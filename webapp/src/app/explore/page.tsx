'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Star, Check, ArrowRight, Heart } from 'lucide-react';
import { Book } from '@/lib/mockData';
import BookCard from '@/components/BookCard';
import { useBookstoreStore } from '@/lib/store';

// Separated component to safely use useSearchParams inside Suspense
function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist, books, categories } = useBookstoreStore();

  // 1. STATE FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceMax, setPriceMax] = useState(100);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state filters with URL query parameters
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      const match = categories.find(c => c.name.toLowerCase() === catParam.toLowerCase());
      if (match) setSelectedCategory(match.name);
    } else {
      setSelectedCategory('All');
    }

    const filterParam = searchParams.get('filter');
    if (filterParam === 'wishlist') {
      // Just a shortcut, we can handle inside useMemo
    }

    const focusParam = searchParams.get('focus');
    if (focusParam === 'categories') {
      const element = document.getElementById('categories-filter-heading');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceMax, minRating, inStockOnly, sortBy]);

  // 2. DYNAMIC FILTERING & SORTING LOGIC
  const filteredBooks = useMemo(() => {
    const isWishlistMode = searchParams.get('filter') === 'wishlist';
    
    // Start with the base list
    let list = isWishlistMode ? wishlist : books;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by max price
    list = list.filter((b) => b.price <= priceMax);

    // Filter by rating
    if (minRating !== null) {
      list = list.filter((b) => b.rating >= minRating);
    }

    // Filter by availability
    if (inStockOnly) {
      list = list.filter((b) => b.inStock);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => (b.isNewRelease ? 1 : 0) - (a.isNewRelease ? 1 : 0));
    } else if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchQuery, selectedCategory, priceMax, minRating, inStockOnly, sortBy, wishlist, books, searchParams]);

  // 3. PAGINATION
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceMax(100);
    setMinRating(null);
    setInStockOnly(false);
    setSortBy('newest');
    if (searchParams.get('filter') === 'wishlist') {
      router.push('/explore');
    }
  };

  const isWishlistMode = searchParams.get('filter') === 'wishlist';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans select-none">
      
      {/* Header and Title */}
      <div className="mb-10 text-left">
        <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
          <span>Home</span>
          <span>/</span>
          <span className="text-primary">Explore</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-text-dark mt-2 tracking-wide uppercase">
          {isWishlistMode ? 'My Wishlist' : 'Explore Books'}
        </h1>
        <p className="text-xs text-text-muted mt-1">
          {isWishlistMode 
            ? 'Browse your handpicked favorite reads and purchase them anytime.'
            : 'Find your next favorite book from our meticulously curated literature collection.'
          }
        </p>
      </div>

      {/* Bar Search & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center mb-8 bg-cream-dark/30 border border-border-warm rounded-xl p-4">
        
        {/* Search Field */}
        <div className="lg:col-span-2 relative">
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-border-warm rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-medium shadow-2xs"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
        </div>

        {/* Quick Category filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-border-warm rounded-lg px-4 py-2.5 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-medium shadow-2xs cursor-pointer appearance-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-text-muted" />
        </div>

        {/* Sorting filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-border-warm rounded-lg px-4 py-2.5 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-medium shadow-2xs cursor-pointer appearance-none"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
          <div className="absolute right-4 top-3.5 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-text-muted" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS COLUMN */}
        <div className="space-y-8 lg:sticky lg:top-28 self-start">
          
          {/* Active Sidebar Filters Title */}
          <div className="flex items-center justify-between border-b border-border-warm pb-3">
            <h3 className="font-serif font-black text-sm text-text-dark uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wider cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* 1. Category filter list */}
          <div className="space-y-3">
            <h4 id="categories-filter-heading" className="font-serif font-extrabold text-sm text-text-dark">Categories</h4>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-all text-left font-medium ${
                  selectedCategory === 'All'
                    ? 'bg-primary text-white font-bold'
                    : 'text-text-muted hover:bg-cream-dark hover:text-text-dark'
                }`}
              >
                <span>All Categories</span>
                <span className={selectedCategory === 'All' ? 'text-white' : 'text-text-muted/60'}>
                  <span>({books.length})</span>
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-all text-left font-medium ${
                    selectedCategory === cat.name
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-text-muted hover:bg-cream-dark hover:text-text-dark'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={selectedCategory === cat.name ? 'text-white' : 'text-text-muted/60'}>
                    ({cat.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Slider */}
          <div className="space-y-3 border-t border-border-warm/60 pt-6">
            <div className="flex justify-between items-baseline">
              <h4 className="font-serif font-extrabold text-sm text-text-dark">Price Range</h4>
              <span className="text-xs font-bold text-primary">${priceMax.toFixed(2)} max</span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-1 bg-border-warm rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold">
                <span>$0</span>
                <span>$50</span>
                <span>$100+</span>
              </div>
            </div>
          </div>

          {/* 3. Rating filter */}
          <div className="space-y-3 border-t border-border-warm/60 pt-6">
            <h4 className="font-serif font-extrabold text-sm text-text-dark">Minimum Rating</h4>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? null : rating)}
                  className="flex items-center gap-3 text-left w-full group cursor-pointer text-xs font-medium"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    minRating === rating
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-warm bg-white group-hover:border-primary'
                  }`}>
                    {minRating === rating && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-dark transition-colors">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold">{rating} & Up</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Availability filter */}
          <div className="space-y-3 border-t border-border-warm/60 pt-6">
            <h4 className="font-serif font-extrabold text-sm text-text-dark">Availability</h4>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className="flex items-center gap-3 text-left w-full group cursor-pointer text-xs font-medium"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                inStockOnly
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-warm bg-white group-hover:border-primary'
              }`}>
                {inStockOnly && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
              </div>
              <span className="text-text-muted group-hover:text-text-dark font-medium transition-colors">
                In Stock Only ({books.filter(b => b.inStock).length})
              </span>
            </button>
          </div>

        </div>

        {/* RIGHT PRODUCTS GRID COLUMN */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Info Status Grid */}
          <div className="flex justify-between items-center text-xs text-text-muted border-b border-border-light pb-4 font-semibold">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of {filteredBooks.length} results
            </span>
            {isWishlistMode && (
              <span className="text-primary font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-primary" /> Active Wishlist View
              </span>
            )}
          </div>

          {/* Book Catalog Cards */}
          {filteredBooks.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-dashed border-border-warm rounded-2xl bg-cream-dark/10">
              <p className="text-base text-text-muted font-serif">No books match your active filter criteria.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-primary text-white rounded-md text-xs font-bold btn-premium uppercase tracking-widest cursor-pointer shadow-md"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Dynamic Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-10 border-t border-border-light">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 border border-border-warm rounded-md text-xs font-bold hover:bg-cream-dark text-text-muted disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 border rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-warm bg-white text-text-muted hover:bg-cream-dark'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 border border-border-warm rounded-md text-xs font-bold hover:bg-cream-dark text-text-muted disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                Next
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
