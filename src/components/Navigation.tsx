'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Feather, ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Blog / Publications', href: '/blog' },
  { name: 'Events', href: '/events' },
  { name: 'Meetups', href: '/meetups' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render public header inside administrator portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-ivory/95 backdrop-blur-md border-b border-brand-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Emblem */}
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-brand-ivory border-2 border-brand-cream shadow-sm group-hover:bg-brand-blue transition-colors">
              <span className="font-serif font-bold text-base tracking-tighter">和</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl text-brand-navy tracking-tight leading-tight group-hover:text-brand-blue transition-colors">
                Asian Cultural Diplomacy
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-brand-sky">
                Dialogue • Heritage • Perspectives
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-xs lg:text-sm font-medium tracking-wide transition-colors py-2 ${
                    active ? 'text-brand-navy font-semibold' : 'text-slate-600 hover:text-brand-blue'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-blue" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Admin Portal / Founder Access */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border border-brand-blue/30 text-brand-blue hover:bg-brand-powder/50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Founder Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/admin"
              className="p-2 text-brand-blue hover:bg-brand-powder/50 rounded-lg transition-colors"
              title="Founder Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-navy hover:bg-brand-cream/60 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-brand-navy" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border/60 bg-brand-ivory px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  active
                    ? 'bg-brand-powder/60 text-brand-navy font-semibold'
                    : 'text-slate-700 hover:bg-brand-cream/40'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-brand-border/40">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-brand-blue font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Publisher / Admin Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
