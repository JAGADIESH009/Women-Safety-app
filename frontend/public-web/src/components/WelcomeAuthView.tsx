import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Smartphone 
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
  const [showPassword, setShowPassword] = useState(false);
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
      await sendPasswordReset(email.trim());
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
        setValidationError('Please enter your name.');
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--brand-primary)] selection:text-white">
      
      {/* Top Header */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-medium)] p-1 flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="SafeHer" 
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" style={{ display: 'none' }} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">SafeHer</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
              title="Download Android APK"
            >
              <Smartphone size={12} className="text-[var(--brand-primary)]" />
              <span>Android APK</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Form: Minimal & Centered */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-sm mx-auto space-y-4">

          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {activeTab === 'signin' && 'Sign in to SafeHer'}
              {activeTab === 'register' && 'Create your account'}
              {activeTab === 'forgot' && 'Reset password'}
            </h1>
          </div>

          {/* Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3.5">
            
            {/* Feedback Notifications */}
            {(validationError || authError) && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>{validationError || authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-1.5">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Google Authentication */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

            {/* Subtle Divider */}
            <div className="relative text-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]"></div>
              </div>
              <span className="relative bg-[var(--bg-surface)] px-2 text-[10px] text-[var(--text-muted)] font-medium">
                or
              </span>
            </div>

            {/* Segmented Tab */}
            <div className="flex p-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => handleTabChange('signin')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-2.5">
              
              {activeTab === 'register' && (
                <>
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                      required={activeTab === 'register'}
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                    />
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                  required
                />
              </div>

              {activeTab !== 'forgot' && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-3 pr-8 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}

              {activeTab === 'register' && (
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span>
                    {activeTab === 'signin' && 'Sign In'}
                    {activeTab === 'register' && 'Create Account'}
                    {activeTab === 'forgot' && 'Send Reset Link'}
                  </span>
                )}
              </button>

              {activeTab === 'signin' && (
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {activeTab === 'forgot' && (
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleTabChange('signin')}
                    className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </form>

            {/* Minimal Guest Access */}
            <div className="pt-2 border-t border-[var(--border-subtle)] text-center">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors font-medium cursor-pointer"
              >
                Continue as guest
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Slim Footer */}
      <footer className="w-full py-3 px-4 text-center text-[10px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        SafeHer • Women's Safety Companion
      </footer>

    </div>
  );
};
