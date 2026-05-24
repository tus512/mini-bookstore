'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, ShoppingBag, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useBookstoreStore } from '@/lib/store';
import ProfileInfo from '@/components/profile/ProfileInfo';
import OrderHistory from '@/components/profile/OrderHistory';

const TABS = [
  { id: 'profile', label: 'My Profile',        icon: User },
  { id: 'orders',  label: 'Purchase History',  icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist',          icon: Heart },
];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, wishlist } = useBookstoreStore();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'profile');

  // Keep tab in sync with URL
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setActiveTab(t);
  }, [searchParams]);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 px-4 font-sans">
        <div className="w-16 h-16 bg-primary-light border border-border-warm rounded-full flex items-center justify-center mx-auto">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-black text-text-dark">Please Log In</h2>
        <p className="text-xs text-text-muted">You need to be signed in to view your profile.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/login" className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2.5 border border-border-warm text-text-muted rounded-lg text-xs font-bold hover:bg-cream-dark transition-colors">
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-primary">Profile</span>
        </div>
        <Link href="/" className="text-xs font-bold text-text-muted hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5" /> Back Home
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-black text-text-dark tracking-wide">My Account</h1>
        <p className="text-xs text-text-muted mt-1">Manage your profile and view your order history.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-cream-dark/40 border border-border-warm rounded-xl mb-8 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-primary shadow-sm border border-border-warm'
                : 'text-text-muted hover:text-text-dark'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === 'wishlist' && wishlist.length > 0 && (
              <span className="ml-0.5 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
            {id === 'orders' && (
              <span className="ml-0.5 bg-cream-dark border border-border-warm text-text-muted text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {useBookstoreStore.getState().orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'profile' && <ProfileInfo />}
        {activeTab === 'orders' && <OrderHistory />}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            {wishlist.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border-warm rounded-2xl bg-cream-dark/10 space-y-3">
                <Heart className="w-10 h-10 text-text-muted/40 mx-auto" />
                <p className="text-sm font-serif text-text-muted">Your wishlist is empty.</p>
                <Link href="/explore" className="inline-block mt-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                  Discover Books
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {wishlist.map(book => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group block bg-white border border-border-warm rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
                    <div className="relative aspect-[3/4] bg-cream-dark overflow-hidden">
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-serif font-bold text-xs text-text-dark line-clamp-2 leading-snug">{book.title}</p>
                      <p className="text-[10px] text-text-muted">{book.author}</p>
                      <p className="font-serif font-black text-sm text-primary">${book.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
