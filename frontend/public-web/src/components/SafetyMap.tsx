import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  MapPin, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SafetyMapProps {
  onLocationCaptured?: (lat: number, lng: number, accuracy: number) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({ onLocationCaptured }) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default overview center (India center)
    const initialLat = 20.5937;
    const initialLng = 78.9629;
    const initialZoom = 4;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      scrollWheelZoom: false, // Don't hijack page scroll
      attributionControl: false,
    });

    // Custom compact zoom controls in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer based on theme
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tiles;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tiles on theme change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [isDark]);

  // Request actual browser geolocation
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const locData: LocationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date(),
        };

        setLocation(locData);
        setIsLocating(false);

        if (onLocationCaptured) {
          onLocationCaptured(latitude, longitude, accuracy);
        }

        // Center map and render location marker
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 15, {
            duration: 1.5,
          });

          // Remove old markers
          if (markerRef.current) {
            markerRef.current.remove();
          }
          if (circleRef.current) {
            circleRef.current.remove();
          }

          // Minimalist pulsing location marker
          const customMarkerHtml = `
            <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #D14D72; border: 2.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(209, 77, 114, 0.25); animation: pulse 2s infinite;"></div>
            </div>
          `;

          const locationIcon = L.divIcon({
            className: 'safeher-location-marker',
            html: customMarkerHtml,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([latitude, longitude], { icon: locationIcon }).addTo(map);
          markerRef.current = marker;

          // Accuracy radius circle
          const circle = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 250),
            color: '#D14D72',
            weight: 1,
            opacity: 0.6,
            fillColor: '#D14D72',
            fillOpacity: 0.08,
          }).addTo(map);
          circleRef.current = circle;
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorStatus('Location permission was denied. You can enable it in your browser settings to verify your area.');
        } else if (err.code === err.TIMEOUT) {
          setErrorStatus('Location request timed out. Please try again.');
        } else {
          setErrorStatus('Unable to determine location: ' + err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationCaptured]);

  return (
    <div className="space-y-3">
      {/* Map Header / Location Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[var(--brand-primary)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Active Location & Surroundings
          </h2>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <RefreshCw size={12} className="animate-spin text-[var(--brand-primary)]" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation size={12} className="text-[var(--brand-primary)]" />
              <span>{location ? 'Update location' : 'Locate me'}</span>
            </>
          )}
        </button>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-[260px] sm:h-[300px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Unlocated Overlay Prompt */}
        {!location && !isLocating && !errorStatus && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 bg-black/10 dark:bg-black/25 backdrop-blur-[1px]">
            <div className="pointer-events-auto max-w-xs text-center p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
                <Navigation size={15} />
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Location Not Captured
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Click "Locate me" to display your coordinates and verify your physical position on the map.
              </p>
              <button
                type="button"
                onClick={handleLocateMe}
                className="w-full py-1.5 px-3 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Locate me
              </button>
            </div>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorStatus && (
          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2 shadow-xs z-10">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate text-[11px]">{errorStatus}</span>
            </div>
            <button
              onClick={handleLocateMe}
              className="text-[11px] font-semibold underline shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Coordinates Pill (when located) */}
        {location && (
          <div className="absolute top-3 left-3 py-1.5 px-2.5 rounded-lg bg-[var(--bg-surface)]/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[11px] font-mono tabular-nums text-[var(--text-primary)] shadow-2xs z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </span>
            <span className="text-[var(--text-muted)] text-[10px]">
              (±{Math.round(location.accuracy)}m)
            </span>
          </div>
        )}
      </div>

      {/* Honest Safety & System Status Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {/* Verification Status */}
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
          {location ? (
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck size={14} className="text-[var(--text-muted)] shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-[11px] text-[var(--text-primary)] truncate">
              {location ? 'Location Verified' : 'Location Standby'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {location ? `Captured at ${location.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Permission required'}
            </div>
          </div>
        </div>

        {/* Network Connectivity */}
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
          {isOnline ? (
            <Wifi size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <WifiOff size={14} className="text-red-500 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-[11px] text-[var(--text-primary)] truncate">
              {isOnline ? 'Network Connected' : 'Offline Mode'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {isOnline ? 'Online dispatch pathways ready' : 'Local emergency lines only'}
            </div>
          </div>
        </div>

        {/* Auxiliary Protection Scope */}
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2">
          <ShieldCheck size={14} className="text-[var(--brand-primary)] shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-[11px] text-[var(--text-primary)] truncate">
              Auxiliary Guardian
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              Dial 112 for direct dispatch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
