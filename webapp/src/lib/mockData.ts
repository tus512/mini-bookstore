export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  price: number;
  rating: number;
  reviewsCount: number;
  coverImage: string;
  category: string;
  description: string;
  publishedDate: string;
  publisher: string;
  language: string;
  pages: number;
  isbn: string;
  dimensions: string;
  inStock: boolean;
  featured: boolean;
  isNewRelease: boolean;
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  count: number;
  iconName: string;
}

export const CATEGORIES: Category[] = [
  { id: 'fiction', name: 'Fiction', count: 120, iconName: 'Book' },
  { id: 'non-fiction', name: 'Non-Fiction', count: 80, iconName: 'FileText' },
  { id: 'biography', name: 'Biography', count: 60, iconName: 'User' },
  { id: 'self-help', name: 'Self-help', count: 90, iconName: 'Sparkles' },
  { id: 'travel', name: 'Travel', count: 70, iconName: 'Compass' },
  { id: 'children', name: 'Children', count: 50, iconName: 'Baby' }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userName: 'Tom Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '07/05/2025',
    comment: 'A beautiful book with a powerful message. Truly enjoyed every page of this book. The typography and printing quality are also outstanding.',
    verified: true
  },
  {
    id: 'rev-2',
    userName: 'Jenny Willis',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    date: '07/03/2025',
    comment: 'An inspiring story that touched my heart. Highly recommended! I bought three more copies to gift to my friends and family.',
    verified: true
  },
  {
    id: 'rev-3',
    userName: 'Michael Chang',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    rating: 4,
    date: '06/28/2025',
    comment: 'Very well written. The author captures the essence of tranquility and daily mindfulness. A few sections felt slightly repetitive, but overall a great read.',
    verified: true
  }
];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'birds-gonna-be-happy',
    title: 'Birds Gonna Be Happy',
    subtitle: 'Finding Joy in the Simple Things',
    author: 'Timber Reed',
    price: 45.00,
    rating: 4.5,
    reviewsCount: 24,
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop',
    category: 'Fiction',
    description: 'A heartwarming story about nature, freedom, and finding happiness in the simplest things. Perfect for readers who love inspiring and uplifting tales of personal transformation, set against the backdrop of a peaceful countryside retreat.',
    publishedDate: 'May 10, 2024',
    publisher: 'Bookdoor Publishing',
    language: 'English',
    pages: 320,
    isbn: '978-1-1234567-8-7',
    dimensions: '5 x 8 inches',
    inStock: true,
    featured: true,
    isNewRelease: true,
    reviews: MOCK_REVIEWS
  },
  {
    id: 'life-of-the-wild',
    title: 'Life Of The Wild',
    subtitle: 'The Untamed beauty of our planet',
    author: 'Sarah Henley',
    price: 38.00,
    rating: 4.8,
    reviewsCount: 42,
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop',
    category: 'Non-Fiction',
    description: 'An immersive journey through the world\'s most remote wildernesses. Detailed observations, breathtaking descriptions, and a powerful call to preserve the fragile beauty of Earth\'s native ecosystems and species.',
    publishedDate: 'Jan 15, 2025',
    publisher: 'Earthbound Press',
    language: 'English',
    pages: 280,
    isbn: '978-2-8765432-1-0',
    dimensions: '6 x 9 inches',
    inStock: true,
    featured: true,
    isNewRelease: true,
    reviews: [
      {
        id: 'rev-l1',
        userName: 'David Atten',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        date: '02/10/2025',
        comment: 'A magnificent achievement in nature writing. Truly captures the spirit of the wild with deep sensitivity.',
        verified: true
      }
    ]
  },
  {
    id: 'the-silent-waves',
    title: 'The Silent Waves',
    subtitle: 'Poetry of the deep ocean',
    author: 'John Waves',
    price: 40.00,
    rating: 4.2,
    reviewsCount: 18,
    coverImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=600&auto=format&fit=crop',
    category: 'Fiction',
    description: 'A lyrical, moody collection of stories and poetry reflecting on the eternal mystery of the sea. Explores themes of solitude, healing, and the unspoken connections between human emotions and the massive ocean depths.',
    publishedDate: 'Oct 22, 2024',
    publisher: 'Marine Lite Press',
    language: 'English',
    pages: 180,
    isbn: '978-3-4567890-1-2',
    dimensions: '4.5 x 7 inches',
    inStock: true,
    featured: true,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'simple-way-of-peace-life',
    title: 'Simple Way Of Peace Life',
    subtitle: 'Practical guide to everyday zen',
    author: 'Dr. Alan Carter',
    price: 25.00,
    rating: 4.7,
    reviewsCount: 56,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
    category: 'Self-help',
    description: 'A comprehensive, practical guide to living a calm, mindful, and intentional life in the midst of modern chaos. Includes accessible meditation routines, breathing exercises, and philosophy for everyday peace.',
    publishedDate: 'Mar 05, 2025',
    publisher: 'Mindfulness Works',
    language: 'English',
    pages: 240,
    isbn: '978-4-5678901-2-3',
    dimensions: '5 x 7.5 inches',
    inStock: true,
    featured: true,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'great-travel-at-desert',
    title: 'Great Travel At Desert',
    subtitle: 'Crossing the empty quarters',
    author: 'Elena Rostova',
    price: 35.00,
    rating: 4.6,
    reviewsCount: 31,
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop',
    category: 'Travel',
    description: 'An exciting first-hand account of a solo trek across the vast, golden deserts of the Middle East. Captures the profound silence of the dunes, the incredible survival strategies of desert nomads, and the inner peace of ultimate isolation.',
    publishedDate: 'Sep 12, 2024',
    publisher: 'Wanderlust Media',
    language: 'English',
    pages: 310,
    isbn: '978-5-6789012-3-4',
    dimensions: '5.5 x 8.5 inches',
    inStock: true,
    featured: true,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'the-lady-beauty-scarlett',
    title: 'The Lady Beauty Scarlett',
    subtitle: 'A historical romance epic',
    author: 'Victoria Sterling',
    price: 28.00,
    rating: 4.4,
    reviewsCount: 29,
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
    category: 'Fiction',
    description: 'A grand historical novel set in the late 19th-century English countryside. Chronicles the life of Scarlett, an independent woman fighting for her inheritance and finding unexpected love amidst societal expectations and family drama.',
    publishedDate: 'Nov 18, 2024',
    publisher: 'Regency Classics',
    language: 'English',
    pages: 410,
    isbn: '978-6-7890123-4-5',
    dimensions: '6 x 9 inches',
    inStock: true,
    featured: true,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'once-upon-a-time',
    title: 'Once Upon A Time',
    subtitle: 'Fairytales for a modern age',
    author: 'Clara Greenwood',
    price: 30.00,
    rating: 4.9,
    reviewsCount: 65,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    category: 'Children',
    description: 'A magical compilation of short stories that inspire kindness, courage, and creativity in young minds. Beautifully written tales featuring friendly dragons, talking trees, and young heroes discovering the power of empathy.',
    publishedDate: 'Dec 01, 2024',
    publisher: 'Little Dreamers Press',
    language: 'English',
    pages: 150,
    isbn: '978-7-8901234-5-6',
    dimensions: '8 x 10 inches',
    inStock: true,
    featured: true,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'the-last-sunset',
    title: 'The Last Sunset',
    subtitle: 'Reflections from the edge of the world',
    author: 'M. J. Brown',
    price: 38.00,
    rating: 4.3,
    reviewsCount: 15,
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
    category: 'Travel',
    description: 'A contemplative travelogue exploring the world\'s westernmost coasts. A meditation on the passage of time, cultural erosion, and the exquisite beauty of sunsets viewed from remote cliffs and beaches.',
    publishedDate: 'Jul 08, 2024',
    publisher: 'Horizon Books',
    language: 'English',
    pages: 220,
    isbn: '978-8-9012345-6-7',
    dimensions: '5.2 x 8 inches',
    inStock: true,
    featured: false,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'journey-to-freedom',
    title: 'Journey to Freedom',
    subtitle: 'My path from darkness to light',
    author: 'J. Watson',
    price: 42.00,
    rating: 4.8,
    reviewsCount: 88,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    category: 'Biography',
    description: 'A moving, deeply personal memoir detailing the author\'s escape from political persecution and their challenging journey to build a new life in a free country. A testament to the unbreakable strength of the human spirit.',
    publishedDate: 'Feb 14, 2025',
    publisher: 'Liberty Press',
    language: 'English',
    pages: 350,
    isbn: '978-9-0123456-7-8',
    dimensions: '6 x 9 inches',
    inStock: true,
    featured: false,
    isNewRelease: false,
    reviews: []
  },
  {
    id: 'mindful-living',
    title: 'Mindful Living',
    subtitle: 'Reclaiming peace in a digital world',
    author: 'D. Hayes',
    price: 30.00,
    rating: 4.5,
    reviewsCount: 37,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
    category: 'Self-help',
    description: 'An insightful analysis of digital fatigue and concrete advice for disconnecting, establishing boundaries, and focusing on meaningful physical relationships and creative pursuits in a hyper-connected age.',
    publishedDate: 'Aug 30, 2024',
    publisher: 'Veritas Publishing',
    language: 'English',
    pages: 200,
    isbn: '978-0-1234567-8-9',
    dimensions: '5 x 8 inches',
    inStock: true,
    featured: false,
    isNewRelease: false,
    reviews: []
  }
];
