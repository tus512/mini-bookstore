'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Package, ChevronDown, ChevronUp, ShoppingBag, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';

const STATUS_LABELS = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_STYLES = [
  'text-amber-700 bg-amber-50 border-amber-200',    // 0: Pending
  'text-indigo-700 bg-indigo-50 border-indigo-200',   // 1: Confirmed
  'text-blue-700 bg-blue-50 border-blue-200',       // 2: Shipped
  'text-emerald-700 bg-emerald-50 border-emerald-200', // 3: Delivered
  'text-red-600 bg-red-50 border-red-200',          // 4: Cancelled
];

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PAGE_SIZE = 5;

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders', {
        params: {
          page,
          size: PAGE_SIZE
        }
      });
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load purchase history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Client-side filtering over the loaded paginated set for fast results
  const filteredOrders = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (STATUS_LABELS[o.status] || '').toLowerCase().includes(q) ||
        o.items.some((i: any) =>
            i.bookTitle.toLowerCase().includes(q) ||
            i.bookAuthor.toLowerCase().includes(q)
        )
    );
  }, [search, orders]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
      <div className="space-y-6 font-sans">
        {/* Search bar & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
                type="text"
                placeholder="Search this page by order ID, title, or status…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-warm rounded-xl text-xs font-medium text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="text-xs text-text-muted font-bold tracking-wide uppercase">
            Total Purchase{totalElements !== 1 ? 's' : ''}: <span className="text-primary">{totalElements}</span>
          </div>
        </div>

        {/* Loading overlay state */}
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Loading orders…</p>
            </div>
        ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border-warm rounded-2xl bg-cream-dark/10 space-y-3">
              <ShoppingBag className="w-10 h-10 text-text-muted/40 mx-auto" />
              <p className="text-sm font-serif text-text-muted">
                {search ? 'No orders match your search on this page.' : 'No purchase history yet.'}
              </p>
              {!search && (
                  <Link
                      href="/explore"
                      className="inline-block mt-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Start Shopping
                  </Link>
              )}
            </div>
        ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const isOpen = expandedId === order.id;
                const statusLabel = STATUS_LABELS[order.status] || 'Unknown';
                const statusStyle = STATUS_STYLES[order.status] ?? 'text-text-muted bg-cream-dark border-border-warm';

                return (
                    <div
                        key={order.id}
                        className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
                    >
                      {/* Order header row */}
                      <button
                          onClick={() => setExpandedId(isOpen ? null : order.id)}
                          className="w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cream-dark/20 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-light border border-border-warm rounded-full flex items-center justify-center shrink-0">
                            <Package className="w-4.5 h-4.5 text-primary" />
                          </div>
                          <div>
                            <p className="font-serif font-black text-xs sm:text-sm text-text-dark uppercase tracking-wider">
                              Order #{order.id.slice(0, 8)}...
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-text-muted font-medium mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-start sm:self-auto justify-between sm:justify-end w-full sm:w-auto">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusStyle}`}>
                            {statusLabel}
                          </span>
                          <span className="font-serif font-black text-sm text-text-dark">
                            ${(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                          </span>
                          {isOpen
                              ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                              : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                          }
                        </div>
                      </button>

                      {/* Expandable order items */}
                      {isOpen && (
                          <div className="border-t border-border-warm px-5 pb-5 pt-4 space-y-3 bg-cream-bg/20 animate-in fade-in slide-in-from-top-2 duration-200">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4">
                                  <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-border-warm bg-cream-dark shrink-0 shadow-sm">
                                    <img
                                        src={item.bookCoverImageUrl || item.book?.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=150'}
                                        alt={item.bookTitle || item.book?.title}
                                        className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/book/${item.bookId || item.book?.id}`}
                                        className="font-serif font-bold text-sm text-text-dark hover:text-primary transition-colors line-clamp-1"
                                    >
                                      {item.bookTitle || item.book?.title}
                                    </Link>
                                    <p className="text-[11px] text-text-muted mt-0.5">{item.bookAuthor || item.book?.author}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-text-dark">
                                      ${(item.subtotal ?? ((item.book?.price ?? 0) * item.quantity)).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                      ${(item.unitPrice ?? item.book?.price ?? 0).toFixed(2)} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-border-warm/60 mt-2 space-y-1.5 text-xs text-text-muted">
                              <p><span className="font-bold text-text-dark">Shipping Address:</span> {order.shippingAddress || 'N/A'}</p>
                              <p><span className="font-bold text-text-dark">Payment Method:</span> {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Credit Card (Stripe)'}</p>
                              {order.paymentRef && <p><span className="font-bold text-text-dark">Payment Ref:</span> {order.paymentRef}</p>}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-border-warm/60 mt-2">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Order Total</span>
                              <span className="font-serif font-black text-base text-text-dark">${(order.totalAmount ?? order.total ?? 0).toFixed(2)}</span>
                            </div>
                          </div>
                      )}
                    </div>
                );
              })}

              {/* Premium Pagination Bar */}
              {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border-warm/40">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="flex items-center gap-1 px-4 py-2 border border-border-warm rounded-xl text-xs font-bold text-text-muted bg-white hover:bg-cream-dark/20 hover:text-text-dark disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => (
                          <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  currentPage === i
                                      ? 'bg-primary border-primary text-white shadow-sm'
                                      : 'bg-white border-border-warm text-text-muted hover:border-primary hover:text-primary'
                              }`}
                          >
                            {i + 1}
                          </button>
                      ))}
                    </div>

                    <span className="sm:hidden text-xs font-bold text-text-muted">
                      Page {currentPage + 1} of {totalPages}
                    </span>

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2 border border-border-warm rounded-xl text-xs font-bold text-text-muted bg-white hover:bg-cream-dark/20 hover:text-text-dark disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
