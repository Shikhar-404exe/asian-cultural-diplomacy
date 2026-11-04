import React from 'react';
import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';
import Link from 'next/link';
import { Calendar, Compass } from 'lucide-react';

export const revalidate = 0;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const where: any = {};
  if (filter === 'past') {
    where.status = 'COMPLETED';
  } else if (filter === 'all') {
    // All events
  } else {
    // Default to upcoming / ongoing
    where.status = { in: ['UPCOMING', 'ONGOING'] };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: [
      { isFeatured: 'desc' },
      { startDate: filter === 'past' ? 'desc' : 'asc' },
    ],
  });

  return (
    <div className="bg-architectural-grid min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue block mb-2">
            Symposia, Conferences & Salons
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-navy leading-tight mb-4">
            Asian Cultural Diplomacy Events
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-sans">
            International roundtables, academic seminars, and cultural programmes curated to bridge civilisations and explore shared heritage.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center space-x-3 mb-10 pb-4 border-b border-brand-border/60">
          <Link
            href="/events"
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
              !filter || filter === 'upcoming'
                ? 'bg-brand-navy text-brand-ivory shadow-sm'
                : 'bg-brand-cream/60 text-slate-600 hover:bg-brand-powder/50 border border-brand-border/60'
            }`}
          >
            Upcoming Engagements
          </Link>
          <Link
            href="/events?filter=past"
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
              filter === 'past'
                ? 'bg-brand-navy text-brand-ivory shadow-sm'
                : 'bg-brand-cream/60 text-slate-600 hover:bg-brand-powder/50 border border-brand-border/60'
            }`}
          >
            Past Symposia Archive
          </Link>
          <Link
            href="/events?filter=all"
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
              filter === 'all'
                ? 'bg-brand-navy text-brand-ivory shadow-sm'
                : 'bg-brand-cream/60 text-slate-600 hover:bg-brand-powder/50 border border-brand-border/60'
            }`}
          >
            All Events
          </Link>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-20 bg-brand-cream/40 rounded-2xl border border-dashed border-brand-border text-slate-500 font-sans">
            <Calendar className="w-10 h-10 text-brand-sky mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-xl font-bold text-brand-navy mb-1">
              {filter === 'past' ? 'No archived events found.' : 'No upcoming events at the moment.'}
            </h3>
            <p className="text-xs sm:text-sm">
              {filter === 'past'
                ? 'Past international symposia and academic proceedings will be archived here.'
                : 'Please check back shortly as new international engagements and symposium programmes are announced.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

