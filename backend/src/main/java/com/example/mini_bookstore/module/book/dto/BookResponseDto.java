package com.example.mini_bookstore.module.book.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponseDto {
  private UUID id;
  private String title;
  private String slug;
  private UUID categoryId;
  private String categoryName;
  private String author;
  private String isbn;
  private String description;
  private BigDecimal price;
  private Integer stockQuantity;
  private String coverImageUrl;
  private Integer status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
