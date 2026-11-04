'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer inside administrator portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-brand-navy text-brand-ivory border-t border-brand-navy/80 mt-24">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Organization & Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-ivory flex items-center justify-center text-brand-navy font-serif font-bold text-sm">
                和
              </div>
              <span className="font-serif font-bold text-xl text-brand-ivory tracking-tight">
                Asian Cultural Diplomacy
              </span>
            </div>
            <p className="text-sm text-brand-powder/80 leading-relaxed max-w-md font-sans">
              An independent digital publication and public engagement platform dedicated to fostering mutual understanding, intercultural dialogue, and shared heritage across diverse Asian civilizations.
            </p>
            <div className="pt-2 text-xs text-brand-sky font-serif italic">
              "Connecting distant shores through the quiet power of cultural respect."
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-sky">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-brand-powder/80">
              <li>
                <Link href="/" className="hover:text-brand-ivory transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-ivory transition-colors">About the Organisation</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand-ivory transition-colors">Publications & Essays</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-brand-ivory transition-colors">Events & Symposia</Link>
              </li>
              <li>
                <Link href="/meetups" className="hover:text-brand-ivory transition-colors">Public Meetups</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-ivory transition-colors">Contact & Inquiries</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Reader Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-sky">
              Community & Dialogue
            </h4>
            <ul className="space-y-2 text-sm text-brand-powder/80">
              <li>
                <Link href="/login" className="hover:text-brand-ivory transition-colors">Reader Sign In</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-ivory transition-colors">Join Reader Dialogue</Link>
              </li>
              <li>
                <Link href="/about#philosophy" className="hover:text-brand-ivory transition-colors">Diplomacy Philosophy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-ivory transition-colors">Media & Academic Enquiries</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brand-powder/15 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-powder/60 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Asian Cultural Diplomacy. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span>Intercultural Digital Publication</span>
            <span>•</span>
            <span>Designed with Impeccable</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
