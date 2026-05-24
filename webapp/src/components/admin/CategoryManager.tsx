'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Tag } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import { Category } from '@/lib/mockData';
import toast from 'react-hot-toast';

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
            <p className="text-[10px] text-text-muted mt-0.5 font-medium">Icon: {cat.iconName}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-bold text-text-dark text-xs">{cat.count} books</span>
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
  const { categories, addCategory, updateCategory, deleteCategory } = useBookstoreStore();
  const [editing, setEditing] = useState<Category | null>(null);  // null = add mode
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', iconName: 'Book', count: 0 });

  const openAdd = () => {
    setForm({ name: '', iconName: 'Book', count: 0 });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, iconName: cat.iconName, count: cat.count });
    setEditing(cat);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Category name is required.'); return; }
    if (editing) {
      updateCategory({ ...editing, ...form });
      toast.success(`Category "${form.name}" updated!`);
    } else {
      addCategory({ id: `cat-${Date.now()}`, ...form });
      toast.success(`Category "${form.name}" added!`);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const cat = categories.find(c => c.id === id);
    deleteCategory(id);
    setConfirmDelete(null);
    toast.success(`Category "${cat?.name}" removed.`);
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
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Count</th>
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
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Science Fiction"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Icon Name</label>
                <select
                  className={INPUT}
                  value={form.iconName}
                  onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))}
                >
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Book Count</label>
                <input
                  className={INPUT}
                  type="number"
                  min="0"
                  value={form.count}
                  onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-warm">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark cursor-pointer transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover cursor-pointer transition-colors shadow-sm">
                <Check className="w-3.5 h-3.5" />
                {editing ? 'Save Changes' : 'Add Category'}
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
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 cursor-pointer transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
