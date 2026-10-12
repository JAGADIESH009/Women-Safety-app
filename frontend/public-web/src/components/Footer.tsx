import React from 'react';
import { 
  ShieldCheck,
  Smartphone
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
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] py-8 px-4 sm:px-6 text-xs text-[var(--text-secondary)]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        
        {/* Brand & Mission */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SafeHer" className="w-5 h-5 rounded-md object-cover shrink-0" />
          <span className="font-bold text-xs text-[var(--text-primary)] tracking-tight">SafeHer</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="text-[11px] text-[var(--text-secondary)]">
            Emergency Helpline: <strong className="text-[var(--text-primary)] font-mono">112 / 1091</strong>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px]">
          <button onClick={() => handleNav('dashboard')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Dashboard
          </button>
          <button onClick={() => handleNav('contacts')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Contacts
          </button>
          <button onClick={() => handleNav('resources')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Resources
          </button>
          <button onClick={() => handleNav('profile')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Profile
          </button>
          <span className="text-[var(--text-muted)]">•</span>
          <button onClick={() => handleNav('privacy')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => handleNav('terms')} className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
            Terms
          </button>
          <span className="text-[var(--text-muted)]">•</span>
          <a
            href={APP_CONFIG.apkDownloadUrl}
            download={APP_CONFIG.apkFilename}
            className="inline-flex items-center gap-1 hover:text-[var(--brand-primary)] transition-colors font-medium text-[var(--text-primary)]"
            title="Download Android APK"
          >
            <Smartphone size={11} className="text-[var(--brand-primary)]" />
            <span>Android APK</span>
          </a>
        </div>

        {/* Verification badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>© 2026 SafeHer</span>
        </div>

      </div>
    </footer>
  );
};
