package com.example.mini_bookstore.module.order;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.common.RequestGuard;
import com.example.mini_bookstore.module.order.dto.CreateOrderRequestDto;
import com.example.mini_bookstore.module.order.dto.OrderResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            HttpServletRequest request,
            @Valid @RequestBody CreateOrderRequestDto requestDto
    ) {
        RequestGuard.requireAuthenticated(request);
        UUID userId = (UUID) request.getAttribute("userId");
        OrderResponseDto response = orderService.createOrder(userId, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponseDto>> getUserOrders(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        RequestGuard.requireAuthenticated(request);
        UUID userId = (UUID) request.getAttribute("userId");
        PageResponse<OrderResponseDto> response = orderService.getUserOrders(userId, page, size);
        return ResponseEntity.ok(response);
    }
}
