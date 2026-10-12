import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountModal } from './components/AccountModal';

// Primary Application Views
import { WelcomeAuthView } from './components/WelcomeAuthView';
import { AuthenticatedLayout } from './components/AuthenticatedLayout';
import { WebDashboard } from './components/WebDashboard';
import { EmergencyView } from './components/EmergencyView';
import { FullMapPage } from './components/FullMapPage';
import { ContactsManager } from './components/ContactsManager';
import { IncidentReporting } from './components/IncidentReporting';
import { AuthenticatedMobileAppShowcase } from './components/AuthenticatedMobileAppShowcase';
import { UserProfileView } from './components/UserProfileView';
import { SafetyResourcesView } from './components/SafetyResourcesView';
import { LegalViews } from './components/LegalViews';
import { NotFoundView } from './components/NotFoundView';
import { LiveTrackingView } from './components/LiveTrackingView';

import type { PageView } from './types';

export const AppContent: React.FC = () => {
  const { user, isGuest, loading } = useAuth();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PageView | 'not-found'>('welcome');

  // Synchronize route with URL hash and authentication state
  useEffect(() => {
    if (loading) return;

    const syncRouteFromHash = () => {
      const fullHash = window.location.hash.replace('#', '').toLowerCase();
      const baseHash = fullHash.split('?')[0];

      const validAppViews: PageView[] = [
        'welcome',
        'dashboard',
        'emergency',
        'contacts',
        'incidents',
        'reports',
        'map',
        'mobile-app',
        'profile',
        'settings',
        'resources',
        'privacy',
        'terms',
        'track',
      ];

      if (baseHash === 'track' || fullHash.startsWith('track')) {
        setCurrentView('track');
        return;
      }

      if (!baseHash || baseHash === 'welcome') {
        if (user) {
          setCurrentView('dashboard');
          window.location.hash = 'dashboard';
        } else {
          setCurrentView('welcome');
        }
      } else if (validAppViews.includes(baseHash as PageView)) {
        setCurrentView(baseHash as PageView);
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
      <div className="min-h-screen bg-[#FAF7F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#EEE5E7] p-1.5 shadow-xs mb-4 animate-pulse overflow-hidden shrink-0 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="SafeHer Logo" 
            className="w-full h-full rounded-xl object-cover" 
          />
        </div>
        <p className="text-xs font-semibold text-[#28151D]">SafeHer</p>
        <p className="text-[11px] text-[#81747D] mt-1">Initializing secure session...</p>
      </div>
    );
  }

  // First-visit authentication / public welcome landing flow
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

  // Standalone recipient tracking view
  if (currentView === 'track') {
    return <LiveTrackingView onNavigate={navigateTo} />;
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

      case 'emergency':
        return <EmergencyView onNavigate={navigateTo} />;

      case 'map':
        return <FullMapPage onNavigate={navigateTo} />;

      case 'contacts':
        return (
          <ContactsManager 
            onNavigate={navigateTo} 
            onOpenAccountModal={() => setAccountModalOpen(true)} 
          />
        );

      case 'incidents':
      case 'reports':
        return <IncidentReporting onNavigate={navigateTo} />;

      case 'mobile-app':
        return <AuthenticatedMobileAppShowcase />;

      case 'profile':
      case 'settings':
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
    <>
      <AuthenticatedLayout currentView={currentView as PageView} onNavigate={navigateTo}>
        {renderCurrentView()}
      </AuthenticatedLayout>

      {/* Account / Guest Authentication Modal */}
      <AccountModal 
        isOpen={accountModalOpen} 
        onClose={() => setAccountModalOpen(false)} 
        onNavigate={navigateTo} 
      />
    </>
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
