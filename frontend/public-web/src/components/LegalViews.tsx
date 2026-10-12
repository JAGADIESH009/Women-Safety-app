import React from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import type { PageView } from '../types';

interface LegalViewsProps {
  view: 'privacy' | 'terms';
  onNavigate: (view: PageView) => void;
}

export const LegalViews: React.FC<LegalViewsProps> = ({ view, onNavigate }) => {
  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Return button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity cursor-pointer group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Return to Dashboard</span>
      </button>

      {view === 'privacy' ? (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Data Stewardship
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Privacy Policy & Security Standards
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Effective Date: October 2026 • SafeHer Open Architecture
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 text-xs text-[var(--color-text-secondary)] leading-relaxed shadow-xs">
            
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                1. Core Privacy Philosophy
              </h2>
              <p>
                SafeHer operates with strict zero-surveillance protocols. We believe a women's safety platform must protect user privacy with the same rigor as physical safety. We do not sell personal telemetry, do not engage in behavioral advertising, and do not harvest continuous silent background coordinates when the app is inactive.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                2. Information We Collect and Process
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-[var(--color-text-primary)]">Account Identification:</strong> When signing in via Firebase (Google or Email), your email address, display name, and unique user identifier (UID) are recorded to securely associate your trusted emergency contacts and profile.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Emergency Contacts:</strong> Phone numbers and names of individuals designated by you as emergency contacts. These records are strictly private to your authenticated account.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Health & Medical Summary:</strong> Optional blood group, allergies, and emergency medical notes you provide to assist paramedics during rescue operations.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Emergency SOS Telemetry:</strong> When an emergency SOS is triggered by you, real-time GPS coordinates, device battery level, and timestamp are captured and shared with your designated contacts.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Audio Evidence Archival:</strong> On native Android devices, a 10-second encrypted audio snippet is recorded during an SOS event and uploaded to AWS S3 as evidentiary protection.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                3. Browser Geolocation Usage
              </h2>
              <p>
                On this public web companion, browser geolocation is <strong>never captured automatically or silently</strong>. It is requested strictly upon explicit user interaction (such as clicking "Fetch My Location" in the incident report tool or running the browser drill simulator). You retain complete authority to deny browser location prompts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                4. Infrastructure & Security
              </h2>
              <p>
                Data is processed using industry-standard cloud infrastructure with encrypted transport:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-[var(--color-text-primary)]">Firebase Authentication & Firestore:</strong> Identity verification and contact sync.</li>
                <li><strong className="text-[var(--color-text-primary)]">Render / FastAPI:</strong> Machine learning risk scoring and contact management backend.</li>
                <li><strong className="text-[var(--color-text-primary)]">Amazon Web Services (AWS S3):</strong> Encrypted incident evidence archival.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                5. Data Retention & Deletion
              </h2>
              <p>
                You may request complete account and data removal at any time by contacting our technical team or removing your contacts within the dashboard.
              </p>
            </section>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Operational Terms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Terms of Service & Safety Disclaimer
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Effective Date: October 2026 • SafeHer Companion Web
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 text-xs text-[var(--color-text-secondary)] leading-relaxed shadow-xs">
            
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the SafeHer web companion or Android mobile application, you acknowledge and agree to these terms and the safety disclaimers detailed herein.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-red-600 dark:text-red-400">
                2. Critical Emergency Response Disclaimer
              </h2>
              <p>
                SafeHer is an auxiliary technological tool designed to alert personal contacts and archive incident telemetry. <strong className="text-[var(--color-text-primary)] font-semibold">SafeHer is not a government agency, police department, or certified emergency dispatch entity.</strong> In immediate danger, always contact the national emergency authority (<strong className="font-mono font-bold text-red-600 dark:text-red-400">112</strong> or <strong className="font-mono font-bold text-red-600 dark:text-red-400">1091</strong>).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                3. Technical & Network Dependencies
              </h2>
              <p>
                Functionality depends upon mobile network coverage, active internet connection, cellular SMS carrier pathways, device GPS sensor accuracy, and battery power. SafeHer cannot be held liable for delayed or undelivered alerts caused by telecommunication provider outages or depleted battery reserves.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                4. Web Companion vs Android Native App
              </h2>
              <p>
                The public web interface is designed as an informational companion, desktop management console, and simulation environment. Due to web browser security sandboxing, web applications cannot perform locked-screen volume button triggers, continuous background sensor polling, or background SMS broadcasts. These features require the installed SafeHer Android application.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                5. Responsible Community Conduct
              </h2>
              <p>
                Users agree not to submit fraudulent emergency alarms, malicious incident reports, or abusive communications. Misuse of emergency reporting features may result in permanent account suspension.
              </p>
            </section>

          </div>
        </div>
      )}

    </div>
  );
};
