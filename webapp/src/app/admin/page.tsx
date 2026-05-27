'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, BookOpen, Tag, BarChart3, ArrowLeft, Users, ShoppingBag, Star, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import BookManager from '@/components/admin/BookManager';
import CategoryManager from '@/components/admin/CategoryManager';
import SalesReport from '@/components/admin/SalesReport';
import apiClient from '@/lib/apiClient';

const TABS = [
  { id: 'reports', label: 'This Month Sales Reports', icon: TrendingUp },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'overview', label: 'Orders', icon: BarChart3 },
];

const STATUS_LABELS = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_STYLES = [
  'text-amber-700 bg-amber-50 border-amber-200',    // 0: Pending
  'text-indigo-700 bg-indigo-50 border-indigo-200',   // 1: Confirmed
  'text-blue-700 bg-blue-50 border-blue-200',       // 2: Shipped
  'text-emerald-700 bg-emerald-50 border-emerald-200', // 3: Delivered
  'text-red-600 bg-red-50 border-red-200',          // 4: Cancelled
];

export default function AdminPage() {
  const router = useRouter();
  const { user, books, categories } = useBookstoreStore();
  const [activeTab, setActiveTab] = useState('reports');
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      apiClient.get('/orders', { params: { size: 100 } })
        .then(res => setOrders(res.data.content || []))
        .catch(err => console.error('Failed to load admin orders metric:', err));
    }
  }, [user]);

  // Guard: must be logged in AND admin
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 px-4 font-sans">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-2xl font-serif font-black text-text-dark">Access Restricted</h2>
        <p className="text-xs text-text-muted">You must be logged in to access the admin dashboard.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm mt-2">
          Login
        </Link>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 px-4 font-sans">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-2xl font-serif font-black text-text-dark">Not Authorized</h2>
        <p className="text-xs text-text-muted">Your account does not have admin privileges.</p>
        <button onClick={() => router.back()} className="inline-block px-5 py-2.5 border border-border-warm text-text-muted rounded-lg text-xs font-bold hover:bg-cream-dark transition-colors mt-2 cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  // Dashboard stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgRating = books.length ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1) : '—';
  const inStockCount = books.filter(b => b.inStock).length;

  const stats = [
    { label: 'Categories', value: categories.length, icon: <Tag className="w-5 h-5 text-purple-500" />, color: 'bg-purple-50 border-purple-200' },
    { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 border-blue-200' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 border-emerald-200' },
    { label: 'In Stock', value: inStockCount, icon: <Star className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 border-amber-200' },
    { label: 'Avg Rating', value: avgRating, icon: <Users className="w-5 h-5 text-rose-500" />, color: 'bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-xs text-text-muted flex items-center gap-1.5 font-semibold">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-primary">Admin Dashboard</span>
        </div>
        <Link href="/" className="text-xs font-bold text-text-muted hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5" /> Back Home
        </Link>
      </div>

      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-serif font-black text-text-dark">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-text-muted ml-11">
            Welcome back, <span className="font-bold text-text-dark">{user.name}</span>. Manage your bookstore catalog here.
          </p>
        </div>
        <Link
          href="/explore"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors border border-border-warm px-4 py-2 rounded-lg hover:bg-primary-light self-start sm:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" /> View Store
        </Link>
      </div>

      {/* Stat cards */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 ${s.color.split(' ')[1]}`}>
            <div className={`w-9 h-9 ${s.color.split(' ')[0]} border ${s.color.split(' ')[1]} rounded-xl flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <p className="font-serif font-black text-xl text-text-dark leading-none">{s.value}</p>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-wider leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-cream-dark/40 border border-border-warm rounded-xl mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === id
              ? 'bg-white text-primary shadow-sm border border-border-warm'
              : 'text-text-muted hover:text-text-dark'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-200">

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-warm bg-cream-dark/20">
                <h3 className="font-serif font-black text-sm text-text-dark uppercase tracking-wider">Recent Orders</h3>
              </div>
              <div className="divide-y divide-border-warm/40">
                {orders.slice(0, 5).map(order => {
                  const isOpen = expandedOrderId === order.id;
                  const statusLabel = typeof order.status === 'number' ? (STATUS_LABELS[order.status] || 'Unknown') : (order.status || 'Pending');
                  const statusStyle = typeof order.status === 'number' ? (STATUS_STYLES[order.status] ?? 'text-text-muted bg-cream-dark border-border-warm') : (
                    order.status === 'Delivered' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                      order.status === 'Shipped' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        order.status === 'Pending' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                          'text-red-600 bg-red-50 border-red-200'
                  );

                  return (
                    <div
                      key={order.id}
                      className="bg-white border-b border-border-warm last:border-b-0 overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream-dark/20 transition-colors cursor-pointer text-left"
                      >
                        <div>
                          <p className="font-serif font-bold text-xs sm:text-sm text-text-dark">Order #{order.id.slice(0, 8)}...</p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {new Date(order.createdAt || order.date).toLocaleDateString()} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusStyle}`}>
                            {statusLabel}
                          </span>
                          <span className="font-serif font-black text-sm text-text-dark">
                            ${(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Order Detail Section */}
                      {isOpen && (
                        <div className="border-t border-border-warm px-6 pb-5 pt-4 space-y-4 bg-cream-bg/20 animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Order items */}
                          <div className="space-y-3">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="relative w-10 h-14 rounded-lg overflow-hidden border border-border-warm bg-cream-dark shrink-0 shadow-sm">
                                  <img
                                    src={item.bookCoverImageUrl || item.book?.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=150'}
                                    alt={item.bookTitle || item.book?.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-serif font-bold text-xs sm:text-sm text-text-dark truncate">
                                    {item.bookTitle || item.book?.title}
                                  </p>
                                  <p className="text-[10px] text-text-muted mt-0.5">{item.bookAuthor || item.book?.author}</p>
                                </div>
                                <div className="text-right shrink-0 text-xs font-bold text-text-dark">
                                  ${(item.subtotal ?? ((item.book?.price ?? 0) * item.quantity)).toFixed(2)}
                                  <p className="text-[10px] text-text-muted mt-0.5">
                                    ${(item.unitPrice ?? item.book?.price ?? 0).toFixed(2)} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order meta details */}
                          <div className="pt-3 border-t border-border-warm/60 space-y-1.5 text-xs text-text-muted">
                            <p><span className="font-bold text-text-dark">Shipping Address:</span> {order.shippingAddress || 'N/A'}</p>
                            <p><span className="font-bold text-text-dark">Payment Method:</span> {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Credit Card (Stripe)'}</p>
                            {order.paymentRef && <p><span className="font-bold text-text-dark">Payment Ref:</span> {order.paymentRef}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('books')}
                className="flex items-center gap-4 p-5 bg-white border border-border-warm rounded-2xl shadow-sm hover:border-primary hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary-light border border-border-warm rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <BookOpen className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-text-dark">Manage Books</p>
                  <p className="text-xs text-text-muted mt-0.5">Add, edit, or remove titles from your catalog.</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className="flex items-center gap-4 p-5 bg-white border border-border-warm rounded-2xl shadow-sm hover:border-primary hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:border-purple-500 transition-all">
                  <Tag className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-text-dark">Manage Categories</p>
                  <p className="text-xs text-text-muted mt-0.5">Organise and update your genre taxonomy.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'books' && <BookManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'reports' && <SalesReport />}
      </div>
    </div>
  );
}
