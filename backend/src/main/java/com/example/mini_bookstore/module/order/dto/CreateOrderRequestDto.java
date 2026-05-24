package com.example.mini_bookstore.module.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequestDto {
    @NotBlank
    private String shippingAddress;

    private String paymentMethod;

    @NotEmpty
    private List<OrderItemRequestDto> items;
}
