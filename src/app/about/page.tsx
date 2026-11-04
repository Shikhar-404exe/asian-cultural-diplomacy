import React from 'react';
import Image from 'next/image';
import Link from 'next/image';
import NextLink from 'next/link';
import { prisma } from '@/lib/prisma';
import { Target, Compass, Award, Shield, Mail, ArrowRight, BookOpen } from 'lucide-react';

export const revalidate = 0;

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });

  const objectives: string[] = settings?.aboutObjectives
    ? JSON.parse(settings.aboutObjectives)
    : [];

  const areasOfEngagement: string[] = settings?.aboutAreasOfEngagement
    ? JSON.parse(settings.aboutAreasOfEngagement)
    : [];

  return (
    <div className="bg-architectural-grid py-16 sm:py-24">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 space-y-20">
        
        {/* Header Hero */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue block mb-3">
            About Asian Cultural Diplomacy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-navy leading-tight mb-6">
            Bridging Ancient Traditions with Contemporary Statecraft
          </h1>
          <p className="text-slate-700 text-lg sm:text-xl leading-relaxed font-sans">
            {settings?.siteTagline ||
              'Fostering deeper mutual understanding, cross-border dialogue, and shared heritage across diverse Asian civilizations.'}
          </p>
        </div>

        {/* Mission & Vision Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-cream/80 border border-brand-border/80 rounded-2xl p-8 sm:p-10 shadow-subtle">
            <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-ivory flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-navy mb-4">
              Our Mission
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {settings?.aboutMission ||
                'To illuminate the profound cultural tapestries of Asia, promoting genuine cross-border empathy, scholarly dialogue, and grassroots cultural diplomacy across generations and geographies.'}
            </p>
          </div>

          <div className="bg-brand-cream/80 border border-brand-border/80 rounded-2xl p-8 sm:p-10 shadow-subtle">
            <div className="w-12 h-12 rounded-xl bg-brand-blue text-brand-ivory flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-navy mb-4">
              Our Vision
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {settings?.aboutVision ||
                'A world where regional diversity is celebrated as shared human heritage, and diplomatic relationships are anchored in mutual cultural respect rather than mere transactional interest.'}
            </p>
          </div>
        </div>

        {/* Founder Profile Section */}
        <section className="bg-brand-navy text-brand-ivory rounded-3xl overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-full">
            <Image
              src="/art/founder-sister-courtyard.jpg"
              alt="Courtyard of contemplation representing founder's scholarly space"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-brand-navy/40" />
            <div className="absolute bottom-4 left-4 right-4 bg-brand-navy/90 backdrop-blur-sm p-4 rounded-xl border border-brand-powder/20">
              <div className="text-xs uppercase tracking-widest text-brand-sky font-semibold">
                Founder & Director
              </div>
              <div className="font-serif text-lg font-bold text-brand-ivory">
                Solo Publisher & Cultural Fellow
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 text-brand-sky text-xs uppercase tracking-widest font-semibold">
                <Shield className="w-4 h-4" />
                <span>Leadership & Voice</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ivory">
                About the Founder
              </h2>

              <p className="text-brand-powder/90 text-sm sm:text-base leading-relaxed font-sans">
                {settings?.aboutFounderBio ||
                  'An international scholar and practitioner dedicated to fostering deeper mutual understanding across Asian civilizations. Her work bridges academic research, public diplomacy, and community engagement, emphasizing the quiet power of cultural exchange as a cornerstone of enduring peace.'}
              </p>

              <p className="text-brand-powder/80 text-sm sm:text-base leading-relaxed font-sans">
                Through this digital platform, she personally publishes original essays, organizes international symposia, and announces in-person meetups across Asian universities and cultural institutions.
              </p>
            </div>

            <div className="pt-8 mt-6 border-t border-brand-powder/15 flex items-center space-x-4">
              <NextLink
                href="/meetups"
                className="inline-flex items-center space-x-2 text-xs font-semibold px-5 py-2.5 rounded-full bg-brand-ivory text-brand-navy hover:bg-brand-powder transition-colors"
              >
                <span>Upcoming Meetups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
              <NextLink
                href="/contact"
                className="inline-flex items-center space-x-2 text-xs font-semibold px-5 py-2.5 rounded-full border border-brand-powder/30 text-brand-powder hover:bg-brand-powder/10 transition-colors"
              >
                <span>Send Direct Inquiry</span>
              </NextLink>
            </div>
          </div>
        </section>

        {/* Philosophy & Objectives */}
        <section id="philosophy" className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Foundational Ethos
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-navy">
              Cultural Diplomacy Philosophy
            </h2>
            <div className="bg-brand-powder/30 border-l-4 border-brand-blue p-6 rounded-r-xl">
              <p className="font-serif italic text-lg sm:text-xl text-brand-navy leading-relaxed">
                "{settings?.aboutPhilosophy ||
                  'Cultural diplomacy is not an instrument of dominance, but an invitation to shared reflection. Like a traditional arched bridge over reflective waters, it exists to connect two distinct shores without altering the beauty of either.'}"
              </p>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans">
              Unlike traditional political negotiations that often focus strictly on immediate leverage, cultural diplomacy cultivates long-term emotional empathy. It recognizes that Asia is not a monolith, but a constellation of vibrant, interconnected cultures—each with distinct traditions of wisdom, statecraft, and artistic expression.
            </p>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Core Strategic Goals
            </span>
            <h3 className="font-serif text-2xl font-bold text-brand-navy">
              Key Objectives
            </h3>
            <ul className="space-y-3.5">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm text-slate-700 bg-brand-cream/60 p-3.5 rounded-xl border border-brand-border/60">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-brand-ivory text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* Areas of Engagement */}
        <section className="bg-brand-cream/50 border border-brand-border/70 rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue">
              Focus Areas
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
              Areas of Diplomatic & Scholarly Engagement
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {areasOfEngagement.map((area, i) => (
              <div key={i} className="bg-brand-ivory p-6 rounded-xl border border-brand-border/70 shadow-subtle">
                <div className="text-brand-blue font-serif font-bold text-2xl mb-2">
                  0{i + 1}
                </div>
                <h4 className="font-serif font-bold text-brand-navy text-base leading-snug">
                  {area}
                </h4>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

