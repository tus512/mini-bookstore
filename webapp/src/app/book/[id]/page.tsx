'use client';

import React, {useState, use} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Star, Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, ArrowLeft, Check, Loader2} from 'lucide-react';
import {useBookstoreStore} from '@/lib/store';
import {useDoRequest} from '@/hooks/useDoRequest';
import toast from 'react-hot-toast';

export default function BookDetailPage({params}: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {addToCart, toggleWishlist, isInWishlist} = useBookstoreStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  // Fetch real book by ID from backend
  const {data: book, loading, error} = useDoRequest<any>({
    url: `/books/${resolvedParams.id}`,
    isFetchOnLoad: true,
  });

  const wishlisted = book ? isInWishlist(book.id) : false;
  const coverUrl = book?.coverImageUrl;
  const price = book ? parseFloat(book.price) : 0;
  const rating = book?.rating ?? 4.5;
  const reviewsCount = book?.reviewsCount ?? 0;
  const inStock = book ? (book.stockQuantity > 0) : false;

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, quantity);
    toast.success(`Added ${quantity} × "${book.title}" to cart!`, {
      style: {background: '#fbfbf9', color: '#2a2421', border: '1px solid #ebdcd0', fontFamily: 'var(--font-sans)'},
    });
  };

  const handleToggleWishlist = () => {
    if (!book) return;
    toggleWishlist(book);
    toast.success(wishlisted ? 'Removed from Wishlist!' : 'Added to Wishlist!');
  };

  const ratingDistribution = [
    {stars: 5, percentage: 60},
    {stars: 4, percentage: 25},
    {stars: 3, percentage: 10},
    {stars: 2, percentage: 3},
    {stars: 1, percentage: 2},
  ];

  if (loading) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center gap-3 font-sans text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin text-primary"/>
          <span className="font-serif text-base">Loading book details...</span>
        </div>
    );
  }

  if (!book || error) {
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

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans select-none">

        {/* Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-border-warm/60">
          <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-primary transition-colors">Explore</Link>
            <span>/</span>
            <span className="text-primary truncate max-w-[200px]">{book.title}</span>
          </div>
          <button
              onClick={() => router.back()}
              className="text-xs font-bold text-text-muted hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4"/> Back to library
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* LEFT: Book Cover */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-[3/4.2] w-full bg-cream-dark border border-border-warm rounded-2xl overflow-hidden shadow-xl p-5 flex items-center justify-center">
              <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/15 z-10 blur-[0.5px]"/>
              <div className="absolute top-0 left-3 bottom-0 w-[1px] bg-white/20 z-10"/>
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm">
                <Image
                    unoptimized
                    src={coverUrl}
                    alt={book.title}
                    fill priority
                    className="object-cover transition-all duration-500"
                />
              </div>
            </div>

            {/* Stock badge */}
            <div className="flex justify-center">
              {inStock ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <Check className="w-3.5 h-3.5"/> In Stock — {book.stockQuantity} copies left
                  </span>
              ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                    Out of Stock
                  </span>
              )}
            </div>
          </div>

          {/* RIGHT: Book Info */}
          <div className="md:col-span-7 space-y-6 text-left">

            <div className="space-y-3">
              {book.categoryName && (
                  <span className="bg-primary-light text-primary font-bold text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-wider border border-border-warm">
                    {book.categoryName}
                  </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-text-dark leading-tight">{book.title}</h1>
              <p className="text-sm font-semibold tracking-wider text-primary">By {book.author}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-500' : 'text-amber-200'}`}/>
                  ))}
                </div>
                <span className="text-xs font-bold text-text-dark ml-1">{rating.toFixed(1)}</span>
              </div>
              <span className="text-border-warm">|</span>
              <button onClick={() => setActiveTab('reviews')}
                      className="text-xs font-semibold text-text-muted hover:text-primary transition-colors underline cursor-pointer">
                ({reviewsCount} Reviews)
              </button>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-border-warm/60">
              <span className="text-3xl font-serif font-black text-text-dark">${price.toFixed(2)}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed line-clamp-4">{book.description}</p>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <div className="flex items-center border border-border-warm rounded-md bg-white self-start h-12">
                <button onClick={() => setQuantity(q => Math.max(q - 1, 1))}
                        className="px-4 py-2 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors h-full flex items-center">
                  <Minus className="w-4 h-4"/>
                </button>
                <span className="px-6 font-bold text-text-dark text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(q + 1, book.stockQuantity || 99))}
                        className="px-4 py-2 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors h-full flex items-center">
                  <Plus className="w-4 h-4"/>
                </button>
              </div>

              <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 px-8 py-3.5 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all cursor-pointer h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4"/> Add To Cart
              </button>

              <button
                  onClick={handleToggleWishlist}
                  className={`p-3.5 border rounded-md transition-all cursor-pointer h-12 flex items-center justify-center ${
                      wishlisted ? 'border-primary bg-primary-light text-primary hover:bg-primary hover:text-white' : 'border-border-warm bg-white text-text-muted hover:border-primary hover:text-primary'
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-primary' : ''}`}/>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-[10px] text-text-muted border-t border-border-warm/60">
              {[
                {icon: <Truck className="w-4 h-4 text-primary shrink-0"/>, label: 'Free shipping on all orders'},
                {icon: <RotateCcw className="w-4 h-4 text-primary shrink-0"/>, label: 'Easy 30-day returns'},
                {icon: <ShieldCheck className="w-4 h-4 text-primary shrink-0"/>, label: '100% Secure Checkout'},
              ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-1.5 justify-center sm:justify-start ${i === 1 ? 'border-x border-border-warm/60 px-2' : ''}`}>
                    {item.icon}
                    <span className="font-semibold">{item.label}</span>
                  </div>
              ))}
            </div>

          </div>
        </div>

        {/* Tabs Section */}
        <section className="mt-20 border border-border-warm rounded-2xl bg-white overflow-hidden shadow-xs">

          <div className="flex border-b border-border-warm bg-cream-dark/35 overflow-x-auto">
            {[
              {id: 'description', label: 'Description'},
              {id: 'details', label: 'Details'},
              {id: 'reviews', label: `Reviews (${reviewsCount})`},
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-dark hover:bg-cream-dark/20'
                    }`}
                >
                  {tab.label}
                </button>
            ))}
          </div>

          <div className="p-8 sm:p-10 text-left">

            {/* Description tab */}
            {activeTab === 'description' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="font-serif font-black text-lg text-text-dark">About This Book</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{book.description}</p>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Written by <strong>{book.author}</strong>, this title invites readers into a world of carefully crafted narratives.
                    Beautifully praised by readers and critics alike, it offers characters of profound depth whose journeys will resonate long after the final page.
                  </p>
                </div>
            )}

            {/* Details tab */}
            {activeTab === 'details' && (
                <div className="animate-in fade-in duration-300 max-w-xl">
                  <h3 className="font-serif font-black text-lg text-text-dark mb-6">Specification Details</h3>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                    {[
                      {label: 'ISBN', value: book.isbn},
                      {label: 'Author', value: book.author},
                      {label: 'Category', value: book.categoryName || '—'},
                      {label: 'Stock', value: `${book.stockQuantity} copies`},
                      {label: 'Status', value: book.status === 1 ? 'Available' : book.status === 0 ? 'Draft' : 'Discontinued'},
                    ].filter(r => r.value).map((row, i) => (
                        <tr key={i} className="border-b border-border-warm/60">
                          <td className="py-3 font-semibold text-text-muted">{row.label}</td>
                          <td className="py-3 font-bold text-text-dark text-right">{row.value}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-border-warm/60 pb-8">
                    <div className="md:col-span-4 text-center space-y-2">
                      <h4 className="text-5xl font-serif font-black text-text-dark">{rating.toFixed(1)}</h4>
                      <div className="flex justify-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}`}/>
                        ))}
                      </div>
                      <p className="text-xs text-text-muted font-semibold">Based on {reviewsCount} reviews</p>
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      {ratingDistribution.map(dist => (
                          <div key={dist.stars} className="flex items-center gap-3 text-xs font-semibold text-text-muted">
                            <span className="w-3">{dist.stars}★</span>
                            <div className="flex-1 bg-border-warm/30 h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-2 rounded-full" style={{width: `${dist.percentage}%`}}/>
                            </div>
                            <span className="w-8 text-right">{dist.percentage}%</span>
                          </div>
                      ))}
                    </div>

                    <div className="md:col-span-3 text-center md:text-right">
                      <button className="px-5 py-3 border border-primary text-primary hover:bg-primary hover:text-white rounded-md text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors">
                        Write A Review
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-10">
                    <p className="text-sm text-text-muted font-serif">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                </div>
            )}
          </div>
        </section>

      </div>
  );
}
