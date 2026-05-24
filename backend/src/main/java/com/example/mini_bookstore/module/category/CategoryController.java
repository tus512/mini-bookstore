package com.example.mini_bookstore.module.category;

import com.example.mini_bookstore.common.RequestGuard;
import com.example.mini_bookstore.module.category.dto.CategoryResponseDto;
import com.example.mini_bookstore.module.category.dto.CreateCategoryRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    // Public: anyone can browse categories
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // Admin-only: CRUD mutations
    @PostMapping
    public ResponseEntity<CategoryResponseDto> createCategory(
            @Valid @RequestBody CreateCategoryRequestDto request,
            HttpServletRequest httpRequest) {
        RequestGuard.requireAdmin(httpRequest);
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCategoryRequestDto request,
            HttpServletRequest httpRequest) {
        RequestGuard.requireAdmin(httpRequest);
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        RequestGuard.requireAdmin(httpRequest);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
