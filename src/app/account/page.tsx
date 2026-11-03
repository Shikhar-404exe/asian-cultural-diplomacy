'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  MessageSquare, 
  Key, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Save
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CommentRecord {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  createdAt: string;
  article: {
    title: string;
    slug: string;
  };
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'READER';
  avatarUrl?: string | null;
  createdAt: string;
  isEmailVerified: boolean;
  _count: {
    comments: number;
  };
  comments: CommentRecord[];
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'comments' | 'security'>('comments');

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/profile');
        if (!res.ok) {
          router.push('/login?redirect=/account');
          return;
        }
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update profile.' });
      } else {
        setFeedback({ type: 'success', message: 'Your display name has been updated successfully.' });
        if (profile) {
          setProfile({ ...profile, name: data.user.name });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update password.' });
      } else {
        setFeedback({ type: 'success', message: 'Your password has been changed securely.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-brand-ivory">
        <div className="w-8 h-8 rounded-full border-2 border-brand-navy border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header / Account Overview Banner */}
        <div className="bg-brand-cream/70 border border-brand-border/80 rounded-2xl p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-brand-navy text-brand-ivory font-serif font-bold text-2xl flex items-center justify-center shadow-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="font-serif text-2xl font-bold text-brand-navy">
                  {profile.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  profile.role === 'ADMIN'
                    ? 'bg-brand-navy text-brand-ivory'
                    : 'bg-brand-powder text-brand-navy'
                }`}>
                  {profile.role === 'ADMIN' ? 'Administrator / Founder' : 'Registered Reader'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {profile.email} • Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {profile.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-blue text-brand-ivory text-xs font-semibold hover:bg-brand-navy transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Founder Portal</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-ivory border border-brand-border text-slate-700 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl border flex items-start space-x-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-border/80 space-x-8">
          <button
            onClick={() => { setActiveTab('comments'); setFeedback(null); }}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
              activeTab === 'comments'
                ? 'text-brand-navy'
                : 'text-slate-500 hover:text-brand-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Dialogue Perspectives ({profile._count.comments})</span>
            {activeTab === 'comments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setFeedback(null); }}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'text-brand-navy'
                : 'text-slate-500 hover:text-brand-navy'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Details</span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('security'); setFeedback(null); }}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
              activeTab === 'security'
                ? 'text-brand-navy'
                : 'text-slate-500 hover:text-brand-navy'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
            {activeTab === 'security' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-navy" />
            )}
          </button>
        </div>

        {/* Tab 1: Comments History */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {profile.comments.length === 0 ? (
              <div className="bg-brand-cream/40 rounded-2xl border border-dashed border-brand-border p-12 text-center">
                <MessageSquare className="w-8 h-8 text-brand-sky mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-brand-navy">No Perspectives Shared Yet</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto mt-1 mb-6">
                  You haven&apos;t commented on any publications yet. Explore our latest essays and join the conversation.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-navy text-brand-ivory text-xs font-semibold hover:bg-brand-blue transition-colors shadow-sm"
                >
                  <span>Explore Publications</span>
                </Link>
              </div>
            ) : (
              profile.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-brand-cream/50 border border-brand-border/70 rounded-xl p-6 shadow-subtle space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Link
                      href={`/blog/${comment.article.slug}`}
                      className="font-serif font-bold text-base text-brand-navy hover:text-brand-blue transition-colors inline-flex items-center space-x-1.5"
                    >
                      <span>{comment.article.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        comment.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comment.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {comment.status === 'APPROVED' ? 'Published' : comment.status === 'PENDING' ? 'Under Review' : 'Flagged'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-brand-ivory/80 p-3.5 rounded-lg border border-brand-border/40 font-sans">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-brand-cream/60 border border-brand-border/80 rounded-2xl p-6 sm:p-8 shadow-subtle">
            <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">
              Update Profile Information
            </h3>
            <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Shown alongside your published perspectives in article dialogues.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-powder/30 border border-brand-border/60 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Email address is linked to your account identity and kept strictly private.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <div className="bg-brand-cream/60 border border-brand-border/80 rounded-2xl p-6 sm:p-8 shadow-subtle">
            <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">
              Change Account Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  New Password (min. 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

