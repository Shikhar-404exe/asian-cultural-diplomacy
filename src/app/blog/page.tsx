import React from 'react';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import BlogFilterHeader from './BlogFilterHeader';

export const revalidate = 0;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: { where: { isPublished: true } } } } },
    orderBy: { name: 'asc' },
  });

  const where: any = { isPublished: true };

  if (category && category !== 'all') {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { subtitle: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: true,
      _count: { select: { comments: { where: { status: 'APPROVED' } } } },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <div className="bg-architectural-grid min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Heading */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue block mb-2">
            Editorial Publications & Essays
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-navy leading-tight mb-4">
            Perspectives on Asian Cultural Diplomacy
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-sans">
            Scholarly observations, field reflections, and philosophical analyses published by the founder to advance intercultural understanding across Asia.
          </p>
        </div>

        {/* Filter & Search Header Component */}
        <BlogFilterHeader categories={categories} activeCategory={category} activeSearch={search} />

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20 bg-brand-cream/40 rounded-2xl border border-dashed border-brand-border text-slate-500 font-sans my-12">
            <h3 className="font-serif text-xl font-bold text-brand-navy mb-2">
              No publications match your criteria
            </h3>
            <p className="text-sm">Try selecting another category or clearing your search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
