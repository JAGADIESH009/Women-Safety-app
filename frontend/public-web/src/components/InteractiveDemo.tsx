import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  PhoneCall, 
  PhoneOff, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  RotateCcw
} from 'lucide-react';

export const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sos' | 'fakecall' | 'readiness'>('sos');

  // SOS Simulator State
  const [sosStatus, setSosStatus] = useState<'idle' | 'countdown' | 'broadcasting'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [mockCoords] = useState({ lat: '13.0827', lng: '80.2707', acc: '4.2m' });
  const [mockSmsSent, setMockSmsSent] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (sosStatus === 'countdown') {
      if (countdown > 1) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        timer = setTimeout(() => {
          setSosStatus('broadcasting');
          setMockSmsSent(true);
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [sosStatus, countdown]);

  const handleStartSos = () => {
    setCountdown(3);
    setSosStatus('countdown');
    setMockSmsSent(false);
  };

  const handleCancelSos = () => {
    setSosStatus('idle');
    setCountdown(3);
    setMockSmsSent(false);
  };

  // Fake Call Simulator State
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callState === 'connected') {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Readiness Checklist State (matching HomeScreen.js formula)
  const [checklist, setChecklist] = useState({
    auth: true,       // 20% base
    location: true,   // 40%
    contacts: true,   // 40%
    notifications: true,
  });

  const readinessScore = 
    (checklist.auth ? 20 : 0) + 
    (checklist.location ? 40 : 0) + 
    (checklist.contacts ? 40 : 0);

  return (
    <section id="interactive-demo" className="section demo-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-brand">Browser Sandbox</span>
          </div>
          <h2>Experience SafeHer in Real Time</h2>
          <p>
            Test SafeHer’s actual interaction loops below. This interactive playground replicates the
            native logic executed by the Android APK.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="demo-tab-nav">
          <button 
            onClick={() => setActiveTab('sos')}
            className={`demo-tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
          >
            <Radio size={18} />
            <span>Emergency SOS Dispatch</span>
          </button>
          <button 
            onClick={() => setActiveTab('fakecall')}
            className={`demo-tab-btn ${activeTab === 'fakecall' ? 'active' : ''}`}
          >
            <PhoneCall size={18} />
            <span>Discreet Fake Call</span>
          </button>
          <button 
            onClick={() => setActiveTab('readiness')}
            className={`demo-tab-btn ${activeTab === 'readiness' ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>Safety Readiness Engine</span>
          </button>
        </div>

        {/* Tab 1: SOS Simulator */}
        {activeTab === 'sos' && (
          <div className="card demo-card">
            <div className="demo-card-grid">
              {/* Trigger UI */}
              <div className="demo-simulator-panel">
                <div className="simulator-header">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted">Module</span>
                    <span className="font-semibold text-sm">Emergency Room Simulator</span>
                  </div>
                  <div className={`status-pill ${sosStatus === 'broadcasting' ? 'pill-emergency' : 'pill-safe'}`}>
                    <span className="pill-dot" />
                    <span>{sosStatus === 'broadcasting' ? 'DISPATCH ACTIVE' : 'STANDBY'}</span>
                  </div>
                </div>

                <div className="sos-demo-center">
                  {sosStatus === 'idle' && (
                    <button 
                      onClick={handleStartSos}
                      className="demo-sos-btn"
                      title="Tap to begin 3-second SOS countdown"
                    >
                      <Radio size={36} />
                      <span className="font-bold text-lg mt-1">TEST SOS</span>
                      <span className="text-xs opacity-80">3s Countdown</span>
                    </button>
                  )}

                  {sosStatus === 'countdown' && (
                    <div className="demo-countdown-box">
                      <div className="demo-countdown-number">{countdown}</div>
                      <p className="text-sm font-medium mb-3">Emergency siren & SMS arming...</p>
                      <button 
                        onClick={handleCancelSos}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel (False Alarm)
                      </button>
                    </div>
                  )}

                  {sosStatus === 'broadcasting' && (
                    <div className="demo-broadcasting-box">
                      <div className="radar-ring" />
                      <div className="emergency-active-badge animate-pulse">
                        <AlertTriangle size={20} />
                        <span>EMERGENCY DISPATCH IN PROGRESS</span>
                      </div>
                      
                      <div className="audio-visualizer-mock">
                        <div className="audio-bar" style={{ height: '30%' }} />
                        <div className="audio-bar" style={{ height: '70%' }} />
                        <div className="audio-bar" style={{ height: '100%' }} />
                        <div className="audio-bar" style={{ height: '50%' }} />
                        <div className="audio-bar" style={{ height: '85%' }} />
                        <div className="audio-bar" style={{ height: '40%' }} />
                        <div className="audio-bar" style={{ height: '65%' }} />
                      </div>
                      <span className="text-xs text-rose text-center block mb-4">
                        ● Live microphone evidence streaming to AWS S3
                      </span>

                      <button 
                        onClick={handleCancelSos}
                        className="btn btn-secondary btn-sm"
                      >
                        <RotateCcw size={14} />
                        <span>Reset Simulation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Dispatch Feedback Console */}
              <div className="demo-console-panel">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Send size={15} className="text-brand" />
                  <span>Outgoing SMS Dispatch Payload</span>
                </h4>

                <div className="mock-sms-bubble">
                  <div className="sms-meta">
                    <span className="sms-sender">SafeHer System SMS</span>
                    <span className="sms-time">Just Now</span>
                  </div>
                  <p className="sms-body">
                    <strong>EMERGENCY ALERT:</strong> I am in danger and triggered SafeHer SOS. My current location is:
                    <br />
                    <span className="sms-link">
                      https://maps.google.com/?q={mockCoords.lat},{mockCoords.lng}
                    </span>
                    <br />
                    Accuracy: {mockCoords.acc} • Battery: 94% • Tracking Active
                  </p>
                </div>

                <div className="dispatch-log-card">
                  <div className="log-row">
                    <span className="log-label">GPS Fix:</span>
                    <span className="log-val text-emerald">Locked ({mockCoords.lat}° N, {mockCoords.lng}° E)</span>
                  </div>
                  <div className="log-row">
                    <span className="log-label">SMS Status:</span>
                    <span className="log-val">
                      {mockSmsSent ? '✓ Sent to 3 Contacts' : 'Awaiting Trigger'}
                    </span>
                  </div>
                  <div className="log-row">
                    <span className="log-label">SOC Incident:</span>
                    <span className="log-val">
                      {sosStatus === 'broadcasting' ? '#INC-2026-9481 (Open)' : 'Inactive'}
                    </span>
                  </div>
                  <div className="log-row">
                    <span className="log-label">Audio Capture:</span>
                    <span className="log-val">
                      {sosStatus === 'broadcasting' ? 'Recording • S3 Vault' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fake Call Simulator */}
        {activeTab === 'fakecall' && (
          <div className="card demo-card">
            <div className="fake-call-container">
              <div className="fake-call-phone">
                {callState === 'incoming' && (
                  <div className="call-incoming-view">
                    <div className="caller-avatar">
                      <span>M</span>
                    </div>
                    <h3 className="caller-name">Mom (Home)</h3>
                    <p className="caller-label">Mobile +91 98401 23456</p>

                    <div className="incoming-actions">
                      <button 
                        onClick={() => setCallState('ended')}
                        className="call-btn btn-decline"
                        title="Decline simulated call"
                      >
                        <PhoneOff size={24} />
                        <span>Decline</span>
                      </button>
                      <button 
                        onClick={() => setCallState('connected')}
                        className="call-btn btn-accept"
                        title="Answer simulated call"
                      >
                        <PhoneCall size={24} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                )}

                {callState === 'connected' && (
                  <div className="call-connected-view">
                    <div className="caller-avatar-small">
                      <span>M</span>
                    </div>
                    <h3 className="caller-name">Mom (Home)</h3>
                    <div className="call-timer font-mono">{formatCallTime(callDuration)}</div>

                    <p className="call-helper-text">
                      "I'm right outside waiting for you in the car, are you on your way down?"
                    </p>

                    <button 
                      onClick={() => {
                        setCallState('ended');
                        setCallDuration(0);
                      }}
                      className="call-btn btn-decline mt-6"
                    >
                      <PhoneOff size={24} />
                      <span>End Call</span>
                    </button>
                  </div>
                )}

                {callState === 'ended' && (
                  <div className="call-ended-view">
                    <h4 className="font-semibold mb-2">Simulated Call Ended</h4>
                    <p className="text-sm text-secondary mb-4">
                      The discreet call feature in SafeHer lets you immediately break away from unsafe conversations without raising alarm.
                    </p>
                    <button 
                      onClick={() => setCallState('incoming')}
                      className="btn btn-secondary btn-sm"
                    >
                      <RotateCcw size={14} />
                      <span>Simulate Again</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="fake-call-info">
                <span className="badge badge-warning mb-2">Discreet Safety Feature</span>
                <h3 className="text-xl font-bold mb-2">Designed for Discreet De-escalation</h3>
                <p className="text-secondary text-sm mb-4">
                  Sometimes you need a polite reason to leave an uncomfortable space before an emergency happens.
                  SafeHer includes an authentic caller screen that rings immediately on command.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>Realistic full-screen Android calling interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>Customizable caller name and ring delay timer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>Zero carrier charges — runs entirely locally</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Safety Readiness Calculator */}
        {activeTab === 'readiness' && (
          <div className="card demo-card">
            <div className="readiness-demo-grid">
              <div className="readiness-calculator-left">
                <h3 className="text-xl font-bold mb-2">Interactive Readiness Audit</h3>
                <p className="text-secondary text-sm mb-6">
                  SafeHer continuously tracks your device’s security posture using three core parameters:
                  authenticated user identity (20%), live GPS availability (40%), and trusted contacts configured (40%).
                </p>

                <div className="readiness-checklist">
                  <label className="checklist-item">
                    <input 
                      type="checkbox"
                      checked={checklist.location}
                      onChange={(e) => setChecklist(prev => ({ ...prev, location: e.target.checked }))}
                    />
                    <div>
                      <div className="font-semibold text-sm">Fine Location Permission (40%)</div>
                      <div className="text-xs text-muted">Required for high-accuracy GPS coordinates during alerts</div>
                    </div>
                  </label>

                  <label className="checklist-item">
                    <input 
                      type="checkbox"
                      checked={checklist.contacts}
                      onChange={(e) => setChecklist(prev => ({ ...prev, contacts: e.target.checked }))}
                    />
                    <div>
                      <div className="font-semibold text-sm">Trusted Contacts Registered (40%)</div>
                      <div className="text-xs text-muted">Pre-approved emergency recipients for direct SMS notifications</div>
                    </div>
                  </label>

                  <label className="checklist-item">
                    <input 
                      type="checkbox"
                      checked={checklist.auth}
                      onChange={(e) => setChecklist(prev => ({ ...prev, auth: e.target.checked }))}
                    />
                    <div>
                      <div className="font-semibold text-sm">Secure Authentication Session (20%)</div>
                      <div className="text-xs text-muted">Synchronizes emergency contacts and reports with cloud vault</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Readiness Meter */}
              <div className="readiness-gauge-panel">
                <div className="gauge-circle-wrap">
                  <div className="gauge-number">{readinessScore}%</div>
                  <div className="gauge-label">
                    {readinessScore === 100 
                      ? 'Maximum Protection' 
                      : readinessScore >= 60 
                      ? 'Moderate Protection' 
                      : 'Attention Required'}
                  </div>
                </div>

                <div className="gauge-progress-bar">
                  <div 
                    className="gauge-progress-fill"
                    style={{ 
                      width: `${readinessScore}%`,
                      backgroundColor: readinessScore === 100 ? 'var(--status-success)' : readinessScore >= 60 ? 'var(--status-warning)' : 'var(--status-emergency)'
                    }}
                  />
                </div>

                <p className="text-xs text-center text-muted mt-3">
                  {readinessScore === 100 
                    ? 'All security layers active and verified.' 
                    : 'Enable all permissions for guaranteed emergency response.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
