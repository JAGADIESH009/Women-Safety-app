import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  User as UserIcon, 
  ArrowRight, 
  PlusCircle, 
  Phone, 
  LogIn, 
  Download, 
  AlertCircle,
  RefreshCw,
  Star,
  Smartphone,
  PhoneCall
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
    if (!user) return;
    setLoadingContacts(true);
    setContactError(null);
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.warn('Dashboard failed to fetch contacts:', err);
      setContactError('Unable to load contacts from server. Please check your connection.');
    } finally {
      setLoadingContacts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
      setContactError(null);
    }
  }, [user, loadContacts]);

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  // =============================================================
  // GUEST DASHBOARD VIEW: Minimalist, Focused, High-Trust
  // =============================================================
  if (isGuest || !user) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        {/* Welcome Header */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Public Safety Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Emergency Response Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Immediate national emergency hotlines and safety guidelines. Sign in to synchronize your private trusted emergency contacts with the SafeHer Android application.
          </p>
        </section>

        {/* Sign In Invitation Strip: Linear-style Restraint */}
        <section className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Synchronize Your Emergency Circle
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Sign in with your Google or email account to store contacts in the cloud. Contacts configured here instantly link to your Android mobile app.
            </p>
          </div>

          <button
            onClick={onOpenAccountModal}
            className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium transition-all shadow-xs active:scale-[0.98] flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <LogIn size={14} />
            <span>Sign in to Sync</span>
          </button>
        </section>

        {/* Public Helplines Directory Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Verified National Helplines (India)</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Official toll-free numbers accessible 24/7 across all carriers
              </p>
            </div>
            <button
              onClick={() => onNavigate('resources')}
              className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APP_CONFIG.emergencyHotlines.slice(0, 4).map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] transition-all flex flex-col justify-between shadow-[var(--shadow-card)] group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                    {line.name}
                  </span>
                  <span className="text-2xl font-bold text-[var(--brand-primary)] tracking-tight font-mono tabular-nums block">
                    {line.number}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {line.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand-primary)]">
                  <span>Direct Call</span>
                  <PhoneCall size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Android Application Card: Restrained & Utilitarian */}
        <section className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  SafeHer Android Application
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  v1.0.4
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Native app with one-tap hardware SOS siren, automatic SMS broadcast, and background GPS location sharing.
              </p>
            </div>
          </div>
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] active:scale-[0.98] border border-[var(--border-medium)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Download size={13} className="text-[var(--brand-primary)]" />
            <span>Download APK (84.6 MB)</span>
          </a>
        </section>

      </div>
    );
  }

  // =============================================================
  // AUTHENTICATED USER DASHBOARD VIEW
  // =============================================================
  const displayName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Personalized Welcome Header */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Cloud Connected</span>
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {user.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Your emergency contacts and profile information are synchronized across the SafeHer mobile app and web portal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('contacts')}
              className="px-3.5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add Contact</span>
            </button>
            <button
              onClick={loadContacts}
              disabled={loadingContacts}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
              title="Refresh contacts from server"
              aria-label="Refresh contacts from server"
            >
              <RefreshCw size={14} className={loadingContacts ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Contacts Network Bento */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-subtle)] border border-[var(--brand-border)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
              <Users size={14} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                Emergency Contacts Network
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Synchronized with SafeHer PostgreSQL cloud backend
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All ({contacts.length})</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Dynamic State Rendering */}
        {loadingContacts ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--text-muted)]">Fetching your contacts from server...</p>
          </div>
        ) : contactError ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{contactError}</span>
            </div>
            <button
              onClick={loadContacts}
              className="font-medium underline ml-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : contacts.length === 0 ? (
          /* Honest Composed Empty State */
          <div className="py-7 px-4 text-center rounded-xl bg-[var(--bg-elevated)]/50 border border-dashed border-[var(--border-medium)] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Users size={18} />
            </div>
            <div className="max-w-sm mx-auto space-y-0.5">
              <p className="text-xs font-bold text-[var(--text-primary)]">No emergency contacts saved yet</p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Add trusted family members or friends. Any contact added here appears automatically in your SafeHer Android mobile application.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contacts')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-medium shadow-xs hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
            >
              <PlusCircle size={13} />
              <span>Add Your First Emergency Contact</span>
            </button>
          </div>
        ) : (
          /* Real Contacts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {primaryContact && (
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-start justify-between shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{primaryContact.name}</span>
                    {primaryContact.is_primary && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Star size={9} fill="currentColor" />
                        <span>Primary</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono tabular-nums text-[var(--brand-primary)] font-semibold">{primaryContact.phone}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Relationship: {primaryContact.relation || 'Emergency Contact'}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                  <Phone size={13} />
                </div>
              </div>
            )}

            {contacts.filter(c => c.id !== primaryContact?.id).slice(0, 2).map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{c.name}</span>
                  <p className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">{c.phone}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Relationship: {c.relation || 'Contact'}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                  <Phone size={13} />
                </div>
              </div>
            ))}

            {contacts.length > 3 && (
              <div 
                onClick={() => onNavigate('contacts')}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-medium)] hover:border-[var(--brand-primary)] flex flex-col justify-center items-center text-center cursor-pointer transition-colors shadow-xs"
              >
                <span className="text-xs font-semibold text-[var(--brand-primary)]">
                  +{contacts.length - 3} more contacts
                </span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Click to view complete network</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Primary Area Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Emergency Contacts Area */}
        <div 
          onClick={() => onNavigate('contacts')}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] transition-all cursor-pointer group shadow-[var(--shadow-card)] flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white flex items-center justify-center transition-colors">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Emergency Contacts</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Add, edit, or prioritize phone numbers to receive emergency SMS notifications from the mobile app.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand-primary)]">
            <span>Manage Contacts ({contacts.length})</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Safety Resources Area */}
        <div 
          onClick={() => onNavigate('resources')}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] transition-all cursor-pointer group shadow-[var(--shadow-card)] flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white flex items-center justify-center transition-colors">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Safety Resources</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Official Indian helplines (112, 1091, 100, 108), women distress guides, and emergency checklists.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand-primary)]">
            <span>View Directory</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Profile & Medical Area */}
        <div 
          onClick={() => onNavigate('profile')}
          className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] transition-all cursor-pointer group shadow-[var(--shadow-card)] flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white flex items-center justify-center transition-colors">
              <UserIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Profile & Medical</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Emergency phone, blood group, Firebase account security, and cloud data synchronization status.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand-primary)]">
            <span>View Profile</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </section>

      {/* Mobile Application Notice */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">
              SafeHer Android Mobile Application
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Hardware siren, shake triggers, background GPS tracking, and automatic SMS broadcast operate via the Android app.
            </p>
          </div>
        </div>
        <a
          href={APP_CONFIG.apkDownloadUrl}
          download={APP_CONFIG.apkFilename}
          className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-medium)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <Download size={13} className="text-[var(--brand-primary)]" />
          <span>Download Android APK</span>
        </a>
      </section>

    </div>
  );
};
