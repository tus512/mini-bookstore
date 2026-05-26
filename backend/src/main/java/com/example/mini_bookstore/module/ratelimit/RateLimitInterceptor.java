package com.example.mini_bookstore.module.ratelimit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

  private final StringRedisTemplate redisTemplate;
  private final RateLimitLogService rateLimitLogService;

  private static final String LUA_SCRIPT =
      "local key = KEYS[1]\n" +
      "local capacity = tonumber(ARGV[1])\n" +
      "local refill_rate = tonumber(ARGV[2])\n" +
      "local requested = tonumber(ARGV[3])\n" +
      "local now = tonumber(ARGV[4])\n" +
      "\n" +
      "local bucket = redis.call('HMGET', key, 'tokens', 'last_updated')\n" +
      "local tokens = tonumber(bucket[1])\n" +
      "local last_updated = tonumber(bucket[2])\n" +
      "\n" +
      "if not tokens then\n" +
      "    tokens = capacity\n" +
      "    last_updated = now\n" +
      "else\n" +
      "    local time_passed = now - last_updated\n" +
      "    if time_passed > 0 then\n" +
      "        local refilled = time_passed * refill_rate\n" +
      "        tokens = math.min(capacity, tokens + refilled)\n" +
      "        last_updated = now\n" +
      "    end\n" +
      "end\n" +
      "\n" +
      "if tokens >= requested then\n" +
      "    tokens = tokens - requested\n" +
      "    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)\n" +
      "    redis.call('EXPIRE', key, 3600)\n" +
      "    return 1\n" +
      "else\n" +
      "    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)\n" +
      "    redis.call('EXPIRE', key, 3600)\n" +
      "    return 0\n" +
      "end";

  private final RedisScript<Long> redisScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!(handler instanceof HandlerMethod)) {
      return true;
    }

    HandlerMethod handlerMethod = (HandlerMethod) handler;
    RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

    if (rateLimit == null) {
      return true; // No rate limit set on this method
    }

    // Determine Identifier & Type
    String identifier;
    IdentifierType type;

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
      identifier = auth.getName(); // User's email or ID
      type = IdentifierType.USER;
    } else {
      String ip = request.getHeader("X-Forwarded-For");
      if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
        ip = request.getRemoteAddr();
      }
      identifier = ip;
      type = IdentifierType.IP;
    }

    String endpoint = request.getRequestURI();
    String redisKey = "rate:limit:" + identifier + ":" + endpoint;

    double capacity = rateLimit.capacity();
    double refillRate = rateLimit.refillRate();
    double nowInSeconds = System.currentTimeMillis() / 1000.0;

    // Atomically execute Token Bucket script
    Long result = redisTemplate.execute(
        redisScript,
        Collections.singletonList(redisKey),
        String.valueOf(capacity),
        String.valueOf(refillRate),
        "1", // requested 1 token
        String.valueOf(nowInSeconds)
    );

    boolean allowed = (result != null && result == 1L);

    if (!allowed) {
      // Async DB logging: reject immediately in microseconds, log in the background
      rateLimitLogService.logViolation(identifier, type, endpoint);

      throw new ResponseStatusException(
          HttpStatus.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later."
      );
    }

    return true;
  }
}
