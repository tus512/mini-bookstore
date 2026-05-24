'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Save, Edit3, X, Camera, ShieldCheck } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProfileInfo() {
  const { user, updateProfile } = useBookstoreStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    updateProfile(form);
    setIsEditing(false);
    toast.success('Profile updated successfully!', {
      icon: '✅',
      style: { background: '#fbfbf9', color: '#2a2421', border: '1px solid #ebdcd0' },
    });
  };

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email, phone: user.phone, address: user.address });
    setIsEditing(false);
  };

  const field = (
    label: string,
    key: keyof typeof form,
    icon: React.ReactNode,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-text-dark uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {icon}
        </div>
        {isEditing ? (
          <input
            type={type}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full bg-cream-bg border border-border-warm rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
          />
        ) : (
          <div className="w-full bg-cream-dark/30 border border-border-warm/50 rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-dark font-medium min-h-[38px] flex items-center">
            {form[key] || <span className="text-text-muted italic">Not set</span>}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Avatar + identity card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white border border-border-warm rounded-2xl shadow-sm">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-serif font-black text-3xl shadow-md select-none">
            {initials}
          </div>
          {isEditing && (
            <button
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-border-warm rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
              title="Change photo (mock)"
              onClick={() => toast('Avatar upload coming soon!', { icon: '📸' })}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Name / status */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-serif font-black text-text-dark">{user.name}</h2>
          <p className="text-xs text-text-muted font-medium">{user.email}</p>
          {user.isAdmin && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary-light border border-border-warm px-2.5 py-1 rounded-full mt-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Admin Account
            </span>
          )}
        </div>

        {/* Edit / Save / Cancel actions */}
        <div className="flex items-center gap-2 self-start">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-muted hover:bg-cream-dark transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-border-warm rounded-lg text-xs font-bold text-text-dark hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-warm bg-cream-dark/20 flex items-center justify-between">
          <h3 className="font-serif font-black text-sm text-text-dark uppercase tracking-wider">Personal Information</h3>
          {isEditing && (
            <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-border-warm animate-pulse">
              Editing…
            </span>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field('Full Name', 'name', <User className="w-4 h-4" />, 'text', 'Your full name')}
          {field('Email Address', 'email', <Mail className="w-4 h-4" />, 'email', 'your@email.com')}
          {field('Phone Number', 'phone', <Phone className="w-4 h-4" />, 'tel', '+1 (555) 000-0000')}
          <div className="sm:col-span-2">
            {field('Delivery Address', 'address', <MapPin className="w-4 h-4" />, 'text', '123 Main St, City, State ZIP')}
          </div>
        </div>
      </div>
    </div>
  );
}
