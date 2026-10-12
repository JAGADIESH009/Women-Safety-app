import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  ArrowRight,
  Wifi,
  BatteryMedium
} from 'lucide-react';
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
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="phone-3d-wrapper relative w-full max-w-[310px] sm:max-w-[330px]">
            
            {/* Ambient Backlight Glow (Subtle and restrained) */}
            <div 
              className="absolute -inset-4 rounded-[56px] bg-gradient-to-tr from-[var(--brand-primary)]/15 via-rose-500/10 to-transparent blur-2xl -z-10 pointer-events-none" 
              aria-hidden="true" 
            />

            {/* 3D Phone Chassis with Realistic Bezel & Hardware Details */}
            <div className="phone-3d-chassis relative w-full aspect-[9/18.8] rounded-[44px] bg-[#0E0C0D] p-[10px] shadow-[0_28px_60px_-15px_rgba(0,0,0,0.35),0_12px_28px_-10px_rgba(134,22,53,0.18)] border border-white/20 select-none">
              
              {/* Outer Metallic Bevel Ring */}
              <div className="absolute inset-0 rounded-[44px] border border-white/10 pointer-events-none" />

              {/* Hardware Side Volume Rocker (Left) */}
              <div className="absolute -left-[3px] top-[100px] w-[3px] h-[34px] rounded-l bg-neutral-600/80" />
              <div className="absolute -left-[3px] top-[144px] w-[3px] h-[34px] rounded-l bg-neutral-600/80" />

              {/* Hardware Power Key (Right) */}
              <div className="absolute -right-[3px] top-[116px] w-[3px] h-[44px] rounded-r bg-neutral-600/80" />

              {/* Phone Inner Screen UI */}
              <div className="relative w-full h-full rounded-[36px] bg-[#120F11] overflow-hidden flex flex-col justify-between text-white border border-white/5">
                
                {/* Diagonal Glass Reflection Highlight */}
                <div 
                  className="absolute inset-0 pointer-events-none z-30 opacity-40 bg-gradient-to-tr from-transparent via-white/10 to-transparent" 
                  aria-hidden="true"
                />

                {/* Top Status Bar & Camera Island */}
                <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-medium text-neutral-400 shrink-0 z-20">
                  <span className="font-mono text-[10px]">09:41</span>
                  {/* Dynamic Island / Earpiece */}
                  <div className="w-16 h-3.5 bg-black rounded-full flex items-center justify-end px-1.5 border border-white/5 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi size={11} className="text-neutral-400" />
                    <span className="text-[9px] font-mono">5G</span>
                    <BatteryMedium size={12} className="text-neutral-400" />
                  </div>
                </div>

                {/* App Screen Content: Replicating HomeScreen.js */}
                <div className="flex-1 px-4 py-2 flex flex-col justify-between space-y-2.5 z-10 overflow-hidden">
                  
                  {/* App Header (HomeScreen.js Greeting & Avatar) */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">SafeHer Companion</p>
                      <h4 className="text-xs font-semibold text-white tracking-tight">Good evening, Jagadiesh</h4>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold text-rose-300">
                      J
                    </div>
                  </div>

                  {/* Protection Status Banner (HomeScreen.js renderSafetyStatus) */}
                  <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-[11px] font-medium text-emerald-300">You're protected</span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400">100% Ready</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* Central SOS Emergency Trigger (SOSButton.js) */}
                  <div className="flex flex-col items-center justify-center py-2 relative">
                    {/* Concentric Pulse Rings */}
                    <div className="absolute w-28 h-28 rounded-full border border-rose-500/15 animate-ping opacity-25" />
                    <div className="absolute w-24 h-24 rounded-full border border-rose-500/25" />
                    
                    {/* SOS Core Button */}
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#861635] to-[#5c0d23] border-2 border-rose-400/40 shadow-[0_8px_20px_rgba(134,22,53,0.45)] flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black tracking-wider text-white">SOS</span>
                      <span className="text-[8px] font-medium text-rose-200 tracking-tight uppercase">Hold 3s</span>
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-2 font-medium">Emergency Broadcast Ready</span>
                  </div>

                  {/* Quick Cards Grid: Trusted Contact & Location Guard */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                        <Users size={10} className="text-rose-400" />
                        <span>Guardian</span>
                      </div>
                      <p className="text-[10px] font-semibold text-neutral-200 truncate">Sudha</p>
                      <p className="text-[8px] text-emerald-400 font-medium">● 7893748175</p>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                        <MapPin size={10} className="text-rose-400" />
                        <span>GPS Live</span>
                      </div>
                      <p className="text-[10px] font-semibold text-neutral-200">Location</p>
                      <p className="text-[8px] text-emerald-400 font-medium">● Accurate &lt; 5m</p>
                    </div>
                  </div>

                </div>

                {/* Bottom App Navigation Bar */}
                <div className="h-10 border-t border-neutral-800/80 bg-neutral-950/80 px-5 flex items-center justify-around text-neutral-500 shrink-0 z-20">
                  <div className="flex flex-col items-center text-rose-400">
                    <div className="w-1 h-1 rounded-full bg-rose-400 mb-0.5" />
                    <span className="text-[8px] font-medium">Home</span>
                  </div>
                  <span className="text-[8px]">Contacts</span>
                  <span className="text-[8px]">Map</span>
                  <span className="text-[8px]">Profile</span>
                </div>

                {/* Android Bottom Gesture Bar */}
                <div className="w-24 h-1 bg-neutral-600/60 rounded-full mx-auto my-1.5 shrink-0" />

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
