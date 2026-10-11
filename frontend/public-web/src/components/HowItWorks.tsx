import React from 'react';
import { 
  Smartphone, 
  Send, 
  Server
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Incident Detection & Trigger',
      subtitle: 'Edge Hardware or Software',
      desc: 'Activated either via a single tap on the SafeHer mobile SOS widget, physical volume key press combination, or a paired Bluetooth IoT panic button via MQTT.',
      icon: Smartphone,
      details: [
        '3-second grace period with audio countdown',
        'Offline capability — triggers even without data',
        'Immediate high-accuracy GPS lock',
      ]
    },
    {
      step: '02',
      title: 'Multi-Channel Alert Dispatch',
      subtitle: 'SMS + Push + Telemetry',
      desc: 'The device instantly fires cellular SMS messages to your pre-stored emergency contacts and transmits a live incident payload to the FastAPI backend service.',
      icon: Send,
      details: [
        'Real-time Google Maps pin with coordinate accuracy',
        'Emergency SMS with battery % and timestamp',
        'FCM push notification broadcast',
      ]
    },
    {
      step: '03',
      title: 'SOC Monitoring & Cloud Evidence',
      subtitle: 'PostgreSQL & AWS S3 Archival',
      desc: 'The incident immediately appears on the Safety Operations Center (SOC) dashboard while audio evidence is uploaded directly to encrypted AWS S3 cloud storage.',
      icon: Server,
      details: [
        'Live incident tracking on Leaflet GIS maps',
        'Secure evidence audio recording stored on S3',
        'Incident status audit log & responder notes',
      ]
    },
  ];

  return (
    <section id="how-it-works" className="section how-it-works-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-brand">System Architecture</span>
          </div>
          <h2>How SafeHer Responds in an Emergency</h2>
          <p>
            From the initial trigger to cloud evidence archival, SafeHer utilizes a resilient multi-tier
            pipeline designed for zero data loss and rapid dispatch.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="card step-card">
                <div className="step-card-top">
                  <span className="step-number">{item.step}</span>
                  <div className="step-icon-wrap">
                    <Icon size={22} className="text-brand" />
                  </div>
                </div>

                <div className="step-subtitle">{item.subtitle}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>

                <div className="step-details-list">
                  {item.details.map((detail, dIndex) => (
                    <div key={dIndex} className="step-detail-row">
                      <span className="step-bullet">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {index < steps.length - 1 && (
                  <div className="step-connector-line" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
