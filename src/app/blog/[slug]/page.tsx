import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import CommentsSection from '@/components/CommentsSection';
import ArticleInteractions from './ArticleInteractions';
import ArticleCard from '@/components/ArticleCard';

export const revalidate = 0;

export default async function SingleArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  // Fetch related articles from same category
  const relatedArticles = await prisma.article.findMany({
    where: {
      isPublished: true,
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    include: {
      category: true,
      _count: { select: { comments: { where: { status: 'APPROVED' } } } },
    },
    take: 2,
    orderBy: { publishedAt: 'desc' },
  });

  const cover = article.coverImage || '/art/founder-sister-bridge.jpg';

  return (
    <article className="bg-architectural-grid min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Publications</span>
          </Link>
        </div>

        {/* Editorial Header */}
        <header className="space-y-4 mb-10">
          <div className="flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider text-brand-blue">
            <span className="bg-brand-powder/60 px-3 py-1 rounded-full text-brand-navy border border-brand-border/60">
              {article.category.name}
            </span>
            {article.isFeatured && (
              <span className="bg-brand-navy text-brand-ivory px-3 py-1 rounded-full text-[11px]">
                Featured Essay
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy leading-[1.18]">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-serif italic text-lg sm:text-xl text-slate-700 leading-relaxed pt-1">
              {article.subtitle}
            </p>
          )}

          {/* Metadata Row */}
          <div className="pt-4 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-brand-powder text-brand-navy flex items-center justify-center font-serif font-bold text-xs">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-brand-navy">{article.author}</div>
                  <div className="text-[10px] text-brand-sky font-medium">Founder & Editor</div>
                </div>
              </div>

              <span>•</span>

              <div className="flex items-center space-x-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-brand-sky" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>

              <span>•</span>

              <div className="flex items-center space-x-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-brand-sky" />
                <span>{article.readingTime} min read</span>
              </div>
            </div>

            <ArticleInteractions
              articleId={article.id}
              initialLikes={article.likesCount}
              title={article.title}
            />
          </div>
        </header>

        {/* Hero Cover Image */}
        <div className="relative h-72 sm:h-96 lg:h-[460px] w-full rounded-2xl overflow-hidden shadow-card border border-brand-border/70 mb-12">
          <Image
            src={cover}
            alt={article.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Long-Form Rich-Text Body */}
        <div
          className="prose-editorial bg-brand-ivory/90 p-6 sm:p-10 rounded-2xl border border-brand-border/60 shadow-subtle mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Bottom Post Engagement Bar */}
        <div className="p-6 rounded-2xl bg-brand-cream/80 border border-brand-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 mb-16 shadow-subtle">
          <div>
            <h4 className="font-serif font-bold text-brand-navy text-base">
              Reflections on this publication?
            </h4>
            <p className="text-xs text-slate-600">
              Leave a perspective or applaud if this piece added to your understanding.
            </p>
          </div>
          <ArticleInteractions
            articleId={article.id}
            initialLikes={article.likesCount}
            title={article.title}
          />
        </div>

        {/* Author Bio Box */}
        <div className="bg-brand-powder/30 border border-brand-blue/20 rounded-2xl p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-16 h-16 rounded-full bg-brand-navy text-brand-ivory font-serif font-bold text-xl flex items-center justify-center shrink-0">
            和
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
              About the Author
            </div>
            <h4 className="font-serif font-bold text-brand-navy text-lg">
              {article.author}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              Founder of Asian Cultural Diplomacy, researching the intersections of classical heritage, art, and multilateral cross-border dialogue across Asia.
            </p>
          </div>
        </div>

        {/* Related Publications */}
        {relatedArticles.length > 0 && (
          <div className="mb-16">
            <h3 className="font-serif text-2xl font-bold text-brand-navy mb-6">
              Related Perspectives
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Community Dialogue & Moderated Comments */}
        <CommentsSection
          articleId={article.id}
          initialComments={article.comments.map((c) => ({
            id: c.id,
            authorName: c.authorName,
            content: c.content,
            createdAt: c.createdAt,
            likesCount: c.likesCount,
          }))}
        />

      </div>
    </article>
  );
}

