package com.example.mini_bookstore.module.book;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.module.book.dto.BookResponseDto;
import com.example.mini_bookstore.module.book.dto.CreateBookRequestDto;
import com.example.mini_bookstore.module.category.Category;
import com.example.mini_bookstore.module.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {
  private final BookRepository bookRepository;
  private final CategoryRepository categoryRepository;

  public PageResponse<BookResponseDto> getBooks(String search, UUID categoryId, List<UUID> ids, int page, int size) {
    if (ids != null && !ids.isEmpty()) {
      List<Book> books = bookRepository.findAllById(ids).stream()
          .filter(b -> b.getDeletedAt() == null)
          .collect(Collectors.toList());

      List<BookResponseDto> content = books.stream()
          .map(this::mapToDto)
          .collect(Collectors.toList());

      return PageResponse.<BookResponseDto>builder()
          .content(content)
          .page(0)
          .size(content.size())
          .totalElements(content.size())
          .totalPages(1)
          .last(true)
          .build();
    }

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Book> bookPage;

    boolean hasSearch = StringUtils.hasText(search);
    boolean hasCategoryId = categoryId != null;

    if (hasSearch && hasCategoryId) {
      bookPage = bookRepository.searchBooksInCategory(search, categoryId, pageable);
    } else if (hasSearch) {
      bookPage = bookRepository.searchBooks(search, pageable);
    } else if (hasCategoryId) {
      bookPage = bookRepository.findByCategoryIdAndDeletedAtIsNull(categoryId, pageable);
    } else {
      bookPage = bookRepository.findByDeletedAtIsNull(pageable);
    }

    List<BookResponseDto> content = bookPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

    return PageResponse.<BookResponseDto>builder()
            .content(content)
            .page(bookPage.getNumber())
            .size(bookPage.getSize())
            .totalElements(bookPage.getTotalElements())
            .totalPages(bookPage.getTotalPages())
            .last(bookPage.isLast())
            .build();
  }

  public BookResponseDto getBookById(UUID id) {
    Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
    if (book.getDeletedAt() != null) {
      throw new RuntimeException("Book has been deleted");
    }
    return mapToDto(book);
  }

  public BookResponseDto createBook(CreateBookRequestDto request) {
    Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));

    Book book = Book.builder()
            .title(request.getTitle())
            .slug(request.getSlug())
            .category(category)
            .author(request.getAuthor())
            .isbn(request.getIsbn())
            .description(request.getDescription())
            .price(request.getPrice())
            .stockQuantity(request.getStockQuantity())
            .coverImageUrl(request.getCoverImageUrl())
            .status(request.getStatus() != null ? request.getStatus() : 1)
            .build();
    book = bookRepository.save(book);
    return mapToDto(book);
  }

  public BookResponseDto updateBook(UUID id, CreateBookRequestDto request) {
    Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
    
    Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));

    book.setTitle(request.getTitle());
    book.setSlug(request.getSlug());
    book.setCategory(category);
    book.setAuthor(request.getAuthor());
    book.setIsbn(request.getIsbn());
    book.setDescription(request.getDescription());
    book.setPrice(request.getPrice());
    book.setStockQuantity(request.getStockQuantity());
    book.setCoverImageUrl(request.getCoverImageUrl());
    book.setStatus(request.getStatus() != null ? request.getStatus() : 1);

    book = bookRepository.save(book);
    return mapToDto(book);
  }

  public void deleteBook(UUID id) {
    Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
    book.setDeletedAt(LocalDateTime.now());
    bookRepository.save(book);
  }

  private BookResponseDto mapToDto(Book book) {
    return BookResponseDto.builder()
            .id(book.getId())
            .title(book.getTitle())
            .slug(book.getSlug())
            .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
            .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
            .author(book.getAuthor())
            .isbn(book.getIsbn())
            .description(book.getDescription())
            .price(book.getPrice())
            .stockQuantity(book.getStockQuantity())
            .coverImageUrl(book.getCoverImageUrl())
            .status(book.getStatus())
            .createdAt(book.getCreatedAt())
            .updatedAt(book.getUpdatedAt())
            .build();
  }
}
