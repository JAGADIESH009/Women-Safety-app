import React from 'react';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import type { PageView } from '../types';

interface NotFoundViewProps {
  onNavigate: (view: PageView) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  return (
    <div className="py-20 px-4 max-w-md mx-auto text-center space-y-6 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 mx-auto flex items-center justify-center">
        <ShieldAlert className="w-7 h-7" />
      </div>
      
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
          404 Error
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Route Not Found
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          The requested safety resource or route does not exist or has been relocated within the SafeHer web companion.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="py-2.5 px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
