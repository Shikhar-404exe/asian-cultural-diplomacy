'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  likesCount?: number;
}

interface CommentsSectionProps {
  articleId: string;
  initialComments: CommentItem[];
}

export default function CommentsSection({ articleId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam bot trap
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in your name and comment.' });
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
          authorName: name,
          authorEmail: email || null,
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
          text: 'Thank you! Your perspective has been received and will be visible publicly once reviewed by the founder.',
        });
        setName('');
        setEmail('');
        setContent('');
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

      {/* Moderation Policy Notice */}
      <div className="bg-brand-powder/40 border border-brand-blue/20 rounded-xl p-4 mb-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <span className="font-semibold text-brand-navy">Editorial Civility Policy: </span>
        All contributions are reviewed by the founder before appearing on this page to ensure respectful, constructive intercultural discourse. We do not require public account creation.
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-brand-cream/70 border border-brand-border/70 rounded-xl p-6 sm:p-8 mb-12 shadow-subtle">
        <h4 className="font-serif text-lg font-bold text-brand-navy mb-4">
          Contribute Your Perspective
        </h4>

        {/* Hidden Honeypot Input for Bot Detection */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Prof. Lin Wei or Cultural Observer"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              maxLength={70}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Email Address <span className="text-slate-400 font-normal lowercase">(private, never displayed)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              maxLength={100}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
            Your Comment / Reflection <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this cultural topic..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
            maxLength={2000}
          />
          <div className="text-[11px] text-slate-400 text-right mt-1">
            {content.length}/2000 characters
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

      {/* Approved Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-brand-cream/30 rounded-xl border border-dashed border-brand-border text-slate-500 text-sm font-sans">
            No public comments yet. Be the first to share your reflection above.
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
