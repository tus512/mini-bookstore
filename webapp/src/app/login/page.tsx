'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';
import { useDoRequest } from '@/hooks/useDoRequest';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useBookstoreStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { loading, doRequest: doLogin } = useDoRequest({
    url: '/auth/login',
    method: 'POST',
    formParams: { email, password },
    onSuccess: async (data) => {
      localStorage.setItem('auth_token', data.token);

      try {
        const userRes = await apiClient.get('/users/me');
        const userData = userRes.data;

        login(userData);

        toast.success(`Welcome back, ${userData.fullName}!`, {
          icon: '👋',
          style: {
            background: '#fbfbf9',
            color: '#2a2421',
            border: '1px solid #ebdcd0',
          }
        });

        router.push('/');
      } catch (err: any) {
        toast.error('Failed to fetch user profile.');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  });

  // If already logged in, show redirect or welcome
  if (user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 border border-border-warm rounded-2xl bg-white text-center font-sans">
        <h2 className="text-2xl font-serif font-black text-text-dark">Already Logged In</h2>
        <p className="text-xs text-text-muted mt-2">You are currently logged in as <span className="font-bold text-primary">{user.email}</span>.</p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link href="/" className="px-4 py-2 border border-border-warm rounded-md text-xs font-semibold hover:bg-cream-dark transition-all text-text-muted">
            Go Home
          </Link>
          <button
            onClick={() => router.push('/explore')}
            className="px-4 py-2 bg-primary text-white rounded-md text-xs font-bold btn-premium uppercase tracking-widest cursor-pointer shadow-md"
          >
            Explore Library
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    doLogin();
  };

  return (
    <div className="max-w-5xl mx-auto my-12 px-4 sm:px-6 lg:px-8 font-sans select-none">

      <div className="bg-white rounded-2xl border border-border-warm overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 min-h-[550px]">

        {/* Left Side: Cozy Cozy Coffee & Book Image (Matching the mockup!) */}
        <div className="relative hidden md:block w-full h-full bg-cream-dark">
          <Image
            unoptimized
            src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop"
            alt="Warm coffee cup with cozy reading books and dry flowers"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-[#8c6239]/5 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Right Side: Login form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center text-left space-y-8">

          {/* Logo & Headline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-black text-xl tracking-wider text-text-dark">
                BOOKDOOR
              </span>
            </div>
            <h2 className="text-2xl font-serif font-black text-text-dark">Welcome Back</h2>
            <p className="text-xs text-text-muted">Login to manage your bookshelf, cart, and orders.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-dark uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                  required
                />
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold text-text-dark uppercase tracking-wider">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wider">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-10 py-2.5 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                  required
                />
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-text-muted hover:text-text-dark transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

          </form>

          {/* Footer Navigation */}
          <p className="text-xs text-text-muted text-center pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Sign up
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}
