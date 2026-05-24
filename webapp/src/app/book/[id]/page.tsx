'use client';

import React, { useState, use, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Safe resolution of Next.js dynamic params
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, books } = useBookstoreStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Retrieve the selected book reactively from the store
  const book = useMemo(() => {
    return books.find((b) => b.id === resolvedParams.id);
  }, [resolvedParams.id, books]);

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans">
        <h2 className="text-2xl font-serif font-black text-text-dark">Book Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The book you are looking for does not exist in our catalog.</p>
        <button 
          onClick={() => router.push('/explore')} 
          className="mt-6 px-5 py-2.5 bg-primary text-white rounded-md text-xs font-bold btn-premium uppercase tracking-widest cursor-pointer shadow-md"
        >
          Return to library
        </button>
      </div>
    );
  }

  // Thumbnails images based on the cover (applying different elegant color overlays/crops to simulate different views)
  const thumbnails = [
    book.coverImage,
    `${book.coverImage}&blur=1`,
    book.coverImage,
  ];

  const wishlisted = isInWishlist(book.id);

  const handleAddToCart = () => {
    addToCart(book, quantity);
    toast.success(`Added ${quantity} x "${book.title}" to cart!`, {
      style: {
        background: '#fbfbf9',
        color: '#2a2421',
        border: '1px solid #ebdcd0',
        fontFamily: 'var(--font-sans)',
      },
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist(book);
    if (!wishlisted) {
      toast.success('Added to Wishlist!');
    } else {
      toast.success('Removed from Wishlist!');
    }
  };

  // Custom mock review count breakdown
  const ratingDistribution = [
    { stars: 5, percentage: 60 },
    { stars: 4, percentage: 25 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans select-none">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-border-light">
        <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-primary transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-primary truncate max-w-[200px]">{book.title}</span>
        </div>

        <button 
          onClick={() => router.back()} 
          className="text-xs font-bold text-text-muted hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-wider self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to library
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: Book Cover Images (4 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Main Book Cover with Spine shadows */}
          <div className="relative aspect-[3/4.2] w-full bg-cream-dark border border-border-warm rounded-2xl overflow-hidden shadow-lg p-5 flex items-center justify-center">
            
            {/* Book Spine shadow */}
            <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/15 z-10 blur-[0.5px]" />
            <div className="absolute top-0 left-3 bottom-0 w-[1px] bg-white/20 z-10" />

            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm">
              <Image 
                src={thumbnails[selectedImageIdx]} 
                alt={book.title} 
                fill
                priority
                className="object-cover transition-all duration-500"
              />
            </div>
          </div>

          {/* Small Thumbnails Row */}
          <div className="flex gap-4 justify-center">
            {thumbnails.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-16 h-22 rounded-lg overflow-hidden border bg-cream-dark transition-all duration-300 ${
                  selectedImageIdx === idx 
                    ? 'border-primary ring-2 ring-primary/20 scale-[1.03] shadow-md' 
                    : 'border-border-warm hover:border-text-muted opacity-70 hover:opacity-100'
                }`}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-black/10 z-10" />
                <Image 
                  src={thumb} 
                  alt={`${book.title} thumbnail ${idx + 1}`} 
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: Book Buying Info (7 cols) */}
        <div className="md:col-span-7 space-y-6 text-left">
          
          <div className="space-y-3">
            <span className="bg-primary-light text-primary font-bold text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-wider border border-border-warm">
              {book.category}
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-text-dark leading-tight">
              {book.title}
            </h1>
            
            <p className="text-sm italic text-text-muted font-medium mt-1">
              {book.subtitle}
            </p>

            <p className="text-sm font-semibold tracking-wider text-primary">
              By {book.author}
            </p>
          </div>

          {/* Rating Block */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-amber-500' : 'text-amber-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-text-dark ml-1">{book.rating}</span>
            </div>
            <span className="text-border-warm">|</span>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className="text-xs font-semibold text-text-muted hover:text-primary transition-colors underline cursor-pointer"
            >
              ({book.reviewsCount} Customer Reviews)
            </button>
          </div>

          {/* Price & Stock info */}
          <div className="py-4 border-y border-border-warm/60 flex items-center justify-between">
            <span className="text-3xl font-serif font-black text-text-dark">
              ${book.price.toFixed(2)}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wide shadow-2xs">
              <Check className="w-3.5 h-3.5" /> In Stock
            </span>
          </div>

          {/* Short description block */}
          <p className="text-sm text-text-muted leading-relaxed">
            {book.description}
          </p>

          {/* Quantity & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            
            {/* Quantity select */}
            <div className="flex items-center border border-border-warm rounded-md bg-white self-start sm:self-auto h-12">
              <button 
                onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                className="px-4 py-2 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors h-full flex items-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-6 font-bold text-text-dark text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors h-full flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 px-8 py-3.5 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all cursor-pointer h-12"
            >
              <ShoppingCart className="w-4 h-4" /> Add To Cart
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 border rounded-md transition-all cursor-pointer h-12 flex items-center justify-center ${
                wishlisted 
                  ? 'border-primary bg-primary-light text-primary hover:bg-primary hover:text-white' 
                  : 'border-border-warm bg-white text-text-muted hover:border-primary hover:text-primary'
              }`}
              title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-primary' : ''}`} />
            </button>

          </div>

          {/* Secure Trust row */}
          <div className="grid grid-cols-3 gap-2 pt-6 text-[10px] text-text-muted border-t border-border-light">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start border-x border-border-light px-2">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">Easy 30-day returns</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">100% Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>

      {/* TABS VIEW SECTION */}
      <section className="mt-20 border border-border-warm rounded-2xl bg-white overflow-hidden shadow-2xs">
        
        {/* Tab Headers */}
        <div className="flex border-b border-border-warm bg-cream-dark/35 overflow-x-auto shrink-0">
          {[
            { id: 'description', label: 'Description' },
            { id: 'details', label: 'Details' },
            { id: 'shipping', label: 'Shipping & Returns' },
            { id: 'reviews', label: `Reviews (${book.reviewsCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent text-text-muted hover:text-text-dark hover:bg-cream-dark/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="p-8 sm:p-10 text-left">
          
          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-serif font-black text-lg text-text-dark">A Heartwarming Literary Masterpiece</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Step door into an exquisitely woven narrative created by {book.author}. {book.description} Whether reading beside a peaceful autumn hearth or sipping coffee in a bustling cafe, this title guarantees an unforgettable escape from the modern digital rush.
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                Beautifully praised by readers and academic critics alike, it introduces characters of profound depth whose daily trials will resonate with you long after you turn the final page.
              </p>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === 'details' && (
            <div className="animate-in fade-in duration-300 max-w-xl">
              <h3 className="font-serif font-black text-lg text-text-dark mb-6">Specification Details</h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-border-light py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">Publisher</td>
                    <td className="font-bold text-text-dark text-right">{book.publisher}</td>
                  </tr>
                  <tr className="border-b border-border-light py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">Language</td>
                    <td className="font-bold text-text-dark text-right">{book.language}</td>
                  </tr>
                  <tr className="border-b border-border-light py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">Paperback</td>
                    <td className="font-bold text-text-dark text-right">{book.pages} pages</td>
                  </tr>
                  <tr className="border-b border-border-light py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">ISBN</td>
                    <td className="font-bold text-text-dark text-right">{book.isbn}</td>
                  </tr>
                  <tr className="border-b border-border-light py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">Published Date</td>
                    <td className="font-bold text-text-dark text-right">{book.publishedDate}</td>
                  </tr>
                  <tr className="py-3 flex justify-between">
                    <td className="font-semibold text-text-muted">Dimensions</td>
                    <td className="font-bold text-text-dark text-right">{book.dimensions}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="font-serif font-black text-lg text-text-dark">Shipping & Return Policies</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                We handle every book copy with delicate care. Books are packaged in custom heavy-grade cardboard envelopes to protect their covers, spines, and corners during transit.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-text-dark">Standard Shipping Delivery</h4>
                  <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
                    <li>Free on orders over $50.</li>
                    <li>Arrives in 3 to 5 business days.</li>
                    <li>Full parcel tracking links dispatched immediately.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-text-dark">Easy 30-Day Return Window</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Unsatisfied with your read? You can return the book within 30 days of shipment for a complete refund or store trade credit. The item must be in its original unread condition.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* Overall Breakdown summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-border-light pb-8">
                
                <div className="md:col-span-4 text-center space-y-2">
                  <h4 className="text-5xl font-serif font-black text-text-dark">{book.rating}</h4>
                  <div className="flex justify-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted font-semibold">Based on {book.reviewsCount} reviews</p>
                </div>

                {/* Rating bars */}
                <div className="md:col-span-5 space-y-2">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-3 text-xs font-semibold text-text-muted">
                      <span className="w-3">{dist.stars}★</span>
                      <div className="flex-1 bg-border-light h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-3 text-center md:text-right">
                  <button 
                    onClick={() => alert('Mock review editor opened!')}
                    className="px-5 py-3 border border-[#8c6239] text-[#8c6239] hover:bg-primary hover:text-white rounded-md text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-2xs hover:shadow-xs"
                  >
                    Write A Review
                  </button>
                </div>

              </div>

              {/* Reviews List */}
              <div className="space-y-8">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((rev) => (
                    <div key={rev.id} className="pb-8 border-b border-border-light last:border-0 last:pb-0 space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border-warm bg-cream-dark shrink-0">
                            <Image 
                              src={rev.avatar} 
                              alt={rev.userName} 
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-serif font-black text-sm text-text-dark">{rev.userName}</h5>
                              {rev.verified && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-medium">{rev.date}</span>
                          </div>
                        </div>

                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500' : 'text-amber-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed pl-13">
                        {rev.comment}
                      </p>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-text-muted font-serif">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}
