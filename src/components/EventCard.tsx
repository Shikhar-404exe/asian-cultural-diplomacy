import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    venue: string;
    city: string;
    country: string;
    status: string;
    organizer: string;
    isFeatured?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const cover = event.coverImage || '/images/fuji-sakura.jpg';

  const statusColors: Record<string, string> = {
    UPCOMING: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ONGOING: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-slate-200 text-slate-700 border-slate-300',
    POSTPONED: 'bg-amber-100 text-amber-800 border-amber-300',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="group bg-brand-cream/70 border border-brand-border/70 rounded-xl overflow-hidden shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col h-full">
      <div className="relative h-44 w-full overflow-hidden bg-brand-powder/40">
        <Image
          src={cover}
          alt={event.title}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColors[event.status] || 'bg-slate-100 text-slate-700'}`}>
            {event.status}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center space-x-2 text-xs text-brand-blue font-medium mb-2.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(event.startDate)}</span>
            {event.endDate && <span>– {formatDate(event.endDate)}</span>}
          </div>

          <Link href={`/events/${event.slug}`}>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-navy group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug mb-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>

          <div className="flex items-start space-x-2 text-xs text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.venue}, {event.city}, {event.country}</span>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-brand-border/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            By {event.organizer}
          </span>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-blue group-hover:text-brand-navy"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

