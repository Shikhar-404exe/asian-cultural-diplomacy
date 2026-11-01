import React from 'react';
import { prisma } from '@/lib/prisma';
import MeetupCard from '@/components/MeetupCard';
import { Users, Shield, Compass, CalendarCheck } from 'lucide-react';

export const revalidate = 0;

export default async function MeetupsPage() {
  const [upcomingMeetups, pastMeetups] = await Promise.all([
    prisma.meetup.findMany({
      where: { status: 'UPCOMING' },
      orderBy: { date: 'asc' },
    }),
    prisma.meetup.findMany({
      where: { status: { in: ['COMPLETED', 'CANCELLED'] } },
      orderBy: { date: 'desc' },
    }),
  ]);

  return (
    <div className="bg-architectural-grid min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Public Appearances & Gatherings</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-navy leading-tight mb-4">
            Founder Meetups & Academic Engagements
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-sans">
            A calendar of scheduled public appearances where students, scholars, cultural practitioners, and readers can meet the founder in person.
          </p>
        </div>

        {/* Founder Privacy & Decorum Notice */}
        <div className="bg-brand-powder/50 border border-brand-blue/30 rounded-2xl p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 shadow-subtle">
          <div className="p-3 bg-brand-navy text-brand-ivory rounded-xl shrink-0">
            <Shield className="w-5 h-5 text-brand-sky" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-brand-navy">Civic Transparency & Privacy Principle: </span>
            This page publishes only confirmed, public academic appearances and open cultural gatherings. Private schedules and live locations are never broadcasted. You may RSVP or arrive in accordance with each venue's instructions.
          </div>
        </div>

        {/* Section 1: Upcoming Meetups */}
        <section className="mb-16">
          <div className="flex items-center space-x-2.5 mb-6">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif text-2xl font-bold text-brand-navy">
              Confirmed Upcoming Appearances ({upcomingMeetups.length})
            </h2>
          </div>

          {upcomingMeetups.length === 0 ? (
            <div className="p-10 text-center bg-brand-cream/40 rounded-2xl border border-dashed border-brand-border text-slate-500 text-sm">
              No new public appearances are currently scheduled. Please check back soon or follow our publications.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingMeetups.map((m) => (
                <MeetupCard key={m.id} meetup={m} />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Past Appearances Archive */}
        {pastMeetups.length > 0 && (
          <section className="pt-8 border-t border-brand-border/60">
            <h3 className="font-serif text-2xl font-bold text-brand-navy mb-6">
              Past Appearances Archive
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pastMeetups.map((m) => (
                <MeetupCard key={m.id} meetup={m} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
