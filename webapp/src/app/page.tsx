'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, Truck, MapPin, ShieldCheck, Headphones,
  Book as BookIcon, FileText, User, Sparkles, Compass, Baby, ChevronRight
} from 'lucide-react';
import { Book } from '@/lib/mockData';
import BookCard from '@/components/BookCard';
import { useBookstoreStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { addToCart, books, categories } = useBookstoreStore();
  const [heroIndex, setHeroIndex] = useState(0);

  // Filter books for the slideshow (isNewRelease or featured)
  const heroBooks = books.filter(b => b.isNewRelease || b.id === 'journey-to-freedom').slice(0, 3);

  // Featured bookshelf section (grid of 4 books matching the mockup)
  const featuredBooks = books.filter(b => b.featured).slice(0, 4);

  // Auto-rotate hero slider every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBooks.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBooks.length]);

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroBooks.length) % heroBooks.length);
  };

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroBooks.length);
  };

  const handleQuickAdd = (book: Book) => {
    addToCart(book, 1);
    toast.success(`"${book.title}" added to cart!`);
  };

  // Map category icon name to Lucide Component
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Book': return <BookIcon className="w-6 h-6 text-primary" />;
      case 'FileText': return <FileText className="w-6 h-6 text-primary" />;
      case 'User': return <User className="w-6 h-6 text-primary" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-primary" />;
      case 'Compass': return <Compass className="w-6 h-6 text-primary" />;
      case 'Baby': return <Baby className="w-6 h-6 text-primary" />;
      default: return <BookIcon className="w-6 h-6 text-primary" />;
    }
  };

  const currentHeroBook = heroBooks[heroIndex];

  return (
    <div className="w-full font-sans bg-cream-bg select-none">

      {/* 1. HERO SLIDER */}
      <section className="relative overflow-hidden bg-cream-dark/40 py-16 md:py-24 border-b border-border-warm">
        {/* Soft shadow silhouettes in the background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none select-none blur-md">
          <div className="w-96 h-96 rounded-full bg-primary/20 absolute -right-20 -top-20" />
          <div className="w-64 h-64 rounded-full bg-clay/20 absolute right-40 bottom-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 min-h-[460px]">

            {/* Left Column: Text Content */}
            <div className="flex flex-col justify-center space-y-6 text-left transition-all duration-700 ease-in-out transform">
              <div>
                <span className="bg-primary-light text-primary font-bold text-xs px-3 py-1 rounded-sm uppercase tracking-widest border border-border-warm select-none">
                  NEW RELEASE
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-text-dark leading-none">
                  {currentHeroBook.title}
                </h1>
                <p className="text-sm font-semibold tracking-wider text-primary uppercase font-sans">
                  By {currentHeroBook.author}
                </p>
              </div>
              <p className="text-sm text-text-muted max-w-lg leading-relaxed">
                {currentHeroBook.description}
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/book/${currentHeroBook.id}`}
                  className="px-6 py-3 bg-[#8c6239] hover:bg-[#704f2f] text-[#fbfbf9] text-xs font-bold tracking-widest uppercase rounded-sm btn-premium transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  READ MORE +
                </Link>
                <button
                  onClick={() => handleQuickAdd(currentHeroBook)}
                  className="px-6 py-3 border border-border-warm hover:bg-white text-text-dark text-xs font-bold tracking-widest uppercase rounded-sm transition-all duration-300 cursor-pointer"
                >
                  Add To Cart
                </button>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center space-x-2 pt-8">
                {heroBooks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${idx === heroIndex ? 'bg-primary w-8' : 'bg-accent/40 w-2.5'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: 3D Book Display */}
            <div className="flex items-center justify-center relative">

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrevHero}
                className="absolute left-[-20px] md:left-0 p-3 bg-white hover:bg-primary hover:text-white rounded-full text-text-muted shadow-md hover:shadow-lg transition-all duration-300 z-20 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Book Spine Overlay Card */}
              <div className="relative w-[280px] sm:w-[320px] aspect-[3/4.2] animate-in fade-in zoom-in-95 duration-700 ease-out select-none">
                {/* Book shadow */}
                <div className="absolute inset-0 bg-black/10 rounded-2xl blur-xl transform translate-x-4 translate-y-6 scale-[0.98] -rotate-3 z-0" />

                {/* Main 3D Cover */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border-warm/75 shadow-xl bg-cream-dark z-10 transform hover:scale-[1.02] hover:-rotate-1 transition-transform duration-500 ease-out flex items-center justify-center p-4">
                  <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/15 z-20 blur-[0.5px]" />
                  <div className="absolute top-0 left-3 bottom-0 w-[1px] bg-white/20 z-20" />

                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={currentHeroBook.coverImage}
                      alt={currentHeroBook.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextHero}
                className="absolute right-[-20px] md:right-0 p-3 bg-white hover:bg-primary hover:text-white rounded-full text-text-muted shadow-md hover:shadow-lg transition-all duration-300 z-20 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* 2. SERVICES INFO GRID */}
      <section className="py-10 bg-white border-b border-border-warm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">

            {/* Feature 1 */}
            <div className="flex items-center gap-4 px-4 border-r-0 md:border-r border-border-warm/60 last:border-0 justify-center md:justify-start">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-black text-sm text-text-dark">FREE SHIPPING</h4>
                <p className="text-[10px] text-text-muted mt-0.5">On all orders over $50</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 px-4 border-r-0 md:border-r border-border-warm/60 last:border-0 justify-center md:justify-start">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-black text-sm text-text-dark">BOOKSTORE</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Find your best local books</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 px-4 border-r-0 md:border-r border-border-warm/60 last:border-0 justify-center md:justify-start">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-black text-sm text-text-dark">EASY PAYMENT</h4>
                <p className="text-[10px] text-text-muted mt-0.5">100% Secure checkouts</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 px-4 justify-center md:justify-start">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-serif font-black text-sm text-text-dark">24/7 SUPPORT</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Dedicated helper desk</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED BOOKS SHELF */}
      <section className="py-20 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Row */}
          <div className="flex justify-between items-baseline mb-12 border-b border-border-warm pb-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-text-dark tracking-wide uppercase">
              Featured Books
            </h2>
            <Link
              href="/explore"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors uppercase tracking-wider"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid Shelf */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY */}
      <section className="py-16 bg-cream-dark/30 border-y border-border-warm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-text-dark tracking-wide uppercase">
              Browse By Category
            </h2>
            <p className="text-xs text-text-muted mt-2">
              Browse our fully stocked literature collection filtered by your favorite genres.
            </p>
          </div>

          {/* Category Shelf Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.name}`}
                className="bg-white hover:bg-primary-light border border-border-warm rounded-xl p-6 text-center shadow-2xs hover:shadow-md transition-all duration-300 group cursor-pointer block"
              >
                <h4 className="font-serif font-extrabold text-sm text-text-dark group-hover:text-primary transition-colors">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL CTA SECTION */}
      <section className="py-20 bg-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cream-dark/40 rounded-2xl border border-border-warm overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center">

            {/* CTA Left Column text */}
            <div className="p-8 sm:p-12 lg:p-16 space-y-6 text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-text-dark leading-tight">
                Get Lost In A <br />Good Book
              </h2>
              <p className="text-sm text-text-muted leading-relaxed max-w-md">
                Discover your next favorite read from our handpicked collections. From heartwarming tales of personal growth to edge-of-your-seat travels, we open the door to limitless worlds.
              </p>
              <div className="pt-2">
                <Link
                  href="/explore"
                  className="px-6 py-3 bg-[#8c6239] hover:bg-[#704f2f] text-[#fbfbf9] text-xs font-bold tracking-widest uppercase rounded-sm btn-premium inline-flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Explore Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* CTA Right Column Photo (matching cozy room with reading woman) */}
            <div className="relative h-[320px] md:h-full min-h-[360px] w-full self-stretch bg-cream-dark">
              <Image
                src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop"
                alt="Cozy library shelf reading space"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Elegant overlay blur filter */}
              <div className="absolute inset-0 bg-primary/5 mix-blend-multiply pointer-events-none" />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
