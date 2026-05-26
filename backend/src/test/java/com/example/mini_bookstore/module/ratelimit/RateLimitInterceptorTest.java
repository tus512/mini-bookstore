package com.example.mini_bookstore.module.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RateLimitInterceptorTest {

  @Mock
  private StringRedisTemplate redisTemplate;
  @Mock
  private RateLimitLogService rateLimitLogService;
  @Mock
  private HttpServletRequest request;
  @Mock
  private HttpServletResponse response;
  @Mock
  private HandlerMethod handlerMethod;

  private RateLimitInterceptor interceptor;

  @BeforeEach
  void setUp() {
    interceptor = new RateLimitInterceptor(redisTemplate, rateLimitLogService);
  }

  @Test
  void testPreHandle_noAnnotation_returnsTrue() throws Exception {
    when(handlerMethod.getMethodAnnotation(RateLimit.class)).thenReturn(null);

    boolean result = interceptor.preHandle(request, response, handlerMethod);

    assertTrue(result);
    verifyNoInteractions(redisTemplate, rateLimitLogService);
  }

  @Test
  void testPreHandle_nonHandlerMethod_returnsTrue() throws Exception {
    boolean result = interceptor.preHandle(request, response, new Object());
    assertTrue(result);
    verifyNoInteractions(redisTemplate, rateLimitLogService);
  }

  @Test
  void testPreHandle_allowed_returnsTrue() throws Exception {
    RateLimit annotation = mock(RateLimit.class);
    when(annotation.capacity()).thenReturn(10.0);
    when(annotation.refillRate()).thenReturn(2.0);

    when(handlerMethod.getMethodAnnotation(RateLimit.class)).thenReturn(annotation);
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("127.0.0.1");
    when(request.getRequestURI()).thenReturn("/api/auth/login");

    when(redisTemplate.execute(
        any(RedisScript.class),
        eq(Collections.singletonList("rate:limit:127.0.0.1:/api/auth/login")),
        eq("10.0"),
        eq("2.0"),
        eq("1"),
        anyString()
    )).thenReturn(1L); // 1 = allowed

    boolean result = interceptor.preHandle(request, response, handlerMethod);

    assertTrue(result);
    verifyNoInteractions(rateLimitLogService);
  }

  @Test
  void testPreHandle_rejected_throwsTooManyRequestsAndLogsAsync() {
    RateLimit annotation = mock(RateLimit.class);
    when(annotation.capacity()).thenReturn(5.0);
    when(annotation.refillRate()).thenReturn(1.0);

    when(handlerMethod.getMethodAnnotation(RateLimit.class)).thenReturn(annotation);
    when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195");
    when(request.getRequestURI()).thenReturn("/api/auth/register");

    when(redisTemplate.execute(
        any(RedisScript.class),
        eq(Collections.singletonList("rate:limit:203.0.113.195:/api/auth/register")),
        eq("5.0"),
        eq("1.0"),
        eq("1"),
        anyString()
    )).thenReturn(0L); // 0 = rejected / rate limited

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
      interceptor.preHandle(request, response, handlerMethod);
    });

    assertEquals(429, exception.getStatus().value());
    assertTrue(exception.getReason().contains("Too many requests"));

    // Verify async logging was called
    verify(rateLimitLogService).logViolation("203.0.113.195", IdentifierType.IP, "/api/auth/register");
  }
}
