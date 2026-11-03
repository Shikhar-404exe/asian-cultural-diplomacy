import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  PenTool,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [
    totalArticles,
    draftArticles,
    pendingComments,
    upcomingEvents,
    upcomingMeetups,
    unreadEnquiries,
    recentArticles,
    pendingCommentsList,
  ] = await Promise.all([
    prisma.article.count({ where: { isPublished: true } }),
    prisma.article.count({ where: { isPublished: false } }),
    prisma.comment.count({ where: { status: 'PENDING' } }),
    prisma.event.count({ where: { status: 'UPCOMING' } }),
    prisma.meetup.count({ where: { status: 'UPCOMING' } }),
    prisma.contactEnquiry.count({ where: { isRead: false } }),
    prisma.article.findMany({
      take: 4,
      orderBy: { updatedAt: 'desc' },
      include: { category: true },
    }),
    prisma.comment.findMany({
      where: { status: 'PENDING' },
      take: 3,
      include: { article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      
      {/* Welcome & Top Ribbon */}
      <div className="bg-brand-cream/80 border border-brand-border/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Welcome back, Founder
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Publishing & Dialogue Dashboard
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Everything you need to publish articles, manage appearances, and moderate community conversations.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-all shadow-sm shrink-0"
        >
          <PenTool className="w-4 h-4 text-emerald-300" />
          <span>Write a Blog</span>
        </Link>
      </div>

      {/* Critical Alert: Pending Comments */}
      {pendingComments > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-amber-900 text-sm sm:text-base">
                {pendingComments} Comment{pendingComments > 1 ? 's' : ''} Awaiting Your Review
              </h4>
              <p className="text-xs text-amber-700">
                Readers have contributed reflections. Review and approve them to make them visible publicly.
              </p>
            </div>
          </div>
          <Link
            href="/admin/comments"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0"
          >
            <span>Review Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Link href="/admin/blogs" className="bg-brand-ivory p-5 rounded-2xl border border-brand-border/70 shadow-subtle hover:border-brand-blue transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Published Blogs</span>
            <BookOpen className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            {totalArticles}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            +{draftArticles} drafts in progress
          </div>
        </Link>

        <Link href="/admin/comments" className="bg-brand-ivory p-5 rounded-2xl border border-brand-border/70 shadow-subtle hover:border-brand-blue transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Comments</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            {pendingComments}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Requires moderation
          </div>
        </Link>

        <Link href="/admin/events" className="bg-brand-ivory p-5 rounded-2xl border border-brand-border/70 shadow-subtle hover:border-brand-blue transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-brand-sky" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            {upcomingEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active conferences
          </div>
        </Link>

        <Link href="/admin/meetups" className="bg-brand-ivory p-5 rounded-2xl border border-brand-border/70 shadow-subtle hover:border-brand-blue transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Public Meetups</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            {upcomingMeetups}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Founder visits scheduled
          </div>
        </Link>

        <Link href="/admin/enquiries" className="bg-brand-ivory p-5 rounded-2xl border border-brand-border/70 shadow-subtle hover:border-brand-blue transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Unread Enquiries</span>
            <Mail className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
            {unreadEnquiries}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Visitor messages
          </div>
        </Link>

      </div>

      {/* Quick Publishing Actions Bar */}
      <div className="bg-brand-powder/30 border border-brand-blue/20 rounded-2xl p-6">
        <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">
          Quick Publishing Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/blogs/new"
            className="flex items-center space-x-3 p-3.5 bg-brand-ivory rounded-xl border border-brand-border/70 hover:border-brand-blue transition-all"
          >
            <div className="p-2 bg-brand-powder rounded-lg text-brand-navy">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy">Write a Blog</div>
              <div className="text-[11px] text-slate-500">Visual rich editor</div>
            </div>
          </Link>

          <Link
            href="/admin/events"
            className="flex items-center space-x-3 p-3.5 bg-brand-ivory rounded-xl border border-brand-border/70 hover:border-brand-blue transition-all"
          >
            <div className="p-2 bg-brand-powder rounded-lg text-brand-navy">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy">Add Event</div>
              <div className="text-[11px] text-slate-500">Symposium or seminar</div>
            </div>
          </Link>

          <Link
            href="/admin/meetups"
            className="flex items-center space-x-3 p-3.5 bg-brand-ivory rounded-xl border border-brand-border/70 hover:border-brand-blue transition-all"
          >
            <div className="p-2 bg-brand-powder rounded-lg text-brand-navy">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy">Announce Meetup</div>
              <div className="text-[11px] text-slate-500">Campus visit or salon</div>
            </div>
          </Link>

          <Link
            href="/admin/about"
            className="flex items-center space-x-3 p-3.5 bg-brand-ivory rounded-xl border border-brand-border/70 hover:border-brand-blue transition-all"
          >
            <div className="p-2 bg-brand-powder rounded-lg text-brand-navy">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy">Edit About Page</div>
              <div className="text-[11px] text-slate-500">Bio, mission, philosophy</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Publications & Comments Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Articles */}
        <div className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Recent Publications
            </h3>
            <Link href="/admin/blogs" className="text-xs font-semibold text-brand-blue hover:text-brand-navy">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {recentArticles.map((art) => (
              <div
                key={art.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-brand-cream/50 border border-brand-border/50 text-xs"
              >
                <div className="min-w-0 pr-4">
                  <h4 className="font-serif font-bold text-brand-navy truncate">
                    {art.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2">
                    <span className="text-brand-blue font-medium">{art.category.name}</span>
                    <span>•</span>
                    <span>{art.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                </div>

                <Link
                  href={`/admin/blogs/${art.id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-ivory text-brand-navy border border-brand-border/70 font-semibold text-[11px] hover:bg-brand-powder shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Comments Queue Preview */}
        <div className="bg-brand-ivory p-6 rounded-2xl border border-brand-border/70 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Pending Comments ({pendingComments})
            </h3>
            <Link href="/admin/comments" className="text-xs font-semibold text-brand-blue hover:text-brand-navy">
              Review Queue
            </Link>
          </div>

          {pendingCommentsList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All comments have been moderated. Zero pending items.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCommentsList.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-navy">{c.authorName}</span>
                    <span className="text-[10px] text-slate-500">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 italic line-clamp-2 font-sans">
                    "{c.content}"
                  </p>
                  <div className="text-[10px] text-brand-sky truncate">
                    On: {c.article.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

