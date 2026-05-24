import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, Category, MOCK_BOOKS, CATEGORIES } from './mockData';

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  role?: string;
}

export interface OrderItem {
  id: string;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  total: number;
}

interface BookstoreState {
  // Catalog collections
  books: Book[];
  categories: Category[];

  // Client states
  cart: CartItem[];
  wishlist: Book[];
  user: UserProfile | null;
  orders: OrderItem[];

  // Actions
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (book: Book) => void;
  isInWishlist: (bookId: string) => boolean;

  // Auth actions
  login: (userData: any) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;

  // Order actions
  addOrder: (order: OrderItem) => void;

  // Admin Books CRUD
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;

  // Admin Categories CRUD
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

// Initial mock orders to enrich the user's purchase history on first load
const INITIAL_ORDERS = (): OrderItem[] => [
  {
    id: 'ORD-89304',
    date: '2026-05-12',
    status: 'Delivered',
    items: [
      { book: MOCK_BOOKS[0], quantity: 1 }, // Birds Gonna Be Happy ($45.00)
      { book: MOCK_BOOKS[1], quantity: 1 }  // Life Of The Wild ($38.00)
    ],
    total: 83.00
  },
  {
    id: 'ORD-72419',
    date: '2026-05-20',
    status: 'Shipped',
    items: [
      { book: MOCK_BOOKS[3], quantity: 2 }  // Simple Way Of Peace Life ($25.00 * 2)
    ],
    total: 50.00
  }
];

export const useBookstoreStore = create<BookstoreState>()(
  persist(
    (set, get) => ({
      books: MOCK_BOOKS,
      categories: CATEGORIES,
      cart: [],
      wishlist: [],
      user: null,
      orders: INITIAL_ORDERS(),

      addToCart: (book, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.book.id === book.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.book.id === book.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { book, quantity }] };
        });
      },

      removeFromCart: (bookId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.book.id !== bookId),
        }));
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(bookId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.book.id === bookId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (book) => {
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === book.id);
          if (exists) {
            return {
              wishlist: state.wishlist.filter((item) => item.id !== book.id),
            };
          }
          return { wishlist: [...state.wishlist, book] };
        });
      },

      isInWishlist: (bookId) => {
        return get().wishlist.some((item) => item.id === bookId);
      },

      login: (userData: any) => {
        set({
          user: {
            id: userData.id,
            name: userData.fullName || userData.name,
            email: userData.email,
            avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop`,
            phone: userData.phone,
            role: userData.role
          }
        });
      },

      updateProfile: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null
        }));
      },

      logout: () => {
        set({ user: null });
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders]
        }));
      },

      // Admin Books CRUD
      addBook: (newBook) => {
        set((state) => ({
          books: [newBook, ...state.books]
        }));
      },

      updateBook: (updatedBook) => {
        set((state) => ({
          books: state.books.map((b) => b.id === updatedBook.id ? updatedBook : b)
        }));
      },

      deleteBook: (bookId) => {
        set((state) => ({
          books: state.books.filter((b) => b.id !== bookId)
        }));
      },

      // Admin Categories CRUD
      addCategory: (newCategory) => {
        set((state) => ({
          categories: [...state.categories, newCategory]
        }));
      },

      updateCategory: (updatedCategory) => {
        set((state) => ({
          categories: state.categories.map((c) => c.id === updatedCategory.id ? updatedCategory : c)
        }));
      },

      deleteCategory: (categoryId) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== categoryId)
        }));
      }
    }),
    {
      name: 'bookstore-storage-v2',
    }
  )
);
