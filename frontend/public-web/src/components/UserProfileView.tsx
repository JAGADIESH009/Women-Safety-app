import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Sparkles,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PageView } from '../types';

interface UserProfileViewProps {
  onNavigate?: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const UserProfileView: React.FC<UserProfileViewProps> = ({ 
  onOpenAccountModal 
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'O+');
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalNotes || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setBloodGroup(profile.bloodGroup || 'O+');
      setMedicalNotes(profile.medicalNotes || '');
      setAllergies(profile.allergies || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const ok = await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        bloodGroup,
        medicalNotes: medicalNotes.trim(),
        allergies: allergies.trim(),
      });
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError('Failed to save profile changes.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Personal Medical Record
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {user ? 'Server Synchronized' : 'Guest Local Profile'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">
            Emergency Health Profile
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Critical medical details attached to emergency alerts to assist first responders and designated trusted contacts.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="py-2.5 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)] flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Emergency Card
        </button>
      </div>

      {/* Guest notice */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Guest Mode: Profile Stored Locally</p>
              <p className="text-[11px] opacity-90">
                Sign in to sync your medical emergency card with the SafeHer Android application.
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

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile and medical details saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Primary Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled={Boolean(user)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] disabled:opacity-60 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Emergency Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Blood Group (Critical for First Responders)
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[var(--color-border)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Known Drug / Food Allergies
              </label>
              <textarea
                rows={3}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin allergy, severe peanut allergy (Carries EpiPen)"
                className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Essential Medical Notes
              </label>
              <textarea
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="e.g. Asthmatic, carries inhaler. Diabetic type 1."
                className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {user ? 'Changes are automatically pushed to the SafeHer cloud.' : 'Saved in current browser session.'}
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
