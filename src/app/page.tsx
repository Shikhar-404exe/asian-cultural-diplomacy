import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Users,
  Compass,
  Sparkles,
  Heart,
  Quote,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import EventCard from '@/components/EventCard';
import MeetupCard from '@/components/MeetupCard';

export const revalidate = 0; // Always fresh for local MVP

export default async function HomePage() {
  const [featuredArticle, latestArticles, upcomingEvents, upcomingMeetups, settings] = await Promise.all([
    prisma.article.findFirst({
      where: { isPublished: true, isFeatured: true },
      include: { category: true, _count: { select: { comments: { where: { status: 'APPROVED' } } } } },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      include: { category: true, _count: { select: { comments: { where: { status: 'APPROVED' } } } } },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.event.findMany({
      where: { status: 'UPCOMING' },
      take: 2,
      orderBy: { startDate: 'asc' },
    }),
    prisma.meetup.findMany({
      where: { status: 'UPCOMING' },
      take: 2,
      orderBy: { date: 'asc' },
    }),
    prisma.siteSettings.findUnique({
      where: { id: 1 },
    }),
  ]);

  return (
    <div className="bg-architectural-grid min-h-screen">
      
      {/* 1. HERO SECTION: Reference-Inspired Split Architecture */}
      <section className="border-b border-brand-border/70 overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* Left Hero Column: Dark Navy Agenda & Pillars */}
          <div className="lg:col-span-5 bg-brand-navy text-brand-ivory p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-r border-brand-navy/90">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-powder/15 text-brand-sky text-xs uppercase tracking-widest font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
                <span>Asian Cultural Diplomacy Initiative</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-ivory leading-[1.15] mb-6">
                Bridging Traditions, Inspiring Global Dialogue.
              </h1>

              <p className="text-brand-powder/80 text-sm sm:text-base leading-relaxed mb-8 font-sans">
                A dedicated platform uniting scholarly reflection, cultural exchange, and grassroots diplomacy across diverse Asian civilisations.
              </p>

              {/* Timeline of Strategic Pillars (Direct Neo Mirai Inspiration) */}
              <div className="space-y-4 border-t border-brand-powder/20 pt-6">
                <div className="flex items-start space-x-3.5 group">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-sky ring-4 ring-brand-sky/20 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-sky font-semibold">Pillar I</span>
                    <h4 className="text-sm font-semibold text-brand-ivory">Intercultural Philosophy & Scholarship</h4>
                    <p className="text-xs text-brand-powder/70">Rigorous essays exploring shared values and mutual history.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 group">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue ring-4 ring-brand-blue/30 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-sky font-semibold">Pillar II</span>
                    <h4 className="text-sm font-semibold text-brand-ivory">Living Heritage & Artisan Dialogues</h4>
                    <p className="text-xs text-brand-powder/70">Preserving intangible wisdom and aesthetic traditions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 group">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-powder ring-4 ring-brand-powder/30 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-sky font-semibold">Pillar III</span>
                    <h4 className="text-sm font-semibold text-brand-ivory">Public Meetups & Human Presence</h4>
                    <p className="text-xs text-brand-powder/70">Creating hospitable spaces for authentic face-to-face dialogue.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-brand-powder/15 flex flex-wrap items-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-powder hover:text-brand-navy text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <span>Explore Publications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-brand-powder/30 hover:bg-brand-powder/10 text-brand-powder text-xs font-semibold tracking-wide transition-colors"
              >
                <span>About Founder</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: Sister's Moon Bridge Artwork & Serene Visual Focus */}
          <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-full bg-brand-cream/40 flex items-center justify-center p-8 lg:p-12 overflow-hidden">
            {/* Background Image of Sister's Artwork */}
            <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden shadow-card border border-brand-border/70">
              <Image
                src="/art/founder-sister-bridge.jpg"
                alt="The Bridge of Dialogue — Original watercolor artwork by the founder's sister"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent" />
              
              {/* Artwork Annotation Pill */}
              <div className="absolute top-4 right-4 bg-brand-ivory/95 backdrop-blur-sm border border-brand-border/80 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-brand-navy shadow-sm">
                Original Artwork: <span className="text-brand-blue font-serif italic">The Bridge of Dialogue</span>
              </div>

              {/* Serene Floating Statement */}
              <div className="absolute bottom-6 left-6 right-6 text-brand-ivory">
                <div className="font-serif italic text-base sm:text-lg mb-1 text-brand-powder/95">
                  "Like an arched bridge rising over reflective waters, diplomacy unites shores without erasing their unique beauty."
                </div>
                <div className="text-xs text-brand-sky uppercase tracking-widest font-sans font-semibold">
                  Founder's Sister's Watercolor Reference
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ORGANISATION INTRODUCTION */}
      <section className="py-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-blue">
            Our Cultural Commitment
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy leading-tight">
            Cultivating Empathy Across Continents and Traditions
          </h2>
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-sans">
            {settings?.aboutMission ||
              'Asian Cultural Diplomacy is an independent publication and dialogue initiative exploring how ancient heritage, philosophy, architectural wisdom, and contemporary arts provide foundational answers to international understanding.'}
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <span>Read the Full Mission & Founder Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PUBLICATION */}
      {featuredArticle && (
        <section className="pb-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              <h2 className="font-serif text-2xl font-bold text-brand-navy">
                Featured Editorial Perspective
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-brand-blue hover:text-brand-navy flex items-center space-x-1"
            >
              <span>View All Publications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ArticleCard article={featuredArticle} featured={true} />
        </section>
      )}

      {/* 4. LATEST PUBLICATIONS GRID */}
      <section className="py-20 bg-brand-cream/40 border-y border-brand-border/60">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-blue">
                Perspectives Journal
              </span>
              <h2 className="font-serif text-3xl font-bold text-brand-navy mt-1">
                Latest Publications & Field Essays
              </h2>
            </div>
            <Link
              href="/blog"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-brand-ivory border border-dashed border-brand-border text-slate-600 font-sans max-w-2xl mx-auto">
              <BookOpen className="w-8 h-8 text-brand-sky mx-auto mb-3 opacity-70" />
              <h3 className="font-serif text-lg font-bold text-brand-navy mb-1">
                Editorial Essays Forthcoming
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                The founder is currently drafting inaugural publications on intercultural statecraft and heritage preservation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. EXPLORE CULTURAL PERSPECTIVES: ARTWORK INTEGRATION */}
      <section className="py-24 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-blue">
            Artistic Heritage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mt-1">
            Visual Harmony & The Founder's Sister's Art
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Cultural diplomacy begins with shared aesthetic contemplation. These original artworks embody the foundational visual language of our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Card 1: The Moon Bridge */}
          <div className="bg-brand-ivory border border-brand-border/80 rounded-2xl overflow-hidden shadow-card p-6 flex flex-col justify-between">
            <div className="relative h-72 w-full rounded-xl overflow-hidden mb-6">
              <Image
                src="/art/founder-sister-bridge.jpg"
                alt="Watercolor Bridge and Glowing Lanterns"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1">
                Symbolic Motif • Intercultural Connection
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand-navy mb-2">
                The Arched Moon Bridge
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                Traditional watercolor portraying the passage between two shores. The glowing lanterns reflect upon tranquil waters, mirroring the diplomatic hospitality that lights the path toward mutual understanding.
              </p>
              <Link
                href="/about#philosophy"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy"
              >
                <span>Read Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: The Courtyard & Peonies */}
          <div className="bg-brand-ivory border border-brand-border/80 rounded-2xl overflow-hidden shadow-card p-6 flex flex-col justify-between">
            <div className="relative h-72 w-full rounded-xl overflow-hidden mb-6">
              <Image
                src="/art/founder-sister-courtyard.jpg"
                alt="Classical Courtyard and Blooming Peonies"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-1">
                Classical Motif • Heritage Sanctuary
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand-navy mb-2">
                The Courtyard of Contemplation
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                Traditional gongbi painting featuring jade-tiled pavilions, resilient bamboo groves, and flourishing peonies. It reminds us that sustainable diplomacy requires sanctuaries of quiet reflection.
              </p>
              <Link
                href="/about#philosophy"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy"
              >
                <span>Read Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      <section className="py-20 bg-brand-powder/25 border-y border-brand-border/60">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-brand-blue">
                Academic & Cultural Gatherings
              </span>
              <h2 className="font-serif text-3xl font-bold text-brand-navy mt-1">
                Upcoming Symposia & Events
              </h2>
            </div>
            <Link
              href="/events"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-brand-ivory border border-dashed border-brand-border text-slate-600 font-sans max-w-2xl mx-auto">
              <Calendar className="w-8 h-8 text-brand-sky mx-auto mb-3 opacity-70" />
              <h3 className="font-serif text-lg font-bold text-brand-navy mb-1">
                Forthcoming Symposia
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                New international cultural forums and academic conferences will be announced here soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. UPCOMING MEETUPS: FOUNDER PUBLIC APPEARANCES */}
      <section className="py-24 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Direct Engagement</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-brand-navy">
              Founder Meetups & Public Appearances
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Meet the founder in person during her university visits, academic salons, and cultural forums. Only official public appearances are listed.
            </p>
          </div>
          <Link
            href="/meetups"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
          >
            <span>All Meetups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingMeetups.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-brand-cream/50 border border-dashed border-brand-border text-slate-600 font-sans max-w-2xl mx-auto">
            <Users className="w-8 h-8 text-brand-sky mx-auto mb-3 opacity-70" />
            <h3 className="font-serif text-lg font-bold text-brand-navy mb-1">
              Public Appearances in Scheduling
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              The founder will post confirmed university visits, cultural festivals, and public salon dates as itineraries are finalized.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingMeetups.map((m) => (
              <MeetupCard key={m.id} meetup={m} />
            ))}
          </div>
        )}
      </section>

      {/* 8. MANIFESTO CALLOUT BANNER (Neo Mirai Reference Feature) */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pb-20">
        <div className="rounded-3xl bg-brand-navy text-brand-ivory overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-elevated">
          
          <div className="lg:col-span-7 p-8 sm:p-14 lg:p-16 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-sky font-semibold block mb-4">
                Our Manifesto
              </span>
              <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-brand-ivory mb-6">
                "We believe peace among nations is not sustained by political treaties alone, but by the patient cultivation of cultural reverence."
              </blockquote>
              <p className="text-brand-powder/80 text-sm sm:text-base leading-relaxed">
                When we learn to see the sacred in each other's poetry, architecture, and daily rituals, diplomacy transforms from calculated interest into enduring kinship.
              </p>
            </div>

            <div className="pt-8 mt-6 border-t border-brand-powder/15">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-ivory text-brand-navy hover:bg-brand-powder text-xs font-semibold tracking-wide transition-colors"
              >
                <span>Read Full Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
            <Image
              src="/images/fuji-sakura.jpg"
              alt="Mount Fuji with Cherry Blossoms"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-brand-navy/30" />
            <div className="absolute bottom-4 right-4 bg-brand-navy/80 backdrop-blur-sm text-brand-ivory text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
              Mount Fuji • Transnational Serenity
            </div>
          </div>

        </div>
      </section>

      {/* 9. CONTACT INVITATION */}
      <section className="py-20 bg-brand-cream/60 border-t border-brand-border/70 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-blue">
            Initiate a Conversation
          </span>
          <h2 className="font-serif text-3xl font-bold text-brand-navy mt-1 mb-4">
            Join the Diplomatic Dialogue
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            Are you a scholar, cultural institution, or student passionate about intercultural understanding in Asia? We welcome collaborative inquiries, speaking invitations, and research exchanges.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-card"
          >
            <span>Send an Inquiry to the Founder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

