package com.example.mini_bookstore.module.ratelimit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RateLimitLogRepository extends JpaRepository<RateLimitLog, UUID> {
}
