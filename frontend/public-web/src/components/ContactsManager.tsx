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
  MessageSquare,
  X,
  Sparkles
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
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [testModalContact, setTestModalContact] = useState<EmergencyContact | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (e) {
      console.warn('Failed to load contacts:', e);
    } finally {
      setLoading(false);
    }
  };

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
    setRelation(contact.relation);
    setIsPrimary(contact.is_primary);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('Please provide both contact name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          relation,
          is_primary: isPrimary,
        });
        setFormSuccess('Contact updated successfully.');
      } else {
        await api.createContact({
          name: name.trim(),
          phone: phone.trim(),
          relation,
          is_primary: isPrimary,
        });
        setFormSuccess('Contact added to emergency broadcast list.');
      }

      await loadContacts();
      setModalOpen(false);
      setTimeout(() => setFormSuccess(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return;
    try {
      await api.deleteContact(id);
      await loadContacts();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Safety Network
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {user ? 'Server Authorized' : 'Guest Sandbox'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">
            Trusted Emergency Contacts
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Recipients who receive automated priority SMS alerts and real-time live GPS tracking links when an SOS is triggered.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-3 px-5 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Add Trusted Contact
        </button>
      </div>

      {/* Guest Notice if unauthenticated */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Guest Mode: Contacts Stored Locally in Browser</p>
              <p className="text-[11px] opacity-90">
                Sign in with Google or Email to synchronize these contacts directly to the SafeHer Android application.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAccountModal}
            className="py-1.5 px-3 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shrink-0"
          >
            Sign In to Sync
          </button>
        </div>
      )}

      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Contacts Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent mx-auto mb-3" />
          Loading trusted contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="py-16 text-center rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Contacts Configured</h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Add parents, guardians, siblings, or close friends who should receive immediate emergency dispatches.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-1 rounded-[2rem] bg-white/5 border border-white/10 shadow-md group hover:border-[var(--color-primary)]/30 transition-all"
            >
              <div className="p-5 rounded-[calc(2rem-0.25rem)] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col justify-between h-full space-y-4">
                
                {/* Top: Name & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-sm flex items-center justify-center shadow-inner shrink-0">
                      {contact.name[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--color-text-primary)] line-clamp-1">
                        {contact.name}
                      </h4>
                      <span className="inline-block text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded-full border border-[var(--color-border)] mt-0.5">
                        {contact.relation}
                      </span>
                    </div>
                  </div>

                  {contact.is_primary && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-500" />
                      Primary
                    </span>
                  )}
                </div>

                {/* Middle: Phone details */}
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-primary)]">
                    <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    <span>{contact.phone}</span>
                  </div>
                  <button
                    onClick={() => setTestModalContact(contact)}
                    className="text-[10px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Preview SMS
                  </button>
                </div>

                {/* Bottom: Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6">
              This contact will be stored on the SafeHer backend and notified in real emergencies.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Mobile Number (with Country Code)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Relationship
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Friend">Close Friend</option>
                  <option value="Colleague">Colleague / Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="primaryContact"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                />
                <label htmlFor="primaryContact" className="text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer">
                  Designate as Primary Emergency Contact (Notified First)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS PREVIEW MODAL */}
      {testModalContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setTestModalContact(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
              Simulated SMS Dispatch Format
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              To: {testModalContact.name} ({testModalContact.phone})
            </p>

            <div className="p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-primary)] space-y-2">
              <p className="text-red-500 font-bold">[EMERGENCY SOS ALERT]</p>
              <p>
                "SafeHer Alert: {profile?.name || 'Your contact'} has triggered an Emergency SOS at 28.6139° N, 77.2090° E. Battery: 84%.
              </p>
              <p className="text-blue-500 underline break-all">
                Live GPS Tracking: https://safeher.app/track/{user ? user.uid.substring(0, 8) : 'demo-user'}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Audio evidence recording uploaded to SafeHer Cloud S3."
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setTestModalContact(null)}
                className="py-2.5 px-5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
