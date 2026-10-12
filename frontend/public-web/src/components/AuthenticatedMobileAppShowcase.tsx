import React from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const AuthenticatedMobileAppShowcase: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FBE9EF] border border-[#A61945]/20 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A61945]" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#A61945]">
            SafeHer for Android
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#28151D]">
          Our Mobile App
        </h1>
        <p className="text-sm text-[#81747D] mt-1 max-w-xl">
          Take SafeHer everywhere you go. Your full women's safety companion with one-tap SOS, offline siren, and live background telemetry.
        </p>
      </div>

      {/* Main Grid: Info + 3D Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#EEE5E7] rounded-2xl p-6 sm:p-10 shadow-xs">
        
        {/* Left Column: Details & Download Button */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#28151D] leading-tight">
              Safety, Always Within Reach.
            </h2>
            <p className="text-sm text-[#5C4953] leading-relaxed">
              Equipped with locked-screen volume button triggers, immediate automated SOS calling, real-time GPS telemetry broadcasts, and zero-latency emergency circle sync.
            </p>
          </div>

          {/* Key Features List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-[#28151D]">
              <CheckCircle size={15} className="text-[#059669] shrink-0" />
              <span>Instant hardware volume-button panic trigger</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#28151D]">
              <CheckCircle size={15} className="text-[#059669] shrink-0" />
              <span>Direct SMS coordinates broadcast to emergency circle</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#28151D]">
              <CheckCircle size={15} className="text-[#059669] shrink-0" />
              <span>Real-time cloud sync with this desktop companion console</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#28151D]">
              <CheckCircle size={15} className="text-[#059669] shrink-0" />
              <span>Offline audible siren & active telemetry recording</span>
            </div>
          </div>

          {/* Download Action */}
          <div className="pt-2">
            <a
              href={APP_CONFIG.apkDownloadUrl}
              download={APP_CONFIG.apkFilename}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#A61945] hover:bg-[#8C1338] text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer"
              title="Download SafeHer for Android"
            >
              <Download size={16} />
              <span>Download for Android (APK)</span>
            </a>
            <div className="text-[11px] text-[#81747D] mt-2">
              Version 1.0.0 • 84.6 MB APK • Compatible with Android 8.0+
            </div>
          </div>
        </div>

        {/* Right Column: 3D Phone Showcase */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="phone-3d-wrapper relative w-full max-w-[280px] sm:max-w-[300px]">
            
            {/* Ambient Glow */}
            <div className="absolute -inset-4 rounded-[56px] bg-gradient-to-tr from-[#A61945]/15 via-rose-500/10 to-transparent blur-2xl -z-10 pointer-events-none" />

            {/* Realistic Phone Frame */}
            <div className="phone-3d-chassis relative w-full aspect-[9/18.8] rounded-[44px] bg-[#0E0C0D] p-[10px] shadow-[0_28px_60px_-15px_rgba(40,21,29,0.35)] border border-white/20 select-none">
              
              {/* Outer Metallic Bezel */}
              <div className="absolute inset-0 rounded-[44px] border border-white/10 pointer-events-none" />

              {/* Hardware Buttons */}
              <div className="absolute -left-[3px] top-[90px] w-[3px] h-[32px] rounded-l bg-neutral-600/80" />
              <div className="absolute -left-[3px] top-[130px] w-[3px] h-[32px] rounded-l bg-neutral-600/80" />
              <div className="absolute -right-[3px] top-[105px] w-[3px] h-[40px] rounded-r bg-neutral-600/80" />

              {/* Inner Phone Screen UI */}
              <div className="relative w-full h-full rounded-[36px] bg-[#120F11] overflow-hidden flex flex-col justify-between text-white border border-white/5 p-3.5">
                
                {/* Diagonal Glass Reflection */}
                <div className="absolute inset-0 pointer-events-none z-30 opacity-40 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />

                {/* Top Status & Notch */}
                <div className="flex items-center justify-between text-[10px] text-neutral-400 shrink-0 z-20 pt-1 px-1">
                  <span className="font-mono">09:41</span>
                  <div className="w-14 h-3 bg-black rounded-full flex items-center justify-end px-1 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700" />
                  </div>
                  <span className="font-mono text-[9px]">5G 100%</span>
                </div>

                {/* Mobile UI Body */}
                <div className="space-y-2.5 z-20 mt-2">
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">SafeHer Companion</div>
                    <div className="text-xs font-bold text-white">Good evening, Jagadiesh</div>
                  </div>

                  {/* Readiness Banner */}
                  <div className="p-2 rounded-lg bg-neutral-900/90 border border-white/10 text-left">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-emerald-400">
                      <span>✓ You're protected</span>
                      <span>100% Ready</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* SOS Center Button with Concentric Glow */}
                  <div className="py-2 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-rose-600/20 border border-rose-500/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                      <div className="w-16 h-16 rounded-full bg-[#E11D48] text-white flex flex-col items-center justify-center font-black shadow-inner">
                        <span className="text-xs tracking-wider">SOS</span>
                        <span className="text-[7px] font-medium opacity-80">HOLD 3S</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400 font-medium mt-1">Emergency Broadcast Ready</span>
                  </div>

                  {/* Guardian & Location Cards */}
                  <div className="grid grid-cols-2 gap-1.5 text-left">
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-white/5">
                      <div className="text-[8px] text-neutral-400">Guardian</div>
                      <div className="text-[10px] font-semibold text-white truncate">Sudha</div>
                      <div className="text-[8px] text-emerald-400">● Active</div>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-white/5">
                      <div className="text-[8px] text-neutral-400">GPS Live</div>
                      <div className="text-[10px] font-semibold text-white truncate">Inavolu</div>
                      <div className="text-[8px] text-emerald-400">● Accurate &lt;5m</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-1.5 border-t border-white/10 flex justify-around text-[8px] text-neutral-500 z-20">
                  <span className="text-rose-400 font-bold">Home</span>
                  <span>Contacts</span>
                  <span>Map</span>
                  <span>Profile</span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
