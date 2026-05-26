package com.example.mini_bookstore.config;

import com.example.mini_bookstore.module.book.Book;
import com.example.mini_bookstore.module.book.BookRepository;
import com.example.mini_bookstore.module.category.Category;
import com.example.mini_bookstore.module.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0 && bookRepository.count() == 0) {
            log.info("Starting database seeding...");
            seedCategoriesAndBooks();
            log.info("Database seeding completed!");
        } else {
            log.info("Database already seeded. Skipping seeder.");
        }
    }

    private void seedCategoriesAndBooks() {
        // 20 realistic categories
        String[][] categoryData = {
            {"Fiction", "fiction"},
            {"Non-Fiction", "non-fiction"},
            {"Biography", "biography"},
            {"Self-Help", "self-help"},
            {"Travel", "travel"},
            {"Children", "children"},
            {"Science Fiction", "science-fiction"},
            {"Fantasy", "fantasy"},
            {"Mystery", "mystery"},
            {"Thriller", "thriller"},
            {"Romance", "romance"},
            {"History", "history"},
            {"Science", "science"},
            {"Technology", "technology"},
            {"Business", "business"},
            {"Poetry", "poetry"},
            {"Art & Photography", "art-and-photography"},
            {"Health & Wellness", "health-and-wellness"},
            {"Cookbooks", "cookbooks"},
            {"Philosophy", "philosophy"}
        };

        List<Category> categories = new ArrayList<>();
        for (String[] cat : categoryData) {
            Category c = Category.builder()
                .name(cat[0])
                .slug(cat[1])
                .build();
            categories.add(categoryRepository.save(c));
        }

        // Templates for generating 300 realistic books
        String[] subjects = {"Silent", "Echoes of", "Secrets of", "Beyond the", "Journey into", "The Lost", "Under the", "Shadows of", "The Golden", "Chronicles of", "Wonders of", "Art of", "Guide to", "Mastering", "History of", "Lessons from", "Path to", "Spirit of", "Call of", "In Search of"};
        String[] nouns = {"Waves", "Time", "Tomorrow", "Horizon", "Stars", "Forest", "Empire", "Light", "Darkness", "Wisdom", "Mindfulness", "Destiny", "Dreamer", "Ocean", "Mountains", "Silence", "Creativity", "Innovation", "Leadership", "Success"};
        String[] authors = {"J. R. Thorne", "Sarah Henley", "John Waves", "Dr. Alan Carter", "Elena Rostova", "Victoria Sterling", "Clara Greenwood", "M. J. Brown", "J. Watson", "D. Hayes", "Liam Vance", "Emma C. Clarke", "Lucas Sterling", "Aria Vance", "Robert Green", "Sophia Finch", "David Miller", "Isabella Cross", "Alexander Frost", "Grace Thorne"};

        String[] covers = {
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop"
        };

        Random random = new Random();
        List<Book> books = new ArrayList<>();
        
        for (int i = 1; i <= 300; i++) {
            Category category = categories.get(random.nextInt(categories.size()));
            String title = subjects[random.nextInt(subjects.length)] + " " + nouns[random.nextInt(nouns.length)] + " Vol. " + (random.nextInt(5) + 1);
            
            String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-") + "-" + UUID.randomUUID().toString().substring(0, 8);
            
            String author = authors[random.nextInt(authors.length)];
            String isbn = "978-" + (random.nextInt(900) + 100) + "-" + (random.nextInt(9000000) + 1000000) + "-" + random.nextInt(10);
            
            String description = "An exceptional volume written by " + author + " detailing various concepts under " + category.getName() + 
                ". This highly sought-after publication contains comprehensive coverage, professional reviews, and beautifully presented pages.";
            
            BigDecimal price = BigDecimal.valueOf(10.00 + (100.00 - 10.00) * random.nextDouble()).setScale(2, BigDecimal.ROUND_HALF_UP);
            int stock = random.nextInt(150) + 5;
            String coverUrl = covers[random.nextInt(covers.length)];
            int status = random.nextInt(10) == 0 ? 0 : 1; 

            Book book = Book.builder()
                .title(title)
                .slug(slug)
                .category(category)
                .author(author)
                .isbn(isbn)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .coverImageUrl(coverUrl)
                .status(status)
                .build();
            
            books.add(book);
        }

        bookRepository.saveAll(books);
    }
}
