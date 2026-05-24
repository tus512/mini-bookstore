'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Shipped:   'text-blue-700 bg-blue-50 border-blue-200',
  Pending:   'text-amber-700 bg-amber-50 border-amber-200',
  Cancelled: 'text-red-600 bg-red-50 border-red-200',
};

export default function OrderHistory() {
  const { orders } = useBookstoreStore();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.items.some(i =>
        i.book.title.toLowerCase().includes(q) ||
        i.book.author.toLowerCase().includes(q)
      )
    );
  }, [search, orders]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order ID, title, or status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-warm rounded-xl text-xs font-medium text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <span className="text-xs text-text-muted font-semibold shrink-0">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border-warm rounded-2xl bg-cream-dark/10 space-y-3">
          <ShoppingBag className="w-10 h-10 text-text-muted/40 mx-auto" />
          <p className="text-sm font-serif text-text-muted">
            {search ? 'No orders match your search.' : 'No purchase history yet.'}
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
          {filtered.map(order => {
            const isOpen = expandedId === order.id;
            const statusStyle = STATUS_STYLES[order.status] ?? 'text-text-muted bg-cream-dark border-border-warm';

            return (
              <div
                key={order.id}
                className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden"
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
                      <p className="font-serif font-black text-sm text-text-dark">{order.id}</p>
                      <p className="text-[11px] text-text-muted font-medium mt-0.5">
                        {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusStyle}`}>
                      {order.status}
                    </span>
                    <span className="font-serif font-black text-sm text-text-dark">
                      ${order.total.toFixed(2)}
                    </span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                    }
                  </div>
                </button>

                {/* Expandable order items */}
                {isOpen && (
                  <div className="border-t border-border-warm px-5 pb-5 pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {order.items.map(({ book, quantity }) => (
                      <div key={book.id} className="flex items-center gap-4">
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-border-warm bg-cream-dark shrink-0 shadow-sm">
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/book/${book.id}`}
                            className="font-serif font-bold text-sm text-text-dark hover:text-primary transition-colors line-clamp-1"
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-text-muted mt-0.5">{book.author}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-text-dark">
                            ${(book.price * quantity).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            ${book.price.toFixed(2)} × {quantity}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-3 border-t border-border-warm/60 mt-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Order Total</span>
                      <span className="font-serif font-black text-base text-text-dark">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
