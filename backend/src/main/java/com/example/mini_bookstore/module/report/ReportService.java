package com.example.mini_bookstore.module.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;

    public List<Report> getReportsSortedByDate() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusMonths(1);

        List<Report> existingReports = reportRepository.findAllByReportDateGreaterThanEqualOrderByReportDateAsc(startDate);
        Map<LocalDate, Report> reportMap = new HashMap<>();
        for (Report r : existingReports) {
            reportMap.put(r.getReportDate(), r);
        }

        List<Report> filledReports = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(today)) {
            Report r = reportMap.get(current);
            if (r == null) {
                r = Report.builder()
                        .reportDate(current)
                        .totalOrders(0)
                        .totalItemsSold(0)
                        .totalRevenue(BigDecimal.ZERO)
                        .periodStart(current.atStartOfDay())
                        .periodEnd(current.atTime(23, 59, 59))
                        .lastAggregatedAt(LocalDateTime.now())
                        .build();
            }
            filledReports.add(r);
            current = current.plusDays(1);
        }
        return filledReports;
    }
}
