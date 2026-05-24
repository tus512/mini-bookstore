package com.example.mini_bookstore.module.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDto {
    private UUID id;
    private LocalDate reportDate;
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private Integer totalItemsSold;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime lastAggregatedAt;
}
