'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Eye, UserCheck } from 'lucide-react';

export default function AdminAboutEditorPage() {
  const [siteTagline, setSiteTagline] = useState('');
  const [aboutFounderBio, setAboutFounderBio] = useState('');
  const [aboutMission, setAboutMission] = useState('');
  const [aboutVision, setAboutVision] = useState('');
  const [aboutPhilosophy, setAboutPhilosophy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          const s = d.settings;
          setSiteTagline(s.siteTagline || '');
          setAboutFounderBio(s.aboutFounderBio || '');
          setAboutMission(s.aboutMission || '');
          setAboutVision(s.aboutVision || '');
          setAboutPhilosophy(s.aboutPhilosophy || '');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTagline,
          aboutFounderBio,
          aboutMission,
          aboutVision,
          aboutPhilosophy,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'About page content updated successfully!' });
      } else {
        setFeedback({ type: 'error', text: 'Failed to update content.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network connection issue.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Core Identity & Story
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Edit About Page & Founder Bio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Keep your organisation's mission, philosophy, and personal profile up to date without coding.
          </p>
        </div>

        <a
          href="/about"
          target="_blank"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-brand-ivory border border-brand-border text-slate-700 hover:bg-brand-powder/60 shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Live Page</span>
        </a>
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

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Founder Bio */}
        <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 text-brand-navy">
            <UserCheck className="w-5 h-5 text-brand-blue" />
            <h3 className="font-serif text-xl font-bold">
              Founder Profile & Bio
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            This narrative appears in the dedicated Founder section on the About page.
          </p>
          <textarea
            rows={5}
            value={aboutFounderBio}
            onChange={(e) => setAboutFounderBio(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-cream/40 border border-brand-border text-sm leading-relaxed"
          />
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle space-y-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Organisation Mission
            </h3>
            <textarea
              rows={4}
              value={aboutMission}
              onChange={(e) => setAboutMission(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm leading-relaxed"
            />
          </div>

          <div className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle space-y-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Organisation Vision
            </h3>
            <textarea
              rows={4}
              value={aboutVision}
              onChange={(e) => setAboutVision(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Cultural Diplomacy Philosophy */}
        <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
          <h3 className="font-serif text-xl font-bold text-brand-navy">
            Cultural Diplomacy Philosophy Statement
          </h3>
          <p className="text-xs text-slate-500">
            The core quote displayed prominently on the About page and Homepage Manifesto banner.
          </p>
          <textarea
            rows={3}
            value={aboutPhilosophy}
            onChange={(e) => setAboutPhilosophy(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-cream/40 border border-brand-border text-sm font-serif italic text-brand-navy leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-emerald-300" />
          <span>{saving ? 'Saving Changes...' : 'Save About Page Changes'}</span>
        </button>

      </form>

    </div>
  );
}

