'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  Flag,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CommentItem {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  createdAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function ManageCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchComments = (status?: string) => {
    const s = status !== undefined ? status : statusFilter;
    const url = s === 'ALL' ? '/api/comments' : `/api/comments?status=${s}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) setComments(data.comments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">Pending Review</span>;
      case 'APPROVED':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Approved (Live)</span>;
      case 'REJECTED':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">Rejected</span>;
      case 'FLAGGED':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">Flagged</span>;
      default:
        return null;
    }
  };

  const pendingCount = comments.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Community Moderation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Manage Comments
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review reader perspectives. Only approved comments appear publicly beneath articles.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-brand-ivory p-1.5 rounded-xl border border-brand-border/70">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab
                  ? 'bg-brand-navy text-brand-ivory shadow-sm'
                  : 'text-slate-600 hover:text-brand-navy hover:bg-brand-powder/40'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500">
          No comments in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-6 rounded-2xl border transition-all ${
                c.status === 'PENDING'
                  ? 'bg-amber-50/70 border-amber-200 shadow-sm'
                  : 'bg-brand-ivory border-brand-border/70 shadow-subtle'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {statusBadge(c.status)}
                    <span className="font-serif font-bold text-brand-navy text-base">
                      {c.authorName}
                    </span>
                    {c.authorEmail && (
                      <span className="text-xs text-slate-400 font-mono">
                        ({c.authorEmail})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-brand-blue font-medium">
                    Article: <span className="text-slate-700 italic">{c.article?.title}</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">
                  {formatDate(c.createdAt)}
                </span>
              </div>

              {/* Comment Content */}
              <div className="p-4 rounded-xl bg-brand-cream/40 border border-brand-border/40 text-sm text-slate-800 leading-relaxed font-sans mb-4 whitespace-pre-wrap">
                {c.content}
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  {c.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(c.id, 'APPROVED')}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve (Publish)</span>
                    </button>
                  )}

                  {c.status !== 'REJECTED' && (
                    <button
                      onClick={() => updateStatus(c.id, 'REJECTED')}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {c.status !== 'FLAGGED' && (
                    <button
                      onClick={() => updateStatus(c.id, 'FLAGGED')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Flag</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => deleteComment(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

