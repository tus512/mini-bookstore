package com.example.mini_bookstore.infrastructure.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSuccessEvent {
  private UUID orderId;
  private UUID userId;
  private BigDecimal totalAmount;
  private Integer totalItemsSold;
  private LocalDateTime purchasedAt;
}
