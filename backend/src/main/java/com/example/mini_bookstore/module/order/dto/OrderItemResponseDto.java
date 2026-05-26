package com.example.mini_bookstore.module.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private UUID id;
    private UUID bookId;
    private String bookTitle;
    private String bookCoverImageUrl;
    private String bookAuthor;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
