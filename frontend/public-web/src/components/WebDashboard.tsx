import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  Volume2,
  VolumeX,
  Radio,
  Lock,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { PageView, SafetyReadinessItem } from '../types';

interface WebDashboardProps {
  onNavigate: (view: PageView) => void;
  onOpenAccountModal: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ 
  onNavigate, 
  onOpenAccountModal 
}) => {
  const { user, profile } = useAuth();
  const [apiStatus, setApiStatus] = useState<{ status: string; online: boolean }>({
    status: 'checking...',
    online: true,
  });

  // Safety Drill State
  const [drillActive, setDrillActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [drillDispatched, setDrillDispatched] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simulatedCoords, setSimulatedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fake Call State
  const [callPending, setCallPending] = useState(false);
  const [callRinging, setCallRinging] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState('Mom');
  const [callDelay, setCallDelay] = useState(3);

  // Readiness Checklist
  const [checklist, setChecklist] = useState<SafetyReadinessItem[]>([
    {
      id: 'contacts',
      label: 'Trusted Contacts Configured',
      description: 'At least one primary emergency contact on file',
      points: 25,
      completed: true,
    },
    {
      id: 'medical',
      label: 'Emergency Medical Info',
      description: 'Blood group and essential allergies documented',
      points: 20,
      completed: Boolean(profile?.bloodGroup),
    },
    {
      id: 'hotlines',
      label: 'National Hotlines Memorized',
      description: 'Familiarity with National 112 and Women Helpline 1091',
      points: 20,
      completed: true,
    },
    {
      id: 'fakecall',
      label: 'Discreet Exit Strategy Rehearsed',
      description: 'Tested browser fake call simulator for awkward situations',
      points: 20,
      completed: false,
    },
    {
      id: 'drill',
      label: 'Emergency SOS Protocol Tested',
      description: 'Completed a simulated browser drill to understand dispatch flow',
      points: 15,
      completed: false,
    },
  ]);

  // Check backend health
  useEffect(() => {
    api.checkHealth().then(setApiStatus);
  }, []);

  // Update medical point if profile changes
  useEffect(() => {
    if (profile?.bloodGroup) {
      setChecklist(prev => prev.map(item => item.id === 'medical' ? { ...item, completed: true } : item));
    }
  }, [profile]);

  // Drill Countdown Timer
  useEffect(() => {
    let timer: any;
    if (drillActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (drillActive && countdown === 0) {
      setDrillActive(false);
      setDrillDispatched(true);
      // Play simulated tone
      if (soundEnabled) {
        playSimulatedTone();
      }
      setChecklist(prev => prev.map(item => item.id === 'drill' ? { ...item, completed: true } : item));
    }
    return () => clearTimeout(timer);
  }, [drillActive, countdown, soundEnabled]);

  // Active call duration timer
  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  // Simulated Web Audio Tone
  const playSimulatedTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 1200);
    } catch {
      // AudioContext not permitted or muted
    }
  };

  const startDrill = () => {
    setDrillDispatched(false);
    setCountdown(3);
    setDrillActive(true);
    // Grab sample coords or current
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setSimulatedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setSimulatedCoords({ lat: 28.6139, lng: 77.2090 })
      );
    } else {
      setSimulatedCoords({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const abortDrill = () => {
    setDrillActive(false);
    setCountdown(3);
  };

  const triggerFakeCall = () => {
    setCallPending(true);
    setTimeout(() => {
      setCallPending(false);
      setCallRinging(true);
      setChecklist(prev => prev.map(item => item.id === 'fakecall' ? { ...item, completed: true } : item));
    }, callDelay * 1000);
  };

  const answerCall = () => {
    setCallRinging(false);
    setCallActive(true);
    setCallDuration(0);
  };

  const endCall = () => {
    setCallRinging(false);
    setCallActive(false);
    setCallDuration(0);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const totalScore = checklist.reduce((acc, curr) => curr.completed ? acc + curr.points : acc, 0);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Banner: Guest vs Authenticated Status */}
      <div className="p-1 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
        <div className="p-6 rounded-[calc(2rem-0.25rem)] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
              user 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}>
              {user ? <ShieldCheck className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {user ? `Welcome back, ${profile?.name || 'Guardian'}` : 'Guest Safety Dashboard'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {user ? 'Cloud Synced' : 'Guest Session'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {user 
                  ? `Authenticated as ${user.email} • Changes automatically sync with SafeHer backend` 
                  : 'You are using SafeHer public web tools in guest mode. Data is stored locally in this browser.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!user ? (
              <button
                onClick={onOpenAccountModal}
                className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Sync Cloud</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('profile')}
                className="py-2.5 px-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold hover:border-[var(--color-primary)] transition-colors"
              >
                <span>Edit Medical Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${apiStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Backend API</p>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">{apiStatus.online ? 'Online (FastAPI)' : 'Warming Up'}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Firebase Auth</p>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">{user ? 'Active Session' : 'Guest Ready'}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Risk AI Model</p>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">v1.2 Random Forest</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">Native Hardware</p>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">Android App Required</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Readiness Engine (Left) + Interactive Drills (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Readiness Engine & Quick Navigation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Readiness Score Card */}
          <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
            <div className="p-6 rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    Audit Engine
                  </span>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                    Safety Readiness Score
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[var(--color-text-primary)]">{totalScore}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">/ 100</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    totalScore >= 80 ? 'bg-emerald-500' : totalScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${totalScore}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-3 pt-2">
                {checklist.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer flex items-start gap-3 transition-colors"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      item.completed 
                        ? 'bg-emerald-500 text-white' 
                        : 'border border-[var(--color-text-muted)]'
                    }`}>
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${item.completed ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {item.label}
                        </p>
                        <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                          +{item.points} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Quick Safety Operations
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('contacts')}
                className="p-4 rounded-2xl bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left group transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Emergency Contacts</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Manage SMS recipients</p>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-4 rounded-2xl bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left group transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Incident Reports</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Hazard feed & report</p>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className="p-4 rounded-2xl bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left group transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Medical Profile</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Blood group & notes</p>
              </button>

              <button
                onClick={() => onNavigate('resources')}
                className="p-4 rounded-2xl bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-left group transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Helplines 112 / 1091</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Direct emergency lines</p>
              </button>
            </div>
          </div>

          {/* Android Native vs Web Capability Distinction Card */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-[var(--color-text-secondary)] space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>Web vs Android Native Capabilities</span>
            </div>
            <p>
              Web browsers cannot maintain locked-screen sensor loops, send background SMS texts without user interaction, or pair with Bluetooth panic buttons. 
            </p>
            <p className="font-semibold text-[var(--color-text-primary)]">
              For complete 24/7 background security, install the official SafeHer Android APK.
            </p>
          </div>

        </div>

        {/* Right Column: Interactive Sandboxes (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SIMULATED SOS DRILL CONTAINER */}
          <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
            <div className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                    Emergency Simulation
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                    SOS Protocol Drill
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Test the multi-channel alert pipeline safely in your browser without contacting real authorities.
                  </p>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  title={soundEnabled ? 'Mute simulation audio' : 'Enable simulation audio'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Main Drill Interactive View */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center space-y-6">
                
                {!drillActive && !drillDispatched && (
                  <div className="space-y-4">
                    <button
                      onClick={startDrill}
                      className="mx-auto w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-black text-lg shadow-xl shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center group"
                    >
                      <Radio className="w-6 h-6 mb-1 group-hover:animate-pulse" />
                      <span>START DRILL</span>
                    </button>
                    <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                      Initiates a 3-second abort window. Shows how GPS coordinates and automated SMS dispatches are orchestrated.
                    </p>
                  </div>
                )}

                {/* Active countdown */}
                {drillActive && (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="w-28 h-28 rounded-full border-4 border-red-500 mx-auto flex items-center justify-center bg-red-500/10">
                      <span className="text-4xl font-black text-red-500">{countdown}</span>
                    </div>
                    <p className="text-sm font-bold text-red-500">
                      SOS Triggering in {countdown} seconds...
                    </p>
                    <button
                      onClick={abortDrill}
                      className="py-2.5 px-6 rounded-full bg-[var(--color-surface)] border border-red-500 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Cancel / Abort Drill
                    </button>
                  </div>
                )}

                {/* Dispatched drill result */}
                {drillDispatched && (
                  <div className="space-y-5 py-2 text-left animate-fade-in">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">Simulated SOS Pipeline Dispatched Successfully</p>
                        <p className="text-[11px]">This was a drill. No actual SMS or emergency service was contacted.</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-[var(--color-text-primary)]">Simulated Dispatch Payloads:</p>
                      
                      <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between text-[var(--color-text-muted)]">
                          <span>SMS Payload:</span>
                          <span>[SENT SIMULATION]</span>
                        </div>
                        <p className="text-[var(--color-text-primary)]">
                          "EMERGENCY: SafeHer SOS activated by {profile?.name || 'User'} at Lat {simulatedCoords?.lat.toFixed(4)}, Lng {simulatedCoords?.lng.toFixed(4)}. Live track: https://safeher.app/track/drill-921"
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between text-[var(--color-text-muted)]">
                          <span>AWS S3 Audio Evidence:</span>
                          <span>[ARCHIVED]</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)]">
                          Evidence audio stream: encrypted 10s ambient recording stored with SHA-256 integrity seal.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDrillDispatched(false)}
                      className="py-2 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Reset Drill Simulator
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* DISCREET FAKE CALL SIMULATOR */}
          <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
            <div className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Tactical Escape Tool
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                    Discreet Fake Call Simulator
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Simulate an urgent incoming call to gracefully exit uncomfortable or suspicious situations.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Caller Identity
                  </label>
                  <select
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="Mom">Mom (Family Emergency)</option>
                    <option value="Campus Security">Campus Safety Office</option>
                    <option value="Ride Driver">Cab / Ride Partner</option>
                    <option value="Doctor Office">Clinic / Doctor</option>
                    <option value="Office Boss">Emergency Team Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Trigger Delay
                  </label>
                  <select
                    value={callDelay}
                    onChange={(e) => setCallDelay(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value={1}>Instant (1 second)</option>
                    <option value={3}>3 seconds</option>
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                  </select>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={triggerFakeCall}
                disabled={callPending || callRinging || callActive}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <PhoneCall className="w-4 h-4" />
                {callPending ? `Scheduling call in ${callDelay}s...` : 'Trigger Incoming Fake Call'}
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* INCOMING FAKE CALL MODAL OVERLAY */}
      {(callRinging || callActive) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-[#121212] text-white p-8 border border-white/20 shadow-2xl text-center space-y-8">
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
                {callRinging ? 'Incoming Call' : 'Call in Progress'}
              </span>
              <h2 className="text-3xl font-black">{callerName}</h2>
              <p className="text-xs text-white/60">
                {callRinging ? 'SafeHer Discreet Escape Service' : `Connected • ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
              </p>
            </div>

            <div className="w-24 h-24 rounded-full bg-white/10 mx-auto flex items-center justify-center animate-pulse">
              <PhoneCall className="w-10 h-10 text-emerald-400" />
            </div>

            {callRinging ? (
              <div className="flex items-center justify-around pt-4">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <PhoneCall className="w-6 h-6 rotate-[135deg]" />
                </button>
                <button
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <PhoneCall className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <p className="text-xs text-white/80 italic">
                  "Hello, please make your way to the exit now. I am waiting outside for you."
                </p>
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 mx-auto flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <PhoneCall className="w-6 h-6 rotate-[135deg]" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
