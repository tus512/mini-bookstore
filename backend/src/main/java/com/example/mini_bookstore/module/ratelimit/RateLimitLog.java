package com.example.mini_bookstore.module.ratelimit;

import com.github.f4b6a3.uuid.UuidCreator;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rate_limit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateLimitLog {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)", nullable = false, updatable = false)
    @org.hibernate.annotations.Type(type = "uuid-binary")
    private UUID id;

    @Column(name = "identifier", nullable = false, length = 45)
    private String identifier;

    @Enumerated(EnumType.STRING)
    @Column(name = "identifier_type", nullable = false)
    private IdentifierType identifierType;

    @Column(name = "endpoint", nullable = false, length = 200)
    private String endpoint;

    @Builder.Default
    @Column(name = "violated_at", nullable = false)
    private LocalDateTime violatedAt = LocalDateTime.now();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RateLimitLog)) return false;
        RateLimitLog other = (RateLimitLog) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
