'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/TipTapEditor';
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cloud,
  CloudOff,
  History,
  RotateCcw,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RevisionItem {
  id: string;
  revisionNumber: number;
  title: string;
  subtitle?: string | null;
  content: string;
  createdAt: string;
  savedBy?: { name: string; email: string } | null;
}

export default function WriteBlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [articleId, setArticleId] = useState<string | null>(null);
  const articleIdRef = React.useRef<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('/art/moon-bridge.jpg');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cloud autosave state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Revisions drawer
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Server-side cloud autosave with debounce
  useEffect(() => {
    if (!title && !content) return;

    setSyncStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const effectiveCatId = categoryId || (categories.length > 0 ? categories[0].id : null);
        const res = await fetch('/api/articles/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId,
            title,
            subtitle,
            categoryId: effectiveCatId,
            coverImage,
            content,
            isFeatured,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (data.articleId) {
            articleIdRef.current = data.articleId;
            setArticleId(data.articleId);
          }
          setSyncStatus('saved');
          const now = new Date();
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          
          // Redundant local cache backup
          try {
            localStorage.setItem(
              'acd_blog_draft_backup',
              JSON.stringify({ articleId: data.articleId, title, subtitle, categoryId, coverImage, content, isFeatured, time: Date.now() })
            );
          } catch (e) {}
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        setSyncStatus('error');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [title, subtitle, categoryId, coverImage, content, isFeatured, articleId]);

  // Load revisions
  const loadRevisions = async () => {
    if (!articleId) return;
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/revisions`);
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

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setFeedback({ type: 'error', text: 'Please provide a title for your article.' });
      return;
    }
    const effectiveCategoryId = categoryId || (categories.length > 0 ? categories[0].id : '');
    if (!effectiveCategoryId) {
      setFeedback({ type: 'error', text: 'Please select a category.' });
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      setFeedback({ type: 'error', text: 'Please write some content before saving.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const activeId = articleId || articleIdRef.current;
      const endpoint = activeId ? `/api/articles/${activeId}` : '/api/articles';
      const method = activeId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          categoryId: effectiveCategoryId,
          coverImage,
          content,
          isPublished: publish,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save publication.' });
      } else {
        try {
          localStorage.removeItem('acd_blog_draft_backup');
        } catch (e) {}
        setFeedback({
          type: 'success',
          text: publish
            ? 'Congratulations! Your article has been published live.'
            : 'Article saved as draft successfully.',
        });
        setTimeout(() => {
          router.push('/admin/blogs');
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-cream/80 p-5 sm:p-6 rounded-2xl border border-brand-border shadow-subtle">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/admin/blogs')}
            className="p-2 rounded-lg hover:bg-brand-powder/50 text-slate-700 transition-colors"
            title="Back to Blogs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-navy">
              Write an Article
            </h1>
            <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
              <span>Non-technical WYSIWYG Publisher</span>
              <span>•</span>
              
              {/* Cloud Autosave Indicator */}
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
                  <span>Offline cache active (Sync failed)</span>
                </span>
              )}
              {syncStatus === 'idle' && (
                <span className="text-slate-400">Ready</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {articleId && (
            <button
              type="button"
              onClick={handleOpenRevisions}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-brand-ivory text-brand-navy border border-brand-border hover:bg-brand-powder/50 transition-colors"
              title="View Version History"
            >
              <History className="w-3.5 h-3.5 text-brand-blue" />
              <span>Revisions</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
              previewMode
                ? 'bg-brand-navy text-brand-ivory border-brand-navy'
                : 'bg-brand-ivory text-slate-700 border-brand-border hover:bg-brand-powder/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-brand-cream border border-brand-border text-slate-800 hover:bg-brand-powder/60 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-brand-blue hover:bg-brand-navy text-brand-ivory transition-colors shadow-sm disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Live</span>
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

      {/* Preview Screen */}
      {previewMode ? (
        <div className="bg-brand-ivory p-6 sm:p-10 rounded-2xl border border-brand-border shadow-card">
          <div className="text-xs uppercase tracking-widest text-brand-blue font-semibold mb-2">
            Article Preview
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-2">
            {title || 'Untitled Article'}
          </h1>
          {subtitle && (
            <p className="font-serif italic text-lg text-slate-600 mb-6">
              {subtitle}
            </p>
          )}
          {coverImage && (
            <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden mb-8 border border-brand-border">
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: content || '<p>No content entered yet.</p>' }}
          />
        </div>
      ) : (
        /* Visual Editor Screen */
        <div className="space-y-6">
          
          {/* Metadata Section */}
          <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Architecture of Dialogue: Building Bridges Across Civilisations"
                className="w-full px-4 py-3 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 font-serif text-lg sm:text-xl font-bold text-brand-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Subtitle / Executive Summary
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief one-sentence editorial overview"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Category <span className="text-rose-500">*</span>
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
                  placeholder="/art/moon-bridge.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                />
              </div>
            </div>

            {/* Quick Artwork Asset Picker */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Preset Cover Images (Art &amp; Photography):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCoverImage('/art/moon-bridge.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  The Moon Bridge
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('/art/courtyard-pavilion.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  Courtyard Pavilion
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('/images/fuji-sakura.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  Mount Fuji &amp; Sakura
                </button>
              </div>
            </div>

            {/* Featured Switch */}
            <div className="pt-2 flex items-center space-x-2.5">
              <input
                id="isFeaturedCheck"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-brand-border focus:ring-brand-blue"
              />
              <label htmlFor="isFeaturedCheck" className="text-xs font-semibold text-brand-navy cursor-pointer">
                Highlight as Featured Perspective on Homepage
              </label>
            </div>
          </div>

          {/* Visual Rich Text Canvas */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
              Article Content &amp; Body
            </label>
            <TipTapEditor
              content={content}
              onChange={(newHtml) => setContent(newHtml)}
              placeholder="Write your essay here. Use the formatting toolbar for headings, quotes, and images..."
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
