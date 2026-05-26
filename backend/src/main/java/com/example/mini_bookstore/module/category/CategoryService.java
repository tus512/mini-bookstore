package com.example.mini_bookstore.module.category;

import com.example.mini_bookstore.module.category.dto.CategoryResponseDto;
import com.example.mini_bookstore.module.category.dto.CreateCategoryRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.mini_bookstore.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

  public PageResponse<CategoryResponseDto> getPaginatedCategories(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
    Page<Category> categoryPage = categoryRepository.findByDeletedAtIsNull(pageable);

    List<CategoryResponseDto> content = categoryPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

    return PageResponse.<CategoryResponseDto>builder()
            .content(content)
            .page(categoryPage.getNumber())
            .size(categoryPage.getSize())
            .totalElements(categoryPage.getTotalElements())
            .totalPages(categoryPage.getTotalPages())
            .last(categoryPage.isLast())
            .build();
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
