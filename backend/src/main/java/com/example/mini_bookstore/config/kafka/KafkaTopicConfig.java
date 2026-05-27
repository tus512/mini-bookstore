package com.example.mini_bookstore.config.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

  public static final String ORDER_SUCCESS_TOPIC = "order-success";

  @Bean
  public NewTopic orderSuccessTopic() {

    return TopicBuilder
        .name(ORDER_SUCCESS_TOPIC)
        .partitions(3)
        .replicas(1)
        .build();
  }
}