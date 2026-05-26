package com.example.mini_bookstore.module.category;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.module.category.dto.CategoryResponseDto;
import com.example.mini_bookstore.module.category.dto.CreateCategoryRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

  @Mock
  private CategoryRepository categoryRepository;

  private CategoryService categoryService;

  @BeforeEach
  void setUp() {
    categoryService = new CategoryService(categoryRepository);
  }

  @Test
  void testGetAllCategories_filtersSoftDeletedCategories() {
    Category cat1 = Category.builder().id(UUID.randomUUID()).name("Tech").build();
    Category cat2 = Category.builder().id(UUID.randomUUID()).name("Art").deletedAt(LocalDateTime.now()).build();

    when(categoryRepository.findAll()).thenReturn(Arrays.asList(cat1, cat2));

    List<CategoryResponseDto> response = categoryService.getAllCategories();

    assertNotNull(response);
    assertEquals(1, response.size());
    assertEquals("Tech", response.get(0).getName());
  }

  @Test
  void testGetPaginatedCategories_returnsPaginatedResults() {
    Category cat = Category.builder().id(UUID.randomUUID()).name("Science").build();
    Page<Category> categoryPage = new PageImpl<>(Collections.singletonList(cat));

    when(categoryRepository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(categoryPage);

    PageResponse<CategoryResponseDto> response = categoryService.getPaginatedCategories(0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Science", response.getContent().get(0).getName());
  }

  @Test
  void testGetCategoryById_success() {
    UUID categoryId = UUID.randomUUID();
    Category cat = Category.builder().id(categoryId).name("Novel").build();

    when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(cat));

    CategoryResponseDto response = categoryService.getCategoryById(categoryId);

    assertNotNull(response);
    assertEquals("Novel", response.getName());
  }

  @Test
  void testGetCategoryById_throwsWhenNotFound() {
    UUID categoryId = UUID.randomUUID();
    when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> {
      categoryService.getCategoryById(categoryId);
    });
  }

  @Test
  void testCreateCategory_success() {
    CreateCategoryRequestDto request = CreateCategoryRequestDto.builder()
        .name("Novel")
        .slug("novel")
        .build();

    when(categoryRepository.save(any(Category.class))).thenAnswer(i -> {
      Category c = i.getArgument(0);
      c.setId(UUID.randomUUID());
      return c;
    });

    CategoryResponseDto response = categoryService.createCategory(request);

    assertNotNull(response);
    assertEquals("Novel", response.getName());
    assertEquals("novel", response.getSlug());
  }

  @Test
  void testUpdateCategory_success() {
    UUID categoryId = UUID.randomUUID();
    Category cat = Category.builder().id(categoryId).name("Novel").slug("novel").build();

    CreateCategoryRequestDto request = CreateCategoryRequestDto.builder()
        .name("Science Fiction")
        .slug("sci-fi")
        .build();

    when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(cat));
    when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

    CategoryResponseDto response = categoryService.updateCategory(categoryId, request);

    assertNotNull(response);
    assertEquals("Science Fiction", response.getName());
    assertEquals("sci-fi", response.getSlug());
  }

  @Test
  void testDeleteCategory_softDeletesSuccessfully() {
    UUID categoryId = UUID.randomUUID();
    Category cat = Category.builder().id(categoryId).name("Novel").build();

    when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(cat));

    categoryService.deleteCategory(categoryId);

    assertNotNull(cat.getDeletedAt());
    verify(categoryRepository).save(cat);
  }
}
