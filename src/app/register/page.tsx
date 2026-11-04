'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please check your information.');
        return;
      }

      // Successful registration
      router.push(data.redirectTo || '/account');
      router.refresh();
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-brand-ivory">
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
          Join the Reader Dialogue
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Create your reader profile to engage in civilized intercultural discourse.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-brand-cream/60 py-8 px-6 shadow-subtle rounded-2xl border border-brand-border/80 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lin Wei, M.A."
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                This name will be displayed alongside your approved comments.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Kept strictly confidential and never displayed publicly.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Reader Account...' : 'Complete Registration'}</span>
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-brand-blue hover:text-brand-navy inline-flex items-center space-x-1"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center bg-brand-ivory"><div className="w-8 h-8 rounded-full border-2 border-brand-navy border-t-transparent animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

