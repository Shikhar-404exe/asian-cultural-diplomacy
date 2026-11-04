'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const notice = searchParams.get('notice');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Successful login
      if (redirectParam) {
        window.location.href = redirectParam;
      } else if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        window.location.href = data.user?.role === 'ADMIN' ? '/admin' : '/account';
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-ivory">
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
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Access your reader profile or manage publication dialogue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-brand-cream/60 py-8 px-6 shadow-subtle rounded-2xl border border-brand-border/80 sm:px-10">
          
          {notice && (
            <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-sm">
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-blue hover:text-brand-navy underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="font-semibold text-brand-blue hover:text-brand-navy inline-flex items-center space-x-1"
              >
                <span>Join our reader dialogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center bg-brand-ivory"><div className="w-8 h-8 rounded-full border-2 border-brand-navy border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

