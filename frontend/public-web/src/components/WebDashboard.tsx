import React, { useState, useEffect, useCallback } from 'react';
import { 
  PhoneCall, 
  ShieldCheck, 
  MapPin, 
  Users, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SafetyMap } from './SafetyMap';
import type { EmergencyContact, PageView } from '../types';

interface WebDashboardProps {
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

const PRIMARY_HELPLINES = [
  { number: '112', label: 'National Emergency', desc: 'Unified pan-India emergency dispatch' },
  { number: '1091', label: 'Women Helpline', desc: '24/7 dedicated women distress response' },
  { number: '100', label: 'Police Control Room', desc: 'Direct immediate police assistance' },
  { number: '181', label: 'Women in Distress', desc: 'Toll-free rescue & support helpline' },
  { number: '108', label: 'Medical & Ambulance', desc: 'Emergency medical services' },
];

export const WebDashboard: React.FC<WebDashboardProps> = ({ 
  onNavigate, 
  onOpenAccountModal 
}) => {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.warn('Dashboard failed to fetch contacts:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
    }
  }, [user, loadContacts]);

  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* 1. SLIM HEADER & BALANCED ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Your safety, at a glance
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
            {!user ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Guest mode</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Synced ({displayName})</span>
              </span>
            )}
          </div>
        </div>

        {/* Compact Emergency Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {user && primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5"
              title={`Call primary contact: ${primaryContact.name}`}
            >
              <span>Call {primaryContact.name.split(' ')[0]}</span>
            </a>
          )}

          <a
            href="tel:112"
            className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-none"
            title="Call National Emergency 112"
          >
            <PhoneCall size={13} />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* 2. FULL-WIDTH RESPONSIVE TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LOCATION PREVIEW & SAFETY PROTOCOL (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Location Summary & Clickable Map Preview */}
          <section className="p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[var(--brand-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Location & Surroundings
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('map')}
                className="text-xs text-[var(--brand-primary)] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Dedicated map view</span>
                <ExternalLink size={11} />
              </button>
            </div>

            {/* Clickable Map Component */}
            <SafetyMap onOpenFullMap={() => onNavigate('map')} />
          </section>

          {/* Useful Safety Information (Single Simple Section) */}
          <section className="p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <ShieldCheck size={15} className="text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Emergency Safety Guidance
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    Call 112 Immediately
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    National unified emergency response connects directly to police, ambulance, and disaster responders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    Broadcast Coordinates via SMS
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Use the SafeHer mobile app or phone to text your live map coordinates directly to your emergency circle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    Move to a Public Safe Zone
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Seek a nearby well-lit commercial establishment, public transport station, or police post while maintaining phone contact.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: HELPLINES & CONTACTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Essential Emergency Helplines (Full Labels, Never Truncated) */}
          <section className="p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <PhoneCall size={15} className="text-[var(--brand-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Essential Helplines
                </h2>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                24/7 Toll-Free
              </span>
            </div>

            <div className="space-y-2">
              {PRIMARY_HELPLINES.map((line) => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  className="p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {line.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {line.desc}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
                      {line.number}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-[var(--bg-surface)] group-hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] group-hover:text-white flex items-center justify-center transition-colors">
                      <PhoneCall size={12} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Emergency Contacts or Sync Card */}
          <section className="p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[var(--brand-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Emergency Contacts
                </h2>
              </div>
              {user && (
                <button
                  onClick={() => onNavigate('contacts')}
                  className="text-xs text-[var(--brand-primary)] hover:underline font-medium cursor-pointer"
                >
                  Manage
                </button>
              )}
            </div>

            {user ? (
              <div className="space-y-2.5 text-xs">
                {contacts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[var(--text-muted)] space-y-2">
                    <p>No contacts saved yet.</p>
                    <button
                      onClick={() => onNavigate('contacts')}
                      className="px-3 py-1.5 rounded-md bg-[var(--brand-primary)] text-white text-xs font-medium cursor-pointer"
                    >
                      Add first contact
                    </button>
                  </div>
                ) : (
                  contacts.slice(0, 3).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>{contact.name}</span>
                          {contact.is_primary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)]">
                          {contact.phone}
                        </div>
                      </div>

                      <a
                        href={`tel:${contact.phone}`}
                        className="p-1.5 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--brand-primary)] transition-colors"
                        title={`Call ${contact.name}`}
                      >
                        <PhoneCall size={13} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <p className="leading-relaxed text-[11px]">
                  Sign in to save personal emergency contacts and automatically sync them with your SafeHer Android mobile application.
                </p>
                <button
                  onClick={onOpenAccountModal}
                  className="w-full py-2 px-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer text-center"
                >
                  Sign in to sync contacts
                </button>
              </div>
            )}
          </section>

        </div>

      </div>

    </div>
  );
};
