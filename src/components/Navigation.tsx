'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User as UserIcon, LogOut, BookOpen } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Blog / Publications', href: '/blog' },
  { name: 'Events', href: '/events' },
  { name: 'Meetups', href: '/meetups' },
  { name: 'Contact', href: '/contact' },
];

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'READER';
  avatarUrl?: string | null;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Do not render public navigation inside the administrator portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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

          {/* Desktop Navigation Links (Strictly Public) */}
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

          {/* Right Action: Reader Account / Authentication (Zero Admin Links) */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-20 h-8 rounded-full bg-brand-cream/50 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/account"
                  className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-brand-powder/60 text-brand-navy hover:bg-brand-powder transition-colors border border-brand-blue/20"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-navy text-brand-ivory flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-xs text-brand-blue hover:text-brand-navy font-semibold underline underline-offset-2"
                  >
                    Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-brand-navy transition-colors rounded-full hover:bg-brand-cream/60"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-700 hover:text-brand-navy px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-brand-navy text-brand-ivory hover:bg-brand-blue transition-colors shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Join Dialogue</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <Link
                href="/account"
                className="w-8 h-8 rounded-full bg-brand-navy text-brand-ivory flex items-center justify-center text-xs font-bold"
                title="My Account"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            )}
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

      {/* Mobile Drawer Menu (Strictly Public) */}
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
          
          <div className="pt-4 mt-2 border-t border-brand-border/40">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-cream/40 rounded-md"
                >
                  <UserIcon className="w-4 h-4 text-brand-blue" />
                  <span>My Account ({user.name})</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-cream/40 rounded-md"
                  >
                    <span>Go to Administrator Portal</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-medium border border-brand-border rounded-lg text-brand-navy hover:bg-brand-cream/40"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold bg-brand-navy text-brand-ivory rounded-lg hover:bg-brand-blue"
                >
                  Join Dialogue
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
