'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PenTool,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  Tags,
  Image as ImageIcon,
  UserCheck,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Write a Blog', href: '/admin/blogs/new', icon: PenTool, highlight: true },
  { name: 'Manage Blogs', href: '/admin/blogs', icon: BookOpen },
  { name: 'Manage Comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'Manage Events', href: '/admin/events', icon: Calendar },
  { name: 'Manage Meetups', href: '/admin/meetups', icon: Users },
  { name: 'Manage Categories', href: '/admin/categories', icon: Tags },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'About Page', href: '/admin/about', icon: UserCheck },
  { name: 'Contact Enquiries', href: '/admin/enquiries', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-brand-navy text-brand-ivory px-4 py-3.5 flex items-center justify-between border-b border-brand-navy/80 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-ivory text-brand-navy font-serif font-bold text-xs flex items-center justify-center">
            和
          </div>
          <span className="font-serif font-bold text-sm">Founder Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg hover:bg-brand-blue transition-colors"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-navy text-brand-ivory flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-brand-powder/15">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-full bg-brand-ivory text-brand-navy flex items-center justify-center font-serif font-bold text-base shadow-sm">
                和
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-brand-ivory leading-tight">
                  Asian Cultural Diplomacy
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-sky font-semibold">
                  Founder Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {ADMIN_NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-blue text-brand-ivory shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-brand-powder/20 text-brand-ivory hover:bg-brand-powder/30 border border-brand-powder/30'
                      : 'text-brand-powder/80 hover:bg-brand-powder/10 hover:text-brand-ivory'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-ivory' : item.highlight ? 'text-emerald-300' : 'text-brand-sky'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Live Site & Logout */}
        <div className="p-4 border-t border-brand-powder/15 space-y-1.5 bg-brand-navy/90">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-brand-powder/80 hover:text-brand-ivory rounded-lg hover:bg-brand-powder/10 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-sky" />
              <span>View Public Site</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

