import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  LogIn,
  Smartphone
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
  const { user, isGuest, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Authenticated users get all 4 primary areas. Guests get public areas only.
  const navLinks: { label: string; view: PageView; icon: React.ReactNode }[] = user
    ? [
        { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard size={14} /> },
        { label: 'Emergency Contacts', view: 'contacts', icon: <Users size={14} /> },
        { label: 'Safety Resources', view: 'resources', icon: <BookOpen size={14} /> },
        { label: 'Profile', view: 'profile', icon: <UserIcon size={14} /> },
      ]
    : [
        { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard size={14} /> },
        { label: 'Safety Resources', view: 'resources', icon: <BookOpen size={14} /> },
      ];

  const handleLinkClick = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    onNavigate('welcome');
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-base)]/85 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => handleLinkClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer shrink-0" 
            aria-label="SafeHer Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-medium)] p-1 flex items-center justify-center shadow-xs group-hover:border-[var(--brand-primary)] transition-colors shrink-0">
              <img 
                src="/logo.png" 
                alt="SafeHer Logo" 
                className="w-full h-full rounded-lg object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} 
              />
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" style={{ display: 'none' }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">SafeHer</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                Companion
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (Centered) */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button 
                key={link.label} 
                onClick={() => handleLinkClick(link.view)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === link.view 
                    ? 'bg-[var(--brand-primary)] text-white shadow-xs' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={isDark ? "Switch to Warm Ivory" : "Switch to Dark Wine"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Small Unobtrusive APK Download Button */}
            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-primary)] text-xs font-semibold transition-all shrink-0"
              title="Download SafeHer Android APK"
            >
              <Smartphone size={13} className="text-[var(--brand-primary)]" />
              <span>Android APK</span>
            </a>

            {/* Account / Authentication State */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] transition-all cursor-pointer"
                  aria-label="User Account Menu"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[var(--text-primary)] hidden md:inline max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown size={13} className="text-[var(--text-muted)]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-medium)] rounded-2xl shadow-[var(--shadow-elevated)] z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {user.displayName || 'SafeHer User'}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">
                        {user.email}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleLinkClick('profile')}
                      className="w-full px-3 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserIcon size={14} />
                      <span>Profile & Medical</span>
                    </button>

                    <button 
                      onClick={() => handleLinkClick('contacts')}
                      className="w-full px-3 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Users size={14} />
                      <span>Emergency Contacts</span>
                    </button>

                    <div className="border-t border-[var(--border-subtle)] my-1"></div>

                    <button 
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : isGuest ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <span>Guest</span>
                </span>
                <button
                  onClick={onOpenAccountModal}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAccountModal}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] py-3 px-1 space-y-1 bg-[var(--bg-base)]">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.view)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentView === link.view
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}

            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            >
              <Smartphone size={14} className="text-[var(--brand-primary)]" />
              <span>Download Android APK</span>
            </a>

            {user && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out ({user.email})</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
