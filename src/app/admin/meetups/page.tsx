'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MeetupItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  timeWindow: string;
  venue: string;
  city: string;
  participationInstructions: string;
  rsvpLink?: string | null;
  status: string;
}

export default function ManageMeetupsPage() {
  const [meetups, setMeetups] = useState<MeetupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('14:30 - 16:30 JST');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [participationInstructions, setParticipationInstructions] = useState('Open to students and cultural researchers. Please arrive 10 minutes early.');
  const [rsvpLink, setRsvpLink] = useState('');
  const [status, setStatus] = useState('UPCOMING');
  const [saving, setSaving] = useState(false);

  const fetchMeetups = () => {
    fetch('/api/meetups')
      .then((r) => r.json())
      .then((d) => {
        if (d.meetups) setMeetups(d.meetups);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetups();
  }, []);

  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !timeWindow || !venue || !city || !participationInstructions) {
      alert('Please fill in required fields.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date: new Date(date).toISOString(),
          timeWindow,
          venue,
          city,
          participationInstructions,
          rsvpLink: rsvpLink || null,
          status,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        setDate('');
        setVenue('');
        setCity('');
        setRsvpLink('');
        fetchMeetups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/meetups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchMeetups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove meetup announcement "${title}"?`)) return;
    try {
      const res = await fetch(`/api/meetups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMeetups(meetups.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Public Appearances
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Manage Public Meetups ({meetups.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish confirmed campus visits, public salons, and coffee meetups where readers can meet you in person.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>Announce New Meetup</span>
        </button>
      </div>

      {/* Privacy Guidance */}
      <div className="bg-brand-powder/40 border border-brand-blue/20 rounded-xl p-4 flex items-center space-x-3 text-xs text-slate-700">
        <Shield className="w-4 h-4 text-brand-blue shrink-0" />
        <span>
          <strong>Privacy reminder:</strong> Only announce appearances you explicitly choose to make public. You can update or remove any meetup at any time.
        </span>
      </div>

      {/* Meetups List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading meetups...</div>
      ) : meetups.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500">
          No public meetups announced yet. Click above to schedule one.
        </div>
      ) : (
        <div className="space-y-4">
          {meetups.map((m) => (
            <div
              key={m.id}
              className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    m.status === 'UPCOMING'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {m.status}
                  </span>
                  <span className="text-xs font-medium text-brand-blue flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(m.date)} ({m.timeWindow})</span>
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-navy">
                  {m.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                  <span>{m.venue}, {m.city}</span>
                </div>
              </div>

              {/* Status Selector & Delete */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={m.status}
                  onChange={(e) => handleStatusChange(m.id, e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-full bg-brand-cream border border-brand-border font-semibold text-brand-navy focus:outline-none"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                  onClick={() => handleDelete(m.id, m.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove Meetup"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-ivory rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-brand-border shadow-elevated space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif text-xl font-bold text-brand-navy">
                Announce Founder Meetup
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-brand-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetup} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Meetup Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. University Visit & Open Dialogue: Asian Cultural Exchange"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the gathering, agenda, and discussion focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-cream/60 border border-brand-border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Attendance Window *
                  </label>
                  <input
                    type="text"
                    required
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    placeholder="e.g. 14:30 - 16:30 JST"
                    className="w-full px-3 py-2 rounded-xl bg-brand-cream/60 border border-brand-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Faculty Common Room, Building B"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  How to Participate / Instructions *
                </label>
                <input
                  type="text"
                  required
                  value={participationInstructions}
                  onChange={(e) => setParticipationInstructions(e.target.value)}
                  placeholder="e.g. Open to students and faculty. Please arrive 10 min early."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  RSVP Link (Optional)
                </label>
                <input
                  type="url"
                  value={rsvpLink}
                  onChange={(e) => setRsvpLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-brand-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-full text-xs font-semibold bg-brand-blue hover:bg-brand-navy text-brand-ivory transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Announce Meetup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

