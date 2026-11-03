'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
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
  category: { name: string; slug: string };
  _count: { comments: number };
}

export default function ManageBlogsPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'TITLE'>('NEWEST');

  const fetchArticles = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/articles?includeDrafts=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch publications');
      }
      if (Array.isArray(data.articles)) {
        setArticles(data.articles);
      }
    } catch (err: any) {
      console.error('Failed to load publications:', err);
      setError(err.message || 'Unable to load articles. Please check your network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
        // Optimistic local update followed by full sync
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isPublished: !currentStatus } : a))
        );
        fetchArticles();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update article status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating publication status.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete article.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting article.');
    }
  };

  // Filtered and Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Status filter
        if (statusFilter === 'PUBLISHED' && !art.isPublished) return false;
        if (statusFilter === 'DRAFT' && art.isPublished) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = art.title.toLowerCase().includes(q);
          const matchSubtitle = art.subtitle?.toLowerCase().includes(q);
          const matchCategory = art.category?.name.toLowerCase().includes(q);
          return matchTitle || matchSubtitle || matchCategory;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'NEWEST') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOrder === 'OLDEST') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOrder === 'TITLE') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [articles, statusFilter, searchQuery, sortOrder]);

  const liveCount = articles.filter((a) => a.isPublished).length;
  const draftCount = articles.filter((a) => !a.isPublished).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Editorial Publications & Essays
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Manage Publications ({articles.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review, edit, publish, or unpublish your perspectives and essays.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => fetchArticles(true)}
            disabled={refreshing}
            className="p-2.5 rounded-full border border-brand-border bg-brand-ivory text-brand-navy hover:bg-brand-powder/50 transition-colors disabled:opacity-50"
            title="Refresh publications list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-blue' : ''}`} />
          </button>

          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-300" />
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchArticles(true)}
            className="text-xs font-bold underline ml-4 hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Control Toolbar: Status Tabs, Search, and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-ivory p-4 rounded-2xl border border-brand-border/70 shadow-subtle">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-brand-cream/80 rounded-xl border border-brand-border/50">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-brand-navy text-brand-ivory shadow-sm'
                : 'text-slate-600 hover:text-brand-navy hover:bg-brand-powder/40'
            }`}
          >
            All ({articles.length})
          </button>

          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'PUBLISHED'
                ? 'bg-emerald-700 text-brand-ivory shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            Live ({liveCount})
          </button>

          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-brand-ivory shadow-sm'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-800"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl bg-brand-ivory border border-brand-border text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="TITLE">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Articles List / Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-brand-ivory rounded-2xl border border-brand-border">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-blue mb-3" />
          <p className="text-sm font-medium">Loading publications...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-16 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500 space-y-3">
          <FileText className="w-8 h-8 mx-auto text-brand-blue/50" />
          <h3 className="font-serif text-lg font-bold text-brand-navy">
            {searchQuery
              ? 'No matching articles found'
              : statusFilter === 'PUBLISHED'
              ? 'No live articles published yet'
              : statusFilter === 'DRAFT'
              ? 'No unpublished drafts found'
              : 'No articles created yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No articles match "${searchQuery}". Try clearing your search term.`
              : 'Click "Write New Article" above to create and publish your first editorial essay.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-brand-blue underline hover:text-brand-navy"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-brand-ivory p-5 sm:p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-brand-blue/40"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      art.isPublished
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {art.isPublished ? 'Live' : 'Draft'}
                  </span>

                  <span className="text-xs font-medium text-brand-blue">
                    {art.category?.name || 'Uncategorized'}
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

                {art.subtitle && (
                  <p className="text-xs text-slate-600 line-clamp-1 italic font-serif">
                    {art.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                  <span>Created {formatDate(art.createdAt)}</span>
                  {art.publishedAt && (
                    <>
                      <span>•</span>
                      <span>Published {formatDate(art.publishedAt)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{art._count?.comments || 0} Comments</span>
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
                  className="inline-flex items-center space-x-1 text-xs px-3.5 py-1.5 rounded-full font-semibold bg-brand-cream border border-brand-border text-brand-navy hover:bg-brand-powder/60 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                {art.isPublished && (
                  <Link
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    className="p-2 rounded-full text-brand-blue hover:bg-brand-powder/50 transition-colors"
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
