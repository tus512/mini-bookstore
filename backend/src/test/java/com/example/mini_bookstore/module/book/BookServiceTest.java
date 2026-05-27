package com.example.mini_bookstore.module.book;

import com.example.mini_bookstore.common.PageResponse;
import com.example.mini_bookstore.module.book.dto.BookResponseDto;
import com.example.mini_bookstore.module.book.dto.CreateBookRequestDto;
import com.example.mini_bookstore.module.category.Category;
import com.example.mini_bookstore.module.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

  @Mock
  private BookRepository bookRepository;
  @Mock
  private CategoryRepository categoryRepository;

  private BookService bookService;

  @BeforeEach
  void setUp() {
    bookService = new BookService(bookRepository, categoryRepository);
  }

  @Test
  void testGetBooks_withSpecificIds_returnsMatchedNonDeletedBooks() {
    UUID id1 = UUID.randomUUID();
    UUID id2 = UUID.randomUUID();

    Book book1 = Book.builder().id(id1).title("Book 1").price(BigDecimal.TEN).build();
    Book book2 = Book.builder().id(id2).title("Book 2").price(BigDecimal.ONE).deletedAt(LocalDateTime.now()).build(); // Soft deleted

    when(bookRepository.findAllById(Arrays.asList(id1, id2))).thenReturn(Arrays.asList(book1, book2));

    PageResponse<BookResponseDto> response = bookService.getBooks(null, null, Arrays.asList(id1, id2), null, null, 0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Book 1", response.getContent().get(0).getTitle());
    assertEquals(1, response.getTotalElements());
  }

  @Test
  void testGetBooks_withSearchAndCategory_callsSearchBooksWithFilters() {
    UUID categoryId = UUID.randomUUID();
    Book book = Book.builder().id(UUID.randomUUID()).title("Java Patterns").price(BigDecimal.TEN).build();
    Page<Book> bookPage = new PageImpl<>(Collections.singletonList(book));

    when(bookRepository.searchBooksWithFilters(eq("Java"), eq(categoryId), any(), any(Pageable.class))).thenReturn(bookPage);

    PageResponse<BookResponseDto> response = bookService.getBooks("Java", categoryId, null, null, null, 0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Java Patterns", response.getContent().get(0).getTitle());
  }

  @Test
  void testGetBooks_withSearchOnly_callsSearchBooksWithFilters() {
    Book book = Book.builder().id(UUID.randomUUID()).title("Design Patterns").price(BigDecimal.TEN).build();
    Page<Book> bookPage = new PageImpl<>(Collections.singletonList(book));

    when(bookRepository.searchBooksWithFilters(eq("Patterns"), any(), any(), any(Pageable.class))).thenReturn(bookPage);

    PageResponse<BookResponseDto> response = bookService.getBooks("Patterns", null, null, null, null, 0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Design Patterns", response.getContent().get(0).getTitle());
  }

  @Test
  void testGetBooks_withCategoryOnly_callsSearchBooksWithFilters() {
    UUID categoryId = UUID.randomUUID();
    Book book = Book.builder().id(UUID.randomUUID()).title("Clean Code").price(BigDecimal.TEN).build();
    Page<Book> bookPage = new PageImpl<>(Collections.singletonList(book));

    when(bookRepository.searchBooksWithFilters(any(), eq(categoryId), any(), any(Pageable.class))).thenReturn(bookPage);

    PageResponse<BookResponseDto> response = bookService.getBooks(null, categoryId, null, null, null, 0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Clean Code", response.getContent().get(0).getTitle());
  }

  @Test
  void testGetBooks_withNoParams_callsSearchBooksWithFilters() {
    Book book = Book.builder().id(UUID.randomUUID()).title("Refactoring").price(BigDecimal.TEN).build();
    Page<Book> bookPage = new PageImpl<>(Collections.singletonList(book));

    when(bookRepository.searchBooksWithFilters(any(), any(), any(), any(Pageable.class))).thenReturn(bookPage);

    PageResponse<BookResponseDto> response = bookService.getBooks(null, null, null, null, null, 0, 10);

    assertNotNull(response);
    assertEquals(1, response.getContent().size());
    assertEquals("Refactoring", response.getContent().get(0).getTitle());
  }

  @Test
  void testGetBookById_success() {
    UUID bookId = UUID.randomUUID();
    Book book = Book.builder().id(bookId).title("Refactoring").price(BigDecimal.TEN).build();

    when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

    BookResponseDto response = bookService.getBookById(bookId);

    assertNotNull(response);
    assertEquals("Refactoring", response.getTitle());
  }

  @Test
  void testGetBookById_throwsWhenNotFound() {
    UUID bookId = UUID.randomUUID();
    when(bookRepository.findById(bookId)).thenReturn(Optional.empty());

    Exception exception = assertThrows(RuntimeException.class, () -> {
      bookService.getBookById(bookId);
    });

    assertTrue(exception.getMessage().contains("Book not found"));
  }

  @Test
  void testGetBookById_throwsWhenDeleted() {
    UUID bookId = UUID.randomUUID();
    Book book = Book.builder().id(bookId).title("Old Book").deletedAt(LocalDateTime.now()).build();

    when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

    Exception exception = assertThrows(RuntimeException.class, () -> {
      bookService.getBookById(bookId);
    });

    assertTrue(exception.getMessage().contains("Book has been deleted"));
  }

  @Test
  void testCreateBook_success() {
    UUID categoryId = UUID.randomUUID();
    Category category = Category.builder().id(categoryId).name("Tech").build();

    CreateBookRequestDto request = CreateBookRequestDto.builder()
        .title("Algorithms")
        .slug("algorithms")
        .categoryId(categoryId)
        .price(BigDecimal.valueOf(50.00))
        .stockQuantity(15)
        .author("Cormen")
        .build();

    when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
    when(bookRepository.save(any(Book.class))).thenAnswer(i -> {
      Book b = i.getArgument(0);
      b.setId(UUID.randomUUID());
      return b;
    });

    BookResponseDto response = bookService.createBook(request);

    assertNotNull(response);
    assertEquals("Algorithms", response.getTitle());
    assertEquals("Tech", response.getCategoryName());
  }

  @Test
  void testCreateBook_throwsWhenCategoryNotFound() {
    UUID categoryId = UUID.randomUUID();
    CreateBookRequestDto request = CreateBookRequestDto.builder()
        .categoryId(categoryId)
        .build();

    when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

    assertThrows(RuntimeException.class, () -> {
      bookService.createBook(request);
    });
  }

  @Test
  void testUpdateBook_success() {
    UUID bookId = UUID.randomUUID();
    UUID categoryId = UUID.randomUUID();

    Category category = Category.builder().id(categoryId).name("Tech").build();
    Book book = Book.builder().id(bookId).title("Algorithms v1").category(category).build();

    CreateBookRequestDto request = CreateBookRequestDto.builder()
        .title("Algorithms v2")
        .categoryId(categoryId)
        .price(BigDecimal.TEN)
        .build();

    when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
    when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
    when(bookRepository.save(any(Book.class))).thenAnswer(i -> i.getArgument(0));

    BookResponseDto response = bookService.updateBook(bookId, request);

    assertNotNull(response);
    assertEquals("Algorithms v2", response.getTitle());
  }

  @Test
  void testDeleteBook_softDeletesSuccessfully() {
    UUID bookId = UUID.randomUUID();
    Book book = Book.builder().id(bookId).title("Algorithms").build();

    when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

    bookService.deleteBook(bookId);

    assertNotNull(book.getDeletedAt());
    verify(bookRepository).save(book);
  }
}
