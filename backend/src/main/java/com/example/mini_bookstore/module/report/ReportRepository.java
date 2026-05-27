package com.example.mini_bookstore.module.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
  Optional<Report> findByReportDate(LocalDate reportDate);

  @Query("SELECT r FROM Report r WHERE r.reportDate IN :dates")
  List<Report> findReportsByDates(Set<LocalDate> dates);

  List<Report> findAllByOrderByReportDateAsc();

  List<Report> findAllByReportDateGreaterThanEqualOrderByReportDateAsc(LocalDate startDate);
}
