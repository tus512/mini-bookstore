package com.example.mini_bookstore.module.report;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportScheduler {

  private final ReportRepository reportRepository;

  // Thread-safe buffer to hold events consumed in real-time until the next 5-minute aggregation run
  private final Queue<OrderSuccessEvent> eventBuffer = new ConcurrentLinkedQueue<>();

  /**
   * Kafka Listener that consumes events in real-time from the "order-success" topic and buffers them in memory.
   */
  @KafkaListener(topics = "order-success", groupId = "report-group")
  public void consumeOrderEvent(OrderSuccessEvent event) {
    if (event != null) {
      System.out.println("ReportScheduler: Consumed event for buffering: " + event);
      eventBuffer.add(event);
    }
  }

  /**
   * Runs periodically every 5 minutes to aggregate the buffered sales data and save/update the daily reports in the database.
   * "định kì 5 phút đọc dữ liệu từ kafka ra để sum số tiền cập nhật bảng report"
   */
  @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
  @Transactional
  public void runSalesReportAggregation() {
    System.out.println("ReportScheduler: Starting 5-minute daily sales aggregation. Buffered event count: " + eventBuffer.size());

    if (eventBuffer.isEmpty()) {
      return;
    }

    // Drain the current buffer into a local list to process to avoid locking the buffer during long DB operations
    List<OrderSuccessEvent> eventsToProcess = new ArrayList<>();
    OrderSuccessEvent event;
    while ((event = eventBuffer.poll()) != null) {
      eventsToProcess.add(event);
    }

    // Group events by date (LocalDate) based on their purchasedAt time
    Map<LocalDate, List<OrderSuccessEvent>> eventsByDate = eventsToProcess.stream()
        .collect(Collectors.groupingBy(e -> {
          if (e.getPurchasedAt() != null) {
            return e.getPurchasedAt().toLocalDate();
          }
          return LocalDate.now();
        }));

    // For each date, sum the amounts and upsert the daily report in the database
    for (Map.Entry<LocalDate, List<OrderSuccessEvent>> entry : eventsByDate.entrySet()) {
      LocalDate reportDate = entry.getKey();
      List<OrderSuccessEvent> dateEvents = entry.getValue();

      BigDecimal dailyTotal = dateEvents.stream()
          .map(e -> e.getTotalAmount() != null ? e.getTotalAmount() : BigDecimal.ZERO)
          .reduce(BigDecimal.ZERO, BigDecimal::add);

      int dailyOrdersCount = dateEvents.size();

      // Load existing report or create a new one
      Report report = reportRepository.findByReportDate(reportDate)
          .orElseGet(() -> Report.builder()
              .reportDate(reportDate)
              .totalRevenue(BigDecimal.ZERO)
              .totalOrders(0)
              .totalItemsSold(0)
              .periodStart(reportDate.atStartOfDay())
              .periodEnd(reportDate.atTime(23, 59, 59))
              .build());

      // Accumulate the aggregated numbers
      report.setTotalRevenue(report.getTotalRevenue().add(dailyTotal));
      report.setTotalOrders(report.getTotalOrders() + dailyOrdersCount);
      report.setLastAggregatedAt(LocalDateTime.now());

      reportRepository.save(report);
      System.out.println("ReportScheduler: Updated Report for " + reportDate + ": Total Revenue = " + report.getTotalRevenue() + ", Total Orders = " + report.getTotalOrders());
    }

    System.out.println("ReportScheduler: Finished 5-minute sales aggregation successfully.");
  }

  /**
   * Helper method for testing to retrieve buffer contents.
   */
  public Queue<OrderSuccessEvent> getEventBuffer() {
    return eventBuffer;
  }
}
