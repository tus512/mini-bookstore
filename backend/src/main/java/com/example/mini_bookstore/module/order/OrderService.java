package com.example.mini_bookstore.module.order;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.module.book.Book;
import com.example.mini_bookstore.module.book.BookRepository;
import com.example.mini_bookstore.module.order.dto.CreateOrderRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderItemRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderItemResponseDto;
import com.example.mini_bookstore.module.order.dto.OrderResponseDto;
import com.example.mini_bookstore.module.user.User;
import com.example.mini_bookstore.module.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.example.mini_bookstore.infrastructure.kafka.producer.OrderEventProducer;
import com.example.mini_bookstore.infrastructure.kafka.event.OrderSuccessEvent;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final OrderEventRepository orderEventRepository;
  private final UserRepository userRepository;
  private final BookRepository bookRepository;
  private final OrderEventProducer orderEventProducer;

  /**
   * Creates a new order atomically and safely.
   */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  public OrderResponseDto createOrder(UUID userId, CreateOrderRequestDto request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if (request.getItems() == null || request.getItems().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order items cannot be empty");
    }

    // --- Phase 1: validate all books ---
    List<UUID> bookIds = request.getItems().stream()
        .map(OrderItemRequestDto::getBookId)
        .collect(Collectors.toList());

    Map<UUID, Book> bookMap = bookRepository.findAllById(bookIds).stream()
        .collect(Collectors.toMap(Book::getId, Function.identity()));

    for (OrderItemRequestDto itemDto : request.getItems()) {
      Book book = bookMap.get(itemDto.getBookId());
      if (book == null) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Book not found: " + itemDto.getBookId());
      }
      if (book.getDeletedAt() != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Book is no longer available: " + book.getTitle());
      }
    }

    List<Book> resolvedBooks = request.getItems().stream()
        .map(itemDto -> bookMap.get(itemDto.getBookId()))
        .collect(Collectors.toList());

    // --- Phase 2: create the order shell ---
    Order order = Order.builder()
        .user(user)
        .shippingAddress(request.getShippingAddress())
        .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD")
        .status(0) // pending
        .totalAmount(BigDecimal.ZERO)
        .build();
    order = orderRepository.save(order);

    // --- Phase 3: atomically decrement stock for each item ---
    BigDecimal totalAmount = BigDecimal.ZERO;
    List<OrderItem> savedItems = new ArrayList<>();

    for (int i = 0; i < request.getItems().size(); i++) {
      OrderItemRequestDto itemDto = request.getItems().get(i);
      Book book = resolvedBooks.get(i);

      int rowsUpdated = bookRepository.decrementStockIfAvailable(book.getId(), itemDto.getQuantity());
      if (rowsUpdated == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Insufficient stock for \"" + book.getTitle() + "\" — please reduce quantity and try again.");
      }

      BigDecimal subtotal = book.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
      totalAmount = totalAmount.add(subtotal);

      OrderItem orderItem = OrderItem.builder()
          .order(order)
          .book(book)
          .quantity(itemDto.getQuantity())
          .unitPrice(book.getPrice())
          .subtotal(subtotal)
          .build();
      savedItems.add(orderItemRepository.save(orderItem));
    }

    // --- Phase 4: finalise order total and record audit event ---
    order.setTotalAmount(totalAmount);
    order = orderRepository.save(order);

    OrderEvent orderEvent = OrderEvent.builder()
        .order(order)
        .eventType("ORDER_PLACED")
        .payload("{\"message\":\"Order placed successfully\",\"totalAmount\":" + totalAmount + "}")
        .processed(1)
        .eventTime(LocalDateTime.now())
        .build();
    orderEventRepository.save(orderEvent);

    try {
      OrderSuccessEvent successEvent = OrderSuccessEvent.builder()
          .orderId(order.getId())
          .userId(userId)
          .totalAmount(totalAmount)
          .purchasedAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now())
          .build();
      orderEventProducer.sendOrderSuccessMessage(successEvent);
    } catch (Exception ex) {
      System.err.println("Warning: Failed to publish OrderSuccessEvent to Kafka: " + ex.getMessage());
    }

    return mapToResponseDto(order, savedItems);
  }

  /**
   * Retrieves a paginated list of orders placed by a specific user.
   */
  @Transactional(readOnly = true)
  public PageResponse<OrderResponseDto> getUserOrders(UUID userId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);

    List<OrderResponseDto> content = orderPage.getContent().stream()
        .map(order -> {
          List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
          return mapToResponseDto(order, items);
        })
        .collect(Collectors.toList());

    return PageResponse.<OrderResponseDto>builder()
        .content(content)
        .page(orderPage.getNumber())
        .size(orderPage.getSize())
        .totalElements(orderPage.getTotalElements())
        .totalPages(orderPage.getTotalPages())
        .last(orderPage.isLast())
        .build();
  }

  private OrderResponseDto mapToResponseDto(Order order, List<OrderItem> items) {
    List<OrderItemResponseDto> itemDtos = items.stream()
        .map(item -> OrderItemResponseDto.builder()
            .id(item.getId())
            .bookId(item.getBook().getId())
            .bookTitle(item.getBook().getTitle())
            .bookCoverImageUrl(item.getBook().getCoverImageUrl())
            .bookAuthor(item.getBook().getAuthor())
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .subtotal(item.getSubtotal())
            .build())
        .collect(Collectors.toList());

    return OrderResponseDto.builder()
        .id(order.getId())
        .userId(order.getUser().getId())
        .totalAmount(order.getTotalAmount())
        .status(order.getStatus())
        .shippingAddress(order.getShippingAddress())
        .paymentMethod(order.getPaymentMethod())
        .paymentRef(order.getPaymentRef())
        .paidAt(order.getPaidAt())
        .createdAt(order.getCreatedAt())
        .updatedAt(order.getUpdatedAt())
        .items(itemDtos)
        .build();
  }
}
