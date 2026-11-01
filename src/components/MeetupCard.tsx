import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MeetupCardProps {
  meetup: {
    id: string;
    slug: string;
    title: string;
    description: string;
    date: Date | string;
    timeWindow: string;
    venue: string;
    city: string;
    participationInstructions: string;
    rsvpLink?: string | null;
    status: string;
  };
}

export default function MeetupCard({ meetup }: MeetupCardProps) {
  const isUpcoming = meetup.status === 'UPCOMING';

  return (
    <div className={`p-6 sm:p-8 rounded-xl border transition-all duration-300 ${
      isUpcoming
        ? 'bg-brand-cream/80 border-brand-border/80 shadow-subtle hover:shadow-card'
        : 'bg-brand-cream/40 border-brand-border/40 opacity-80'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isUpcoming
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}>
              {meetup.status}
            </span>
            <span className="text-xs font-semibold text-brand-blue flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Founder Appearance</span>
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-navy leading-snug">
            {meetup.title}
          </h3>
        </div>

        {/* Date Box */}
        <div className="shrink-0 bg-brand-powder/60 border border-brand-blue/20 rounded-lg p-3 text-center sm:min-w-[110px]">
          <div className="text-[11px] font-semibold text-brand-blue uppercase tracking-wider">
            {new Date(meetup.date).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-2xl font-serif font-bold text-brand-navy">
            {new Date(meetup.date).getDate()}
          </div>
          <div className="text-[11px] text-slate-500">
            {new Date(meetup.date).getFullYear()}
          </div>
        </div>
      </div>

      <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-sans">
        {meetup.description}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4 my-2 border-y border-brand-border/40 text-xs sm:text-sm">
        <div className="flex items-start space-x-2 text-slate-700">
          <Clock className="w-4 h-4 text-brand-sky shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-navy">Time Window: </span>
            <span>{meetup.timeWindow}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2 text-slate-700">
          <MapPin className="w-4 h-4 text-brand-sky shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-navy">Location: </span>
            <span>{meetup.venue}, {meetup.city}</span>
          </div>
        </div>
      </div>

      {/* Instructions & RSVP */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-600 bg-brand-ivory/80 px-3.5 py-2.5 rounded-lg border border-brand-border/40 flex-1">
          <span className="font-semibold text-brand-navy">How to participate: </span>
          <span>{meetup.participationInstructions}</span>
        </div>

        {meetup.rsvpLink && isUpcoming && (
          <a
            href={meetup.rsvpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-full bg-brand-blue text-brand-ivory text-xs font-semibold hover:bg-brand-navy transition-colors shrink-0 shadow-sm"
          >
            <span>RSVP / Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
