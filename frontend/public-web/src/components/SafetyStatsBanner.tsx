import React from 'react';

export const SafetyStatsBanner: React.FC = () => {
  const metrics = [
    {
      metric: '0-Tap',
      title: 'Hardware Panic Trigger',
      desc: 'Physical volume key combo & Bluetooth MQTT wearable pendant integration',
    },
    {
      metric: '< 3s',
      title: 'Alert Broadcast Latency',
      desc: 'Instant carrier SMS dispatch with live Google Maps coordinate telemetry',
    },
    {
      metric: '100%',
      title: 'Offline SMS Resilience',
      desc: 'Sends distress payload through native cellular even when 4G/5G data is disabled',
    },
    {
      metric: 'AWS S3',
      title: 'Cloud Evidence Vault',
      desc: 'Tamper-proof encrypted emergency audio recording archival and SOC sync',
    },
  ];

  return (
    <section className="stats-banner-section">
      <div className="container">
        <div className="stats-grid">
          {metrics.map((item) => (
            <div key={item.title} className="stat-item">
              <div className="stat-metric">{item.metric}</div>
              <div className="stat-title">{item.title}</div>
              <div className="stat-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
