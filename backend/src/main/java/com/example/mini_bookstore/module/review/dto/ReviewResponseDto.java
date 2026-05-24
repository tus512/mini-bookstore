package com.example.mini_bookstore.module.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDto {
    private UUID id;
    private UUID bookId;
    private UUID userId;
    private Integer rating;
    private String comment;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
