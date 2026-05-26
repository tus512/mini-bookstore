package com.example.mini_bookstore.infrastructure.kafka.consumer;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderEventConsumer {
  @KafkaListener(topics = "order-success", groupId = "bookstore-group")
  public void consume(OrderSuccessEvent event) {
    System.out.println("Received event: " + event);
  }
}
