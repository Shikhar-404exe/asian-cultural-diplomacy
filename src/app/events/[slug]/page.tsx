import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ArrowLeft,
  Users,
  CheckCircle,
  Building,
} from 'lucide-react';

export const revalidate = 0;

export default async function SingleEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });

  if (!event) {
    notFound();
  }

  let speakersList: Array<{ name: string; title: string }> = [];
  try {
    if (event.speakers) {
      speakersList = JSON.parse(event.speakers);
    }
  } catch (e) {
    speakersList = [];
  }

  let agendaList: Array<{ time: string; topic: string }> = [];
  try {
    if (event.agenda) {
      agendaList = JSON.parse(event.agenda);
    }
  } catch (e) {
    agendaList = [];
  }

  const cover = event.coverImage || '/images/fuji-sakura.jpg';

  const statusColors: Record<string, string> = {
    UPCOMING: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ONGOING: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-slate-200 text-slate-700 border-slate-300',
    POSTPONED: 'bg-amber-100 text-amber-800 border-amber-300',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="bg-architectural-grid min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Event Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColors[event.status] || 'bg-slate-100 text-slate-700'}`}>
              {event.status}
            </span>
            <span className="text-xs text-brand-sky font-semibold uppercase tracking-wider">
              {event.organizer}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight">
            {event.title}
          </h1>

          {/* Quick Date and Location Ribbon */}
          <div className="bg-brand-cream/80 border border-brand-border/70 rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm shadow-subtle">
            <div className="flex items-center space-x-3 text-slate-700">
              <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <span className="font-semibold text-brand-navy">Date: </span>
                <span>{formatDate(event.startDate)}</span>
                {event.endDate && <span> – {formatDate(event.endDate)}</span>}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
              <div>
                <span className="font-semibold text-brand-navy">Venue: </span>
                <span>{event.venue}, {event.city}, {event.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Cover Image */}
        <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-card border border-brand-border/70 mb-12">
          <Image
            src={cover}
            alt={event.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* Description */}
        <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/60 shadow-subtle mb-10">
          <h2 className="font-serif text-2xl font-bold text-brand-navy mb-4">
            About the Event
          </h2>
          <p className="text-slate-700 leading-relaxed text-base sm:text-lg font-sans whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Speakers Section */}
        {speakersList.length > 0 && (
          <div className="bg-brand-cream/60 p-6 sm:p-8 rounded-2xl border border-brand-border/70 mb-10">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-5 h-5 text-brand-blue" />
              <h3 className="font-serif text-2xl font-bold text-brand-navy">
                Distinguished Speakers & Fellows
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {speakersList.map((spk, i) => (
                <div key={i} className="bg-brand-ivory p-4 rounded-xl border border-brand-border/60 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-brand-powder text-brand-navy font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    {spk.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-brand-navy text-sm sm:text-base">
                      {spk.name}
                    </h4>
                    <p className="text-xs text-brand-sky font-medium">
                      {spk.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda Section */}
        {agendaList.length > 0 && (
          <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/60 shadow-subtle mb-10">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="w-5 h-5 text-brand-blue" />
              <h3 className="font-serif text-2xl font-bold text-brand-navy">
                Programme & Agenda
              </h3>
            </div>
            <div className="space-y-4">
              {agendaList.map((item, i) => (
                <div key={i} className="flex items-start space-x-4 p-3.5 rounded-xl hover:bg-brand-powder/20 transition-colors border-l-2 border-brand-blue">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue font-mono shrink-0 min-w-[100px]">
                    {item.time}
                  </span>
                  <span className="text-sm text-slate-800 font-medium">
                    {item.topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration CTA Banner */}
        {event.registrationLink && event.status === 'UPCOMING' && (
          <div className="bg-brand-navy text-brand-ivory p-8 rounded-2xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-brand-ivory mb-1">
                Participate in this Event
              </h3>
              <p className="text-xs sm:text-sm text-brand-powder/80">
                Registration is open for delegates, students, and cultural practitioners.
              </p>
            </div>
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-ivory text-brand-navy hover:bg-brand-powder text-xs font-semibold tracking-wide transition-colors shrink-0 shadow-sm"
            >
              <span>Register Attendance</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
