import React from 'react';
import { 
  Download, 
  ShieldCheck
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import type { PageView } from '../types';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (view: PageView) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-base)] py-8 px-4 sm:px-6 text-xs text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SafeHer" width={24} height={24} style={{ width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px' }} className="w-6 h-6 rounded-lg object-cover shrink-0" />
            <span className="font-extrabold text-sm text-[var(--color-text-primary)] tracking-tight">SafeHer</span>
          </div>
          <span className="hidden sm:inline text-[var(--color-text-muted)]">•</span>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Personal Safety Web Companion • Emergency Helpline: <strong className="text-[var(--color-text-primary)]">112 / 1091</strong>
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button onClick={() => handleNav('dashboard')} className="hover:text-[var(--color-primary)] transition-colors">
            Dashboard
          </button>
          <button onClick={() => handleNav('features')} className="hover:text-[var(--color-primary)] transition-colors">
            Safety Features
          </button>
          <button onClick={() => handleNav('contacts')} className="hover:text-[var(--color-primary)] transition-colors">
            Trusted Contacts
          </button>
          <button onClick={() => handleNav('resources')} className="hover:text-[var(--color-primary)] transition-colors">
            Resources
          </button>
          <button onClick={() => handleNav('profile')} className="hover:text-[var(--color-primary)] transition-colors">
            Profile
          </button>
          <span className="text-[var(--color-text-muted)]">•</span>
          <button onClick={() => handleNav('privacy')} className="hover:text-[var(--color-primary)] transition-colors">
            Privacy
          </button>
          <button onClick={() => handleNav('terms')} className="hover:text-[var(--color-primary)] transition-colors">
            Terms
          </button>
          <span className="text-[var(--color-text-muted)]">•</span>
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="inline-flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors font-medium text-[var(--color-text-primary)]"
            title="Download Android APK (84.6 MB)"
          >
            <Download size={12} className="text-[var(--color-primary)]" />
            <span>Android APK</span>
          </a>
        </div>

        {/* Verification badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>© {new Date().getFullYear()} SafeHer</span>
        </div>

      </div>
    </footer>
  );
};
