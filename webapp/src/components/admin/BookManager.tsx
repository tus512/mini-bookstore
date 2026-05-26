'use client';

import React, {useState, useEffect, useMemo} from 'react';
import Image from 'next/image';
import {Plus, Search, Edit2, Trash2, Star, Package, AlertTriangle, Layers, EyeOff, CheckCircle2, Loader2} from 'lucide-react';
import BookFormModal from './BookFormModal';
import toast from 'react-hot-toast';
import {useDoRequest} from "@/hooks/useDoRequest";
import {Category} from "@/components/admin/CategoryManager";
import apiClient from "@/lib/apiClient";

export default function BookManager() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<any | null | undefined>(undefined); // undefined = closed
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // 1. Fetch Categories for select lists
  const {data: categories = []} = useDoRequest<Category[]>({
    url: '/categories',
    isFetchOnLoad: true,
  });

  // 2. Fetch Paginated Books with query parameters
  const {data: paginatedBooks, loading, doRequest: fetchBooks} = useDoRequest<any>({
    url: '/books',
    isFetchOnLoad: false,
  });

  // Effect to load books whenever search, category filter, or page changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks({
        params: {
          search: search.trim() || undefined,
          categoryId: filterCat !== 'All' ? filterCat : undefined,
          page,
          size: 8
        }
      });
    }, 150); // slight debounce for search input
    return () => clearTimeout(delayDebounce);
  }, [search, filterCat, page, fetchBooks]);

  const booksList = paginatedBooks?.content || [];
  const totalBooks = paginatedBooks?.totalElements || 0;
  const totalPages = paginatedBooks?.totalPages || 1;

  // 3. Delete request handler
  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      setConfirmDelete(null);
      fetchBooks({
        params: {
          search: search.trim() || undefined,
          categoryId: filterCat !== 'All' ? filterCat : undefined,
          page,
          size: 8
        }
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete book: ' + (err.response?.data?.error || err.message));
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Uncategorized';
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200">Draft</span>;
      case 1:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">Active</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-600 bg-red-50 border border-red-200">Discontinued</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-text-muted bg-cream-dark">Unknown</span>;
    }
  };

  return (
      <>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
            <input
                type="text"
                placeholder="Search title, author or ISBN…"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-warm rounded-xl text-xs font-medium text-text-dark outline-none focus:border-primary transition-all shadow-xs"
            />
          </div>

          <select
              value={filterCat}
              onChange={e => {
                setFilterCat(e.target.value);
                setPage(0);
              }}
              className="bg-white border border-border-warm rounded-xl px-4 py-2.5 text-xs font-medium text-text-dark outline-none focus:border-primary transition-all cursor-pointer shadow-xs"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button
              onClick={() => setEditing(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-md hover:shadow-lg whitespace-nowrap ml-auto"
          >
            <Plus className="w-4 h-4"/> Add Book
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            {label: 'Total Books', value: totalBooks, icon: <Package className="w-4 h-4 text-primary"/>},
            {
              label: 'Active Categories',
              value: categories.length,
              icon: <Layers className="w-4 h-4 text-emerald-500"/>
            },
            {
              label: 'Current Page Elements',
              value: booksList.length,
              icon: <CheckCircle2 className="w-4 h-4 text-blue-500"/>
            },
          ].map(s => (
              <div key={s.label} className="bg-white border border-border-warm rounded-xl p-4 flex items-center gap-3 shadow-xs">
                <div className="p-2 bg-cream-dark rounded-lg shrink-0">{s.icon}</div>
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
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider w-12">#</th>
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Book Details</th>
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Stock</th>
                <th className="text-left px-5 py-3 font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="text-right px-5 py-3 font-bold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-border-warm/40">
              {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-text-muted font-serif">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary"/>
                        <span>Loading catalog...</span>
                      </div>
                    </td>
                  </tr>
              ) : booksList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-text-muted font-serif">
                      No books found matching criteria.
                    </td>
                  </tr>
              ) : (
                  booksList.map((book: any, idx: number) => (
                      <tr key={book.id} className="hover:bg-cream-dark/10 transition-colors">
                        <td className="px-5 py-3.5 text-text-muted font-medium">{(page * 8) + idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-12 rounded overflow-hidden border border-border-warm shrink-0 bg-cream-dark">
                              {book.coverImageUrl ? (
                                  <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover"/>
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-cream-dark"><Star className="w-4 h-4 text-text-muted/30"/></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-serif font-black text-text-dark truncate max-w-[200px]">{book.title}</p>
                              <p className="text-text-muted truncate max-w-[200px] mt-0.5 font-medium">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="px-2 py-0.5 bg-primary-light text-primary rounded-full text-[10px] font-bold border border-border-warm">
                            {getCategoryName(book.categoryId)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-text-dark hidden sm:table-cell">${parseFloat(book.price).toFixed(2)}</td>
                        <td className="px-5 py-3.5 hidden lg:table-cell font-medium text-text-dark">
                          {book.stockQuantity} copies
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {getStatusBadge(book.status)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                                onClick={() => setEditing(book)}
                                className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer"
                                title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5"/>
                            </button>
                            <button
                                onClick={() => setConfirmDelete(book.id)}
                                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
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

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4.5 bg-white border border-border-warm rounded-2xl mt-5 shadow-xs">
              <p className="text-xs text-text-muted font-medium">
                Page <span className="font-bold text-text-dark">{page + 1}</span> of <span className="font-bold text-text-dark">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="px-3.5 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-dark bg-white hover:bg-cream-dark disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3.5 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-dark bg-white hover:bg-cream-dark disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
        )}

        {/* Delete confirm dialog */}
        {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl border border-border-warm shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-500"/>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-text-dark">Delete Book?</h3>
                    <p className="text-xs text-text-muted mt-1">
                      This book will be permanently removed from the catalog.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setConfirmDelete(null)}
                          className="px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(confirmDelete)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer shadow-sm">
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Create / Edit modal */}
        {editing !== undefined && (
            <BookFormModal book={editing} onClose={() => {
              setEditing(undefined);
              fetchBooks({
                params: {
                  search: search.trim() || undefined,
                  categoryId: filterCat !== 'All' ? filterCat : undefined,
                  page,
                  size: 8
                }
              });
            }}/>
        )}
      </>
  );
}
