'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface BookCardProps {
  book: any;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useBookstoreStore();
  const wishlisted = isInWishlist(book.id);

  // Default ratings and reviews counts for dynamically seeded books
  const rating = book.rating !== undefined && book.rating !== null ? book.rating : 4.5;
  const reviewsCount = book.reviewsCount !== undefined && book.reviewsCount !== null ? book.reviewsCount : 12;
  const coverUrl = book.coverImageUrl;
  const price = parseFloat(book.price as any) || 0.00;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    toast.success(`"${book.title}" added to cart!`, {
      style: {
        background: '#fbfbf9',
        color: '#2a2421',
        border: '1px solid #ebdcd0',
        fontFamily: 'var(--font-sans)',
      },
      iconTheme: {
        primary: '#8c6239',
        secondary: '#fff',
      },
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book);
    if (!wishlisted) {
      toast.success(`Added to Wishlist!`);
    } else {
      toast.success(`Removed from Wishlist!`);
    }
  };

  return (
    <Link href={`/book/${book.id}`} className="group block font-sans">
      <div className="flex flex-col h-full bg-transparent">
        
        {/* Cover Container with Premium Card Shadow & Book Spine Effect */}
        <div className="relative aspect-[3/4.2] w-full bg-cream-dark rounded-xl overflow-hidden border border-border-warm/60 shadow-md group-hover:shadow-xl transition-all duration-500 ease-out flex items-center justify-center p-3 select-none">
          
          {/* Subtle Spine Texture */}
          <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-black/10 z-10 blur-[0.5px]" />
          <div className="absolute top-0 left-2.5 bottom-0 w-[1px] bg-white/20 z-10" />

          {/* Book Image */}
          <div className="relative w-full h-full rounded-md overflow-hidden shadow-sm group-hover:scale-[1.03] transition-transform duration-500 ease-out">
            <Image
              unoptimized
              src={coverUrl} 
              alt={book.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover"
              priority={book.isNewRelease}
            />
          </div>

          {/* Quick Action Overlay (Wishlist Icon) */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 p-2 bg-cream-bg/95 hover:bg-primary hover:text-white rounded-full text-text-muted shadow-xs transition-all duration-300 transform opacity-0 translate-y-[-4px] group-hover:opacity-100 group-hover:translate-y-0 z-20"
            title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary text-white hover:text-white' : ''}`} />
          </button>

          {/* New Release Badge */}
          {book.isNewRelease && (
            <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase shadow-xs select-none">
              New
            </span>
          )}
        </div>

        {/* Book Metadata */}
        <div className="mt-4 flex flex-col flex-1">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-amber-500' : 'text-amber-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-text-muted font-medium">({reviewsCount})</span>
          </div>

          {/* Title & Author */}
          <h3 className="font-serif font-extrabold text-base text-text-dark group-hover:text-primary transition-colors line-clamp-1">
            {book.title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{book.author}</p>
          
          {/* Price & Add To Cart Button */}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="font-serif font-black text-base text-text-dark">
              ${price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="p-2.5 bg-primary-light/80 hover:bg-primary text-primary hover:text-white rounded-lg transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}
