package com.example.mini_bookstore.module.category;

import com.example.mini_bookstore.module.category.dto.CategoryResponseDto;
import com.example.mini_bookstore.module.category.dto.CreateCategoryRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .filter(cat -> cat.getDeletedAt() == null)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryResponseDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToDto(category);
    }

    public CategoryResponseDto createCategory(CreateCategoryRequestDto request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .build();

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    public CategoryResponseDto updateCategory(UUID id, CreateCategoryRequestDto request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());

        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setDeletedAt(java.time.LocalDateTime.now());
        categoryRepository.save(category);
    }

    private CategoryResponseDto mapToDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
