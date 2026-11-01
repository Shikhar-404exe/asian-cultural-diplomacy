import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    coverImage?: string | null;
    author: string;
    publishedAt?: Date | string | null;
    readingTime: number;
    likesCount: number;
    category: {
      name: string;
      slug: string;
      color?: string | null;
    };
    _count?: {
      comments: number;
    };
  };
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const cover = article.coverImage || '/art/founder-sister-bridge.jpg';

  if (featured) {
    return (
      <article className="group relative bg-brand-cream/80 border border-brand-border/70 rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden">
          <Image
            src={cover}
            alt={article.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-4 left-4 bg-brand-navy/90 backdrop-blur-sm text-brand-ivory text-xs uppercase tracking-widest px-3 py-1 rounded-full font-medium">
            Featured Perspective
          </div>
        </div>
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 text-xs text-brand-sky font-medium mb-3">
              <span className="text-brand-blue font-semibold uppercase tracking-wider">
                {article.category.name}
              </span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{article.readingTime} min read</span>
              </span>
            </div>

            <Link href={`/blog/${article.slug}`}>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-tight mb-3">
                {article.title}
              </h3>
            </Link>

            {article.subtitle && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-sans">
                {article.subtitle}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-brand-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              By {article.author}
            </span>
            <Link
              href={`/blog/${article.slug}`}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors group/link"
            >
              <span>Read Full Article</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-brand-cream/60 border border-brand-border/60 rounded-xl overflow-hidden shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden bg-brand-powder/50">
        <Image
          src={cover}
          alt={article.title}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 left-3 bg-brand-ivory/90 backdrop-blur-sm text-brand-navy text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-border/50">
          {article.category.name}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-2.5">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime} min</span>
            </span>
          </div>

          <Link href={`/blog/${article.slug}`}>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-navy group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug mb-2">
              {article.title}
            </h3>
          </Link>

          {article.subtitle && (
            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
              {article.subtitle}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs text-slate-500">
          <span>By {article.author}</span>
          <div className="flex items-center space-x-3 text-slate-400">
            {article.likesCount > 0 && (
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                <span>{article.likesCount}</span>
              </span>
            )}
            {article._count && article._count.comments > 0 && (
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{article._count.comments}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
