'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('shashwatiprajapati@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
      } else {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-architectural-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-cream/90 border border-brand-border/80 rounded-3xl p-8 sm:p-10 shadow-elevated">
        
        {/* Brand Seal */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-navy text-brand-ivory flex items-center justify-center font-serif font-bold text-2xl mx-auto mb-3 shadow-sm border-2 border-brand-cream">
            和
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            Publisher Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">
            Asian Cultural Diplomacy Administration
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Authorised Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Authorised Access Notice */}
        <div className="mt-8 pt-6 border-t border-brand-border/60 bg-brand-powder/40 p-4 rounded-xl text-xs text-slate-600 space-y-1">
          <div className="flex items-center space-x-1.5 font-semibold text-brand-navy">
            <KeyRound className="w-3.5 h-3.5 text-brand-blue" />
            <span>Authorised Founder Portal:</span>
          </div>
          <div><span className="font-mono text-brand-blue">shashwatiprajapati@gmail.com</span></div>
        </div>

      </div>
    </div>
  );
}

