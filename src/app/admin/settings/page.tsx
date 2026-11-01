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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('Asian Cultural Diplomacy');
  const [contactEmail, setContactEmail] = useState('dialogue@asianculturaldiplomacy.org');
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
        body: JSON.stringify({ siteTitle, contactEmail }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Site settings updated successfully!' });
      } else {
        setFeedback({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Connection issue.' });
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
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setFeedback({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Connection issue.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/backup', '_blank');
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      
      {/* Header */}
      <div className="bg-brand-cream/80 p-6 rounded-2xl border border-brand-border shadow-subtle">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
          System Administration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
          Settings & Data Backup
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage system preferences, change credentials, and export complete database backups.
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

      {/* 1. General Site Settings */}
      <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2 text-brand-navy">
          <Settings className="w-5 h-5 text-brand-blue" />
          <h3 className="font-serif text-xl font-bold">
            General Configuration
          </h3>
        </div>

        <form onSubmit={handleUpdateGeneral} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Website Name
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Official Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </form>
      </div>

      {/* 2. Security & Credentials */}
      <div className="bg-brand-ivory p-6 sm:p-8 rounded-2xl border border-brand-border/70 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2 text-brand-navy">
          <Lock className="w-5 h-5 text-brand-blue" />
          <h3 className="font-serif text-xl font-bold">
            Security & Password Change
          </h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-cream/40 border border-brand-border text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-blue text-brand-ivory text-xs font-semibold tracking-wide transition-colors shadow-sm disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* 3. One-Click Database Backup */}
      <div className="bg-brand-powder/40 border border-brand-blue/30 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-brand-navy">
          <Database className="w-5 h-5 text-brand-blue" />
          <h3 className="font-serif text-xl font-bold">
            Full Database Backup & Data Preservation
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Download a complete, structured JSON export of all your published articles, reader comments, upcoming events, founder meetups, and enquiries. You can keep this on your laptop or external drive for complete data safety.
        </p>

        <button
          onClick={handleDownloadBackup}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-navy text-brand-ivory text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-300" />
          <span>Download Database Snapshot (.JSON)</span>
        </button>
      </div>

    </div>
  );
}
