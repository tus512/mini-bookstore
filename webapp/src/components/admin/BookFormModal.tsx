'use client';

import React, {useState, useEffect, useRef} from 'react';
import {X, BookOpen, Save, Loader2, Upload, FileImage} from 'lucide-react';
import toast from 'react-hot-toast';
import {useDoRequest} from "@/hooks/useDoRequest";
import {Category} from "@/components/admin/CategoryManager";
import apiClient from "@/lib/apiClient";

interface Props {
  book?: any;   // null = create mode
  onClose: () => void;
}

const EMPTY = {
  title: '',
  slug: '',
  categoryId: '',
  author: '',
  isbn: '',
  description: '',
  price: 0,
  stockQuantity: 10,
  coverImageUrl: '',
  status: 1, // 0=draft, 1=active, 2=discontinued
};

const INPUT = 'w-full bg-cream-bg border border-border-warm rounded-lg px-3.5 py-2.5 text-xs font-medium text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all';
const LABEL = 'text-[10px] font-bold text-text-dark uppercase tracking-widest';

export default function BookFormModal({book, onClose}: Props) {
  const isEdit = !!book;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>(() => {
    if (book) {
      return {
        title: book.title || '',
        slug: book.slug || '',
        categoryId: book.categoryId || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        price: book.price || 0,
        stockQuantity: book.stockQuantity || 0,
        coverImageUrl: book.coverImageUrl || '',
        status: book.status !== undefined ? book.status : 1,
      };
    }
    return {...EMPTY};
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key: string, value: unknown) =>
      setForm((f: any) => ({...f, [key]: value}));

  const {data: categories = []} = useDoRequest<Category[]>({
    url: '/categories',
    isFetchOnLoad: true,
  });

  // Automatically select the first category if none is chosen
  useEffect(() => {
    if (categories.length > 0 && !form.categoryId) {
      set('categoryId', categories[0].id);
    }
  }, [categories, form.categoryId]);

  // Handle Cover Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set('coverImageUrl', res.data.url);
      toast.success('Cover image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.categoryId) {
      toast.error('Title, Author, and Category are required.');
      return;
    }

    // Auto-generate slug from title if not set
    const slug = form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      ...form,
      slug,
      price: parseFloat(form.price) || 0,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      status: parseInt(form.status) || 1,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.put(`/books/${book.id}`, payload);
        toast.success(`"${form.title}" updated!`);
      } else {
        await apiClient.post('/books', payload);
        toast.success(`"${form.title}" added to catalog!`);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save book: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
      /* Backdrop */
      <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
        <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border-warm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

          {/* Modal Header */}
          <div
              className="flex items-center justify-between px-6 py-4 border-b border-border-warm bg-cream-dark/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4"/>
              </div>
              <h2 className="font-serif font-black text-base text-text-dark">
                {isEdit ? 'Edit Book' : 'Add New Book'}
              </h2>
            </div>
            <button onClick={onClose}
                    className="p-1.5 text-text-muted hover:text-text-dark hover:bg-cream-dark rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL}>Title *</label>
                <input className={INPUT} value={form.title} onChange={e => set('title', e.target.value)}
                       placeholder="e.g. The Great Gatsby" required/>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Author *</label>
                <input className={INPUT} value={form.author} onChange={e => set('author', e.target.value)}
                       placeholder="Author full name" required/>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Category *</label>
                <select className={INPUT} value={form.categoryId}
                        onChange={e => set('categoryId', e.target.value)} required>
                  {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Price ($) *</label>
                <input className={INPUT} type="number" step="0.01" min="0" value={form.price}
                       onChange={e => set('price', e.target.value)} required/>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Stock Quantity *</label>
                <input className={INPUT} type="number" min="0" value={form.stockQuantity}
                       onChange={e => set('stockQuantity', e.target.value)} required/>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>ISBN</label>
                <input className={INPUT} value={form.isbn} onChange={e => set('isbn', e.target.value)}
                       placeholder="978-0-00-000000-0"/>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Status *</label>
                <select className={INPUT} value={form.status}
                        onChange={e => set('status', e.target.value)} required>
                  <option value={0}>Draft</option>
                  <option value={1}>Active</option>
                  <option value={2}>Discontinued</option>
                </select>
              </div>

              {/* Cover Image Upload and URL Section */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL}>Cover Image</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input className={INPUT} value={form.coverImageUrl}
                           onChange={e => set('coverImageUrl', e.target.value)}
                           placeholder="Image URL or upload a file below..."/>

                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden"/>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-dark bg-cream-bg hover:bg-cream-dark transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Upload className="w-3.5 h-3.5"/>}
                      Upload Cover Image
                    </button>
                  </div>

                  <div className="w-20 h-28 border border-border-warm rounded-xl bg-cream-dark/20 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    {form.coverImageUrl ? (
                        <img src={form.coverImageUrl} alt="preview" className="w-full h-full object-cover"
                             onError={e => (e.currentTarget.style.display = 'none')}/>
                    ) : (
                        <FileImage className="w-6 h-6 text-text-muted/40"/>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL}>Description</label>
                <textarea
                    className={`${INPUT} resize-none`}
                    rows={4}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Provide an overview of the book's contents, plot summary or key take-aways…"
                />
              </div>

            </div>
          </form>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-warm bg-cream-dark/20 shrink-0">
            <button type="button" onClick={onClose}
                    className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark transition-colors cursor-pointer">
              Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5"/>}
              {isEdit ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </div>
      </div>
  );
}
