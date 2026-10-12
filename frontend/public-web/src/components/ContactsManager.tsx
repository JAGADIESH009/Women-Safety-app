import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Trash2, 
  Edit3, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Lock, 
  LogIn, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { EmergencyContact, PageView } from '../types';

interface ContactsManagerProps {
  onNavigate?: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({ 
  onOpenAccountModal 
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('syncing');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadContacts = React.useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    setFetchError(null);
    try {
      const data = await api.getContacts();
      // Defensive client-side deduplication by clean phone or ID
      const seen = new Set<string>();
      const deduped: EmergencyContact[] = [];
      const sorted = [...data].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      for (const c of sorted) {
        const clean = (c.phone || '').replace(/\D/g, '');
        const norm = clean.length >= 10 ? clean.slice(-10) : clean;
        const key = norm || (c.id ? `id_${c.id}` : (c.name ? c.name.trim().toLowerCase() : ''));
        if (key && !seen.has(key)) {
          seen.add(key);
          deduped.push(c);
        }
      }
      setContacts(deduped);
      setSyncStatus('synced');
    } catch (err: any) {
      console.warn('Failed to load contacts:', err);
      setFetchError(err.message || 'Unable to connect to backend server. Please try again.');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
      setLoading(false);
      setSyncStatus('error');
    }
  }, [user, loadContacts]);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setRelation('Parent');
    setIsPrimary(contacts.length === 0);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation || 'Parent');
    setIsPrimary(contact.is_primary);
    setFormError('');
    setModalOpen(true);
  };

  const handleSetPrimary = async (contact: EmergencyContact) => {
    if (contact.is_primary) return;
    try {
      await api.updateContact(contact.id, {
        is_primary: true,
      });
      setFormSuccess(`${contact.name} is now your primary contact and synced with your mobile app.`);
      await loadContacts();
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update primary contact.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('Please enter both contact name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim(),
          is_primary: isPrimary,
        });
        setFormSuccess('Contact updated and synced with your mobile app.');
      } else {
        await api.createContact({
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim(),
          is_primary: isPrimary,
        });
        setFormSuccess('Emergency contact added and synced with your mobile app.');
      }

      await loadContacts();
      setModalOpen(false);
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save contact. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact? It will also be removed from your cloud profile and mobile app.')) {
      return;
    }

    try {
      await api.deleteContact(id);
      setFormSuccess('Contact deleted and synced with your mobile app.');
      await loadContacts();
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact.');
    }
  };

  // -------------------------------------------------------------
  // GUEST ACCESS RESTRICTION WALL
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="py-12 px-4 sm:px-6 max-w-md mx-auto text-center space-y-6">
        <div className="p-7 sm:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-[var(--shadow-card)] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Emergency Contacts Protected
            </h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              To safeguard your personal security circle and synchronize records with the SafeHer mobile app, contact management requires an authenticated session.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAccountModal}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium transition-all shadow-xs active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={14} />
              <span>Sign In to Access Contacts</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED EMERGENCY CONTACTS VIEW
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              Safety Network
            </span>
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <ShieldCheck size={11} />
                <span>Synced with Mobile App</span>
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                <RefreshCw size={11} className="animate-spin" />
                <span>Syncing...</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <AlertCircle size={11} />
                <span>Sync Offline</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Emergency Contacts
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Recipients notified automatically when an emergency SOS is triggered from the SafeHer mobile app.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadContacts}
            disabled={loading}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] transition-all cursor-pointer"
            title="Refresh contacts"
            aria-label="Refresh contacts"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {fetchError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadContacts}
            className="font-medium underline ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Contact Cards List */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">Loading verified emergency contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-14 px-4 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-3.5">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
            <Users size={22} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              No Emergency Contacts Configured
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Add trusted family members or friends. Any contacts configured here will automatically appear on your mobile app and receive emergency dispatch details during an SOS.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-medium shadow-xs hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add First Emergency Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40 transition-all shadow-[var(--shadow-card)] flex flex-col justify-between space-y-3.5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                        {contact.name}
                      </h4>
                      {contact.is_primary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                          <Star size={9} fill="currentColor" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[11px] text-[var(--text-muted)]">
                      {contact.relation || 'Emergency Contact'}
                    </span>
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white flex items-center justify-center shrink-0 transition-colors"
                    title={`Call ${contact.name}`}
                  >
                    <Phone size={13} />
                  </a>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <p className="text-xs font-mono font-medium text-[var(--text-primary)] tabular-nums">
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5">
                <div>
                  {!contact.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(contact)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Set as priority SOS recipient"
                    >
                      <Star size={11} />
                      <span>Make Primary</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Edit contact"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete contact"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal: Stripe-tier Minimalist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-[var(--shadow-elevated)] overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Phone Number (with country code) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Relationship
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all cursor-pointer"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Close Friend</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Child">Child</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] border-[var(--border-medium)] cursor-pointer"
                />
                <label htmlFor="primaryContactCheck" className="text-xs text-[var(--text-primary)] font-medium cursor-pointer">
                  Set as Primary Contact (receives priority SOS notification)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs font-medium hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingContact ? 'Save Changes' : 'Add Contact'}</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
