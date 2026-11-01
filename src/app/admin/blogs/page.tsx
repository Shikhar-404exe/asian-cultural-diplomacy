'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  author: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string | null;
  createdAt: string;
  category: { name: string };
  _count: { comments: number };
}

export default function ManageBlogsPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    fetch('/api/articles?includeDrafts=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Editorial Publications
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Manage Publications ({articles.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review, edit, publish, or unpublish your perspectives and essays.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm shrink-0"
        >
          <PenTool className="w-3.5 h-3.5 text-emerald-300" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Articles List / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading publications...</div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500">
          No articles created yet. Click "Write New Article" above to publish your first piece!
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-brand-ivory p-5 sm:p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    art.isPublished
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {art.isPublished ? 'Live' : 'Draft'}
                  </span>
                  <span className="text-xs font-medium text-brand-blue">
                    {art.category.name}
                  </span>
                  {art.isFeatured && (
                    <span className="text-[10px] font-semibold bg-brand-navy text-brand-ivory px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-navy leading-snug">
                  {art.title}
                </h3>

                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>Updated {formatDate(art.createdAt)}</span>
                  <span>•</span>
                  <span>{art._count.comments} Approved Comments</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/40">
                <button
                  onClick={() => handleTogglePublish(art.id, art.isPublished)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-colors ${
                    art.isPublished
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={art.isPublished ? 'Unpublish to draft' : 'Make article live'}
                >
                  {art.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <Link
                  href={`/admin/blogs/${art.id}`}
                  className="inline-flex items-center space-x-1 text-xs px-3.5 py-1.5 rounded-full font-semibold bg-brand-cream border border-brand-border text-brand-navy hover:bg-brand-powder/60"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                {art.isPublished && (
                  <Link
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    className="p-2 rounded-full text-brand-blue hover:bg-brand-powder/50"
                    title="View public page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={() => handleDelete(art.id, art.title)}
                  className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete article"
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
