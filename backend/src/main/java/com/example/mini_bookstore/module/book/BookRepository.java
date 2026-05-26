package com.example.mini_bookstore.module.book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {
    Page<Book> findByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.deletedAt IS NULL AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Book> searchBooks(String search, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.deletedAt IS NULL AND b.category.id = :categoryId")
    Page<Book> findByCategoryIdAndDeletedAtIsNull(UUID categoryId, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.deletedAt IS NULL AND b.category.id = :categoryId AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Book> searchBooksInCategory(String search, UUID categoryId, Pageable pageable);

    /**
     * Acquire a pessimistic write lock on a book row before reading it.
     * Used during order creation to prevent concurrent stock over-selling.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdForUpdate(UUID id);

    /**
     * Atomically decrement stock by qty only when:
     * - the book exists, is not deleted, and has enough stock.
     * Returns the number of rows updated (1 = success, 0 = insufficient stock / not found).
     */
    @Modifying
    @Query("UPDATE Book b SET b.stockQuantity = b.stockQuantity - :qty " +
           "WHERE b.id = :id AND b.deletedAt IS NULL AND b.stockQuantity >= :qty")
    int decrementStockIfAvailable(UUID id, int qty);
}
