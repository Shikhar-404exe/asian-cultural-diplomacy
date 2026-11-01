'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = () => {
    fetch('/api/enquiries')
      .then((r) => r.json())
      .then((d) => {
        if (d.enquiries) setEnquiries(d.enquiries);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const toggleRead = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !current }),
      });
      if (res.ok) fetchEnquiries();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEnquiries(enquiries.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Inbox
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Contact Enquiries ({enquiries.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Messages transmitted by visitors and researchers through the public Contact page.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading messages...</div>
      ) : enquiries.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500">
          No inquiries received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className={`p-6 rounded-2xl border transition-all ${
                !enq.isRead
                  ? 'bg-brand-ivory border-brand-blue/40 shadow-card'
                  : 'bg-brand-cream/40 border-brand-border/60 shadow-subtle opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-brand-navy text-base">
                      {enq.name}
                    </span>
                    {!enq.isRead && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue text-brand-ivory">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-brand-sky font-mono mt-0.5">
                    {enq.email}
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">
                  {formatDate(enq.createdAt)}
                </span>
              </div>

              {enq.subject && (
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
                  Subject: {enq.subject}
                </div>
              )}

              <p className="p-4 rounded-xl bg-brand-ivory border border-brand-border/40 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap mb-4">
                {enq.message}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-xs">
                <button
                  onClick={() => toggleRead(enq.id, enq.isRead)}
                  className="font-medium text-brand-blue hover:text-brand-navy"
                >
                  {enq.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>

                <button
                  onClick={() => deleteEnquiry(enq.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
