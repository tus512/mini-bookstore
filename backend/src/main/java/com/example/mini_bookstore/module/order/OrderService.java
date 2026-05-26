package com.example.mini_bookstore.module.order;

import com.example.mini_bookstore.module.book.Book;
import com.example.mini_bookstore.module.book.BookRepository;
import com.example.mini_bookstore.module.order.dto.CreateOrderRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderItemRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderItemResponseDto;
import com.example.mini_bookstore.module.order.dto.OrderResponseDto;
import com.example.mini_bookstore.module.user.User;
import com.example.mini_bookstore.module.user.UserRepository;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderItemRepository orderItemRepository;
  private final OrderEventRepository orderEventRepository;
  private final UserRepository userRepository;
  private final BookRepository bookRepository;

  /**
   * Creates a new order atomically and safely.
   *
   * Race-condition protection strategy:
   * 1. The transaction runs at READ_COMMITTED isolation (default for MySQL InnoDB).
   * 2. Stock deduction uses an atomic conditional UPDATE:
   *      UPDATE books SET stock_quantity = stock_quantity - qty
   *      WHERE id = ? AND deleted_at IS NULL AND stock_quantity >= qty
   *    This is a single atomic SQL statement. If two transactions race, the database
   *    serialises the writes — only the first succeeds; the second sees 0 rows affected.
   * 3. If the atomic decrement returns 0 affected rows we immediately abort with 409 Conflict.
   * 4. The entire method is @Transactional, so a failure in any step rolls back ALL changes
   *    (stock already decremented, order rows already inserted, etc.).
   */
  @Transactional(isolation = Isolation.READ_COMMITTED)
  public OrderResponseDto createOrder(UUID userId, CreateOrderRequestDto request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if (request.getItems() == null || request.getItems().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order items cannot be empty");
    }

    // --- Phase 1: validate all books — ONE batch SELECT instead of N individual queries ---
    List<UUID> bookIds = request.getItems().stream()
        .map(OrderItemRequestDto::getBookId)
        .collect(Collectors.toList());

    // Single WHERE id IN (...) query
    Map<UUID, Book> bookMap = bookRepository.findAllById(bookIds).stream()
        .collect(Collectors.toMap(Book::getId, Function.identity()));

    // Validate every requested book is present and still active
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

    // Preserve original request order for Phase 3
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

      // Single atomic SQL: UPDATE ... WHERE stock_quantity >= qty
      // Returns 1 on success, 0 if stock was exhausted by a concurrent transaction.
      int rowsUpdated = bookRepository.decrementStockIfAvailable(book.getId(), itemDto.getQuantity());
      if (rowsUpdated == 0) {
        // Another concurrent order already claimed the last units — abort entire transaction.
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

    return mapToResponseDto(order, savedItems);
  }

  private OrderResponseDto mapToResponseDto(Order order, List<OrderItem> items) {
    List<OrderItemResponseDto> itemDtos = items.stream()
        .map(item -> OrderItemResponseDto.builder()
            .id(item.getId())
            .bookId(item.getBook().getId())
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
