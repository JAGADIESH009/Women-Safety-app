import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Send, 
  History, 
  ShieldAlert, 
  Info,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';
import type { IncidentReport, PageView } from '../types';

interface IncidentReportingProps {
  onNavigate?: (view: PageView) => void;
  onOpenAccountModal?: () => void;
}

const INCIDENT_TYPES = [
  'Harassment',
  'Theft',
  'Assault',
  'Stalking',
  'Suspicious Person',
  'Unsafe Location',
];

export const IncidentReporting: React.FC<IncidentReportingProps> = () => {
  const [incidentType, setIncidentType] = useState('Harassment');
  const [description, setDescription] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Not requested');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<IncidentReport | null>(null);
  const [reportHistory, setReportHistory] = useState<IncidentReport[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = api.getLocalReports();
    setReportHistory(list);
  };

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting explicit permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus(`Captured: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`Permission denied or unavailable: ${err.message}. You can manually type the location below.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    const now = new Date();
    const trackingId = `#REP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReport: IncidentReport = {
      id: trackingId,
      type: incidentType,
      description: description.trim(),
      createdAt: now.toISOString(),
      location: {
        latitude: coords?.lat || 28.6139,
        longitude: coords?.lng || 77.2090,
        addressLabel: addressLabel.trim() || 'Manual Geotag',
        accuracy: coords ? 15 : 0,
      },
      status: 'Submitted',
      timeline: [
        {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: 'Incident report filed via SafeHer Companion Web',
          location: {
            latitude: coords?.lat || 28.6139,
            longitude: coords?.lng || 77.2090,
            addressLabel: addressLabel.trim() || 'Manual Geotag',
          },
        },
        {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: 'Secure evidence timestamped and stored',
        },
      ],
    };

    api.saveLocalReport(newReport);
    setSubmittedReport(newReport);
    loadHistory();
    setIsSubmitting(false);

    // Reset inputs
    setDescription('');
    setAddressLabel('');
    setCoords(null);
    setLocationStatus('Not requested');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
            Community Defense
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Anonymized Safety Feed
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">
          File Community Safety Report
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Report harassment, unlit pathways, stalking, or suspicious activity to keep women informed about potential danger zones.
        </p>
      </div>

      {/* Submission Success Banner */}
      {submittedReport && (
        <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Report Successfully Logged ({submittedReport.id})</h3>
                <p className="text-xs opacity-90">Your submission has been securely recorded with encrypted timestamp.</p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedReport(null)}
              className="text-xs font-bold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Report Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
            <div className="p-6 sm:p-8 rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
              
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                Incident Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Incident Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                    Incident Classification
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INCIDENT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setIncidentType(type)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center border ${
                          incidentType === type
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                            : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location with clear explanation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      Incident Location
                    </label>
                    <button
                      type="button"
                      onClick={requestBrowserLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      {isLocating ? 'Acquiring GPS...' : 'Fetch My Location'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Privacy Notice: No Silent Tracking</span>
                    </div>
                    <p>
                      SafeHer never captures location silently. Coordinates are only requested when you explicitly click "Fetch My Location".
                    </p>
                    {locationStatus !== 'Not requested' && (
                      <p className="font-mono text-[10px] text-[var(--color-text-primary)] pt-1 border-t border-[var(--color-border)]">
                        Status: {locationStatus}
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Area, Street Name, or Landmark (e.g. Near Metro Station Gate 3)"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Incident Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please describe what occurred, suspicious vehicle details, or hazards observed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Logging Report...' : 'Submit Incident Report'}
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* Right Column: Submitted Reports & Guidelines (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* History Card */}
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--color-text-muted)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  My Incident History
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                {reportHistory.length} Reports
              </span>
            </div>

            {reportHistory.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                No incidents reported yet on this device.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reportHistory.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-primary)]">{rep.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                        {rep.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                      <span>Type: <strong className="text-[var(--color-text-primary)]">{rep.type}</strong></span>
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-[11px] line-clamp-2">
                      {rep.description}
                    </p>
                    {rep.location.addressLabel && (
                      <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rep.location.addressLabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Reporting Protocol Card */}
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3 text-xs text-[var(--color-text-secondary)]">
            <h4 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--color-primary)]" />
              Reporting Guidelines
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>Never put yourself in danger to capture evidence or photographs.</li>
              <li>Reports are aggregated anonymously to highlight hazardous urban zones.</li>
              <li>If you are in immediate physical danger, dial <strong>112 (National Emergency)</strong> or <strong>1091 (Women Helpline)</strong> immediately.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
