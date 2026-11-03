'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate secure request (avoids user enumeration)
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-ivory">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-brand-ivory font-serif font-bold text-lg shadow-sm">
            和
          </div>
          <span className="font-serif font-bold text-xl text-brand-navy">
            Asian Cultural Diplomacy
          </span>
        </Link>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-navy">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email address to receive recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-brand-cream/60 py-8 px-6 shadow-subtle rounded-2xl border border-brand-border/80 sm:px-10">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">Check Your Inbox</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If an account exists for <strong className="text-brand-navy">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-blue hover:text-brand-navy"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@asianculturaldiplomacy.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{loading ? 'Processing...' : 'Send Reset Instructions'}</span>
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-blue hover:text-brand-navy"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

