import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AccountModal } from './components/AccountModal';

// Application Views
import { WelcomeAuthView } from './components/WelcomeAuthView';
import { WebDashboard } from './components/WebDashboard';
import { Features } from './components/Features';
import { ContactsManager } from './components/ContactsManager';
import { IncidentReporting } from './components/IncidentReporting';
import { UserProfileView } from './components/UserProfileView';
import { SafetyResourcesView } from './components/SafetyResourcesView';
import { LegalViews } from './components/LegalViews';
import { NotFoundView } from './components/NotFoundView';

import type { PageView } from './types';

export const AppContent: React.FC = () => {
  const { user, isGuest, loading } = useAuth();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PageView | 'not-found'>('welcome');

  // Synchronize route with URL hash and authentication state
  useEffect(() => {
    if (loading) return;

    const syncRouteFromHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validAppViews: PageView[] = [
        'welcome',
        'dashboard',
        'features',
        'contacts',
        'resources',
        'profile',
        'reports',
        'privacy',
        'terms',
      ];

      if (!hash || hash === 'welcome') {
        // Root visit or explicit welcome hash
        if (user || isGuest) {
          // Returning authenticated user or active guest session -> Go directly to Dashboard
          setCurrentView('dashboard');
          window.location.hash = 'dashboard';
        } else {
          // New visitor or signed out -> Show Welcome / Authentication screen
          setCurrentView('welcome');
        }
      } else if (validAppViews.includes(hash as PageView)) {
        // If guest or authenticated, or accessing public resource/terms/privacy
        setCurrentView(hash as PageView);
      } else {
        setCurrentView('not-found');
      }
    };

    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, [user, isGuest, loading]);

  const navigateTo = (view: PageView) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-2 shadow-sm mb-4 animate-pulse overflow-hidden shrink-0" style={{ width: '48px', height: '48px' }}>
          <img src="/logo.png" alt="SafeHer" width={32} height={32} style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px' }} className="w-full h-full object-cover rounded-lg" />
        </div>
        <p className="text-xs font-semibold text-[var(--color-text-primary)]">SafeHer Companion</p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Initializing secure session...</p>
      </div>
    );
  }

  // First-visit authentication / welcome flow
  if (currentView === 'welcome') {
    return (
      <>
        <WelcomeAuthView onEnterDashboard={() => navigateTo('dashboard')} />
        <AccountModal 
          isOpen={accountModalOpen} 
          onClose={() => setAccountModalOpen(false)} 
          onNavigate={navigateTo} 
        />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <WebDashboard 
            onNavigate={navigateTo} 
            onOpenAccountModal={() => setAccountModalOpen(true)} 
          />
        );

      case 'features':
        return (
          <div className="py-6">
            <Features onExploreDashboard={() => navigateTo('dashboard')} />
          </div>
        );

      case 'contacts':
        return (
          <ContactsManager 
            onNavigate={navigateTo} 
            onOpenAccountModal={() => setAccountModalOpen(true)} 
          />
        );

      case 'reports':
        return (
          <IncidentReporting 
            onNavigate={navigateTo} 
            onOpenAccountModal={() => setAccountModalOpen(true)} 
          />
        );

      case 'profile':
        return (
          <UserProfileView 
            onNavigate={navigateTo} 
            onOpenAccountModal={() => setAccountModalOpen(true)} 
          />
        );

      case 'resources':
        return <SafetyResourcesView onNavigate={navigateTo} />;

      case 'privacy':
        return <LegalViews view="privacy" onNavigate={navigateTo} />;

      case 'terms':
        return <LegalViews view="terms" onNavigate={navigateTo} />;

      default:
        return <NotFoundView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Primary Application Header */}
      <Navbar 
        currentView={currentView as PageView} 
        onNavigate={navigateTo} 
        onOpenAccountModal={() => setAccountModalOpen(true)} 
      />

      {/* Main Product Application View */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Application Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Account / Guest Authentication Modal */}
      <AccountModal 
        isOpen={accountModalOpen} 
        onClose={() => setAccountModalOpen(false)} 
        onNavigate={navigateTo} 
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
