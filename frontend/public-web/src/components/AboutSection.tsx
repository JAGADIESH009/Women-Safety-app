import React from 'react';
import { 
  Lock, 
  Code2, 
  Cpu, 
  Server, 
  PhoneCall, 
  ExternalLink
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-brand">Project Mission & Architecture</span>
          </div>
          <h2>Engineered for Trust, Privacy & Survival</h2>
          <p>
            SafeHer was created to bridge the critical gap between emergency distress signals
            and actionable first-responder awareness without compromising user privacy.
          </p>
        </div>

        <div className="about-grid">
          {/* Left Column: Core Principles */}
          <div className="about-text-col">
            <h3 className="text-2xl font-bold mb-4">A Zero-Compromise Security Philosophy</h3>
            <p className="text-secondary text-base leading-relaxed mb-4">
              Traditional safety applications often suffer from fragile cloud-only architectures, intrusive tracking, 
              or subscription paywalls. SafeHer was architected as a mission-driven, production-ready system where 
              critical alerts execute on the edge first.
            </p>
            <p className="text-secondary text-base leading-relaxed mb-6">
              When an SOS is triggered, SMS messages leave your device instantly through the cellular carrier layer, 
              bypassing patchy 4G/5G mobile data dead zones. Simultaneously, high-frequency GPS telemetry and encrypted 
              audio recordings stream to our FastAPI backend for immediate responder coordination.
            </p>

            <div className="about-pillars-list">
              <div className="pillar-item">
                <div className="pillar-icon">
                  <Lock size={18} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Strict Privacy & Zero Monetization</h4>
                  <p className="text-xs text-secondary">
                    Your location telemetry is never sold or tracked in the background during normal use. GPS is broadcast only when an active incident is triggered.
                  </p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">
                  <Cpu size={18} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Edge + AI Synergy</h4>
                  <p className="text-xs text-secondary">
                    Local device logic ensures instant offline response, while backend machine learning evaluates contextual route risk factors.
                  </p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">
                  <Server size={18} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Open Architecture & Companion SOC</h4>
                  <p className="text-xs text-secondary">
                    Full integration with our web-based Safety Operations Center for authorized campus, enterprise, or responder dispatchers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Emergency Helplines & Tech Specs */}
          <div className="about-hotlines-col">
            {/* National Emergency Hotline Card */}
            <div className="card hotlines-card">
              <div className="hotlines-header">
                <PhoneCall size={20} className="text-rose" />
                <div>
                  <h4 className="font-bold text-base">Verified Emergency Helplines</h4>
                  <p className="text-xs text-secondary">Direct national emergency contacts</p>
                </div>
              </div>

              <div className="hotlines-list">
                {APP_CONFIG.emergencyHotlines.map((hotline) => (
                  <div key={hotline.number} className="hotline-row">
                    <div>
                      <div className="hotline-name">{hotline.name}</div>
                      <div className="hotline-desc">{hotline.desc}</div>
                    </div>
                    <a 
                      href={`tel:${hotline.number}`} 
                      className="hotline-number-badge"
                      title={`Call ${hotline.name}`}
                    >
                      {hotline.number}
                    </a>
                  </div>
                ))}
              </div>

              <div className="hotlines-footer">
                <span className="text-xs text-muted">
                  Note: SafeHer is designed to supplement, not replace, primary national emergency services.
                </span>
              </div>
            </div>

            {/* GitHub Open Source Card */}
            <div className="card card-elevated repo-meta-card mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-brand">Open Engineering</span>
                <span className="text-xs font-mono text-muted">Branch: master</span>
              </div>
              <h4 className="font-bold text-sm mb-1">Explore SafeHer on GitHub</h4>
              <p className="text-xs text-secondary mb-4">
                Explore the complete source code including FastAPI microservices, Flutter/Expo mobile app,
                and AI risk scoring engine.
              </p>
              <a 
                href={APP_CONFIG.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm w-full"
              >
                <Code2 size={15} />
                <span>View GitHub Repository</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
