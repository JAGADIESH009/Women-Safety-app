import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  AlertCircle, 
  RefreshCw, 
  PhoneCall 
} from 'lucide-react';
import type { PageView } from '../types';

interface FullMapPageProps {
  onNavigate: (view: PageView) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export const FullMapPage: React.FC<FullMapPageProps> = ({ onNavigate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Initialize Full-Page Leaflet Map with OpenStreetMap (Admin parity)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: India overview
    const initialLat = 20.5937;
    const initialLng = 78.9629;
    const initialZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap tiles — identical to admin panel
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Browser Geolocation capture
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

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 16, { duration: 1.5 });

          if (markerRef.current) markerRef.current.remove();
          if (circleRef.current) circleRef.current.remove();

          const markerHtml = `
            <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #D14D72; border: 2.5px solid #ffffff; box-shadow: 0 1px 6px rgba(0,0,0,0.45);"></div>
              <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(209, 77, 114, 0.25); animation: pulse 2s infinite;"></div>
            </div>
          `;

          const locationIcon = L.divIcon({
            className: 'safeher-marker',
            html: markerHtml,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          markerRef.current = L.marker([latitude, longitude], { icon: locationIcon }).addTo(map);

          circleRef.current = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 300),
            color: '#D14D72',
            weight: 1.5,
            opacity: 0.6,
            fillColor: '#D14D72',
            fillOpacity: 0.08,
          }).addTo(map);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorStatus('Location permission was denied. Please allow location access in your browser to view your live position.');
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
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium"
            title="Return to Dashboard"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-[var(--border-subtle)]" />

          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <MapPin size={16} className="text-[var(--brand-primary)]" />
              <span>Your Location</span>
            </h1>
            {location && (
              <p className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] mt-0.5">
                {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E · Accurate to ±{Math.round(location.accuracy)}m
              </p>
            )}
          </div>
        </div>

        {/* Right Actions: Locate Me & Emergency Dial */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <RefreshCw size={13} className="animate-spin text-[var(--brand-primary)]" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation size={13} className="text-[var(--brand-primary)]" />
                <span>{location ? 'Update Location' : 'Locate Me'}</span>
              </>
            )}
          </button>

          <a
            href="tel:112"
            className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-none"
            title="Call National Emergency 112"
          >
            <PhoneCall size={13} />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* Main Full-Page Map Viewport */}
      <div className="relative w-full h-[calc(100vh-210px)] min-h-[460px] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Error notification banner */}
        {errorStatus && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md p-3 rounded-lg bg-[var(--bg-surface)]/95 backdrop-blur-md border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3 shadow-md z-10">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] leading-relaxed">{errorStatus}</span>
            </div>
            <button
              onClick={handleLocateMe}
              className="text-[11px] font-semibold underline shrink-0 cursor-pointer pt-0.5"
            >
              Retry
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
