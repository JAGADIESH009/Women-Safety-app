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
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

interface NavbarProps {
  onOpenAccountModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAccountModal }) => {
  const { toggleTheme, isDark } = useTheme();
  const { user, signOut, isFirebaseAvailable } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Safety Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Interactive Demo', href: '#interactive-demo' },
    { label: 'Download APK', href: '#download' },
    { label: 'About SafeHer', href: '#about' },
    { label: 'Support & Help', href: '#support' },
  ];

  return (
    <header className="site-header">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo & Brand */}
          <a href="#" className="brand-logo" aria-label="SafeHer Home">
            <div className="logo-icon-wrap">
              <img src="/logo.png" alt="SafeHer Shield Logo" className="brand-icon" onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }} />
              <ShieldAlert className="brand-fallback-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">SafeHer</span>
              <span className="brand-badge">Android v1.0</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
            
            {/* Admin Portal Link */}
            <a 
              href={APP_CONFIG.adminPortalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="nav-link nav-link-admin"
              title="Official Safety Operations Center Dashboard"
            >
              <span>Admin SOC</span>
              <ExternalLink size={13} />
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
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Google Auth / Account */}
            {isFirebaseAvailable && (
              <div className="auth-menu-container">
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="user-profile-btn"
                      aria-label="User Account Menu"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar-img" />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="user-name-short">{user.displayName?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown size={14} />
                    </button>

                    {userDropdownOpen && (
                      <div className="user-dropdown-menu">
                        <div className="dropdown-user-info">
                          <p className="font-semibold text-sm">{user.displayName || 'SafeHer User'}</p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                        <div className="dropdown-divider" />
                        <button 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAccountModal();
                          }}
                          className="dropdown-item"
                        >
                          <UserIcon size={15} />
                          <span>Safety Companion</span>
                        </button>
                        <button 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="dropdown-item dropdown-item-danger"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={onOpenAccountModal} 
                    className="btn btn-outline btn-sm auth-btn"
                    title="Sign in with Google Firebase"
                  >
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Direct APK Download CTA */}
            <a 
              href={APP_CONFIG.downloadUrl}
              download={APP_CONFIG.apkFilename}
              className="btn btn-primary btn-sm nav-download-btn"
              title="Download SafeHer Android APK v1.0.0 directly"
            >
              <Download size={15} />
              <span>Get APK</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label={mobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-inner">
            <nav className="mobile-nav-links">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={APP_CONFIG.adminPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-link text-brand flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Admin SOC Operations</span>
                <ExternalLink size={15} />
              </a>
            </nav>

            <div className="mobile-drawer-footer">
              <a 
                href={APP_CONFIG.downloadUrl}
                download={APP_CONFIG.apkFilename}
                className="btn btn-primary w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download size={17} />
                <span>Download SafeHer APK (84.6 MB)</span>
              </a>

              {user ? (
                <div className="mobile-user-row">
                  <div className="text-sm">
                    Signed in as <strong>{user.displayName || user.email}</strong>
                  </div>
                  <button 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccountModal();
                  }}
                  className="btn btn-secondary w-full"
                >
                  <LogIn size={16} />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
