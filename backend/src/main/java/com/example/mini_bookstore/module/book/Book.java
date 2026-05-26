package com.example.mini_bookstore.module.book;

import com.example.mini_bookstore.module.category.Category;
import com.github.f4b6a3.uuid.UuidCreator;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
  @Id
  @Column(name = "id", columnDefinition = "BINARY(16)", nullable = false, updatable = false)
  @org.hibernate.annotations.Type(type = "uuid-binary")
  private UUID id;

  @Column(name = "title", nullable = false, length = 255)
  private String title;

  @Column(name = "slug", nullable = false, unique = true, length = 200)
  private String slug;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @Column(name = "author", nullable = false, length = 100)
  private String author;

  @Column(name = "isbn", unique = true, length = 20)
  private String isbn;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "price", nullable = false, precision = 10, scale = 2)
  private BigDecimal price;

  @Builder.Default
  @Column(name = "stock_quantity", nullable = false)
  private Integer stockQuantity = 0;

  @Column(name = "cover_image_url", length = 500)
  private String coverImageUrl;

  @Builder.Default
  @Column(name = "status", nullable = false)
  private Integer status = 1; // 0=draft, 1=active, 2=discontinued

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Book)) return false;
    Book other = (Book) o;
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }

  @PrePersist
  public void prePersist() {
    if (this.id == null) {
      this.id = UuidCreator.getTimeOrderedEpoch();
    }
  }
}
