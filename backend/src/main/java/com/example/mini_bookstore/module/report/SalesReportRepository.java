package com.example.mini_bookstore.module.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SalesReportRepository extends JpaRepository<SalesReport, Long> {
  Optional<SalesReport> findByReportDate(LocalDate reportDate);
}
