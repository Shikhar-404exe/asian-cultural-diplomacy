'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin portal error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-brand-cream/80 border border-brand-border/80 rounded-3xl p-8 shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-navy">
          Portal Display Error
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          The management portal encountered an unexpected display issue while rendering this section.
        </p>

        {error.message && (
          <div className="p-3 bg-brand-ivory rounded-xl border border-brand-border text-left font-mono text-[11px] text-slate-700 overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy text-brand-ivory text-xs font-semibold hover:bg-brand-blue transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full border border-brand-border bg-brand-ivory text-brand-navy text-xs font-semibold hover:bg-brand-powder transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

