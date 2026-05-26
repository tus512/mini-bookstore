import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import apiClient from '@/lib/apiClient';

export interface CartItem {
  book: any;
  quantity: number;
}

export interface PersistedCartItem {
  bookId: string;
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

interface BookstoreState {
  // Client persistent IDs
  cartIds: PersistedCartItem[];
  wishlistIds: string[];

  // Client states (runtime-only, not persisted)
  books: any[];
  categories: any[];
  cart: CartItem[];
  wishlist: any[];
  user: UserProfile | null;

  // Actions
  addToCart: (book: any, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (book: any) => void;
  isInWishlist: (bookId: string) => boolean;

  // Auth actions
  login: (userData: any) => void;
  logout: () => void;

  // Sync actions to resolve stale localstorage data with the backend
  syncUserProfile: () => Promise<void>;
  syncCartAndWishlist: () => Promise<void>;
}

export const useBookstoreStore = create<BookstoreState>()(
    persist(
        (set, get) => ({
          cartIds: [],
          wishlistIds: [],

          books: [],
          categories: [],
          cart: [],
          wishlist: [],
          user: null,

          addToCart: (book, quantity = 1) => {
            set((state) => {
              // 1. Update persisted IDs
              let newCartIds = [...state.cartIds];
              const existingId = newCartIds.find((x) => x.bookId === book.id);
              if (existingId) {
                newCartIds = newCartIds.map((x) =>
                    x.bookId === book.id ? {...x, quantity: x.quantity + quantity} : x
                );
              } else {
                newCartIds.push({bookId: book.id, quantity});
              }

              // 2. Update runtime state
              let newCart = [...state.cart];
              const existingCartItem = newCart.find((item) => item.book.id === book.id);
              if (existingCartItem) {
                newCart = newCart.map((item) =>
                    item.book.id === book.id
                        ? {...item, quantity: item.quantity + quantity}
                        : item
                );
              } else {
                newCart.push({book, quantity});
              }

              return {cartIds: newCartIds, cart: newCart};
            });
          },

          removeFromCart: (bookId) => {
            set((state) => ({
              cartIds: state.cartIds.filter((x) => x.bookId !== bookId),
              cart: state.cart.filter((item) => item.book.id !== bookId)
            }));
          },

          updateQuantity: (bookId, quantity) => {
            if (quantity <= 0) {
              get().removeFromCart(bookId);
              return;
            }
            set((state) => ({
              cartIds: state.cartIds.map((x) =>
                  x.bookId === bookId ? {...x, quantity} : x
              ),
              cart: state.cart.map((item) =>
                  item.book.id === bookId ? {...item, quantity} : item
              )
            }));
          },

          clearCart: () => set({cartIds: [], cart: []}),

          toggleWishlist: (book) => {
            set((state) => {
              const exists = state.wishlistIds.includes(book.id);
              if (exists) {
                return {
                  wishlistIds: state.wishlistIds.filter((id) => id !== book.id),
                  wishlist: state.wishlist.filter((item) => item.id !== book.id)
                };
              }
              return {
                wishlistIds: [...state.wishlistIds, book.id],
                wishlist: [...state.wishlist, book]
              };
            });
          },

          isInWishlist: (bookId) => {
            return get().wishlistIds.includes(bookId);
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

          logout: () => {
            set({user: null});
          },

          syncUserProfile: async () => {
            if (typeof window === 'undefined') return;
            const token = localStorage.getItem('auth_token');
            if (!token) {
              set({user: null});
              return;
            }
            try {
              const userRes = await apiClient.get('/users/me');
              get().login(userRes.data);
            } catch (err: any) {
              console.error('Failed to sync user profile:', err);
              if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('auth_token');
                set({user: null});
              }
            }
          },

          syncCartAndWishlist: async () => {
            const state = get();
            const cartIds = state.cartIds;
            const wishlistIds = state.wishlistIds;

            if (cartIds.length === 0 && wishlistIds.length === 0) {
              set({cart: [], wishlist: []});
              return;
            }

            try {
              // Merge all unique IDs to fetch them at once
              const allIds = Array.from(new Set([
                ...cartIds.map(x => x.bookId),
                ...wishlistIds
              ]));

              const res = await apiClient.get('/books', {
                params: {
                  ids: allIds.join(','),
                  size: 100
                }
              });

              const fetchedBooks = res.data.content || [];

              // Map resolved cart
              const resolvedCart = cartIds.map(item => {
                const book = fetchedBooks.find((b: any) => b.id === item.bookId);
                return book ? { book, quantity: item.quantity } : null;
              }).filter((item): item is CartItem => item !== null);

              // Map resolved wishlist
              const resolvedWishlist = wishlistIds.map(id => {
                return fetchedBooks.find((b: any) => b.id === id) || null;
              }).filter((book): book is any => book !== null);

              set({
                cart: resolvedCart,
                wishlist: resolvedWishlist
              });
            } catch (err) {
              console.error('Failed to sync cart and wishlist items in bulk:', err);
            }
          }

        }),
        {
          name: 'bookstore-storage-v2',
          partialize: (state) => ({
            cartIds: state.cartIds,
            wishlistIds: state.wishlistIds,
            user: state.user
          })
        }
    )
);
