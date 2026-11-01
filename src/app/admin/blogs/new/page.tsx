'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/TipTapEditor';
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function WriteBlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('/art/founder-sister-bridge.jpg');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Autosave simulation/draft backup to localStorage
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'acd_blog_draft',
          JSON.stringify({ title, subtitle, categoryId, coverImage, content, isFeatured, time: Date.now() })
        );
        setAutosaveStatus('Draft autosaved locally');
      } catch (e) {}
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, subtitle, categoryId, coverImage, content, isFeatured]);

  // Load saved draft if user wants
  useEffect(() => {
    try {
      const saved = localStorage.getItem('acd_blog_draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data && (!title && !content)) {
          // prefill
          setTitle(data.title || '');
          setSubtitle(data.subtitle || '');
          if (data.categoryId) setCategoryId(data.categoryId);
          if (data.coverImage) setCoverImage(data.coverImage);
          if (data.content) setContent(data.content);
          if (data.isFeatured !== undefined) setIsFeatured(data.isFeatured);
          setAutosaveStatus('Restored previous unsaved work');
        }
      }
    } catch (e) {}
  }, []);

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setFeedback({ type: 'error', text: 'Please provide a title for your article.' });
      return;
    }
    if (!categoryId) {
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
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          categoryId,
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
        localStorage.removeItem('acd_blog_draft');
        setFeedback({
          type: 'success',
          text: publish
            ? 'Congratulations! Your article has been published live.'
            : 'Article saved as draft successfully.',
        });
        setTimeout(() => {
          router.push('/admin/blogs');
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
            <div className="text-[11px] text-slate-500 flex items-center space-x-2">
              <span>Non-technical WYSIWYG Publisher</span>
              {autosaveStatus && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">{autosaveStatus}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
          
          {/* Metadata Section: Title, Subtitle, Category, Cover */}
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
                  placeholder="/art/founder-sister-bridge.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                />
              </div>
            </div>

            {/* Quick Artwork Asset Picker */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Preset Cover Images (Founder Art & Photography):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCoverImage('/art/founder-sister-bridge.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  Sister's Moon Bridge
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('/art/founder-sister-courtyard.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  Sister's Courtyard Pavilion
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('/images/fuji-sakura.jpg')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-cream border border-brand-border hover:bg-brand-powder/60"
                >
                  Mount Fuji & Sakura
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
              Article Content & Body
            </label>
            <TipTapEditor
              content={content}
              onChange={(newHtml) => setContent(newHtml)}
              placeholder="Write your essay here. Use the formatting toolbar for headings, quotes, and images..."
            />
          </div>

        </div>
      )}

    </div>
  );
}
