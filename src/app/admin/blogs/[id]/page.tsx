'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TipTapEditor from '@/components/TipTapEditor';
import {
  ArrowLeft,
  Save,
  Globe,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Cloud,
  CloudOff,
  History,
  RotateCcw,
  X,
} from 'lucide-react';

interface RevisionItem {
  id: string;
  revisionNumber: number;
  title: string;
  subtitle?: string | null;
  content: string;
  createdAt: string;
  savedBy?: { name: string; email: string } | null;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cloud autosave state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Revisions state
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/articles/${id}`).then((r) => r.json()),
    ])
      .then(([catData, artData]) => {
        if (catData.categories) setCategories(catData.categories);
        if (artData.article) {
          const a = artData.article;
          setTitle(a.title);
          setSubtitle(a.subtitle || '');
          setCategoryId(a.categoryId);
          setCoverImage(a.coverImage || '');
          setContent(a.content);
          setIsPublished(a.isPublished);
          setIsFeatured(a.isFeatured);
          if (a.lastAutosavedAt) {
            const date = new Date(a.lastAutosavedAt);
            setLastSavedTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Server autosave debounced
  useEffect(() => {
    if (loading || (!title && !content)) return;

    setSyncStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/articles/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: id,
            title,
            subtitle,
            categoryId,
            coverImage,
            content,
            isPublished,
            isFeatured,
          }),
        });

        if (res.ok) {
          setSyncStatus('saved');
          const now = new Date();
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        setSyncStatus('error');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [id, title, subtitle, categoryId, coverImage, content, isPublished, isFeatured, loading]);

  const loadRevisions = async () => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/articles/${id}/revisions`);
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      }
    } catch (err) {
      console.error('Failed to load revisions:', err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleOpenRevisions = () => {
    setShowRevisions(true);
    loadRevisions();
  };

  const handleRestoreRevision = (rev: RevisionItem) => {
    if (window.confirm(`Restore Revision #${rev.revisionNumber} from ${new Date(rev.createdAt).toLocaleString()}? Current unsaved edits will be replaced.`)) {
      setTitle(rev.title);
      if (rev.subtitle) setSubtitle(rev.subtitle);
      setContent(rev.content);
      setShowRevisions(false);
      setFeedback({ type: 'success', text: `Restored Revision #${rev.revisionNumber}. Changes will autosave to cloud.` });
    }
  };

  const handleUpdate = async (publishStatus?: boolean) => {
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', text: 'Title and content are required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const willPublish = publishStatus !== undefined ? publishStatus : isPublished;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          categoryId,
          coverImage,
          content,
          isPublished: willPublish,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update article.' });
      } else {
        setIsPublished(willPublish);
        setFeedback({ type: 'success', text: 'Article changes saved successfully.' });
        setTimeout(() => {
          router.push('/admin/blogs');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication issue.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this publication?')) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/blogs');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading publication...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-cream/80 p-5 sm:p-6 rounded-2xl border border-brand-border shadow-subtle">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/admin/blogs')}
            className="p-2 rounded-lg hover:bg-brand-powder/50 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-navy">
              Edit Article
            </h1>
            <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
              <span>Status: <strong className="text-brand-navy">{isPublished ? 'Published Live' : 'Draft'}</strong></span>
              <span>•</span>
              {syncStatus === 'saving' && (
                <span className="inline-flex items-center space-x-1 text-brand-blue font-semibold">
                  <Cloud className="w-3.5 h-3.5 animate-pulse" />
                  <span>Saving to Cloud...</span>
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Saved to Cloud ({lastSavedTime})</span>
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold">
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Offline cache active</span>
                </span>
              )}
              {syncStatus === 'idle' && (
                <span className="text-slate-400">Synced</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenRevisions}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-brand-ivory text-brand-navy border border-brand-border hover:bg-brand-powder/50 transition-colors"
            title="View Version History"
          >
            <History className="w-3.5 h-3.5 text-brand-blue" />
            <span>Revisions</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-brand-ivory border border-brand-border"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdate(false)}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-brand-cream border border-brand-border text-slate-800 hover:bg-brand-powder/60 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleUpdate(true)}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-brand-blue text-brand-ivory hover:bg-brand-navy transition-colors disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isPublished ? 'Save & Keep Live' : 'Publish Live'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-full text-rose-600 hover:bg-rose-50"
            title="Delete Article"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Editor or Preview */}
      {previewMode ? (
        <div className="bg-brand-ivory p-6 sm:p-10 rounded-2xl border border-brand-border shadow-card">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="font-serif italic text-lg text-slate-600 mb-6">
              {subtitle}
            </p>
          )}
          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 font-serif text-lg font-bold text-brand-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Subtitle / Summary
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2.5">
              <input
                id="editFeaturedCheck"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-brand-border focus:ring-brand-blue"
              />
              <label htmlFor="editFeaturedCheck" className="text-xs font-semibold text-brand-navy cursor-pointer">
                Highlight as Featured Perspective on Homepage
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
              Content &amp; Body
            </label>
            <TipTapEditor
              content={content}
              onChange={(newHtml) => setContent(newHtml)}
            />
          </div>
        </div>
      )}

      {/* Revisions History Modal */}
      {showRevisions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-brand-ivory rounded-2xl border border-brand-border max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-brand-border/60 flex items-center justify-between bg-brand-cream/60">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-brand-navy" />
                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  Version History &amp; Revisions
                </h3>
              </div>
              <button
                onClick={() => setShowRevisions(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-brand-powder/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingRevisions ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading previous drafts...
                </div>
              ) : revisions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  No previous revisions recorded yet. Revisions are captured automatically as you write.
                </div>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-brand-border/80 bg-brand-cream/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs bg-brand-navy text-brand-ivory px-2 py-0.5 rounded">
                          Rev #{rev.revisionNumber}
                        </span>
                        <span className="font-semibold text-sm text-brand-navy">
                          {rev.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Saved {new Date(rev.createdAt).toLocaleString()} by {rev.savedBy?.name || 'Administrator'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreRevision(rev)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-ivory border border-brand-border text-brand-blue hover:bg-brand-powder/50 text-xs font-semibold shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-brand-border/60 bg-brand-cream/40 text-right">
              <button
                onClick={() => setShowRevisions(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-navy text-brand-ivory hover:bg-brand-blue"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
