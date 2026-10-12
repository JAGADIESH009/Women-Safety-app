import React, { useState, useEffect, useCallback } from 'react';
import { PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SafetyMap } from './SafetyMap';
import type { EmergencyContact, PageView } from '../types';

interface WebDashboardProps {
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

const PRIMARY_HELPLINES = [
  { number: '112', label: 'National Emergency' },
  { number: '1091', label: 'Women Helpline' },
  { number: '100', label: 'Police' },
  { number: '181', label: 'Women in Distress' },
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* 1. CLEAN COMPACT HEADING & EMERGENCY ACTION */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Your safety, at a glance
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
            {!user ? (
              <span>Guest mode</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Synced ({displayName})
              </span>
            )}
          </div>
        </div>

        {/* Compact Emergency-Help Action */}
        <div className="flex items-center gap-2">
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

      {/* 2. COMPACT LOCATION AREA (REAL MAP) */}
      <section>
        <SafetyMap />
      </section>

      {/* 3. ESSENTIAL EMERGENCY HELPLINES (UNOBTRUSIVE LIST) */}
      <section className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Essential Helplines
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIMARY_HELPLINES.map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number}`}
              className="py-2 px-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-between group"
            >
              <span className="text-xs text-[var(--text-secondary)] truncate mr-1">
                {line.label}
              </span>
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] shrink-0">
                {line.number}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 4. USER CONTACT OR GUEST SYNC NOTICE */}
      <section className="pt-2 border-t border-[var(--border-subtle)]">
        {user ? (
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 truncate">
              {primaryContact ? (
                <span>
                  Primary contact: <strong className="text-[var(--text-primary)]">{primaryContact.name}</strong> ({primaryContact.phone})
                </span>
              ) : (
                <span>No emergency contacts saved yet</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {primaryContact && (
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="font-medium text-[var(--brand-primary)] hover:underline"
                >
                  Call
                </a>
              )}
              <button
                onClick={() => onNavigate('contacts')}
                className="font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Sign in to save and sync contacts with the mobile app</span>
            <button
              onClick={onOpenAccountModal}
              className="font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
