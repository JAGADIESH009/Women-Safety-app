import React from 'react';
import { 
  Download, 
  ExternalLink, 
  PhoneCall, 
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
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Col 1: Brand & Mission */}
          <div className="footer-brand-col">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.png" alt="SafeHer" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
              <span className="font-extrabold text-xl tracking-tight text-[var(--color-text-primary)]">SafeHer</span>
            </div>
            <p className="text-secondary text-xs leading-relaxed max-w-sm mb-4">
              Women's Safety Application Using AI, IoT & Cloud Computing.
              Engineered for mission-critical reliability, offline resilience, and absolute privacy protection.
            </p>
            <div className="footer-emergency-note flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <PhoneCall size={14} className="flex-shrink-0" />
              <span className="text-xs">Emergency Helpline: <strong>112</strong> / <strong>1091</strong></span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div className="footer-links-col">
            <h4 className="footer-col-title text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-3">
              Companion Platform
            </h4>
            <ul className="footer-links-list space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Companion Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('dashboard')} className="hover:text-[var(--color-primary)] transition-colors text-left font-semibold text-[var(--color-primary)]">
                  Web Safety Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('features')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Safety Capabilities
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contacts')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Trusted Emergency Contacts
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reports')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Community Hazard Reports
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('profile')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Emergency Medical Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Support */}
          <div className="footer-links-col">
            <h4 className="footer-col-title text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-3">
              Resources & Help
            </h4>
            <ul className="footer-links-list space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li>
                <button onClick={() => handleNav('resources')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Emergency Hotlines Directory
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  About SafeHer Project
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('download')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Android APK Installation Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Contact & Support Desk
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Privacy Policy (Zero Surveillance)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-[var(--color-primary)] transition-colors text-left">
                  Terms of Emergency Use
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Ecosystem & Downloads */}
          <div className="footer-links-col">
            <h4 className="footer-col-title text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-3">
              Official Releases
            </h4>
            <ul className="footer-links-list space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              <li>
                <a 
                  href={APP_CONFIG.downloadUrl}
                  download={APP_CONFIG.apkFilename}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] font-semibold transition-all group"
                >
                  <Download size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs">SafeHer.apk (v1.0.0)</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-normal">84.6 MB • Android 8.0+</p>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href={APP_CONFIG.adminPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <span>Safety Operations Center (SOC)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a 
                  href={APP_CONFIG.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <span>GitHub Source Repository</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar pt-8 mt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} SafeHer. Open-source safety engineering under MIT License.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('privacy')} className="hover:underline">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => handleNav('terms')} className="hover:underline">
              Terms
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verified Companion
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
