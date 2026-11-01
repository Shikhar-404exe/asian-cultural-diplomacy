'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
}

interface BlogFilterHeaderProps {
  categories: CategoryItem[];
  activeCategory?: string;
  activeSearch?: string;
}

export default function BlogFilterHeader({
  categories,
  activeCategory,
  activeSearch = '',
}: BlogFilterHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(activeSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`/blog?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="space-y-6 bg-brand-cream/60 p-6 rounded-2xl border border-brand-border/70 shadow-subtle">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search publications, topics, heritage..."
            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="text-xs text-slate-500 font-medium">
          Filter by topic or regional focus:
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/40">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
            !activeCategory || activeCategory === 'all'
              ? 'bg-brand-navy text-brand-ivory shadow-sm'
              : 'bg-brand-ivory text-slate-600 hover:bg-brand-powder/60 border border-brand-border/60'
          }`}
        >
          All Topics
        </button>

        {categories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-brand-navy text-brand-ivory shadow-sm'
                  : 'bg-brand-ivory text-slate-600 hover:bg-brand-powder/60 border border-brand-border/60'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-blue text-brand-ivory' : 'bg-brand-cream text-slate-500'}`}>
                {cat._count.articles}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
