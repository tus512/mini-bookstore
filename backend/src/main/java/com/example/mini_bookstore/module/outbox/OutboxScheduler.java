package com.example.mini_bookstore.module.outbox;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OutboxScheduler {

  private final OutboxRepository outboxRepository;
  private final KafkaTemplate<String, Object> kafkaTemplate;
  private final ObjectMapper objectMapper;

  @Scheduled(fixedDelay = 5000)
  @Transactional
  public void publishPendingMessages() {
    List<OutboxMessage> pending = outboxRepository
        .findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);

    List<OutboxMessage> toUpdate = new ArrayList<>();

    for (OutboxMessage msg : pending) {
      try {
        Object payloadObj = msg.getPayload();
        
        // Deserialize payload back to OrderSuccessEvent if the target topic matches
        if ("order-success".equals(msg.getTopic())) {
          try {
            payloadObj = objectMapper.readValue(msg.getPayload(), OrderSuccessEvent.class);
          } catch (Exception ex) {
            // fallback to raw payload string if deserialization fails
          }
        }
        
        kafkaTemplate.send(msg.getTopic(), msg.getAggregateId().toString(), payloadObj);
        msg.setStatus(OutboxStatus.PUBLISHED);
        msg.setProcessedAt(LocalDateTime.now());
      } catch (Exception ex) {
        msg.setRetryCount(msg.getRetryCount() + 1);
        msg.setLastError(ex.getMessage());
        if (msg.getRetryCount() >= 5) {
          msg.setStatus(OutboxStatus.FAILED);
        }
      }
      toUpdate.add(msg);
    }

    outboxRepository.saveAll(toUpdate); // ← single batch UPDATE
  }
}
