import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  User as UserIcon, 
  ArrowRight, 
  PlusCircle, 
  Phone, 
  CheckCircle2, 
  LogIn, 
  Download, 
  AlertCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { APP_CONFIG } from '../config/appConfig';
import type { EmergencyContact, PageView } from '../types';

interface WebDashboardProps {
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ 
  onNavigate, 
  onOpenAccountModal 
}) => {
  const { user, profile, isGuest } = useAuth();
  
  // Real backend contacts state (authenticated only)
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const loadContacts = React.useCallback(async () => {
    setLoadingContacts(true);
    setContactError(null);
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err: any) {
      console.warn('Dashboard failed to fetch contacts:', err);
      setContactError('Unable to load contacts from server. Please check your connection.');
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
      setContactError(null);
    }
  }, [user, loadContacts]);

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  // -------------------------------------------------------------
  // GUEST DASHBOARD VIEW
  // -------------------------------------------------------------
  if (isGuest || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-3">
              <span>Guest Session</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Welcome to SafeHer Companion
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              SafeHer is a comprehensive women's security initiative integrating AI risk analysis, IoT wearables, and rapid emergency dispatch. The web companion provides immediate access to emergency helplines and safety protocols.
            </p>
          </div>
        </section>

        {/* Call to Sign In Card */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Personal Emergency Contacts & Mobile Sync</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Sign in with your Google account or email to view, add, and synchronize your trusted emergency contacts directly with the SafeHer mobile application.
            </p>
          </div>
          <button
            onClick={onOpenAccountModal}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <LogIn size={15} />
            <span>Sign In to Sync</span>
          </button>
        </section>

        {/* Public Hotlines Quick Access */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-primary)]" />
              <span>National Emergency Helplines</span>
            </h2>
            <button
              onClick={() => onNavigate('resources')}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Resources</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {APP_CONFIG.emergencyHotlines.slice(0, 3).map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group flex items-center justify-between shadow-xs"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">{line.name}</p>
                  <p className="text-xl font-black text-[var(--color-primary)] tracking-wide mt-0.5">{line.number}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{line.desc}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-elevated)] group-hover:bg-[var(--color-primary)] group-hover:text-white text-[var(--color-primary)] flex items-center justify-center transition-colors shrink-0">
                  <Phone size={15} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Mobile App Download Card */}
        <section className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">SafeHer Android Application</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Install the APK on Android for one-tap SOS and background emergency monitoring.</p>
            </div>
          </div>
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="px-4 py-2 rounded-xl bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <Download size={14} className="text-[var(--color-primary)]" />
            <span>Download APK</span>
          </a>
        </section>

      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED USER DASHBOARD VIEW
  // -------------------------------------------------------------
  const displayName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      
      {/* Personalized Welcome Header */}
      <section className="p-6 sm:p-7 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 size={11} />
                <span>Cloud Synced</span>
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {user.email}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
              Your emergency contacts and preferences are connected across the SafeHer mobile app and web portal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('contacts')}
              className="px-3.5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add Contact</span>
            </button>
            <button
              onClick={loadContacts}
              disabled={loadingContacts}
              className="p-2 rounded-xl bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition-all cursor-pointer"
              title="Refresh contacts from server"
              aria-label="Refresh contacts from server"
            >
              <RefreshCw size={14} className={loadingContacts ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Contacts Summary Card */}
      <section className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Emergency Contacts Summary
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Contacts</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Loading State */}
        {loadingContacts ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading contacts from server...</p>
          </div>
        ) : contactError ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{contactError}</span>
            </div>
            <button
              onClick={loadContacts}
              className="font-semibold underline ml-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : contacts.length === 0 ? (
          /* Empty State */
          <div className="py-8 px-4 text-center rounded-2xl bg-[var(--color-surface-elevated)]/50 border border-dashed border-[var(--color-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-text-muted)]">
              <Users size={22} />
            </div>
            <div className="max-w-sm mx-auto">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">No emergency contacts saved yet</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Add trusted family members or friends. Any contacts added here will appear in your SafeHer mobile app automatically.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contacts')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add First Emergency Contact</span>
            </button>
          </div>
        ) : (
          /* Contacts Preview Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryContact && (
              <div className="p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{primaryContact.name}</span>
                    {primaryContact.is_primary && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                        <Star size={9} fill="currentColor" />
                        <span>Primary</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[var(--color-primary)] font-medium">{primaryContact.phone}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Relation: {primaryContact.relation || 'Emergency Contact'}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <Phone size={14} />
                </div>
              </div>
            )}

            {contacts.length > 1 && (
              <div className="p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">Additional Contacts</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {contacts.length - 1} more trusted {contacts.length - 1 === 1 ? 'contact' : 'contacts'} configured in your network.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('contacts')}
                  className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View all {contacts.length} contacts</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Primary Navigation Shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Emergency Contacts Shortcut */}
        <div 
          onClick={() => onNavigate('contacts')}
          className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white flex items-center justify-center transition-colors mb-3">
              <Users size={18} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Emergency Contacts</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Add or edit phone numbers to receive emergency notifications from the mobile app.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] group-hover:underline">
            <span>Manage Contacts</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Safety Resources Shortcut */}
        <div 
          onClick={() => onNavigate('resources')}
          className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white flex items-center justify-center transition-colors mb-3">
              <BookOpen size={18} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Safety Resources</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Verified national emergency hotlines, self-defense guidance, and women safety helplines.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] group-hover:underline">
            <span>View Hotlines</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Profile Shortcut */}
        <div 
          onClick={() => onNavigate('profile')}
          className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white flex items-center justify-center transition-colors mb-3">
              <UserIcon size={18} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Profile & Medical</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Maintain your emergency phone number, blood group, and account credentials.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] group-hover:underline">
            <span>View Profile</span>
            <ArrowRight size={13} />
          </div>
        </div>

      </section>

      {/* Mobile Application Link */}
      <section className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <Download size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">SafeHer Mobile Companion</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Emergency sirens, offline triggers, and live GPS broadcasting operate via the SafeHer Android app.</p>
          </div>
        </div>
        <a
          href={APP_CONFIG.apkDownloadUrl}
          download={APP_CONFIG.apkFilename}
          className="px-4 py-2 rounded-xl bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Download size={14} className="text-[var(--color-primary)]" />
          <span>Download Android APK</span>
        </a>
      </section>

    </div>
  );
};
