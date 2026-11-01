'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MediaItem {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMedia = () => {
    fetch('/api/upload')
      .then((r) => r.json())
      .then((d) => {
        if (d.media) setMediaList(d.media);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to upload image.' });
      } else {
        setFeedback({ type: 'success', text: `Image "${file.name}" uploaded successfully!` });
        fetchMedia();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Upload failed. Check file size and format.' });
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Asset Repository
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload and access photographs, sister's artworks, and illustrations for your articles.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer shrink-0">
          <Upload className="w-4 h-4 text-emerald-300" />
          <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
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

      {/* Grid of Media Assets */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading media assets...</div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-brand-ivory border border-brand-border/70 rounded-2xl overflow-hidden shadow-subtle group flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-brand-powder/40 overflow-hidden">
                <img
                  src={item.fileUrl}
                  alt={item.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4 space-y-2">
                <div className="font-serif font-bold text-sm text-brand-navy truncate">
                  {item.originalName}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  {item.fileUrl}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-brand-border/40">
                  <span className="text-[10px] text-slate-400">
                    {(item.sizeBytes / 1024).toFixed(0)} KB
                  </span>
                  <button
                    onClick={() => copyUrl(item.id, item.fileUrl)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-cream hover:bg-brand-powder/60 text-brand-navy border border-brand-border transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
