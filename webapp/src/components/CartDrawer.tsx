'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Loader2, MapPin, CreditCard } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, user } = useBookstoreStore();
  const router = useRouter();

  // Checkout states
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const shipping: number = 0;
  const total = subtotal + shipping;
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error('You must log in to proceed to checkout!', {
        id: 'auth-required-checkout',
        style: {
          background: '#fbfbf9',
          color: '#2a2421',
          border: '1px solid #ebdcd0',
          fontFamily: 'var(--font-sans)',
        },
      });
      router.push('/login');
      onClose();
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('Please enter a valid shipping address.');
      return;
    }

    try {
      setLoadingCheckout(true);

      const orderItems = cart.map(item => ({
        bookId: item.book.id,
        quantity: item.quantity
      }));

      const payload = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        items: orderItems
      };

      // Call real backend API to place the order
      const response = await apiClient.post('/orders', payload);

      toast.success('🎉 Order placed successfully!', {
        style: {
          background: '#f1fcf3',
          color: '#155724',
          border: '1px solid #c3e6cb',
          fontFamily: 'var(--font-sans)',
        },
      });

      // Clear states & cart
      clearCart();
      setShowCheckoutForm(false);
      setShippingAddress('');
      onClose();

      // Redirect to explore page or profile
      router.push('/explore');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
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
              {showCheckoutForm ? 'Checkout Details' : 'Shopping Cart'}
              <span className="text-sm font-sans font-normal text-text-muted">
                ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
              </span>
            </h2>
            <button
              onClick={() => {
                if (showCheckoutForm) {
                  setShowCheckoutForm(false);
                } else {
                  onClose();
                }
              }}
              className="p-1.5 hover:bg-cream-dark rounded-full text-text-muted hover:text-text-dark transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Switcher */}
          {!showCheckoutForm ? (
            <>
              {/* Free Shipping Notice */}
              {subtotal > 0 && (
                <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-center gap-2">
                  <span className="text-xs text-emerald-700 font-semibold tracking-wide uppercase">🎉 Enjoy Free Shipping on your order!</span>
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
                      onClick={() => {
                        onClose();
                      }}
                      className="mt-2 text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Start exploring <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.book.id} className="flex gap-4 pb-6 border-b border-border-light last:border-b-0 last:pb-0">
                      <div className="relative w-16 h-24 bg-cream-dark rounded-md overflow-hidden shadow-xs shrink-0 border border-border-warm">
                        <Image
                          unoptimized
                          src={item.book.coverImageUrl}
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
                              className="text-text-muted hover:text-red-500 p-0.5 transition-colors shrink-0 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">{item.book.author}</p>
                          {item.book.stockQuantity !== undefined && item.book.stockQuantity !== null && (
                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${item.book.stockQuantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {item.book.stockQuantity > 0 ? `${item.book.stockQuantity} in stock` : 'Out of stock'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border-warm rounded-md bg-white">
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                              className="px-2 py-1 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-0.5 text-xs font-semibold text-text-dark">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.book.stockQuantity || 99)}
                              className={`px-2 py-1 text-text-muted hover:text-text-dark hover:bg-cream-dark transition-colors ${
                                item.quantity >= (item.book.stockQuantity || 99) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                              }`}
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
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={clearCart}
                      className="px-4 py-2.5 border border-border-warm rounded-md text-xs font-semibold text-text-muted hover:bg-white hover:text-text-dark transition-all duration-200 cursor-pointer"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={handleCheckoutClick}
                      className="px-4 py-2.5 bg-primary text-white rounded-md text-xs font-semibold btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      Checkout
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-text-muted">
                    100% Secure Checkout. Easy 30-Day Returns.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Checkout Form Panel */
            <form onSubmit={handleConfirmOrder} className="flex-1 flex flex-col justify-between">
              <div className="px-6 py-6 space-y-6 overflow-y-auto">

                {/* Order summary small box */}
                <div className="bg-cream-dark/40 border border-border-warm rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">Order Summary</h3>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Items Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Shipping Delivery</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif font-bold text-text-dark border-t border-border-light pt-2 mt-1">
                    <span>Total Due</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dark flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Address
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete delivery address here..."
                    className="w-full bg-white border border-border-warm rounded-lg px-3.5 py-2.5 text-xs text-text-dark outline-none focus:border-primary font-medium shadow-xs resize-none"
                  />
                </div>

                {/* Payment selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-text-dark flex items-center gap-1.5 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'CARD', label: 'Credit Card' },
                      { id: 'COD', label: 'Cash on Delivery' },
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`px-4 py-3 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${paymentMethod === method.id
                            ? 'border-primary bg-primary-light text-primary shadow-xs'
                            : 'border-border-warm bg-white text-text-muted hover:border-text-muted hover:text-text-dark'
                          }`}
                      >
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form Actions Footer */}
              <div className="border-t border-border-warm px-6 py-6 bg-cream-dark/40 space-y-3">
                <button
                  type="submit"
                  disabled={loadingCheckout}
                  className="w-full py-3.5 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                    </>
                  ) : (
                    `Confirm Order & Pay $${total.toFixed(2)}`
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(false)}
                  className="w-full py-2.5 border border-border-warm bg-white rounded-md text-xs font-semibold text-text-muted hover:text-text-dark transition-all cursor-pointer"
                >
                  Back to Cart
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
