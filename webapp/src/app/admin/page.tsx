'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, BookOpen, Tag, BarChart3, ArrowLeft, Users, ShoppingBag, Star } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import BookManager from '@/components/admin/BookManager';
import CategoryManager from '@/components/admin/CategoryManager';

const TABS = [
  { id: 'overview',    label: 'Overview',    icon: BarChart3 },
  { id: 'books',       label: 'Books',       icon: BookOpen  },
  { id: 'categories',  label: 'Categories',  icon: Tag       },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, books, categories, orders } = useBookstoreStore();
  const [activeTab, setActiveTab] = useState('overview');

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

  if (!user.isAdmin) {
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
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgRating = books.length ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1) : '—';
  const inStockCount = books.filter(b => b.inStock).length;

  const stats = [
    { label: 'Total Books',    value: books.length,              icon: <BookOpen className="w-5 h-5 text-primary" />,         color: 'bg-primary-light border-border-warm' },
    { label: 'Categories',     value: categories.length,         icon: <Tag className="w-5 h-5 text-purple-500" />,           color: 'bg-purple-50 border-purple-200' },
    { label: 'Total Orders',   value: orders.length,             icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,     color: 'bg-blue-50 border-blue-200' },
    { label: 'Revenue',        value: `$${totalRevenue.toFixed(0)}`, icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 border-emerald-200' },
    { label: 'In Stock',       value: inStockCount,              icon: <Star className="w-5 h-5 text-amber-500" />,           color: 'bg-amber-50 border-amber-200' },
    { label: 'Avg Rating',     value: avgRating,                 icon: <Users className="w-5 h-5 text-rose-500" />,           color: 'bg-rose-50 border-rose-200' },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
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
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-cream-dark/40 border border-border-warm rounded-xl mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
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
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-serif font-bold text-sm text-text-dark">{order.id}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {new Date(order.date).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        order.status === 'Shipped'   ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        order.status === 'Pending'   ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                                       'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {order.status}
                      </span>
                      <span className="font-serif font-black text-sm text-text-dark">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
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
      </div>
    </div>
  );
}
