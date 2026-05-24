package com.example.mini_bookstore.module.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RateLimitLogService {
    private final RateLimitLogRepository rateLimitLogRepository;
}
