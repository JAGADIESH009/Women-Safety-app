import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle2, 
  Car, 
  Moon, 
  Download
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import type { PageView } from '../types';

interface SafetyResourcesViewProps {
  onNavigate?: (view: PageView) => void;
}

export const SafetyResourcesView: React.FC<SafetyResourcesViewProps> = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Rapid Response Directory
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
            Direct Dial Ready
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">
          Emergency Resources & National Helplines
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Immediate contact numbers, tactical safety guidelines, and emergency action checklists.
        </p>
      </div>

      {/* Critical Life-Safety Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
        <div className="space-y-1">
          <p className="font-bold text-sm">Critical Emergency Disclaimer</p>
          <p>
            SafeHer is an auxiliary technology platform designed to streamline contact notification and evidence archival. 
            <strong> SafeHer does not replace government emergency services.</strong> If you are in immediate life-threatening danger, dial <strong>112</strong> immediately.
          </p>
        </div>
      </div>

      {/* National Helplines Directory Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Official Emergency Helplines (India)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_CONFIG.emergencyHotlines.map((hotline) => (
            <div
              key={hotline.number}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Official Emergency Line
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)] mt-1">
                  {hotline.name}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {hotline.desc}
                </p>
              </div>

              <a
                href={`tel:${hotline.number}`}
                className="py-2.5 px-4 rounded-xl bg-[var(--color-bg)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] text-center text-xs font-mono font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-500 group-hover:text-white" />
                <span>Call {hotline.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Tactical Field Guides */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Personal Safety Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Guide 1: Rideshare & Taxi Checklist */}
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                  Cab & Rideshare Protocol
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Pre-boarding & in-transit safety rules
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Always verify license plate, driver photo, and car model before entering.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Ask the driver "Who are you picking up?" — never volunteer your own name first.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Sit in the back seat to allow exit from either side and maintain spatial distance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Share live trip coordinates with a trusted contact via SafeHer.</span>
              </li>
            </ul>
          </div>

          {/* Guide 2: Solo Night Travel */}
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                  Solo Night Transit & Walking
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Pedestrian awareness and route choices
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep one ear free — avoid wearing dual noise-canceling headphones in unlit areas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Walk on well-lit thoroughfares rather than isolated alley shortcuts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Have the SafeHer mobile app ready on your phone home screen with Volume Button trigger enabled.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>If feeling followed, head toward a lit commercial shop, fuel station, or hotel lobby.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Action Banner */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-black">Get 24/7 Mobile Background Protection</h4>
          <p className="text-xs text-white/80 max-w-md">
            Download the SafeHer Android application for power button rapid SOS triggers, offline siren, and ambient AI risk detection.
          </p>
        </div>
        <a
          href={APP_CONFIG.downloadUrl}
          className="py-3 px-6 rounded-xl bg-white text-[var(--color-primary)] font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download SafeHer.apk
        </a>
      </div>

    </div>
  );
};
