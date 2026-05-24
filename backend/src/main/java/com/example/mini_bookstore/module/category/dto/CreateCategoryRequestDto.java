package com.example.mini_bookstore.module.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCategoryRequestDto {
    @NotBlank
    private String name;

    @NotBlank
    private String slug;

    private UUID parentId;

    private Integer sortOrder;
}
