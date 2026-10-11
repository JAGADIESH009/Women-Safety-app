import React, { useState } from 'react';
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

export const AppContent: React.FC = () => {
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const scrollToDemo = () => {
    const el = document.getElementById('interactive-demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAccountModal={() => setAccountModalOpen(true)} />
      
      <main id="main-content">
        <Hero onTriggerDemo={scrollToDemo} />
        <SafetyStatsBanner />
        <Features />
        <HowItWorks />
        <InteractiveDemo />
        <DownloadSection />
        <AboutSection />
        <ContactSection />
      </main>

      <Footer />

      <AccountModal 
        isOpen={accountModalOpen} 
        onClose={() => setAccountModalOpen(false)} 
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
