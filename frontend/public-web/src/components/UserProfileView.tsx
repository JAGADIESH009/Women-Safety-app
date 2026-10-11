import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Lock,
  LogIn,
  LogOut,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PageView } from '../types';

interface UserProfileViewProps {
  onNavigate?: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const UserProfileView: React.FC<UserProfileViewProps> = ({ 
  onNavigate,
  onOpenAccountModal 
}) => {
  const { user, profile, updateUserProfile, signOut } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'O+');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.displayName || '');
      setPhone(profile.phone || '');
      setBloodGroup(profile.bloodGroup || 'O+');
    }
  }, [profile, user]);

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

  const handleSignOut = async () => {
    await signOut();
    if (onNavigate) onNavigate('welcome');
  };

  // -------------------------------------------------------------
  // GUEST ACCESS RESTRICTION WALL
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="py-12 px-4 sm:px-6 max-w-xl mx-auto animate-fade-in text-center space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
              Account Profile Protected
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Your profile, emergency medical details, and authentication credentials require an active signed-in session. Sign in to view and manage your account.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAccountModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Sign In to Access Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED USER PROFILE VIEW
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              Identity & Medical Record
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <ShieldCheck size={11} />
              <span>Firebase Verified</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Account & Emergency Profile
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
            Personal identity and critical medical details synchronized across the SafeHer ecosystem.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>Profile changes saved and synchronized to the cloud.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Identity & Account Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <UserIcon size={16} className="text-[var(--color-primary)]" />
            <span>Account Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] opacity-80 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Firebase UID Info */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-[var(--color-primary)] shrink-0" />
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">Firebase Authentication Identity</p>
                <p className="text-[11px] font-mono text-[var(--color-text-muted)] truncate max-w-xs sm:max-w-md">
                  UID: {user.uid}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Active Match
            </span>
          </div>
        </div>

        {/* Emergency Contact & Medical Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <Activity size={16} className="text-[var(--color-primary)]" />
            <span>Emergency & Medical Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Your Primary Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
              />
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Used to verify dispatch and contact you during an emergency.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Shared with emergency medical responders if dispatch is required.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
