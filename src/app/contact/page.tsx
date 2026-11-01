'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setResult({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: 'error', text: data.error || 'Failed to submit enquiry.' });
      } else {
        setResult({
          type: 'success',
          text: 'Thank you. Your message has been safely received and stored in the founder’s local inbox.',
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      setResult({ type: 'error', text: 'Network connection issue. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-architectural-grid min-h-screen py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue block mb-2">
            Initiate Direct Dialogue
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-navy leading-tight mb-4">
            Contact & Academic Inquiries
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-sans">
            Reach out for research collaborations, symposium invitations, speaking engagements, or dialogue inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-brand-cream/80 border border-brand-border/80 rounded-2xl p-6 sm:p-8 shadow-card">
            <h3 className="font-serif text-2xl font-bold text-brand-navy mb-6">
              Send an Enquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Spam Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. A. Tanaka"
                  className="w-full px-4 py-2.5 rounded-lg bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.org"
                  className="w-full px-4 py-2.5 rounded-lg bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Research Collaboration / Keynote Request"
                  className="w-full px-4 py-2.5 rounded-lg bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your proposal or inquiry..."
                  className="w-full px-4 py-2.5 rounded-lg bg-brand-ivory border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
                  maxLength={3000}
                />
              </div>

              {result && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 ${
                    result.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {result.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{result.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-full bg-brand-navy text-brand-ivory text-xs font-semibold hover:bg-brand-blue transition-colors disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending...' : 'Transmit Enquiry'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Channels & Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-ivory border border-brand-border/70 rounded-2xl p-6 sm:p-8 shadow-subtle space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-powder text-brand-navy flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-xl text-brand-navy">
                Direct Inquiries
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For formal diplomatic queries, conference invitations, or academic correspondence, write directly to:
              </p>
              <div className="p-3 bg-brand-cream/60 rounded-lg text-xs font-mono text-brand-blue font-semibold">
                dialogue@asianculturaldiplomacy.org
              </div>
            </div>

            <div className="bg-brand-powder/40 border border-brand-blue/20 rounded-2xl p-6 sm:p-8 text-xs sm:text-sm text-slate-700 space-y-3">
              <span className="font-semibold text-brand-navy font-serif text-base block">
                Local MVP Architecture Note:
              </span>
              <p className="leading-relaxed">
                Submissions made through this form are stored securely in the local SQLite database. The founder reviews every message via the protected Publisher Portal.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
