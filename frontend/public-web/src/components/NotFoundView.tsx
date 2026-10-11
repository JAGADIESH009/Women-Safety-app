import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import type { PageView } from '../types';

interface NotFoundViewProps {
  onNavigate: (view: PageView) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  return (
    <div className="py-24 px-4 max-w-xl mx-auto text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mx-auto flex items-center justify-center">
        <ShieldAlert className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
          404 Error
        </span>
        <h1 className="text-3xl font-black text-[var(--color-text-primary)]">
          Safety Route Not Found
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          The requested page or safety resource does not exist or has been relocated within the SafeHer ecosystem.
        </p>
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="py-3 px-6 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Home className="w-4 h-4" />
        Return to SafeHer Companion Home
      </button>
    </div>
  );
};
