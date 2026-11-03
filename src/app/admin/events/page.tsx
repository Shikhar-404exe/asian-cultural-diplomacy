'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string | null;
  startDate: string;
  endDate?: string | null;
  venue: string;
  city: string;
  country: string;
  organizer: string;
  registrationLink?: string | null;
  status: string;
  isFeatured: boolean;
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/images/fuji-sakura.jpg');
  const [startDate, setStartDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Japan');
  const [registrationLink, setRegistrationLink] = useState('');
  const [status, setStatus] = useState('UPCOMING');
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/events', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load events');
      const d = await res.json();
      if (d.events) setEvents(d.events);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !description || !startDate || !venue || !city || !country) {
      setFormError('Please fill in all required fields (title, description, start date, venue, city, country).');
      return;
    }

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) {
      setFormError('Please enter a valid start date and time.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          startDate: parsedDate.toISOString(),
          venue,
          city,
          country,
          registrationLink: registrationLink || null,
          status,
          isFeatured,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event. Please check inputs and permissions.');
      }

      // Success
      setSuccessMessage(`Event "${title}" published successfully.`);
      setShowModal(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setVenue('');
      setCity('');
      setCountry('Japan');
      setRegistrationLink('');
      setStatus('UPCOMING');
      setIsFeatured(false);
      await fetchEvents();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setFormError(err.message || 'An unexpected error occurred while saving the event.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Permanently delete event "${eventTitle}"?`)) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
        setSuccessMessage(`Event "${eventTitle}" deleted.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesStatus =
      statusFilter === 'ALL' ? true : ev.status.toUpperCase() === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Symposia & Conferences
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Manage Events ({events.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create, update, and manage official cultural forums, academic seminars, and symposium programmes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => fetchEvents()}
            disabled={refreshing}
            className="p-2.5 rounded-full border border-brand-border bg-brand-ivory hover:bg-brand-cream text-brand-navy transition-colors disabled:opacity-50"
            title="Refresh event list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Add New Event</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center space-x-2 shadow-subtle animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center space-x-1.5 p-1 bg-brand-cream/80 rounded-xl border border-brand-border text-xs overflow-x-auto">
          {(['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                statusFilter === tab
                  ? 'bg-brand-navy text-brand-ivory shadow-xs'
                  : 'text-slate-600 hover:text-brand-navy hover:bg-brand-ivory/60'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title, venue, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-brand-ivory border border-brand-border focus:outline-brand-blue"
          />
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-brand-ivory rounded-2xl border border-dashed border-brand-border text-slate-500 text-sm">
          {events.length === 0
            ? 'No events created yet. Click "Add New Event" to publish one.'
            : 'No events match the selected filters.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-powder text-brand-navy border border-brand-border/60">
                    {ev.status}
                  </span>
                  <span className="text-xs font-medium text-brand-blue flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(ev.startDate)}</span>
                  </span>
                  {ev.isFeatured && (
                    <span className="text-[10px] font-semibold bg-brand-navy text-brand-ivory px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-navy">
                  {ev.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                  <span>{ev.venue}, {ev.city}, {ev.country}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  href={`/events/${ev.slug}`}
                  target="_blank"
                  className="inline-flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full bg-brand-cream border border-brand-border font-semibold text-brand-navy hover:bg-brand-powder transition-colors"
                  title="View Public Event Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <select
                  value={ev.status}
                  onChange={(e) => handleStatusChange(ev.id, e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-full bg-brand-cream border border-brand-border font-semibold text-brand-navy focus:outline-none"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="POSTPONED">Postponed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-ivory rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-brand-border shadow-elevated space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif text-xl font-bold text-brand-navy">
                Add New Cultural Event
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-brand-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pan-Asian Cultural Diplomacy Symposium 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Event Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the symposium, topics, and diplomatic intent..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-cream/60 border border-brand-border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-cream/60 border border-brand-border text-xs font-medium"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Kyoto International Conference Hall"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kyoto"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Japan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Registration / RSVP Link (Optional)
                </label>
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  placeholder="https://asianculturaldiplomacy.org/register/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/60 border border-brand-border text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="modalIsFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded"
                />
                <label htmlFor="modalIsFeatured" className="text-xs font-semibold text-brand-navy cursor-pointer">
                  Feature on Homepage
                </label>
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
                  {saving ? 'Saving...' : 'Save & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
