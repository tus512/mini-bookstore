'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Compass, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <footer className="w-full bg-cream-dark border-t border-border-warm font-sans mt-20">
      
      {/* Newsletter Clay Bar (matching the bottom of the mockup home page!) */}
      <div className="bg-[#8c6239] text-[#fbfbf9] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="font-serif font-black text-xl tracking-wide">Subscribe To Our Newsletter</h3>
            <p className="text-xs text-cream-bg/80 mt-1">Get the latest updates, curated collections, and exclusive offers.</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex max-w-md shrink-0 bg-white rounded-md p-1 border border-border-warm">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent px-4 py-2 text-text-dark text-sm outline-hidden flex-1 min-w-[200px]"
              required
            />
            <button
              type="submit"
              className="bg-[#2a2421] hover:bg-[#1a1513] text-white px-6 py-2 rounded-sm text-xs font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8c6239] rounded-md flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-black text-xl tracking-wider text-text-dark">
                BOOKDOOR
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              We curate only the finest books for eager readers. Step through our bookstore door and discover your next favorite world.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-cream-bg hover:bg-primary hover:text-white rounded-full text-text-muted transition-colors border border-border-warm flex items-center justify-center" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-cream-bg hover:bg-primary hover:text-white rounded-full text-text-muted transition-colors border border-border-warm flex items-center justify-center" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="p-2 bg-cream-bg hover:bg-primary hover:text-white rounded-full text-text-muted transition-colors border border-border-warm flex items-center justify-center" aria-label="X (Twitter)">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-text-dark uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-text-muted">
              <li><Link href="/" className="hover:text-primary transition-colors">Home Page</Link></li>
              <li><Link href="/explore" className="hover:text-primary transition-colors">Explore Library</Link></li>
              <li><Link href="/explore?focus=categories" className="hover:text-primary transition-colors">Book Categories</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Our Story</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif font-bold text-sm text-text-dark uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">F.A.Q. Help Desk</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Secure Payment Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-text-dark uppercase tracking-wider mb-4">Our Bookstore</h4>
            <p className="text-xs text-text-muted flex items-start gap-2">
              <span className="font-semibold text-text-dark shrink-0">Address:</span>
              <span>100 Vintage Library Way, Sector 4, Creamwood Hills</span>
            </p>
            <p className="text-xs text-text-muted flex items-center gap-2">
              <span className="font-semibold text-text-dark">Email:</span>
              <span>support@bookdoor.com</span>
            </p>
            <p className="text-xs text-text-muted flex items-center gap-2">
              <span className="font-semibold text-text-dark">Phone:</span>
              <span>+1 (800) 555-BOOK</span>
            </p>
          </div>

        </div>

        {/* Copyright Panel */}
        <div className="border-t border-border-warm mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} BOOKDOOR Bookstore. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
