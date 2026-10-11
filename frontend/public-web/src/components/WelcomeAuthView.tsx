import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Compass,
  Sun,
  Moon,
  Sparkles,
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--brand-primary)] selection:text-white">
      
      {/* Top Header Navigation Bar */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              <img 
                src="/logo.png" 
                alt="SafeHer Logo" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" style={{ display: 'none' }} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">SafeHer</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand-primary)] border border-[var(--brand-border)]">
                Web Portal
              </span>
            </div>
          </div>

          {/* Right Header Utilities: Secondary APK Download & Theme Toggle */}
          <div className="flex items-center gap-3">
            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all shrink-0"
              title="Download SafeHer Android App APK"
            >
              <Smartphone size={13} className="text-[var(--brand-primary)]" />
              <span>Android APK</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label="Toggle visual theme"
              title={isDark ? "Switch to Warm Ivory" : "Switch to Dark Wine"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content: Balanced Layout */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Brand Panel (Desktop only, complementary context) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-border)] text-xs font-semibold text-[var(--brand-primary)] w-fit">
              <Sparkles size={13} />
              <span>Official Companion Experience</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                Your personal safety network, verified & synchronized.
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Connect your SafeHer account to manage trusted emergency contacts, review national helplines, and maintain cloud profile data alongside the Android mobile application.
              </p>
            </div>

            {/* Three Value Pillars */}
            <div className="space-y-3.5 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[var(--text-primary)]">Shared Cloud Contacts</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">Contacts configured here immediately synchronize with your SafeHer Android app.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 mt-0.5">
                  <Phone size={15} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[var(--text-primary)]">Verified Emergency Helplines</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">One-tap access to national police, women distress lines, and medical emergency centers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 mt-0.5">
                  <Compass size={15} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[var(--text-primary)]">Privacy First Architecture</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">Zero unauthorized background tracking. Uncompromising user data isolation.</p>
                </div>
              </div>
            </div>

            {/* Subtle Android APK note */}
            <div className="pt-2 text-xs text-[var(--text-muted)] flex items-center gap-2">
              <Download size={13} />
              <span>Android app available for automated hardware & SOS triggers.</span>
            </div>

          </div>

          {/* Right Column: Dedicated Authentication Panel */}
          <div className="w-full max-w-md mx-auto lg:col-span-7">
            
            {/* Double-Bezel Card Enclosure */}
            <div className="p-1 sm:p-1.5 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-elevated)]">
              
              {/* Inner Card Body */}
              <div className="bg-[var(--bg-surface)] rounded-[calc(1.5rem-0.25rem)] border border-[var(--border-subtle)] p-6 sm:p-8 relative">
                
                {/* Mobile-only header info */}
                <div className="text-center mb-6">
                  <div className="inline-flex p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] mb-3 shadow-xs">
                    <img 
                      src="/logo.png" 
                      alt="SafeHer" 
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <ShieldCheck className="w-10 h-10 text-[var(--brand-primary)]" style={{ display: 'none' }} />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    Welcome to SafeHer
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
                    Sign in to access your emergency contacts and safety tools.
                  </p>
                </div>

                {/* Error and Success Notices */}
                {(validationError || authError) && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span className="leading-snug">{validationError || authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccess}</span>
                  </div>
                )}

                {/* Option 1: Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-medium)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-subtle)]"></div>
                  </div>
                  <span className="relative bg-[var(--bg-surface)] px-3 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    or with email
                  </span>
                </div>

                {/* Tab switcher: Sign In / Create Account / Reset */}
                <div className="flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('signin')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'signin'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'forgot'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  
                  {activeTab === 'register' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Maya Sharma"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                            required={activeTab === 'register'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Phone Number <span className="font-normal text-[var(--text-muted)]">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                        required
                      />
                    </div>
                  </div>

                  {activeTab !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                          Password
                        </label>
                        {activeTab === 'signin' && (
                          <button
                            type="button"
                            onClick={() => handleTabChange('forgot')}
                            className="text-[10px] text-[var(--brand-primary)] hover:underline font-semibold cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>
                          {activeTab === 'signin' && 'Sign In to SafeHer'}
                          {activeTab === 'register' && 'Create Your Account'}
                          {activeTab === 'forgot' && 'Send Password Reset Link'}
                        </span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Option 3: Continue as Guest */}
                <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] text-center">
                  <button
                    type="button"
                    onClick={handleGuestEntry}
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Compass size={14} className="text-[var(--brand-primary)]" />
                    <span>Continue as Guest</span>
                  </button>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-snug">
                    View verified national emergency helplines & safety protocols without creating an account.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="w-full py-4 px-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        SafeHer Cloud Companion • Auxiliary Emergency Support Platform
      </footer>

    </div>
  );
};
