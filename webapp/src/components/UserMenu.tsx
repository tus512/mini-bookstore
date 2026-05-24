'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ShieldCheck, BookOpen, ChevronRight } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface UserMenuProps {
  onClose: () => void;
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const router = useRouter();
  const { user, logout } = useBookstoreStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Logged out. See you next time!', {
      icon: '👋',
      style: { background: '#fbfbf9', color: '#2a2421', border: '1px solid #ebdcd0' }
    });
    router.push('/');
  };

  if (!user) return null;

  // Avatar initials fallback
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white border border-border-warm rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* User info header */}
      <div className="px-5 py-4 bg-cream-dark/40 border-b border-border-warm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-serif font-black text-sm text-text-dark truncate">{user.name}</p>
          <p className="text-[10px] text-text-muted truncate">{user.email}</p>
          {user.isAdmin && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded-sm mt-0.5 uppercase tracking-wider border border-border-warm">
              <ShieldCheck className="w-2.5 h-2.5" /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-2">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center justify-between px-5 py-3 text-xs font-semibold text-text-muted hover:bg-cream-dark/40 hover:text-text-dark transition-colors group"
        >
          <span className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
            My Profile
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/profile?tab=orders"
          onClick={onClose}
          className="flex items-center justify-between px-5 py-3 text-xs font-semibold text-text-muted hover:bg-cream-dark/40 hover:text-text-dark transition-colors group"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
            Purchase History
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </Link>

        {user.isAdmin && (
          <>
            <div className="mx-4 my-1.5 border-t border-border-warm" />
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-between px-5 py-3 text-xs font-semibold text-primary hover:bg-primary-light transition-colors group"
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                Admin Dashboard
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </>
        )}

        <div className="mx-4 my-1.5 border-t border-border-warm" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
