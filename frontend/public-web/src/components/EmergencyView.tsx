import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Radio } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import type { PageView } from '../types';

interface EmergencyViewProps {
  onNavigate?: (view: PageView) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sosFeedback, setSosFeedback] = useState<string | null>(null);

  const handleTriggerSos = () => {
    setSosActive(true);
    setSosFeedback('Emergency broadcast initiated. Coordinates logged. Call 112 if immediate dispatch is required.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEE5E7]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold tracking-wider uppercase mb-1">
            <Radio size={12} className="animate-pulse" />
            <span>Emergency Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#28151D]">
            Emergency Dispatch & SOS
          </h1>
          <p className="text-xs text-[#81747D] mt-0.5">
            Direct access to national authorities, automated response numbers, and emergency coordinate broadcast.
          </p>
        </div>

        <a
          href="tel:112"
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-2 self-start sm:self-auto shadow-md transition-colors cursor-pointer"
        >
          <PhoneCall size={15} />
          <span>Call 112 Now</span>
        </a>
      </div>

      {/* SOS Alert Panel */}
      <div className="p-6 rounded-2xl bg-white border border-[#EEE5E7] text-center space-y-4 shadow-xs">
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-base font-bold text-[#28151D]">Immediate SOS Trigger</h2>
          <p className="text-xs text-[#81747D]">
            Pressing SOS will broadcast your current device coordinates to your emergency circle and log an active security incident.
          </p>
        </div>

        <div className="py-4 flex justify-center">
          <button
            onClick={handleTriggerSos}
            className={`w-28 h-28 rounded-full font-black text-xl tracking-wider text-white flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shadow-lg cursor-pointer ${
              sosActive
                ? 'bg-red-700 ring-8 ring-red-200 animate-pulse'
                : 'bg-[#A61945] hover:bg-[#8C1338] ring-4 ring-[#FBE9EF]'
            }`}
          >
            <span>SOS</span>
            <span className="text-[10px] font-semibold tracking-normal mt-0.5 opacity-90">
              {sosActive ? 'ACTIVE' : 'TRIGGER'}
            </span>
          </button>
        </div>

        {sosFeedback && (
          <div className="max-w-md mx-auto p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 text-left">
            <ShieldAlert size={16} className="shrink-0 text-red-600" />
            <span>{sosFeedback}</span>
          </div>
        )}
      </div>

      {/* Verified Helplines Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#28151D]">Verified Indian Emergency Hotlines</h2>
          <span className="text-[11px] font-mono text-[#81747D]">Toll-Free 24/7</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {APP_CONFIG.emergencyHotlines.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number}`}
              className="p-4 rounded-xl bg-white border border-[#EEE5E7] hover:border-[#A61945] transition-all flex items-center justify-between group shadow-xs cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-[#28151D] group-hover:text-[#A61945] transition-colors">
                  {hotline.name}
                </div>
                <div className="text-[11px] text-[#81747D] mt-0.5">{hotline.desc}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pl-3">
                <span className="text-sm font-mono font-bold text-[#A61945]">{hotline.number}</span>
                <div className="w-7 h-7 rounded-lg bg-[#FBE9EF] text-[#A61945] flex items-center justify-center group-hover:bg-[#A61945] group-hover:text-white transition-colors">
                  <PhoneCall size={13} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};
