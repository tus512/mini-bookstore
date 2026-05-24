package com.example.mini_bookstore.module.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rate-limits")
@RequiredArgsConstructor
public class RateLimitLogController {
    private final RateLimitLogService rateLimitLogService;
}
