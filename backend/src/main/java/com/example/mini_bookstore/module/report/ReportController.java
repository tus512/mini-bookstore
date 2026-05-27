package com.example.mini_bookstore.module.report;

import com.example.mini_bookstore.common.RequestGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<Report>> getReports(HttpServletRequest request) {
        RequestGuard.requireAdmin(request);
        return ResponseEntity.ok(reportService.getReportsSortedByDate());
    }
}
