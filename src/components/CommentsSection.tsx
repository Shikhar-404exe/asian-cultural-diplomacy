'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, CheckCircle2, AlertCircle, LogIn, UserPlus, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  likesCount?: number;
}

interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'READER';
  avatarUrl?: string | null;
}

interface CommentsSectionProps {
  articleId: string;
  initialComments: CommentItem[];
}

export default function CommentsSection({ articleId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam bot trap
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        // Unauthenticated or network error
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: 'Please write your comment before submitting.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to submit comment.' });
      } else {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Thank you! Your perspective has been received.',
        });
        setContent('');
        // If admin commented, append to visible list immediately
        if (currentUser?.role === 'ADMIN' && data.comment) {
          setComments((prev) => [
            {
              id: data.comment.id,
              authorName: data.comment.authorName,
              content: content.trim(),
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-brand-border/60">
      <div className="flex items-center space-x-2.5 mb-8">
        <MessageSquare className="w-5 h-5 text-brand-blue" />
        <h3 className="font-serif text-2xl font-bold text-brand-navy">
          Perspectives & Dialogue ({comments.length})
        </h3>
      </div>

      {/* Civility Policy Banner */}
      <div className="bg-brand-powder/30 border border-brand-blue/20 rounded-xl p-4 mb-8 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start space-x-3">
        <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />
        <div>
          <span className="font-semibold text-brand-navy">Intercultural Civility Standard: </span>
          Contributions are reviewed to foster thoughtful, respectful exchange across cultural traditions. Comments are bound to registered reader accounts.
        </div>
      </div>

      {/* Comment Form for Authenticated Users */}
      {loadingUser ? (
        <div className="bg-brand-cream/40 border border-brand-border/60 rounded-xl p-6 mb-12 animate-pulse h-36" />
      ) : currentUser ? (
        <form onSubmit={handleSubmit} className="bg-brand-cream/60 border border-brand-border/80 rounded-xl p-6 sm:p-8 mb-12 shadow-subtle">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-ivory font-serif font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-brand-navy">
                  Commenting as <span className="font-bold">{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {currentUser.role === 'ADMIN' ? 'Platform Administrator / Founder' : 'Registered Reader'}
                </div>
              </div>
            </div>
            <Link
              href="/account"
              className="text-xs text-brand-blue hover:text-brand-navy underline underline-offset-2"
            >
              My Account
            </Link>
          </div>

          {/* Hidden Honeypot Input */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Leave this field blank</label>
            <input
              id="website_hp"
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
              Your Reflection <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your perspective or contextual insight..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
              maxLength={2500}
            />
            <div className="text-[11px] text-slate-400 text-right mt-1">
              {content.length}/2500 characters
            </div>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-lg mb-4 text-xs sm:text-sm flex items-start space-x-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-brand-navy text-brand-ivory text-xs font-semibold hover:bg-brand-blue transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit Perspective'}</span>
          </button>
        </form>
      ) : (
        /* Sign-in Callout Card for Unauthenticated Visitors */
        <div className="bg-brand-cream/50 border border-brand-border/80 rounded-xl p-6 sm:p-8 mb-12 text-center shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-brand-powder/60 text-brand-navy flex items-center justify-center mx-auto mb-3">
            <UserIcon className="w-5 h-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-brand-navy mb-2">
            Join the Asian Cultural Dialogue
          </h4>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            To ensure genuine dialogue and maintain editorial civility, readers sign in before contributing comments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy text-brand-ivory text-xs font-semibold hover:bg-brand-blue transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Comment</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-brand-ivory text-brand-navy border border-brand-border text-xs font-semibold hover:bg-brand-powder/40 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register as Reader</span>
            </Link>
          </div>
        </div>
      )}

      {/* Approved Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-brand-cream/20 rounded-xl border border-dashed border-brand-border text-slate-500 text-sm font-sans">
            No published comments on this publication yet. Be the first to contribute your thoughts.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-brand-ivory p-6 rounded-xl border border-brand-border/60 shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-powder text-brand-navy font-bold font-serif text-xs flex items-center justify-center">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm text-brand-navy">
                    {c.authorName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
