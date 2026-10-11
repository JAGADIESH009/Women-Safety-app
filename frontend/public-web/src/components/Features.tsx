import React from 'react';
import { 
  Radio, 
  Users, 
  Cpu, 
  Cloud, 
  PhoneOutgoing, 
  Map, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const Features: React.FC = () => {
  const verifiedFeatures = [
    {
      id: 'sos-dispatch',
      icon: Radio,
      category: 'Mission-Critical SOS',
      title: 'One-Tap Emergency SOS & Evidence Archival',
      description: 'Instant SOS trigger with a 3-second countdown window to prevent false alarms. Automatically initiates emergency audio recording and begins continuous high-frequency GPS coordinate streaming.',
      techStack: ['FastAPI Emergency Router', 'React Native Audio Capture', 'PostgreSQL Incidents Table'],
      highlight: '< 3s Alert Broadcast',
      color: 'var(--status-emergency)',
      bgColor: 'var(--status-emergency-bg)',
    },
    {
      id: 'trusted-network',
      icon: Users,
      category: 'Trusted Network',
      title: 'Automated SMS & Maps Dispatch to Contacts',
      description: 'Dispatches emergency SMS alerts directly to your designated guardian contacts containing live Google Maps tracking links, current battery level, and timestamped distress coordinates.',
      techStack: ['Android SMS Gateway', 'Encrypted Local Contact Store', 'Google Maps Geo-URI'],
      highlight: 'Carrier SMS Fallback',
      color: 'var(--status-success)',
      bgColor: 'var(--status-success-bg)',
    },
    {
      id: 'ai-risk-scoring',
      icon: Cpu,
      category: 'Artificial Intelligence',
      title: 'FastAPI Scikit-Learn Safety Risk Scoring',
      description: 'Backend intelligence module built with Scikit-learn to calculate real-time situational risk scores. Evaluates route history, time-of-day variables, and proactive device readiness.',
      techStack: ['Python Scikit-Learn Model', 'FastAPI AI Service', 'Dynamic Readiness Score'],
      highlight: 'Predictive Assessment',
      color: 'var(--brand-primary)',
      bgColor: 'var(--brand-subtle)',
    },
    {
      id: 'iot-cloud-arch',
      icon: Cloud,
      category: 'IoT & Cloud Systems',
      title: 'MQTT Wearable Pendants & AWS S3 Evidence Vault',
      description: 'Integrated MQTT messaging broker for tethered wearable panic pendants and physical triggers. Incident evidence is stored securely in AWS S3 buckets with tamper-proof audit trails.',
      techStack: ['MQTT Broker Protocol', 'AWS S3 Object Storage', 'Redis Telemetry Pub/Sub'],
      highlight: 'Hardware-Trigger Capable',
      color: 'var(--rose-accent)',
      bgColor: 'var(--brand-subtle)',
    },
    {
      id: 'discreet-fake-call',
      icon: PhoneOutgoing,
      category: 'Discreet Escape',
      title: 'Simulated Incoming Fake Call Generator',
      description: 'A discreet safety escape tool designed to generate an authentic-looking full-screen incoming phone call. Enables a natural, non-confrontational exit from unsafe or suspicious environments.',
      techStack: ['Native Call Screen Simulator', 'Custom Caller ID', 'One-Touch Quick Trigger'],
      highlight: 'Discreet Safety Exit',
      color: 'var(--status-warning)',
      bgColor: 'var(--status-warning-bg)',
    },
    {
      id: 'safe-navigation-reports',
      icon: Map,
      category: 'Geospatial Intelligence',
      title: 'Safe Zone Mapping & Community Hazard Reporting',
      description: 'Interactive map displaying verified safe zones, emergency police stations, and 24/7 medical facilities. Community members can submit verified hazard reports to alert other women.',
      techStack: ['Leaflet / OpenStreetMap', 'GPS Geofencing', 'FastAPI Locations Router'],
      highlight: 'Verified Safe Havens',
      color: 'var(--status-success)',
      bgColor: 'var(--status-success-bg)',
    },
  ];

  return (
    <section id="features" className="section features-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-brand">Verified Technical Capabilities</span>
          </div>
          <h2>Engineered for Reliability When Everything Else Fails</h2>
          <p>
            Unlike theoretical prototypes, every SafeHer capability is implemented and backed by real mobile,
            cloud, and machine learning components in the official repository.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="features-grid">
          {verifiedFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="card feature-card">
                <div className="feature-card-header">
                  <div 
                    className="feature-icon-box"
                    style={{ backgroundColor: feat.bgColor, color: feat.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="badge" style={{ backgroundColor: feat.bgColor, color: feat.color }}>
                    {feat.highlight}
                  </span>
                </div>

                <div className="feature-category">{feat.category}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.description}</p>

                {/* Technical Stack Tags */}
                <div className="feature-tech-tags">
                  {feat.techStack.map((tech) => (
                    <span key={tech} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Companion SOC Banner */}
        <div className="card card-elevated soc-companion-banner">
          <div className="soc-banner-content">
            <div className="soc-banner-icon">
              <ShieldCheck size={32} className="text-brand" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Companion Safety Operations Center (SOC)</h3>
              <p className="text-secondary text-sm">
                Active incidents triggered from the SafeHer mobile app synchronize immediately with the
                official SOC Dashboard for responder coordination, live map tracking, and resolution logging.
              </p>
            </div>
          </div>
          <div className="soc-banner-action">
            <a 
              href={APP_CONFIG.adminPortalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
            >
              <span>View Admin Dashboard</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
