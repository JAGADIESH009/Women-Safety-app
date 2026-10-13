import React from 'react';
import { ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface MobileAppShowcaseProps {
  onExploreClick?: () => void;
}

export const MobileAppShowcase: React.FC<MobileAppShowcaseProps> = ({ onExploreClick }) => {
  return (
    <section 
      aria-label="SafeHer on Mobile Showcase"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: Minimalist Promotional Copy */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--brand-primary)]">
              SAFEHER FOR ANDROID
            </span>
          </div>

          {/* Editorial Display Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]">
              Safety, Closer to You.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Your trusted safety companion, designed to help you reach support when it matters.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Download Button with Android Icon */}
            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer group"
              title={`Download SafeHer for Android (${APP_CONFIG.apkSize})`}
              id="showcase-download-android-cta"
            >
              {/* Android Bugdroid Vector Icon */}
              <svg 
                className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9996.4482.9996.9993.0001.5511-.4485.9997-.9996.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9994.4482.9994.9993 0 .5511-.4483.9997-.9994.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4128 13.8533 8.125 12 8.125s-3.5902.2878-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3438 14.6589 0 18.7845h24c-.3438-4.1256-2.6889-7.5978-6.1185-9.4631" />
              </svg>
              <span>Download for Android</span>
            </a>

            {/* Secondary CTA: Explore SafeHer */}
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
            >
              <span>Explore SafeHer</span>
              <ArrowRight size={13} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Micro Specification Note */}
          <div className="pt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span className="font-mono">v{APP_CONFIG.version}</span>
            <span>•</span>
            <span>{APP_CONFIG.apkSize} APK</span>
            <span>•</span>
            <span>Android 8.0+</span>
          </div>

        </div>

        {/* Right Column: Premium 3D Phone Showcase */}
        <div className="lg:col-span-6 flex items-center justify-center py-2">
          <div className="phone-3d-wrapper relative w-full max-w-[260px] sm:max-w-[280px]">
            
            {/* Ambient Backlight Glow (Subtle and restrained) */}
            <div 
              className="absolute -inset-4 rounded-[56px] bg-gradient-to-tr from-[var(--brand-primary)]/15 via-rose-500/10 to-transparent blur-2xl -z-10 pointer-events-none" 
              aria-hidden="true" 
            />

            {/* 3D Phone Chassis with Realistic Bezel & Hardware Details */}
            <div className="phone-3d-chassis relative w-full aspect-[458/1024] rounded-[44px] bg-[#0E0C0D] p-[10px] shadow-[0_28px_60px_-15px_rgba(0,0,0,0.35),0_12px_28px_-10px_rgba(134,22,53,0.18)] border border-white/20 select-none">
              
              {/* Outer Metallic Bevel Ring */}
              <div className="absolute inset-0 rounded-[44px] border border-white/10 pointer-events-none" />

              {/* Hardware Side Volume Rocker (Left) */}
              <div className="absolute -left-[3px] top-[100px] w-[3px] h-[34px] rounded-l bg-neutral-600/80" />
              <div className="absolute -left-[3px] top-[144px] w-[3px] h-[34px] rounded-l bg-neutral-600/80" />

              {/* Hardware Power Key (Right) */}
              <div className="absolute -right-[3px] top-[116px] w-[3px] h-[44px] rounded-r bg-neutral-600/80" />

              {/* Phone Inner Screen UI with Real SafeHer Dashboard Screenshot */}
              <div className="relative w-full h-full rounded-[34px] bg-[#FAF7F6] overflow-hidden border border-white/10 shadow-inner">
                {/* Authentic Mobile App Screenshot */}
                <img 
                  src="/safeher-app-screen.png" 
                  alt="SafeHer Mobile App Live Dashboard showing safety readiness, emergency SOS trigger, and real-time location sharing" 
                  className="w-full h-full object-cover object-top select-none pointer-events-none"
                  loading="eager"
                  decoding="async"
                />

                {/* Diagonal Glass Reflection Highlight */}
                <div 
                  className="absolute inset-0 pointer-events-none z-30 opacity-25 bg-gradient-to-tr from-transparent via-white/15 to-transparent" 
                  aria-hidden="true"
                />
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
