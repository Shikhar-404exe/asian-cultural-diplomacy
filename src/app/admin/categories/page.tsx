'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Check } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  _count: { articles: number };
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#315C85');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });
      if (res.ok) {
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
          Editorial Taxonomy
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
          Manage Categories ({categories.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Define editorial pillars and regional topics to organize publications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Create Form */}
        <div className="md:col-span-5 bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
          <h3 className="font-serif font-bold text-lg text-brand-navy flex items-center space-x-2">
            <Plus className="w-4 h-4 text-brand-blue" />
            <span>Add New Category</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maritime Silk Road Studies"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/50 border border-brand-border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of articles in this topic..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/50 border border-brand-border text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                Theme Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-brand-border cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-lg bg-brand-cream/50 border border-brand-border font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Right: Existing Categories List */}
        <div className="md:col-span-7 space-y-3">
          <h3 className="font-serif font-bold text-lg text-brand-navy">
            Existing Editorial Categories
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading categories...</div>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-brand-ivory border border-brand-border/70 shadow-subtle flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || '#315C85' }}
                    />
                    <h4 className="font-serif font-bold text-brand-navy text-base">
                      {c.name}
                    </h4>
                  </div>
                  {c.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <span className="text-[11px] font-mono text-brand-sky">
                    slug: /{c.slug}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-powder/60 font-semibold text-brand-navy">
                    {c._count.articles} {c._count.articles === 1 ? 'article' : 'articles'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

