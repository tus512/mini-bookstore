package com.example.mini_bookstore.module.report;

import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReport {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "report_date", nullable = false, unique = true)
  private LocalDate reportDate;

  @Column(name = "total_sales", nullable = false, precision = 15, scale = 2)
  private BigDecimal totalSales;

  @Column(name = "total_orders", nullable = false)
  private Long totalOrders;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;
}
