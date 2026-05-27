package com.example.mini_bookstore.module.outbox;

import com.github.f4b6a3.uuid.UuidCreator;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "outbox_messages", indexes = {
    @Index(name = "idx_outbox_unprocessed", columnList = "status, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxMessage {

  @Id
  @Column(name = "id", columnDefinition = "BINARY(16)", nullable = false, updatable = false)
  @org.hibernate.annotations.Type(type = "uuid-binary")
  private UUID id;                    // keep UuidCreator time-ordered

  @Column(name = "aggregate_type", nullable = false)
  private String aggregateType;       // "ORDER" — useful if outbox is shared across domains

  @Column(name = "aggregate_id", columnDefinition = "BINARY(16)", nullable = false)
  @org.hibernate.annotations.Type(type = "uuid-binary")
  private UUID aggregateId;           // order.getId() — no FK, just the raw ID

  @Column(name = "event_type", nullable = false)
  private String eventType;           // "ORDER_PLACED"

  @Column(nullable = false)
  private String topic;               // "order-success-events" — target Kafka topic

  @Column(columnDefinition = "JSON", nullable = false)
  private String payload;             // serialized event body

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private OutboxStatus status;        // PENDING, PUBLISHED, FAILED

  @Column(name = "retry_count")
  private Integer retryCount;         // how many publish attempts

  @Column(name = "last_error", length = 2000)
  private String lastError;           // last failure message for debugging

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "processed_at")
  private LocalDateTime processedAt;  // when it was successfully published

  @PrePersist
  public void prePersist() {
    if (this.id == null) {
      this.id = UuidCreator.getTimeOrderedEpoch();
    }
    if (this.retryCount == null) {
      this.retryCount = 0;
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof OutboxMessage)) return false;
    OutboxMessage other = (OutboxMessage) o;
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
