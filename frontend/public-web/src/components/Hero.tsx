import React, { useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Radio, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Info
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface HeroProps {
  onTriggerDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onTriggerDemo }) => {
  const [phoneSosActive, setPhoneSosActive] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState<number | null>(null);

  const handlePhoneSosClick = () => {
    if (phoneSosActive) {
      setPhoneSosActive(false);
      setPhoneCountdown(null);
      return;
    }

    setPhoneCountdown(3);
    const interval = setInterval(() => {
      setPhoneCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setPhoneSosActive(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <section className="hero-section">
      <div className="hero-glow-backdrop" />
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Headlines & Download CTAs */}
          <div className="hero-content">
            {/* System Release Tag */}
            <div className="hero-badge-wrap">
              <span className="badge badge-brand">
                <Sparkles size={13} />
                <span>Production Release v1.0.0</span>
              </span>
              <span className="badge badge-success">
                <ShieldCheck size={13} />
                <span>Verified Release APK</span>
              </span>
            </div>

            <h1 className="hero-title">
              Proactive Protection When <span className="text-highlight">Seconds Matter</span>
            </h1>

            <p className="hero-subtitle">
              SafeHer is an autonomous personal security ecosystem engineered with AI risk evaluation, 
              IoT hardware trigger integration, multi-channel emergency broadcast, and tamper-resistant cloud telemetry.
            </p>

            {/* Direct APK Download Area */}
            <div className="hero-download-card">
              <div className="download-actions">
                <a 
                  href={APP_CONFIG.downloadUrl}
                  download={APP_CONFIG.apkFilename}
                  className="btn btn-primary btn-lg hero-cta-btn"
                  id="hero-download-apk-button"
                  title="Direct download SafeHer Android APK v1.0.0"
                >
                  <Download size={20} />
                  <span>Download SafeHer for Android</span>
                </a>

                <button 
                  onClick={onTriggerDemo}
                  className="btn btn-secondary btn-lg"
                  title="Test emergency simulation in browser"
                >
                  <span>Interactive Simulator</span>
                  <ArrowRight size={17} />
                </button>
              </div>

              {/* APK Specs & Browser Permission Notice */}
              <div className="apk-metadata-row">
                <div className="apk-specs">
                  <span className="spec-item">
                    <strong>Format:</strong> Android APK
                  </span>
                  <span className="spec-dot">•</span>
                  <span className="spec-item">
                    <strong>Size:</strong> {APP_CONFIG.apkSize}
                  </span>
                  <span className="spec-dot">•</span>
                  <span className="spec-item">
                    <strong>Req:</strong> {APP_CONFIG.minAndroidVersion}
                  </span>
                </div>

                <div className="install-notice-hint">
                  <Info size={14} className="text-muted flex-shrink-0" />
                  <span>
                    Direct download without app store logins. When installing, Android may ask to permit <em>"Install unknown apps"</em> from your browser.
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Proof Items */}
            <div className="hero-proof-list">
              <div className="proof-item">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>Direct SMS dispatch to trusted contacts with live maps</span>
              </div>
              <div className="proof-item">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>FastAPI Scikit-Learn risk analysis & route safety</span>
              </div>
              <div className="proof-item">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>MQTT panic pendant tethering & AWS S3 cloud evidence</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive SafeHer Mobile Companion Device */}
          <div className="hero-device-col">
            <div className="phone-mockup-wrapper animate-float">
              {/* Phone Outer Chassis */}
              <div className="phone-chassis">
                <div className="phone-speaker-notch" />

                {/* Phone Inner Screen UI */}
                <div className="phone-screen">
                  {/* Status Bar */}
                  <div className="phone-status-bar">
                    <span className="font-mono text-xs">09:41</span>
                    <div className="status-icons">
                      <Radio size={12} className="text-emerald animate-pulse" />
                      <span className="text-xs font-mono">LTE • 98%</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="phone-app-header">
                    <div className="flex items-center gap-2">
                      <div className="phone-logo-dot">
                        <img src="/logo.png" alt="SafeHer" className="w-5 h-5 rounded-full object-cover" />
                      </div>
                      <div>
                        <div className="phone-app-title">SafeHer Companion</div>
                        <div className="phone-app-subtitle">
                          {phoneSosActive ? 'CRITICAL DISPATCH ACTIVE' : 'Background Shield Active'}
                        </div>
                      </div>
                    </div>
                    <div className={`phone-status-pill ${phoneSosActive ? 'pill-emergency' : 'pill-safe'}`}>
                      <span className="pill-dot" />
                      <span>{phoneSosActive ? 'SOS ALERT' : 'SECURE'}</span>
                    </div>
                  </div>

                  {/* Readiness Card */}
                  <div className="phone-readiness-card">
                    <div className="readiness-meta">
                      <div className="text-xs text-muted">Safety Readiness</div>
                      <div className="font-bold text-sm text-emerald">100% Prepared</div>
                    </div>
                    <div className="readiness-bar-track">
                      <div className="readiness-bar-fill" style={{ width: '100%' }} />
                    </div>
                    <div className="readiness-tags">
                      <span>✓ GPS Active</span>
                      <span>✓ 3 Contacts</span>
                      <span>✓ Audio Rec Ready</span>
                    </div>
                  </div>

                  {/* SOS Interactive Trigger Area */}
                  <div className="phone-sos-center">
                    <div className={`sos-ring-outer ${phoneSosActive ? 'sos-ring-active' : ''}`}>
                      {phoneSosActive && <div className="radar-ring" />}
                      <button 
                        onClick={handlePhoneSosClick}
                        className={`phone-sos-btn ${phoneSosActive ? 'sos-btn-active' : ''}`}
                        aria-label="Simulate SafeHer SOS Emergency Trigger"
                        title="Click to simulate mobile SOS button"
                      >
                        {phoneCountdown !== null ? (
                          <div className="sos-countdown-text">{phoneCountdown}</div>
                        ) : phoneSosActive ? (
                          <>
                            <ShieldAlert size={36} className="text-white" />
                            <span className="sos-btn-label">CANCEL SOS</span>
                          </>
                        ) : (
                          <>
                            <Radio size={32} className="text-white" />
                            <span className="sos-btn-label">EMERGENCY SOS</span>
                            <span className="sos-sub-label">TAP TO TRIGGER</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="phone-sos-hint">
                      {phoneSosActive 
                        ? 'Broadcasting live coordinates & audio recording...' 
                        : 'Hold or tap to trigger 3s emergency countdown'}
                    </p>
                  </div>

                  {/* Telemetry Snapshot */}
                  <div className="phone-telemetry-box">
                    <div className="telemetry-row">
                      <MapPin size={13} className="text-brand" />
                      <span className="font-mono text-xs truncate">Lat 13.0827° N, Long 80.2707° E</span>
                    </div>
                    <div className="telemetry-row">
                      <PhoneCall size={13} className="text-emerald" />
                      <span className="text-xs">SMS Dispatch: Ready (3 Trusted Contacts)</span>
                    </div>
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="phone-bottom-nav">
                    <div className="phone-nav-item active">
                      <ShieldCheck size={16} />
                      <span>Protect</span>
                    </div>
                    <div className="phone-nav-item">
                      <MapPin size={16} />
                      <span>Safe Map</span>
                    </div>
                    <div className="phone-nav-item">
                      <PhoneCall size={16} />
                      <span>Fake Call</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Companion Floating Badge */}
              <div className="device-floating-badge">
                <Radio size={14} className="text-emerald animate-pulse" />
                <span>Connected to Cloud SOC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
