'use client';

import React, {useState, useMemo, useEffect, Suspense} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Search, SlidersHorizontal, Star, Check, Heart, Loader2, ChevronLeft, ChevronRight} from 'lucide-react';
import BookCard from '@/components/BookCard';
import {useBookstoreStore} from '@/lib/store';
import {useDoRequest} from '@/hooks/useDoRequest';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {wishlist} = useBookstoreStore();
  const isWishlistMode = searchParams.get('filter') === 'wishlist';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [priceMax, setPriceMax] = useState(100);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 12;

  // Sync from URL params on mount
  useEffect(() => {
    const catId = searchParams.get('categoryId');
    if (catId) setSelectedCategoryId(catId);
  }, []);

  // Fetch categories
  const {data: categories = []} = useDoRequest<any[]>({
    url: '/categories',
    isFetchOnLoad: true,
  });

  // Fetch books (server-side paginated + filtered)
  const {data: booksPage, loading, doRequest: fetchBooks} = useDoRequest<any>({
    url: '/books',
    isFetchOnLoad: false,
  });

  // Refetch whenever filters change
  useEffect(() => {
    if (isWishlistMode) return; // wishlist handled client-side
    const delay = setTimeout(() => {
      fetchBooks({
        params: {
          search: searchQuery.trim() || undefined,
          categoryId: selectedCategoryId || undefined,
          page: currentPage,
          size: PAGE_SIZE,
        }
      });
    }, 200);
    return () => clearTimeout(delay);
  }, [searchQuery, selectedCategoryId, currentPage, isWishlistMode]);

  const books = booksPage?.content || [];
  const totalPages = booksPage?.totalPages || 1;
  const totalElements = booksPage?.totalElements || 0;

  // Wishlist mode: filter client-side
  const displayBooks = isWishlistMode ? wishlist : books;
  const filteredWishlist = useMemo(() => {
    if (!isWishlistMode) return displayBooks;
    let list = [...wishlist];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q));
    }
    if (selectedCategoryId) {
      list = list.filter(b => b.categoryId === selectedCategoryId);
    }
    list = list.filter(b => parseFloat(b.price) <= priceMax);
    return list;
  }, [wishlist, searchQuery, selectedCategoryId, priceMax, isWishlistMode]);

  const finalBooks = isWishlistMode ? filteredWishlist : displayBooks;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('');
    setPriceMax(100);
    setSortBy('newest');
    setCurrentPage(0);
    if (isWishlistMode) router.push('/explore');
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans select-none">

        {/* Header */}
        <div className="mb-10 text-left">
          <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
            <span>Home</span>
            <span>/</span>
            <span className="text-primary">{isWishlistMode ? 'Wishlist' : 'Explore'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-text-dark mt-2 tracking-wide uppercase">
            {isWishlistMode ? 'My Wishlist' : 'Explore Books'}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {isWishlistMode
                ? 'Browse your handpicked favorite reads and purchase them anytime.'
                : 'Find your next favorite book from our meticulously curated literature collection.'}
          </p>
        </div>

        {/* Top Search & Sort bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mb-8 bg-cream-dark/30 border border-border-warm rounded-xl p-4">
          <div className="lg:col-span-2 relative">
            <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full bg-white border border-border-warm rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-dark outline-none focus:border-primary transition-colors font-medium shadow-xs"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none"/>
          </div>

          <div className="relative">
            <select
                value={selectedCategoryId}
                onChange={e => {
                  setSelectedCategoryId(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full bg-white border border-border-warm rounded-lg px-4 py-2.5 text-xs text-text-dark outline-none focus:border-primary font-medium shadow-xs cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-text-muted"/>
          </div>

          <div className="relative">
            <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-white border border-border-warm rounded-lg px-4 py-2.5 text-xs text-text-dark outline-none focus:border-primary font-medium shadow-xs cursor-pointer appearance-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-text-muted"/>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="space-y-8 lg:sticky lg:top-28 self-start">
            <div className="flex items-center justify-between border-b border-border-warm pb-3">
              <h3 className="font-serif font-black text-sm text-text-dark uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary"/> Filters
              </h3>
              <button onClick={handleResetFilters}
                      className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wider cursor-pointer">
                Reset All
              </button>
            </div>

            {/* Category filter */}
            <div className="space-y-3">
              <h4 id="categories-filter-heading" className="font-serif font-extrabold text-sm text-text-dark">Categories</h4>
              <div className="flex flex-col space-y-1.5">
                <button
                    onClick={() => {
                      setSelectedCategoryId('');
                      setCurrentPage(0);
                    }}
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-all text-left font-medium ${
                        !selectedCategoryId ? 'bg-primary text-white font-bold' : 'text-text-muted hover:bg-cream-dark hover:text-text-dark'
                    }`}
                >
                  <span>All Categories</span>
                  <span>({totalElements || '—'})</span>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setCurrentPage(0);
                        }}
                        className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-all text-left font-medium ${
                            selectedCategoryId === cat.id ? 'bg-primary text-white font-bold shadow-xs' : 'text-text-muted hover:bg-cream-dark hover:text-text-dark'
                        }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3 border-t border-border-warm/60 pt-6">
              <div className="flex justify-between items-baseline">
                <h4 className="font-serif font-extrabold text-sm text-text-dark">Price Range</h4>
                <span className="text-xs font-bold text-primary">up to ${priceMax}</span>
              </div>
              <input
                  type="range" min="10" max="100" step="5" value={priceMax}
                  onChange={e => {
                    setPriceMax(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="w-full h-1 bg-border-warm rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold">
                <span>$0</span><span>$50</span><span>$100+</span>
              </div>
            </div>

            {/* Wishlist shortcut */}
            <div className="space-y-3 border-t border-border-warm/60 pt-6">
              <button
                  onClick={() => router.push(isWishlistMode ? '/explore' : '/explore?filter=wishlist')}
                  className={`flex items-center gap-3 text-xs px-3 py-2 rounded-md transition-all w-full font-medium ${
                      isWishlistMode ? 'bg-primary text-white' : 'text-text-muted hover:bg-cream-dark'
                  }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlistMode ? 'fill-white' : ''}`}/>
                My Wishlist ({wishlist.length})
              </button>
            </div>
          </div>

          {/* BOOK GRID */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex justify-between items-center text-xs text-text-muted border-b border-border-warm pb-4 font-semibold">
              {isWishlistMode ? (
                  <span>Showing {finalBooks.length} saved book{finalBooks.length !== 1 ? 's' : ''}</span>
              ) : loading ? (
                  <span>Loading...</span>
              ) : (
                  <span>
                    {totalElements > 0
                        ? `Showing ${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of ${totalElements} results`
                        : 'No results found'}
                  </span>
              )}
              {isWishlistMode && (
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-primary"/> Active Wishlist View
                  </span>
              )}
            </div>

            {loading && !isWishlistMode ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                </div>
            ) : finalBooks.length === 0 ? (
                <div className="py-24 text-center space-y-4 border border-dashed border-border-warm rounded-2xl bg-cream-dark/10">
                  <p className="text-base text-text-muted font-serif">No books match your filters.</p>
                  <button onClick={handleResetFilters}
                          className="px-5 py-2.5 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md">
                    Clear all filters
                  </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                  {finalBooks.map((book: any) => (
                      <BookCard key={book.id} book={book}/>
                  ))}
                </div>
            )}

            {/* Pagination (server-side, only for non-wishlist) */}
            {!isWishlistMode && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8 border-t border-border-warm">
                  <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="p-2 border border-border-warm rounded-md text-xs font-bold hover:bg-cream-dark text-text-muted disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4"/>
                  </button>

                  {/* Show at most 5 page buttons */}
                  {(() => {
                    const pages = [];
                    const start = Math.max(0, currentPage - 2);
                    const end = Math.min(totalPages - 1, start + 4);
                    for (let i = start; i <= end; i++) {
                      pages.push(
                          <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`w-9 h-9 border rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  currentPage === i ? 'border-primary bg-primary text-white' : 'border-border-warm bg-white text-text-muted hover:bg-cream-dark'
                              }`}
                          >
                            {i + 1}
                          </button>
                      );
                    }
                    return pages;
                  })()}

                  <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="p-2 border border-border-warm rounded-md text-xs font-bold hover:bg-cream-dark text-text-muted disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
            )}
          </div>

        </div>
      </div>
  );
}

export default function ExplorePage() {
  return (
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary"/>
        </div>
      }>
        <ExploreContent/>
      </Suspense>
  );
}
