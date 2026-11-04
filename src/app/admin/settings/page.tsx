'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Database,
  Mail,
  Bell,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('Asian Cultural Diplomacy');
  const [contactEmail, setContactEmail] = useState('dialogue@asianculturaldiplomacy.org');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [gmailNotificationsEnabled, setGmailNotificationsEnabled] = useState(true);
  const [notifyOnNewComment, setNotifyOnNewComment] = useState(true);
  const [notifyOnNewReader, setNotifyOnNewReader] = useState(true);
  const [notifyOnContactEnquiry, setNotifyOnContactEnquiry] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSiteTitle(d.settings.siteTitle || '');
          setContactEmail(d.settings.contactEmail || '');
          setNotificationEmail(d.settings.notificationEmail || d.settings.gmailUser || '');
          if (d.settings.gmailNotificationsEnabled !== undefined) {
            setGmailNotificationsEnabled(d.settings.gmailNotificationsEnabled);
          }
          if (d.settings.notifyOnNewComment !== undefined) {
            setNotifyOnNewComment(d.settings.notifyOnNewComment);
          }
          if (d.settings.notifyOnNewReader !== undefined) {
            setNotifyOnNewReader(d.settings.notifyOnNewReader);
          }
          if (d.settings.notifyOnNewEnquiry !== undefined) {
            setNotifyOnContactEnquiry(d.settings.notifyOnNewEnquiry);
          } else if (d.settings.notifyOnContactEnquiry !== undefined) {
            setNotifyOnContactEnquiry(d.settings.notifyOnContactEnquiry);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          contactEmail,
          notificationEmail,
          gmailNotificationsEnabled,
          notifyOnNewComment,
          notifyOnNewReader,
          notifyOnContactEnquiry,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Site & notification settings updated successfully!' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Connection issue. Please verify your internet connection.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setFeedback({ type: 'error', text: 'Both current and new passwords are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setSavingPassword(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setFeedback({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Connection issue. Please check your network.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">
          Platform Settings &amp; Security
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage general website preferences, administrator credentials, and database backups.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-brand-cream/60 p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-brand-border/60 pb-3">
          <Settings className="w-5 h-5 text-brand-navy" />
          <h2 className="font-serif text-lg font-bold text-brand-navy">
            General Website Identity
          </h2>
        </div>

        <form onSubmit={handleUpdateGeneral} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Website Title
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm font-serif font-bold text-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Public Inquiry Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
            />
          </div>

          {/* Gmail & Transactional Alerts */}
          <div className="pt-4 border-t border-brand-border/60 space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-brand-blue" />
              <h3 className="font-serif font-bold text-sm text-brand-navy">
                Gmail &amp; Activity Notifications
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Founder Notification Email
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="shashwatiprajapati@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Where platform alerts and moderation notices are delivered.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gmailNotificationsEnabled}
                  onChange={(e) => setGmailNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-brand-navy rounded border-brand-border"
                />
                <span className="text-xs font-semibold text-slate-700">Enable Gmail &amp; Email Notifications</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnNewComment}
                  onChange={(e) => setNotifyOnNewComment(e.target.checked)}
                  className="w-4 h-4 text-brand-navy rounded border-brand-border"
                />
                <span className="text-xs text-slate-600">Notify immediately when a reader submits a comment</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnNewReader}
                  onChange={(e) => setNotifyOnNewReader(e.target.checked)}
                  className="w-4 h-4 text-brand-navy rounded border-brand-border"
                />
                <span className="text-xs text-slate-600">Notify when a new reader registers an account</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnContactEnquiry}
                  onChange={(e) => setNotifyOnContactEnquiry(e.target.checked)}
                  className="w-4 h-4 text-brand-navy rounded border-brand-border"
                />
                <span className="text-xs text-slate-600">Notify on new diplomatic contact form enquiries</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>

      {/* Security & Password */}
      <div className="bg-brand-cream/60 p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-brand-border/60 pb-3">
          <Lock className="w-5 h-5 text-brand-navy" />
          <h2 className="font-serif text-lg font-bold text-brand-navy">
            Administrator Password
          </h2>
        </div>

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
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ivory border border-brand-border/80 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Database Backup & Disaster Recovery */}
      <div className="bg-brand-cream/60 p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-brand-border/60 pb-3">
          <Database className="w-5 h-5 text-brand-navy" />
          <h2 className="font-serif text-lg font-bold text-brand-navy">
            Database Backup &amp; Safe Archival
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
          Download a verified timestamped JSON snapshot of your production database. The downloaded file contains all publications, categories, comments, settings, and media records.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-navy text-brand-ivory text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Database Snapshot (.json)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
