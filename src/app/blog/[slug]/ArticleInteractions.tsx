'use client';

import React, { useState } from 'react';
import { Heart, Share2, Check } from 'lucide-react';

interface ArticleInteractionsProps {
  articleId: string;
  initialLikes: number;
  title: string;
}

export default function ArticleInteractions({
  articleId,
  initialLikes,
  title,
}: ArticleInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (hasLiked || liking) return;
    setLiking(true);

    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likesCount);
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={hasLiked || liking}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide transition-all ${
          hasLiked
            ? 'bg-rose-50 border-rose-300 text-rose-600'
            : 'bg-brand-cream/60 border-brand-border hover:bg-brand-powder/50 text-slate-700'
        }`}
        title={hasLiked ? 'You liked this article' : 'Applaud this article'}
      >
        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
        <span>{likes} {likes === 1 ? 'Appreciation' : 'Appreciations'}</span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 rounded-full border border-brand-border bg-brand-cream/60 hover:bg-brand-powder/50 text-slate-700 text-xs font-semibold tracking-wide transition-colors"
        title="Share this publication"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
