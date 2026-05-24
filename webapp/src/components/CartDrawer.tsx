'use client';

import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useBookstoreStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const shippingThreshold = 50;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 5.99;
  const total = subtotal + shipping;
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);
  const remainingForFreeShipping = shippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-cream-bg shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-border-warm flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-text-dark flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Shopping Cart <span className="text-sm font-sans font-normal text-text-muted">({itemsCount} {itemsCount === 1 ? 'item' : 'items'})</span>
            </h2>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-cream-dark rounded-full text-text-muted hover:text-text-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {subtotal > 0 && (
            <div className="px-6 py-4 bg-primary-light/60 border-b border-border-warm">
              {subtotal >= shippingThreshold ? (
                <p className="text-sm text-primary font-medium">🎉 You qualify for FREE shipping!</p>
              ) : (
                <p className="text-sm text-text-muted">
                  Add <span className="font-semibold text-primary">${remainingForFreeShipping.toFixed(2)}</span> more to qualify for <span className="font-semibold text-primary">FREE Shipping</span>.
                </p>
              )}
              <div className="w-full bg-border-warm h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center text-text-muted">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-text-dark">Your cart is empty</h3>
                  <p className="text-sm text-text-muted mt-1 max-w-[240px] mx-auto">
                    Explore our curated bookstore collection and add your next favorite reads.
                  </p>
                </div>
                <button 
                  onClick={() => { onClose(); }}
                  className="mt-2 text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  Start exploring <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.book.id} className="flex gap-4 pb-6 border-b border-border-light last:border-b-0 last:pb-0">
                  <div className="relative w-16 h-24 bg-cream-dark rounded-md overflow-hidden shadow-xs shrink-0 border border-border-warm">
                    <Image 
                      src={item.book.coverImage} 
                      alt={item.book.title} 
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-sm text-text-dark line-clamp-1 hover:text-primary transition-colors">
                          <Link href={`/book/${item.book.id}`} onClick={onClose}>
                            {item.book.title}
                          </Link>
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.book.id)}
                          className="text-text-muted hover:text-red-500 p-0.5 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{item.book.author}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border-warm rounded-md bg-white">
                        <button 
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="px-2 py-1 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-0.5 text-xs font-semibold text-text-dark">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          className="px-2 py-1 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-text-dark">
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Info */}
          {cart.length > 0 && (
            <div className="border-t border-border-warm px-6 py-6 bg-cream-dark/40 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-dark">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-text-dark pt-2 border-t border-border-light">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={clearCart}
                  className="px-4 py-2.5 border border-border-warm rounded-md text-xs font-semibold text-text-muted hover:bg-white hover:text-text-dark transition-all duration-200"
                >
                  Clear Cart
                </button>
                <button 
                  onClick={() => alert('Mock checkout complete! Thank you for purchasing.')}
                  className="px-4 py-2.5 bg-primary text-white rounded-md text-xs font-semibold btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Checkout
                </button>
              </div>

              <p className="text-[10px] text-center text-text-muted">
                100% Secure Checkout. Easy 30-Day Returns.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
