package com.example.mini_bookstore.infrastructure.kafka.consumer;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import static com.example.mini_bookstore.config.kafka.KafkaTopicConfig.ORDER_SUCCESS_TOPIC;

@Service
public class OrderEventConsumer {
//  @KafkaListener(topics = ORDER_SUCCESS_TOPIC, groupId = "bookstore-group", concurrency = "3")
//  public void consume(OrderSuccessEvent event) {
//    System.out.println("Received event: " + event);
//  }
}
