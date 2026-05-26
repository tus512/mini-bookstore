package com.example.mini_bookstore.module.report;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SalesReportSchedulerTest {

  @Mock
  private SalesReportRepository salesReportRepository;

  private SalesReportScheduler scheduler;

  @BeforeEach
  void setUp() {
    scheduler = new SalesReportScheduler(salesReportRepository);
  }

  @Test
  void testConsumeOrderEvent_addsToBuffer() {
    OrderSuccessEvent event = OrderSuccessEvent.builder()
        .orderId(java.util.UUID.randomUUID())
        .userId(java.util.UUID.randomUUID())
        .totalAmount(BigDecimal.valueOf(120.50))
        .purchasedAt(LocalDateTime.now())
        .build();

    scheduler.consumeOrderEvent(event);

    assertEquals(1, scheduler.getEventBuffer().size());
    assertEquals(event, scheduler.getEventBuffer().peek());
  }

  @Test
  void testRunSalesReportAggregation_doesNothingOnEmptyBuffer() {
    scheduler.runSalesReportAggregation();
    verifyNoInteractions(salesReportRepository);
  }

  @Test
  void testRunSalesReportAggregation_sumsAndSavesNewDailyReport() {
    LocalDate today = LocalDate.now();
    LocalDateTime purchasedTime = today.atTime(10, 0);

    OrderSuccessEvent event1 = OrderSuccessEvent.builder()
        .orderId(java.util.UUID.randomUUID())
        .totalAmount(BigDecimal.valueOf(100.00))
        .purchasedAt(purchasedTime)
        .build();

    OrderSuccessEvent event2 = OrderSuccessEvent.builder()
        .orderId(java.util.UUID.randomUUID())
        .totalAmount(BigDecimal.valueOf(50.50))
        .purchasedAt(purchasedTime)
        .build();

    scheduler.consumeOrderEvent(event1);
    scheduler.consumeOrderEvent(event2);

    // Mock findByReportDate to return empty (no pre-existing report)
    when(salesReportRepository.findByReportDate(today)).thenReturn(Optional.empty());

    scheduler.runSalesReportAggregation();

    // Verify buffer is drained
    assertTrue(scheduler.getEventBuffer().isEmpty());

    // Verify repository save was called with the aggregated values
    ArgumentCaptor<SalesReport> reportCaptor = ArgumentCaptor.forClass(SalesReport.class);
    verify(salesReportRepository).save(reportCaptor.capture());

    SalesReport savedReport = reportCaptor.getValue();
    assertEquals(today, savedReport.getReportDate());
    assertEquals(0, BigDecimal.valueOf(150.50).compareTo(savedReport.getTotalSales()));
    assertEquals(2L, savedReport.getTotalOrders());
    assertNotNull(savedReport.getUpdatedAt());
  }

  @Test
  void testRunSalesReportAggregation_accumulatesOnExistingDailyReport() {
    LocalDate today = LocalDate.now();
    LocalDateTime purchasedTime = today.atTime(14, 30);

    OrderSuccessEvent event = OrderSuccessEvent.builder()
        .orderId(java.util.UUID.randomUUID())
        .totalAmount(BigDecimal.valueOf(75.00))
        .purchasedAt(purchasedTime)
        .build();

    scheduler.consumeOrderEvent(event);

    // Existing daily report loaded from DB
    SalesReport existingReport = SalesReport.builder()
        .id(1L)
        .reportDate(today)
        .totalSales(BigDecimal.valueOf(200.00))
        .totalOrders(3L)
        .build();

    when(salesReportRepository.findByReportDate(today)).thenReturn(Optional.of(existingReport));

    scheduler.runSalesReportAggregation();

    // Verify buffer is drained
    assertTrue(scheduler.getEventBuffer().isEmpty());

    // Verify repository save was called with the updated values
    ArgumentCaptor<SalesReport> reportCaptor = ArgumentCaptor.forClass(SalesReport.class);
    verify(salesReportRepository).save(reportCaptor.capture());

    SalesReport savedReport = reportCaptor.getValue();
    assertEquals(today, savedReport.getReportDate());
    assertEquals(0, BigDecimal.valueOf(275.00).compareTo(savedReport.getTotalSales()));
    assertEquals(4L, savedReport.getTotalOrders());
  }
}
