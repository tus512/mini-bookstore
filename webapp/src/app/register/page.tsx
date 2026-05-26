'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { useBookstoreStore } from '@/lib/store';
import Image from 'next/image';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';
import { useDoRequest } from '@/hooks/useDoRequest';

export default function RegisterPage() {
  const router = useRouter();
  const { login, user } = useBookstoreStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const { loading, doRequest: doRegister } = useDoRequest({
    url: '/auth/register',
    method: 'POST',
    formParams: { fullName, email, password },
    onSuccess: async (data) => {
      localStorage.setItem('auth_token', data.token);

      try {
        const userRes = await apiClient.get('/users/me');
        const userData = userRes.data;

        login(userData);

        toast.success(`Account created! Welcome, ${userData.fullName}!`, {
          icon: '🎉',
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
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  });

  // If already logged in, redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 border border-border-warm rounded-2xl bg-white text-center font-sans">
        <h2 className="text-2xl font-serif font-black text-text-dark">Already Registered</h2>
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
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms & Conditions.');
      return;
    }

    doRegister();
  };

  return (
    <div className="max-w-5xl mx-auto my-12 px-4 sm:px-6 lg:px-8 font-sans select-none">

      <div className="bg-white rounded-2xl border border-border-warm overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

        {/* Left Side: Cozy Book & Floral elements (Matching the mockup!) */}
        <div className="relative hidden md:block w-full h-full bg-cream-dark">
          <Image
            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
            alt="Minimalist elegant book pages lying next to dried floral stem"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-[#8c6239]/5 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Right Side: Signup Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center text-left space-y-6">

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
            <h2 className="text-2xl font-serif font-black text-text-dark">Create Account</h2>
            <p className="text-xs text-text-muted">Join us and start exploring our curated literature universe.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-dark uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-4 py-2 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                  required
                />
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-dark uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-4 py-2 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                  required
                />
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dark uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-4 py-2 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                    required
                  />
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dark uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cream-bg/40 border border-border-warm rounded-lg pl-10 pr-4 py-2 text-xs text-text-dark outline-hidden focus:border-primary transition-colors font-semibold"
                    required
                  />
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                </div>
              </div>

            </div>

            {/* Terms checkbox */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-center gap-2.5 text-left text-xs font-semibold text-text-muted hover:text-text-dark transition-colors cursor-pointer"
              >
                {agreeTerms ? (
                  <CheckSquare className="w-4.5 h-4.5 text-primary shrink-0" />
                ) : (
                  <Square className="w-4.5 h-4.5 text-border-warm shrink-0" />
                )}
                <span>I agree to the Terms & Conditions</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-wider cursor-pointer"
              >
                {showPassword ? 'Hide Pass' : 'Show Pass'}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-primary text-white rounded-md text-xs font-bold uppercase tracking-widest btn-premium hover:bg-primary-hover shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

          </form>

          {/* Footer Navigation */}
          <p className="text-xs text-text-muted text-center pt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}
