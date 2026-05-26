'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Search, ShoppingBag, Heart, User, BookOpen, Menu, X} from 'lucide-react';
import {useBookstoreStore} from '@/lib/store';
import CartDrawer from './CartDrawer';
import UserMenu from './UserMenu';

export default function Header() {
  const pathname = usePathname();
  const {cart, wishlist, user} = useBookstoreStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  const navLinks = [
    {name: 'Home', path: '/'},
    {name: 'Explore', path: '/explore'},
    // { name: 'Categories', path: '/explore?focus=categories' },
    // { name: 'About', path: '#' },
    // { name: 'Contact', path: '#' },
  ];

  return (
      <>
        <header
            className="sticky top-0 z-40 w-full bg-cream-bg/95 border-b border-border-warm backdrop-blur-md transition-all duration-300 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">

              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2 group">
                  <div
                      className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
                    <BookOpen className="w-5 h-5"/>
                  </div>
                  <span
                      className="font-serif font-extrabold text-2xl tracking-wider text-text-dark group-hover:text-primary transition-colors">
                  BOOKDOOR
                </span>
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex space-x-10">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path || (link.path.startsWith('/explore') && pathname === '/explore');
                  return (
                      <Link
                          key={link.name}
                          href={link.path}
                          className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                              isActive
                                  ? 'text-primary font-bold'
                                  : 'text-text-muted hover:text-text-dark'
                          }`}
                      >
                        {link.name}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"/>
                        )}
                      </Link>
                  );
                })}
              </nav>

              {/* Right Icons Row */}
              <div className="hidden md:flex items-center space-x-1">
                {/* Search */}
                <Link href="/explore">
                  <button
                      className="p-2.5 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-cream-dark cursor-pointer"
                      title="Search Books">
                    <Search className="w-5 h-5"/>
                  </button>
                </Link>

                {/* Wishlist */}
                <Link href="/explore?filter=wishlist"
                      className="relative p-2.5 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-cream-dark"
                      title="Wishlist">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-primary text-primary' : ''}`}/>
                  {wishlistCount > 0 && (
                      <span
                          className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2.5 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-cream-dark cursor-pointer"
                    title="Cart"
                >
                  <ShoppingBag className="w-5 h-5"/>
                  {cartItemsCount > 0 && (
                      <span
                          className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartItemsCount}
                  </span>
                  )}
                </button>

                {/* User avatar / login — with dropdown */}
                <div className="relative pl-2 ml-1 border-l border-border-warm">
                  {user ? (
                      <button
                          onClick={() => setIsUserMenuOpen(v => !v)}
                          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                          title={user.name}
                      >
                        {initials}
                      </button>
                  ) : (
                      <Link
                          href="/login"
                          className="flex items-center text-text-muted hover:text-primary transition-colors gap-1.5 py-1"
                          title="Login / Register"
                      >
                        <User className="w-5 h-5"/>
                        <span className="text-sm font-semibold">Login</span>
                      </Link>
                  )}

                  {/* Dropdown */}
                  {isUserMenuOpen && user && (
                      <UserMenu onClose={() => setIsUserMenuOpen(false)}/>
                  )}
                </div>
              </div>

              {/* Mobile right controls */}
              <div className="md:hidden flex items-center gap-3">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-text-muted hover:text-primary transition-colors"
                >
                  <ShoppingBag className="w-5 h-5"/>
                  {cartItemsCount > 0 && (
                      <span
                          className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                  )}
                </button>

                {user && (
                    <div className="relative">
                      <button
                          onClick={() => setIsUserMenuOpen(v => !v)}
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs cursor-pointer"
                      >
                        {initials}
                      </button>
                      {isUserMenuOpen && (
                          <UserMenu onClose={() => setIsUserMenuOpen(false)}/>
                      )}
                    </div>
                )}

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-text-muted hover:text-primary transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
              <div
                  className="md:hidden border-b border-border-warm bg-cream-bg px-4 pt-2 pb-6 space-y-1 animate-in fade-in slide-in-from-top-5 duration-200">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2.5 text-sm font-semibold text-text-muted hover:text-primary hover:bg-cream-dark rounded-lg transition-colors"
                    >
                      {link.name}
                    </Link>
                ))}
                <div className="pt-3 border-t border-border-warm flex items-center justify-between px-3">
                  <Link
                      href="/explore?filter=wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary"
                  >
                    <Heart className="w-5 h-5"/> Wishlist ({wishlistCount})
                  </Link>
                  {!user && (
                      <Link
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary"
                      >
                        <User className="w-5 h-5"/> Login
                      </Link>
                  )}
                </div>
              </div>
          )}
        </header>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>
      </>
  );
}
