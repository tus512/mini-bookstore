package com.example.mini_bookstore.infrastructure.kafka.producer;

import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import static com.example.mini_bookstore.config.kafka.KafkaTopicConfig.ORDER_SUCCESS_TOPIC;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {
  private final KafkaTemplate<String, OrderSuccessEvent> kafkaTemplate;

  public void sendOrderSuccessMessage(OrderSuccessEvent event) {
    // Key để tính ra partition của message
    String messageKey = event.getUserId().toString();

    kafkaTemplate.send(ORDER_SUCCESS_TOPIC, messageKey, event);
    System.out.println("Event sent: " + event);
  }


}
