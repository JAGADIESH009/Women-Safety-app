import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { APP_CONFIG } from '../config/appConfig';

interface WelcomeAuthViewProps {
  onEnterDashboard: () => void;
}

export const WelcomeAuthView: React.FC<WelcomeAuthViewProps> = ({ onEnterDashboard }) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    registerWithEmail, 
    sendPasswordReset, 
    continueAsGuest,
    loading, 
    authError, 
    authSuccess, 
    clearAuthMessages 
  } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTabChange = (tab: 'signin' | 'register' | 'forgot') => {
    setActiveTab(tab);
    setValidationError(null);
    clearAuthMessages();
  };

  const handleGoogleSignIn = async () => {
    setValidationError(null);
    const success = await signInWithGoogle();
    if (success) {
      onEnterDashboard();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearAuthMessages();

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (activeTab === 'forgot') {
      const sent = await sendPasswordReset(email.trim());
      if (sent) {
        // Keeps user on forgot tab with success message
      }
      return;
    }

    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
      if (!name.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      const success = await registerWithEmail(email.trim(), password, name.trim(), phone.trim());
      if (success) {
        onEnterDashboard();
      }
    } else {
      const success = await signInWithEmail(email.trim(), password);
      if (success) {
        onEnterDashboard();
      }
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    onEnterDashboard();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col justify-between py-8 px-4 sm:px-6 relative selection:bg-[var(--color-primary)] selection:text-white">
      {/* Top utility row */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium tracking-wide">SafeHer Cloud Online</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] transition-all"
          aria-label="Toggle dark/light theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        {/* Double-Bezel Outer Shell */}
        <div className="p-1 sm:p-1.5 rounded-[2rem] bg-gradient-to-b from-[var(--color-border)] to-transparent shadow-xl">
          {/* Inner Core */}
          <div className="bg-[var(--color-surface)] rounded-[calc(2rem-0.375rem)] border border-[var(--color-border)] p-6 sm:p-8 shadow-inner relative overflow-hidden">
            
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex p-2.5 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] mb-3.5 shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="SafeHer Shield" 
                  width={40}
                  height={40}
                  style={{ width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px' }}
                  className="sh-logo w-10 h-10 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <ShieldAlert className="w-10 h-10 text-[var(--color-primary)]" style={{ display: 'none' }} />
              </div>

              <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                SafeHer
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xs mx-auto">
                Official Web Companion. Manage trusted emergency contacts, review safety protocols, and audit personal readiness.
              </p>
            </div>

            {/* Error & Success Alerts */}
            {(validationError || authError) && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{validationError || authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{authSuccess}</span>
              </div>
            )}

            {/* Primary Choice 1: Continue with Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]"></div>
              </div>
              <span className="relative bg-[var(--color-surface)] px-3 text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                or with email
              </span>
            </div>

            {/* Choice 2: Email & Password Form */}
            {/* Tabs */}
            <div className="flex p-1 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] mb-4">
              <button
                type="button"
                onClick={() => handleTabChange('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signin'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('forgot')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'forgot'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Sharma"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                        required={activeTab === 'register'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    required
                  />
                </div>
              </div>

              {activeTab !== 'forgot' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>
                      {activeTab === 'signin' && 'Sign In'}
                      {activeTab === 'register' && 'Create Account'}
                      {activeTab === 'forgot' && 'Send Password Reset Link'}
                    </span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Choice 3: Continue as Guest */}
            <div className="pt-5 mt-5 border-t border-[var(--color-border)] text-center">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[var(--color-surface-elevated)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-xs transition-all flex items-center justify-center gap-2"
              >
                <Compass size={14} className="text-[var(--color-primary)]" />
                <span>Continue as Guest</span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-normal hidden sm:inline">(Explore dashboard tools)</span>
              </button>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                Guest sessions store contacts locally. No account required.
              </p>
            </div>

          </div>
        </div>

        {/* Secondary APK Download Link */}
        <div className="text-center mt-6">
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors py-1 px-3 rounded-full hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]"
          >
            <Download size={13} />
            <span>Looking for the Android APK? Direct Download (84.6 MB)</span>
          </a>
        </div>
      </div>

      {/* Subtle bottom note */}
      <div className="text-center text-[11px] text-[var(--color-text-muted)] pb-2">
        SafeHer Companion • Auxiliary Emergency Support Tool
      </div>
    </div>
  );
};
