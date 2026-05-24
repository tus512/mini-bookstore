package com.example.mini_bookstore.module.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequestDto {
    @NotNull
    private UUID bookId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
