package com.example.mini_bookstore.module.book;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.common.RequestGuard;
import com.example.mini_bookstore.module.book.dto.BookResponseDto;
import com.example.mini_bookstore.module.book.dto.CreateBookRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
  private final BookService bookService;

  @GetMapping
  public ResponseEntity<PageResponse<BookResponseDto>> getBooks(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UUID categoryId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(bookService.getBooks(search, categoryId, page, size));
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookResponseDto> getBookById(@PathVariable UUID id) {
    return ResponseEntity.ok(bookService.getBookById(id));
  }

  @PostMapping
  public ResponseEntity<BookResponseDto> createBook(@Valid @RequestBody CreateBookRequestDto request, HttpServletRequest httpRequest) {
    RequestGuard.requireAdmin(httpRequest);
    return ResponseEntity.ok(bookService.createBook(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<BookResponseDto> updateBook(
      @PathVariable UUID id,
      @Valid @RequestBody CreateBookRequestDto request,
      HttpServletRequest httpRequest) {
    RequestGuard.requireAdmin(httpRequest);
    return ResponseEntity.ok(bookService.updateBook(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteBook(@PathVariable UUID id, HttpServletRequest httpRequest) {
    RequestGuard.requireAdmin(httpRequest);
    bookService.deleteBook(id);
    return ResponseEntity.noContent().build();
  }
}
