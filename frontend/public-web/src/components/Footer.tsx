import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  Lock, 
  PhoneCall, 
  FileText, 
  X
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const Footer: React.FC = () => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Col 1: Brand & Mission */}
            <div className="footer-brand-col">
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="SafeHer" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-xl tracking-tight">SafeHer</span>
              </div>
              <p className="text-secondary text-xs leading-relaxed max-w-sm mb-4">
                Smart Women Security Application using AI, IoT & Cloud Computing.
                Built for mission-critical reliability, offline resilience, and uncompromising privacy.
              </p>
              <div className="footer-emergency-note">
                <PhoneCall size={14} className="text-rose flex-shrink-0" />
                <span className="text-xs">Emergency Helpline: <strong>112</strong> / <strong>1091</strong></span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Platform</h4>
              <ul className="footer-links-list">
                <li><a href="#features">Safety Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#interactive-demo">Interactive Sandbox</a></li>
                <li><a href="#download">Download Android APK</a></li>
                <li><a href="#about">Project Mission</a></li>
                <li><a href="#support">Contact & Feedback</a></li>
              </ul>
            </div>

            {/* Col 3: Ecosystem & SOC */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Companion Ecosystem</h4>
              <ul className="footer-links-list">
                <li>
                  <a 
                    href={APP_CONFIG.adminPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <span>Safety Operations Center</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a 
                    href={APP_CONFIG.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a 
                    href={APP_CONFIG.downloadUrl}
                    download={APP_CONFIG.apkFilename}
                    className="flex items-center gap-1.5 text-brand"
                  >
                    <span>Direct APK Release (v1.0.0)</span>
                    <Download size={12} />
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => setPrivacyModalOpen(true)}
                    className="footer-text-btn"
                  >
                    Privacy Architecture
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setTermsModalOpen(true)}
                    className="footer-text-btn"
                  >
                    Terms of Emergency Use
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Verified Hotlines */}
            <div className="footer-hotlines-col">
              <h4 className="footer-col-title">Immediate Dispatch</h4>
              <div className="footer-hotlines-mini">
                <div className="mini-hotline">
                  <span className="hotline-tag">National Emergency</span>
                  <a href="tel:112" className="hotline-val">112</a>
                </div>
                <div className="mini-hotline">
                  <span className="hotline-tag">Women Distress</span>
                  <a href="tel:1091" className="hotline-val">1091</a>
                </div>
                <div className="mini-hotline">
                  <span className="hotline-tag">Police Dispatch</span>
                  <a href="tel:100" className="hotline-val">100</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <div className="text-xs text-muted">
              © {new Date().getFullYear()} SafeHer Platform. Open-source under Apache / MIT.
            </div>
            <div className="footer-legal-row">
              <span className="text-xs text-muted">
                Engineered by <strong className="text-secondary">JAGADIESH009</strong>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Architecture Modal */}
      {privacyModalOpen && (
        <div className="modal-backdrop" onClick={() => setPrivacyModalOpen(false)}>
          <div className="modal-card max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-brand" />
                <h3 className="font-bold text-base">SafeHer Privacy Architecture</h3>
              </div>
              <button onClick={() => setPrivacyModalOpen(false)} className="icon-btn">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body space-y-4 text-xs text-secondary leading-relaxed">
              <p>
                <strong>1. No Background Location Tracking:</strong> SafeHer does not harvest or track 
                your GPS coordinates during standard inactive use. GPS telemetry is queried and broadcast 
                strictly upon an intentional or confirmed SOS trigger event.
              </p>
              <p>
                <strong>2. Local Contact Vault:</strong> Your designated emergency contacts and phone numbers 
                are stored within hardened local encrypted storage on your Android device and shared only with 
                your verified authentication profile.
              </p>
              <p>
                <strong>3. Tamper-Proof Evidence:</strong> Emergency audio evidence captured during an 
                active distress incident is encrypted and transmitted directly to AWS S3 storage for potential 
                investigative review, shielded from local tampering or device theft.
              </p>
              <p>
                <strong>4. Zero Data Commercialization:</strong> SafeHer does not display advertisements, 
                does not bundle behavioral tracking SDKs, and never sells or licenses personal safety records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Emergency Use Modal */}
      {termsModalOpen && (
        <div className="modal-backdrop" onClick={() => setTermsModalOpen(false)}>
          <div className="modal-card max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-brand" />
                <h3 className="font-bold text-base">Terms of Emergency Use</h3>
              </div>
              <button onClick={() => setTermsModalOpen(false)} className="icon-btn">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body space-y-4 text-xs text-secondary leading-relaxed">
              <p>
                <strong>1. Supplement to Official Services:</strong> SafeHer is an auxiliary safety application 
                engineered to automate notification of personal emergency contacts and security coordinators. 
                It is not a replacement for official national police, fire, or ambulance dispatch.
              </p>
              <p>
                <strong>2. Hardware & Cellular Dependency:</strong> SMS and telemetry dispatch rely on 
                device hardware, battery level, cellular carrier reception, and GPS availability. While designed 
                with offline failovers, network connectivity limitations may affect instantaneous delivery.
              </p>
              <p>
                <strong>3. Non-Commercial Safety Tool:</strong> SafeHer is delivered as open-source software 
                for community and individual empowerment. Users are encouraged to maintain active testing of their 
                emergency contacts.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
