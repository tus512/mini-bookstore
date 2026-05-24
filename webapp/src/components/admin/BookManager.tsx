'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit2, Trash2, Star, Package, AlertTriangle } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import { Book } from '@/lib/mockData';
import BookFormModal from './BookFormModal';
import toast from 'react-hot-toast';

export default function BookManager() {
  const { books, deleteBook, categories } = useBookstoreStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [editing, setEditing] = useState<Book | null | undefined>(undefined); // undefined = closed
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return books.filter(b => {
      const matchCat = filterCat === 'All' || b.category === filterCat;
      const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [books, search, filterCat]);

  const handleDelete = (id: string) => {
    const book = books.find(b => b.id === id);
    deleteBook(id);
    setConfirmDelete(null);
    toast.success(`"${book?.title}" removed from catalog.`);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or author…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-warm rounded-xl text-xs font-medium text-text-dark outline-none focus:border-primary transition-all"
          />
        </div>

        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-white border border-border-warm rounded-xl px-4 py-2.5 text-xs font-medium text-text-dark outline-none focus:border-primary transition-all cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Books', value: books.length, icon: <Package className="w-4 h-4 text-primary" /> },
          { label: 'In Stock', value: books.filter(b => b.inStock).length, icon: <Star className="w-4 h-4 text-emerald-500" /> },
          { label: 'Showing', value: filtered.length, icon: <Search className="w-4 h-4 text-blue-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border-warm rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-cream-dark rounded-lg">{s.icon}</div>
            <div>
              <p className="font-serif font-black text-lg text-text-dark leading-none">{s.value}</p>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-warm bg-cream-dark/30">
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider">Book</th>
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Rating</th>
                <th className="text-left px-4 py-3 font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-bold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-text-muted font-serif">
                    No books match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((book, idx) => (
                  <tr key={book.id} className="hover:bg-cream-dark/20 transition-colors">
                    <td className="px-4 py-3 text-text-muted font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-11 rounded overflow-hidden border border-border-warm shrink-0 bg-cream-dark">
                          <Image src={book.coverImage} alt={book.title} fill sizes="32px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-text-dark truncate max-w-[160px]">{book.title}</p>
                          <p className="text-text-muted truncate max-w-[160px] mt-0.5">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 bg-primary-light text-primary rounded-full text-[10px] font-bold border border-border-warm">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-text-dark hidden sm:table-cell">${book.price.toFixed(2)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {book.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${book.inStock ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                        {book.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(book)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(book.id)}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border-warm shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-text-dark">Delete Book?</h3>
                <p className="text-xs text-text-muted mt-1">
                  "{books.find(b => b.id === confirmDelete)?.title}" will be permanently removed from the catalog.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer shadow-sm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {editing !== undefined && (
        <BookFormModal book={editing} onClose={() => setEditing(undefined)} />
      )}
    </>
  );
}
