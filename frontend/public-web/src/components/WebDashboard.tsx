import React, { useState, useEffect, useCallback } from 'react';
import { 
  PhoneCall, 
  ArrowRight, 
  Users, 
  Smartphone, 
  PlusCircle, 
  RefreshCw, 
  Star, 
  Phone, 
  AlertCircle,
  BookOpen,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { APP_CONFIG } from '../config/appConfig';
import type { EmergencyContact, PageView } from '../types';

interface WebDashboardProps {
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

// 4 Primary Scannable Emergency Helplines
const PRIMARY_HELPLINES = [
  { number: '112', label: 'National Emergency' },
  { number: '1091', label: 'Women Helpline' },
  { number: '100', label: 'Police Control' },
  { number: '181', label: 'Women in Distress' },
];

export const WebDashboard: React.FC<WebDashboardProps> = ({ 
  onNavigate, 
  onOpenAccountModal 
}) => {
  const { user, profile } = useAuth();
  
  // Real backend contacts state (authenticated only)
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    setLoadingContacts(true);
    setContactError(null);
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.warn('Dashboard failed to fetch contacts:', err);
      setContactError('Unable to load contacts. Check network connection.');
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

  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* 1. COMPACT PAGE HEADING (No bulky outer container) */}
      <section className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {user ? `Welcome, ${displayName}` : 'Your safety, connected.'}
            </h1>
            {!user ? (
              <span className="text-[10px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60">
                Guest mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Synced</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {user 
              ? 'Emergency contacts and telemetry synchronized across the SafeHer cloud network.'
              : 'Direct access to national emergency responders and field safety protocols.'}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => onNavigate('contacts')}
              className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle size={13} />
              <span>Add contact</span>
            </button>
            <button
              onClick={loadContacts}
              disabled={loadingContacts}
              className="p-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Refresh contacts"
              aria-label="Refresh contacts"
            >
              <RefreshCw size={13} className={loadingContacts ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </section>

      {/* 2. COMPACT CONTACT SYNCHRONIZATION NOTICE (Guest Only) */}
      {!user && (
        <section className="py-2.5 px-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Users size={14} className="text-[var(--brand-primary)] shrink-0" />
            <span>Sign in to store emergency contacts and sync them with the SafeHer Android app.</span>
          </div>
          <button
            onClick={onOpenAccountModal}
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Sign in to sync contacts</span>
            <ArrowRight size={12} />
          </button>
        </section>
      )}

      {/* 3. EMERGENCY HELPLINES (Primary Hero Section - Immediately Scannable) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-[var(--brand-primary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Emergency Helplines
            </h2>
          </div>
          <button
            onClick={() => onNavigate('resources')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all helplines</span>
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {PRIMARY_HELPLINES.map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number}`}
              className="group p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] shadow-2xs"
            >
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors tabular-nums">
                  {line.number}
                </div>
                <div className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5 truncate">
                  {line.label}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] group-hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2">
                <PhoneCall size={14} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 4. EMERGENCY CONTACTS (Authenticated Users) */}
      {user && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--brand-primary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Emergency Contacts ({contacts.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('contacts')}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Manage contacts</span>
              <ArrowRight size={11} />
            </button>
          </div>

          {loadingContacts ? (
            <div className="py-6 text-center text-xs text-[var(--text-muted)] space-y-2">
              <div className="w-4 h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading emergency circle...</p>
            </div>
          ) : contactError ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{contactError}</span>
              </div>
              <button onClick={loadContacts} className="font-semibold underline ml-2 cursor-pointer">
                Retry
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-5 text-center rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-medium)] space-y-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">No contacts saved yet</p>
              <p className="text-[11px] text-[var(--text-secondary)] max-w-sm mx-auto">
                Add trusted family members or friends to receive emergency alerts from your Android device.
              </p>
              <button
                onClick={() => onNavigate('contacts')}
                className="mt-1 px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle size={13} />
                <span>Add first contact</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {primaryContact && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {primaryContact.name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        <Star size={8} fill="currentColor" />
                        <span>Primary</span>
                      </span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[var(--brand-primary)] font-semibold">
                      {primaryContact.phone}
                    </div>
                  </div>
                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--brand-primary)] hover:text-white text-[var(--text-secondary)] flex items-center justify-center transition-colors shrink-0 ml-2"
                    title={`Call ${primaryContact.name}`}
                  >
                    <Phone size={13} />
                  </a>
                </div>
              )}

              {contacts.filter(c => c.id !== primaryContact?.id).slice(0, 2).map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {c.name}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                      {c.phone}
                    </div>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--brand-primary)] hover:text-white text-[var(--text-secondary)] flex items-center justify-center transition-colors shrink-0 ml-2"
                    title={`Call ${c.name}`}
                  >
                    <Phone size={13} />
                  </a>
                </div>
              ))}

              {contacts.length > 3 && (
                <button
                  onClick={() => onNavigate('contacts')}
                  className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-medium)] hover:border-[var(--brand-primary)] text-center text-xs font-medium text-[var(--brand-primary)] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>+{contacts.length - 3} more contacts</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 5. ESSENTIAL NAVIGATION & ANDROID COMPANION STRIP */}
      <section className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigate('contacts')}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-left transition-colors cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Users size={15} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Contacts</div>
                <div className="text-[11px] text-[var(--text-muted)]">Manage emergency recipients</div>
              </div>
            </div>
            <ArrowRight size={12} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('resources')}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-left transition-colors cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen size={15} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Protocols</div>
                <div className="text-[11px] text-[var(--text-muted)]">Field guides & safety rules</div>
              </div>
            </div>
            <ArrowRight size={12} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-left transition-colors cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <UserIcon size={15} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Profile</div>
                <div className="text-[11px] text-[var(--text-muted)]">Medical data & security</div>
              </div>
            </div>
            <ArrowRight size={12} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Small Inline Android App Notice */}
        <div className="py-2.5 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-[var(--text-muted)] shrink-0" />
            <span>SafeHer Android app enables volume button hardware triggers & siren.</span>
          </div>
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="font-medium text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Download APK</span>
            <ArrowRight size={11} />
          </a>
        </div>
      </section>

    </div>
  );
};
