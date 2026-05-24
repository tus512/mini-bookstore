'use client';

import React, { useState } from 'react';
import { X, BookOpen, Save, Loader2 } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import { Book } from '@/lib/mockData';
import toast from 'react-hot-toast';

interface Props {
  book?: Book | null;   // null = create mode
  onClose: () => void;
}

const EMPTY: Omit<Book, 'reviews'> = {
  id: '',
  title: '',
  subtitle: '',
  author: '',
  price: 0,
  rating: 4.0,
  reviewsCount: 0,
  coverImage: '',
  category: 'Fiction',
  description: '',
  publishedDate: '',
  publisher: '',
  language: 'English',
  pages: 0,
  isbn: '',
  dimensions: '',
  inStock: true,
  featured: false,
  isNewRelease: false,
};

const INPUT = 'w-full bg-cream-bg border border-border-warm rounded-lg px-3.5 py-2.5 text-xs font-medium text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all';
const LABEL = 'text-[10px] font-bold text-text-dark uppercase tracking-widest';

export default function BookFormModal({ book, onClose }: Props) {
  const isEdit = !!book;
  const { addBook, updateBook, categories } = useBookstoreStore();

  const [form, setForm] = useState<Omit<Book, 'reviews'>>(() =>
    book ? { ...book } : { ...EMPTY, id: `book-${Date.now()}` }
  );
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.coverImage.trim()) {
      toast.error('Title, Author, and Cover Image URL are required.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (isEdit) {
        updateBook(form as Book);
        toast.success(`"${form.title}" updated!`);
      } else {
        addBook(form as Book);
        toast.success(`"${form.title}" added to catalog!`);
      }
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border-warm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-warm bg-cream-dark/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-black text-base text-text-dark">
              {isEdit ? 'Edit Book' : 'Add New Book'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-dark hover:bg-cream-dark rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-1.5 sm:col-span-2">
              <label className={LABEL}>Title *</label>
              <input className={INPUT} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. The Great Gatsby" required />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={LABEL}>Subtitle</label>
              <input className={INPUT} value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} placeholder="Optional subtitle" />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Author *</label>
              <input className={INPUT} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author full name" required />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Category</label>
              <select className={INPUT} value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Price ($)</label>
              <input className={INPUT} type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Rating (0–5)</label>
              <input className={INPUT} type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', parseFloat(e.target.value) || 0)} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={LABEL}>Cover Image URL *</label>
              <input className={INPUT} value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://images.unsplash.com/..." required />
              {form.coverImage && (
                <img src={form.coverImage} alt="preview" className="mt-2 h-20 w-14 object-cover rounded-lg border border-border-warm shadow-sm" onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={LABEL}>Description</label>
              <textarea
                className={`${INPUT} resize-none`}
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Short book description…"
              />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Publisher</label>
              <input className={INPUT} value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="Publisher name" />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Published Date</label>
              <input className={INPUT} value={form.publishedDate} onChange={e => set('publishedDate', e.target.value)} placeholder="e.g. 2024-03-15" />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>Pages</label>
              <input className={INPUT} type="number" min="0" value={form.pages} onChange={e => set('pages', parseInt(e.target.value) || 0)} />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL}>ISBN</label>
              <input className={INPUT} value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-0-00-000000-0" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-5 pt-2 border-t border-border-warm/60">
            {([
              ['inStock', 'In Stock'],
              ['featured', 'Featured'],
              ['isNewRelease', 'New Release'],
            ] as [keyof typeof form, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => set(key, !form[key])}
                  className={`w-9 h-5 rounded-full border transition-all relative ${form[key] ? 'bg-primary border-primary' : 'bg-cream-dark border-border-warm'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form[key] ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-text-muted">{label}</span>
              </label>
            ))}
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-warm bg-cream-dark/20 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
