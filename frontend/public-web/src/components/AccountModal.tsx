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
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff
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
  const [showPassword, setShowPassword] = useState(false);
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
      }, 400);
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
      }, 400);
    }
  };

  const handleGuestChoice = () => {
    continueAsGuest();
    onClose();
    if (onNavigate) onNavigate('dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    if (onNavigate) onNavigate('welcome');
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md z-10 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border-strong)] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] overflow-y-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[var(--color-border)] p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img src="/logo.png" alt="SafeHer" className="w-full h-full rounded-lg object-cover" />
            </div>
            <div>
              <h3 id="account-modal-title" className="text-base font-bold text-[var(--color-text-primary)]">
                {user ? 'SafeHer Account' : 'Access SafeHer'}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {user ? 'Cloud-synchronized security profile' : 'Sign in or continue with instant access'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Banners */}
        {authError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Notice</p>
              <p>{authError}</p>
            </div>
          </div>
        )}

        {authSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{authSuccess}</p>
          </div>
        )}

        {/* AUTHENTICATED STATE */}
        {user ? (
          <div className="mt-5 space-y-5">
            {/* Profile Card */}
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  (user.displayName || user.email || 'U')[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[var(--color-text-primary)] truncate">
                  {profile?.name || user.displayName || 'SafeHer Guardian'}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Synced
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Blood: {profile?.bloodGroup || 'O+'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onClose(); if (onNavigate) onNavigate('dashboard'); }}
                  className="p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => { onClose(); if (onNavigate) onNavigate('contacts'); }}
                  className="p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Contacts</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => { onClose(); if (onNavigate) onNavigate('resources'); }}
                  className="p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Resources</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => { onClose(); if (onNavigate) onNavigate('profile'); }}
                  className="p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from SafeHer</span>
            </button>
          </div>
        ) : (
          /* UNAUTHENTICATED CHOICES */
          <div className="mt-5 space-y-5">
            
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--color-border)] w-full" />
              <span className="bg-[var(--color-bg)] px-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                Or email
              </span>
            </div>

            {/* Email Tabs */}
            <div className="space-y-3.5">
              <div className="flex p-0.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); clearAuthMessages(); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === 'signin' 
                      ? 'bg-[var(--color-primary)] text-white shadow-2xs' 
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); clearAuthMessages(); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    mode === 'register' 
                      ? 'bg-[var(--color-primary)] text-white shadow-2xs' 
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Ananya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Emergency Mobile (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="user@safeher.app"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); clearAuthMessages(); }}
                          className="text-[10px] text-[var(--color-primary)] hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-8 pr-8 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : mode === 'signin' ? (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>
            </div>

            {/* Guest choice */}
            <div className="pt-2 border-t border-[var(--color-border)] text-center">
              <button
                type="button"
                onClick={handleGuestChoice}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue as Guest without account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
