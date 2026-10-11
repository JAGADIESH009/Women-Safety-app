import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PageView } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: PageView) => void;
}

type AuthMode = 'signin' | 'register' | 'forgot';

export const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, 
  onClose,
  onNavigate 
}) => {
  const { 
    user, 
    profile, 
    loading, 
    authError, 
    authSuccess, 
    signInWithGoogle, 
    signInWithEmail, 
    registerWithEmail, 
    sendPasswordReset, 
    signOut, 
    continueAsGuest,
    clearAuthMessages
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const success = await signInWithGoogle();
    setIsSubmitting(false);
    if (success) {
      setTimeout(() => {
        onClose();
        if (onNavigate) onNavigate('dashboard');
      }, 500);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    let success = false;

    if (mode === 'signin') {
      success = await signInWithEmail(email, password);
    } else if (mode === 'register') {
      success = await registerWithEmail(email, password, name, phone);
    } else if (mode === 'forgot') {
      success = await sendPasswordReset(email);
    }

    setIsSubmitting(false);
    if (success && mode !== 'forgot') {
      setTimeout(() => {
        onClose();
        if (onNavigate) onNavigate('dashboard');
      }, 500);
    }
  };

  const handleGuestChoice = () => {
    continueAsGuest();
    onClose();
    if (onNavigate) onNavigate('dashboard');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog with Double-Bezel Architecture */}
      <div className="relative w-full max-w-lg z-10 p-1.5 rounded-[2rem] bg-white/10 border border-white/15 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
        <div className="bg-[var(--color-bg)] rounded-[calc(2rem-0.375rem)] border border-[var(--color-border)] p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 id="account-modal-title" className="text-xl font-bold text-[var(--color-text-primary)]">
                  {user ? 'SafeHer Companion Account' : 'Access SafeHer'}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {user ? 'Cloud-synchronized security profile' : 'Choose how you want to access SafeHer web'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Banners */}
          {authError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p>{authError}</p>
                {authError.includes('Authorized domains') && (
                  <div className="mt-2 text-[11px] bg-red-500/10 p-2 rounded border border-red-500/20">
                    <p className="font-semibold text-[var(--color-text-primary)]">How to fix in Firebase Console:</p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-[var(--color-text-secondary)] mt-1">
                      <li>Open <a href="https://console.firebase.google.com/project/women-protection-project/authentication/settings" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firebase Authentication Settings</a></li>
                      <li>Click "Authorized domains"</li>
                      <li>Add this domain: <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{window.location.hostname}</code></li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {authSuccess && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p>{authSuccess}</p>
            </div>
          )}

          {/* AUTHENTICATED STATE */}
          {user ? (
            <div className="mt-6 space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    (user.displayName || user.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-[var(--color-text-primary)] truncate">
                    {profile?.name || user.displayName || 'SafeHer Guardian'}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Cloud Synchronized
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      Blood: {profile?.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Companion Workspace
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => { onClose(); if (onNavigate) onNavigate('dashboard'); }}
                    className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Safety Dashboard</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Readiness & drill test</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => { onClose(); if (onNavigate) onNavigate('contacts'); }}
                    className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Trusted Contacts</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Sync emergency recipients</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => { onClose(); if (onNavigate) onNavigate('reports'); }}
                    className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Incident Reports</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Community safety feed</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => { onClose(); if (onNavigate) onNavigate('profile'); }}
                    className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Medical Profile</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Blood group & allergies</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Security info */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)] space-y-1">
                <p className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Zero Admin Privileges Guarantee
                </p>
                <p>
                  This account is configured as a standard user companion account. It does not possess admin privileges and cannot access private SOS histories or telemetry belonging to other users.
                </p>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from Companion Web
              </button>
            </div>
          ) : (
            /* UNAUTHENTICATED CHOICES: EXACTLY GOOGLE, EMAIL/PASSWORD, GUEST */
            <div className="mt-6 space-y-6">
              
              {/* CHOICE 1: CONTINUE WITH GOOGLE */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Option 1 — Fast Cloud Sync
                </p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[var(--color-border)] w-full" />
                <span className="bg-[var(--color-bg)] px-3 text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                  Or email & password
                </span>
              </div>

              {/* CHOICE 2: EMAIL & PASSWORD WITH TABS */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Option 2 — Email Account
                </p>

                {/* Sub-tabs */}
                <div className="flex p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); clearAuthMessages(); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      mode === 'signin' 
                        ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); clearAuthMessages(); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      mode === 'register' 
                        ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="Ananya Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                          Emergency Mobile (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="user@safeher.app"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                          Password
                        </label>
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => { setMode('forgot'); clearAuthMessages(); }}
                            className="text-[11px] text-[var(--color-primary)] hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : mode === 'signin' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In to SafeHer
                      </>
                    ) : mode === 'register' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create Free Companion Account
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Send Password Reset Link
                      </>
                    )}
                  </button>

                  {mode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      Back to Sign In
                    </button>
                  )}
                </form>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[var(--color-border)] w-full" />
                <span className="bg-[var(--color-bg)] px-3 text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                  Or instant access
                </span>
              </div>

              {/* CHOICE 3: CONTINUE AS GUEST */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Option 3 — Instant Guest Access
                </p>
                <button
                  type="button"
                  onClick={handleGuestChoice}
                  className="w-full p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] text-left group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[var(--color-text-primary)]">
                          Continue as Guest
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          Explore safety dashboard, test fake call & simulate SOS drills without an account
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </button>
              </div>

              {/* Privacy and transparency note */}
              <div className="pt-2 text-center text-[10px] text-[var(--color-text-muted)]">
                SafeHer does not sell personal records or harvest silent background coordinates. Ordinary accounts never receive administrator privileges.
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
