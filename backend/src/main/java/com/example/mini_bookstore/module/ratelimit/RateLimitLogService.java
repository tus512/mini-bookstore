package com.example.mini_bookstore.module.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RateLimitLogService {

  private final RateLimitLogRepository rateLimitLogRepository;

  /**
   * Asynchronously logs the rate limit violation to the database.
   * This ensures that rate-limit rejections remain extremely high-speed (microseconds)
   * and do not block request threads or exhaust the DB connection pool.
   */
  @Async
  public void logViolation(String identifier, IdentifierType type, String endpoint) {
    RateLimitLog log = RateLimitLog.builder()
        .identifier(identifier)
        .identifierType(type)
        .endpoint(endpoint)
        .violatedAt(LocalDateTime.now())
        .build();

    rateLimitLogRepository.save(log);
    System.out.println("RateLimitLogService [Async]: Recorded rate limit hit for " + type + " (" + identifier + ") on endpoint: " + endpoint);
  }
}
