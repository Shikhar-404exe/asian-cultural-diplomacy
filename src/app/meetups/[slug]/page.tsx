import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Users,
  Shield,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const revalidate = 0;

export default async function SingleMeetupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const meetup = await prisma.meetup.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });

  if (!meetup) {
    notFound();
  }

  const isUpcoming = meetup.status === 'UPCOMING';

  const statusColors: Record<string, string> = {
    UPCOMING: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    COMPLETED: 'bg-slate-200 text-slate-700 border-slate-300',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="bg-architectural-grid min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/meetups"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Public Appearances</span>
          </Link>
        </div>

        {/* Header Block */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                statusColors[meetup.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {meetup.status}
            </span>
            <span className="text-xs text-brand-sky font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Founder Public Engagement</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight">
            {meetup.title}
          </h1>

          {/* Quick Date and Location Ribbon */}
          <div className="bg-brand-cream/80 border border-brand-border/70 rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm shadow-subtle">
            <div className="flex items-center space-x-3 text-slate-700">
              <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <span className="block font-semibold text-brand-navy">Date</span>
                <span className="text-slate-600">{formatDate(meetup.date)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700">
              <Clock className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <span className="block font-semibold text-brand-navy">Time Window</span>
                <span className="text-slate-600">{meetup.timeWindow}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <span className="block font-semibold text-brand-navy">Location</span>
                <span className="text-slate-600">{meetup.venue}, {meetup.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-brand-ivory rounded-3xl p-6 sm:p-10 border border-brand-border/80 shadow-card space-y-8">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-navy mb-4 pb-2 border-b border-brand-border/60">
              About This Appearance & Discussion
            </h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
              {meetup.description}
            </div>
          </div>

          {/* How to Participate Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-brand-cream/70 border border-brand-border space-y-3">
            <div className="flex items-center space-x-2 text-brand-navy font-semibold text-sm">
              <Info className="w-4 h-4 text-brand-blue" />
              <span>How to Participate</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {meetup.participationInstructions}
            </p>
            {meetup.rsvpLink && isUpcoming && (
              <div className="pt-2">
                <a
                  href={meetup.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  <span>RSVP / Register Attendance</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Decorum & Privacy Principle Notice */}
          <div className="p-5 rounded-2xl bg-brand-powder/50 border border-brand-blue/30 flex items-start space-x-3 text-xs text-slate-700 leading-relaxed">
            <Shield className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-navy">Civic Decorum Note: </span>
              This appearance is conducted in an open, academic, and respectful forum. Attendees are welcome to discuss research, regional cultural exchanges, and collaborative initiatives.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
