'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDoRequest } from '@/hooks/useDoRequest';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

const ICONS = ['Book', 'FileText', 'User', 'Sparkles', 'Compass', 'Baby', 'Heart', 'Star', 'Tag', 'Globe'];

const INPUT = 'w-full bg-cream-bg border border-border-warm rounded-lg px-3.5 py-2.5 text-xs font-medium text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all';
const LABEL = 'text-[10px] font-bold text-text-dark uppercase tracking-widest';

function CategoryRow({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-cream-dark/20 transition-colors border-b border-border-warm/40 last:border-0">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light border border-border-warm rounded-full flex items-center justify-center shrink-0">
            <Tag className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-text-dark">{cat.name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(cat)}
            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(cat.id)}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryManager() {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', slug: '' });

  const { data: categories = [], doRequest: fetchCategories } = useDoRequest<Category[]>({
    url: '/categories',
    isFetchOnLoad: true,
  });

  const { doRequest: createCategory, loading: creating } = useDoRequest({
    url: '/categories',
    method: 'POST',
    onSuccess: () => {
      toast.success('Category added!');
      setShowForm(false);
      fetchCategories();
    }
  });

  const { doRequest: updateCategory, loading: updating } = useDoRequest({
    url: editing ? `/categories/${editing.id}` : '/categories',
    method: 'PUT',
    onSuccess: () => {
      toast.success('Category updated!');
      setShowForm(false);
      fetchCategories();
    }
  });

  const { doRequest: deleteCategory, loading: deleting } = useDoRequest({
    url: confirmDelete ? `/categories/${confirmDelete}` : '/categories',
    method: 'DELETE',
    onSuccess: () => {
      toast.success('Category deleted.');
      setConfirmDelete(null);
      fetchCategories();
    }
  });

  const openAdd = () => {
    setForm({ name: '', slug: '' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug || '' });
    setEditing(cat);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Category name is required.'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required.'); return; }
    if (editing) {
      updateCategory(form);
    } else {
      createCategory(form);
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory();
  };

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-text-muted font-semibold">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-warm bg-cream-dark/30">
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Category</th>
                {/* <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Count</th> */}
                <th className="text-right px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  onEdit={openEdit}
                  onDelete={id => setConfirmDelete(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Add/Edit form panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border-warm shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-base text-text-dark">
                {editing ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-text-muted hover:text-text-dark cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={LABEL}>Category Name *</label>
                <input
                  className={INPUT}
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setForm(f => ({ ...f, name, slug: editing ? f.slug : slug }));
                  }}
                  placeholder="e.g. Science Fiction"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Slug *</label>
                <input
                  className={INPUT}
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. science-fiction"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-warm">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark cursor-pointer transition-colors">
                Cancel
              </button>
              <button disabled={creating || updating} onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover cursor-pointer transition-colors shadow-sm disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />
                {editing ? (updating ? 'Saving...' : 'Save Changes') : (creating ? 'Adding...' : 'Add Category')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border-warm shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-full"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-serif font-black text-base text-text-dark">Delete Category?</h3>
                <p className="text-xs text-text-muted mt-1">
                  "{categories.find(c => c.id === confirmDelete)?.name}" will be removed.
                  Books in this category will remain in the catalog.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark cursor-pointer transition-colors">Cancel</button>
              <button disabled={deleting} onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 cursor-pointer transition-colors shadow-sm disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
