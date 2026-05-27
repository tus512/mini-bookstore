package com.example.mini_bookstore.module.report;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.example.mini_bookstore.config.kafka.KafkaTopicConfig.ORDER_SUCCESS_TOPIC;

@Service
@RequiredArgsConstructor
public class ReportScheduler {

  private final ReportRepository reportRepository;
  private final ConsumerFactory<String, OrderSuccessEvent> consumerFactory;

  private Consumer<String, OrderSuccessEvent> consumer;

  @PostConstruct
  public void init() {
    consumer = consumerFactory.createConsumer("report-group", null);
    consumer.subscribe(Collections.singletonList(ORDER_SUCCESS_TOPIC));
  }

  @PreDestroy
  public void destroy() {
    if (consumer != null) consumer.close();
  }

  @Scheduled(fixedRate = 60000)
//  @Scheduled(fixedRate = 300000)
  @Transactional
  public void runSalesReportAggregation() {

    ConsumerRecords<String, OrderSuccessEvent> records;
    try {
      records = consumer.poll(Duration.ofSeconds(3));
    } catch (org.apache.kafka.common.errors.InterruptException e) {
      Thread.currentThread().interrupt();
      return;
    }

    if (records.isEmpty()) return;

    Map<LocalDate, List<OrderSuccessEvent>> eventsByDate =
            StreamSupport.stream(records.spliterator(), false)
                    .map(ConsumerRecord::value)
                    .collect(Collectors.groupingBy(e ->
                            e.getPurchasedAt() != null
                                    ? e.getPurchasedAt().toLocalDate()
                                    : LocalDate.now()
                    ));


    Map<LocalDate, Report> existedReport = reportRepository.findReportsByDates(eventsByDate.keySet())
            .stream().collect(Collectors.toMap(Report::getReportDate, Function.identity()));

    List<Report> reportsToSave = new ArrayList<>();

    for (Map.Entry<LocalDate, List<OrderSuccessEvent>> entry : eventsByDate.entrySet()) {
      LocalDate date = entry.getKey();
      List<OrderSuccessEvent> events = entry.getValue();

      BigDecimal total = events.stream().map(OrderSuccessEvent::getTotalAmount)
              .reduce(BigDecimal.ZERO, BigDecimal::add);

      int totalItems = events.stream()
              .mapToInt(e -> e.getTotalItemsSold() != null ? e.getTotalItemsSold() : 0)
              .sum();

      Report report = existedReport.getOrDefault(date, Report.builder()
              .reportDate(date)
              .totalRevenue(BigDecimal.ZERO)
              .totalOrders(0)
              .totalItemsSold(0)
              .periodStart(date.atStartOfDay())
              .periodEnd(date.atTime(23, 59, 59))
              .build());

      report.setTotalRevenue(report.getTotalRevenue().add(total));
      report.setTotalOrders(report.getTotalOrders() + events.size());
      report.setTotalItemsSold(report.getTotalItemsSold() + totalItems);
      report.setLastAggregatedAt(LocalDateTime.now());

      reportsToSave.add(report);
    }
    reportRepository.saveAll(reportsToSave);

    consumer.commitSync();
  }
}