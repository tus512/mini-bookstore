package com.example.mini_bookstore.module.book.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookRequestDto {
    @NotBlank
    private String title;

    @NotBlank
    private String slug;

    @NotNull
    private UUID categoryId;

    @NotBlank
    private String author;

    private String isbn;
    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    private Integer stockQuantity;

    private String coverImageUrl;
    private Integer status;
}
