import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Download, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ExternalLink, 
  LogIn, 
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Activity,
  Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import type { PageView } from '../types';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenAccountModal 
}) => {
  const { toggleTheme, isDark } = useTheme();
  const { user, profile, isGuest, signOut, isFirebaseAvailable } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks: { label: string; view: PageView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'Features', view: 'features' },
    { label: 'Contacts', view: 'contacts' },
    { label: 'Reports', view: 'reports' },
    { label: 'Hotlines', view: 'resources' },
    { label: 'About', view: 'about' },
  ];

  const handleLinkClick = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="site-header">
      <div className="container">
        <div className="navbar-inner">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => handleLinkClick('home')}
            className="brand-logo text-left" 
            aria-label="SafeHer Home"
          >
            <div className="logo-icon-wrap">
              <img 
                src="/logo.png" 
                alt="SafeHer Shield Logo" 
                className="brand-icon" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} 
              />
              <ShieldAlert className="brand-fallback-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">SafeHer</span>
              <span className="brand-badge">Companion Web</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button 
                key={link.label} 
                onClick={() => handleLinkClick(link.view)} 
                className={`nav-link ${currentView === link.view ? 'active' : ''}`}
              >
                {link.label}
              </button>
            ))}
            
            {/* Admin Portal Link */}
            <a 
              href={APP_CONFIG.adminPortalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-link nav-link-admin"
              title="Official Safety Operations Center Dashboard"
            >
              <span>SOC Admin</span>
              <ExternalLink size={12} />
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="nav-actions">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Account / Guest Control */}
            {isFirebaseAvailable && (
              <div className="auth-menu-container relative">
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="user-profile-btn flex items-center gap-2 py-1.5 px-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                      aria-label="User Account Menu"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="user-name-short text-xs font-semibold text-[var(--color-text-primary)] hidden sm:inline">
                        {user.displayName?.split(' ')[0] || 'Guardian'}
                      </span>
                      <ChevronDown size={13} className="text-[var(--color-text-muted)]" />
                    </button>

                    {userDropdownOpen && (
                      <div className="user-dropdown-menu absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-2 z-50 animate-fade-in">
                        <div className="p-3 border-b border-[var(--color-border)]">
                          <p className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                            {profile?.name || user.displayName || 'SafeHer User'}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Cloud Synced
                          </span>
                        </div>
                        
                        <div className="py-1 space-y-0.5">
                          <button 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleLinkClick('dashboard');
                            }}
                            className="w-full text-left p-2 rounded-xl text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2.5 transition-colors"
                          >
                            <Activity size={14} className="text-[var(--color-primary)]" />
                            <span>Safety Dashboard</span>
                          </button>

                          <button 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleLinkClick('contacts');
                            }}
                            className="w-full text-left p-2 rounded-xl text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2.5 transition-colors"
                          >
                            <Users size={14} className="text-[var(--color-primary)]" />
                            <span>Trusted Contacts</span>
                          </button>

                          <button 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleLinkClick('profile');
                            }}
                            className="w-full text-left p-2 rounded-xl text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2.5 transition-colors"
                          >
                            <UserIcon size={14} className="text-[var(--color-primary)]" />
                            <span>Medical Profile</span>
                          </button>

                          <button 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenAccountModal();
                            }}
                            className="w-full text-left p-2 rounded-xl text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2.5 transition-colors"
                          >
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span>Account Details</span>
                          </button>
                        </div>

                        <div className="pt-1 border-t border-[var(--color-border)]">
                          <button 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              signOut();
                            }}
                            className="w-full text-left p-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors font-semibold"
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isGuest ? (
                  <button 
                    onClick={onOpenAccountModal}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                    title="You are in Guest Mode. Click to sign in or view options."
                  >
                    <Sparkles size={13} />
                    <span>Guest Mode</span>
                  </button>
                ) : (
                  <button 
                    onClick={onOpenAccountModal} 
                    className="btn btn-outline btn-sm auth-btn"
                    title="Sign in with Google, Email, or Guest"
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* PERSISTENT DIRECT APK DOWNLOAD CTA */}
            <a 
              href={APP_CONFIG.downloadUrl}
              download={APP_CONFIG.apkFilename}
              className="btn btn-primary btn-sm nav-download-btn flex items-center gap-1.5"
              title="Download SafeHer Android APK v1.0.0 directly (84.6 MB)"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download App</span>
              <span className="sm:hidden">APK</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label={mobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-fade-in p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl mt-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.view)}
                  className={`text-left p-3 rounded-xl text-xs font-semibold transition-colors ${
                    currentView === link.view
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <a 
                href={APP_CONFIG.adminPortalUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-between"
              >
                <span>SOC Admin Dashboard</span>
                <ExternalLink size={14} />
              </a>

              <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                <a 
                  href={APP_CONFIG.downloadUrl}
                  download={APP_CONFIG.apkFilename}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Download size={14} />
                  <span>Download SafeHer APK (84.6 MB)</span>
                </a>

                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccountModal();
                    }}
                    className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold"
                  >
                    Sign In / Guest Options
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};
