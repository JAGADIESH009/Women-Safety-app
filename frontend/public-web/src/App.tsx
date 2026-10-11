import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SafetyStatsBanner } from './components/SafetyStatsBanner';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { InteractiveDemo } from './components/InteractiveDemo';
import { DownloadSection } from './components/DownloadSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AccountModal } from './components/AccountModal';

// New Web Companion App Views
import { WebDashboard } from './components/WebDashboard';
import { ContactsManager } from './components/ContactsManager';
import { IncidentReporting } from './components/IncidentReporting';
import { UserProfileView } from './components/UserProfileView';
import { SafetyResourcesView } from './components/SafetyResourcesView';
import { LegalViews } from './components/LegalViews';
import { NotFoundView } from './components/NotFoundView';

import type { PageView } from './types';

export const AppContent: React.FC = () => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PageView>('home');

  // Hash-based SPA routing with browser history support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validViews: PageView[] = [
        'home', 
        'dashboard', 
        'features', 
        'contacts', 
        'reports', 
        'profile', 
        'resources', 
        'download', 
        'about', 
        'contact', 
        'privacy', 
        'terms'
      ];
      
      if (validViews.includes(hash as PageView)) {
        setCurrentView(hash as PageView);
      } else if (!hash) {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: PageView) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDemo = () => {
    navigateTo('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onTriggerDemo={scrollToDemo} onNavigate={navigateTo} />
            <SafetyStatsBanner />
            <Features onExploreDashboard={() => navigateTo('dashboard')} />
            <HowItWorks />
            <InteractiveDemo />
            <DownloadSection />
            <AboutSection />
            <ContactSection />
          </>
        );

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

      case 'about':
        return (
          <div className="py-8">
            <AboutSection />
          </div>
        );

      case 'download':
        return (
          <div className="py-8">
            <DownloadSection />
          </div>
        );

      case 'contact':
        return (
          <div className="py-8">
            <ContactSection />
          </div>
        );

      case 'privacy':
        return <LegalViews view="privacy" onNavigate={navigateTo} />;

      case 'terms':
        return <LegalViews view="terms" onNavigate={navigateTo} />;

      default:
        return <NotFoundView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenAccountModal={() => setAccountModalOpen(true)} 
      />
      
      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Account / Guest / Google Auth Dialog */}
      <AccountModal 
        isOpen={accountModalOpen} 
        onClose={() => setAccountModalOpen(false)}
        onNavigate={navigateTo}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
