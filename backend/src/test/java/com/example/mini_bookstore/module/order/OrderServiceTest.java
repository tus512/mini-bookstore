package com.example.mini_bookstore.module.order;

import com.example.mini_bookstore.module.book.Book;
import com.example.mini_bookstore.module.book.BookRepository;
import com.example.mini_bookstore.module.order.dto.CreateOrderRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderItemRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderResponseDto;
import com.example.mini_bookstore.module.user.User;
import com.example.mini_bookstore.module.user.UserRepository;
import com.example.mini_bookstore.infrastructure.kafka.producer.OrderEventProducer;
import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

  @Mock
  private OrderRepository orderRepository;
  @Mock
  private OrderItemRepository orderItemRepository;
  @Mock
  private OrderEventRepository orderEventRepository;
  @Mock
  private UserRepository userRepository;
  @Mock
  private BookRepository bookRepository;
  @Mock
  private OrderEventProducer orderEventProducer;

  private OrderService orderService;

  @BeforeEach
  void setUp() {
    orderService = new OrderService(
        orderRepository,
        orderItemRepository,
        orderEventRepository,
        userRepository,
        bookRepository,
        orderEventProducer
    );
  }

  @Test
  void testCreateOrder_success_deductsStockAndPublishesKafkaEvent() {
    UUID userId = UUID.randomUUID();
    UUID bookId = UUID.randomUUID();

    User user = User.builder().id(userId).email("user@example.com").build();
    Book book = Book.builder()
        .id(bookId)
        .title("Mindful Living")
        .price(BigDecimal.valueOf(45.00))
        .stockQuantity(10)
        .build();

    CreateOrderRequestDto request = CreateOrderRequestDto.builder()
        .shippingAddress("123 Book St")
        .paymentMethod("COD")
        .items(Collections.singletonList(
            OrderItemRequestDto.builder().bookId(bookId).quantity(2).build()
        ))
        .build();

    // Mock dependencies
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(bookRepository.findAllById(anyList())).thenReturn(Collections.singletonList(book));
    when(bookRepository.decrementStockIfAvailable(bookId, 2)).thenReturn(1); // 1 = success

    // Capture saved order
    when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
      Order order = invocation.getArgument(0);
      order.setId(UUID.randomUUID());
      return order;
    });

    when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

    OrderResponseDto response = orderService.createOrder(userId, request);

    assertNotNull(response);
    assertEquals("123 Book St", response.getShippingAddress());
    assertEquals("COD", response.getPaymentMethod());
    assertEquals(0, BigDecimal.valueOf(90.00).compareTo(response.getTotalAmount()));

    // Verify DB log (lưu log db) is recorded
    verify(orderEventRepository).save(any(OrderEvent.class));

    // Verify Kafka event was published with correct properties
    ArgumentCaptor<OrderSuccessEvent> eventCaptor = ArgumentCaptor.forClass(OrderSuccessEvent.class);
    verify(orderEventProducer).sendOrderSuccessMessage(eventCaptor.capture());

    OrderSuccessEvent sentEvent = eventCaptor.getValue();
    assertEquals(userId, sentEvent.getUserId());
    assertEquals(0, BigDecimal.valueOf(90.00).compareTo(sentEvent.getTotalAmount()));
    assertNotNull(sentEvent.getOrderId());
    assertNotNull(sentEvent.getPurchasedAt());
  }

  @Test
  void testCreateOrder_throwsExceptionWhenStockIsInsufficient() {
    UUID userId = UUID.randomUUID();
    UUID bookId = UUID.randomUUID();

    User user = User.builder().id(userId).build();
    Book book = Book.builder()
        .id(bookId)
        .title("Mindful Living")
        .price(BigDecimal.valueOf(45.00))
        .stockQuantity(1) // only 1 in stock
        .build();

    CreateOrderRequestDto request = CreateOrderRequestDto.builder()
        .shippingAddress("123 Book St")
        .items(Collections.singletonList(
            OrderItemRequestDto.builder().bookId(bookId).quantity(5).build() // requests 5
        ))
        .build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(bookRepository.findAllById(anyList())).thenReturn(Collections.singletonList(book));

    // Attempting to buy more than available should throw ResponseStatusException
    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
      orderService.createOrder(userId, request);
    });

    assertTrue(exception.getReason().contains("Insufficient stock"));
    verify(orderRepository).save(any(Order.class));
    verifyNoInteractions(orderItemRepository, orderEventRepository, orderEventProducer);
  }
}
