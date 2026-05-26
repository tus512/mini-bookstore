package com.example.mini_bookstore.infrastructure.kafka.producer;
import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {
  private final KafkaTemplate<String, OrderSuccessEvent> kafkaTemplate;

  private static final String TOPIC = "order-success";

  public void sendOrderSuccessMessage(OrderSuccessEvent event){
    kafkaTemplate.send(TOPIC, event);
    System.out.println("Event sent: " + event);
  }


}
