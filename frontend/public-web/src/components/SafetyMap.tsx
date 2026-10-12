import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Initialize Leaflet Map using OpenStreetMap (matching Admin Panel configuration)
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
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap tiles — identical to admin panel (index.html:1786)
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

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 15, { duration: 1.2 });

          if (markerRef.current) markerRef.current.remove();
          if (circleRef.current) circleRef.current.remove();

          const markerHtml = `
            <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: #D14D72; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(209, 77, 114, 0.25); animation: pulse 2s infinite;"></div>
            </div>
          `;

          const locationIcon = L.divIcon({
            className: 'safeher-marker',
            html: markerHtml,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

          markerRef.current = L.marker([latitude, longitude], { icon: locationIcon }).addTo(map);

          circleRef.current = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 250),
            color: '#D14D72',
            weight: 1,
            opacity: 0.5,
            fillColor: '#D14D72',
            fillOpacity: 0.08,
          }).addTo(map);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorStatus('Location permission denied. Please allow location access in your browser.');
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
    <div className="space-y-2">
      {/* Location Header Action Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[var(--brand-primary)]" />
          <span className="font-medium text-[var(--text-primary)]">
            {location
              ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° (±${Math.round(location.accuracy)}m)`
              : 'Current Location'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <RefreshCw size={11} className="animate-spin text-[var(--brand-primary)]" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation size={11} className="text-[var(--brand-primary)]" />
              <span>{location ? 'Update' : 'Locate me'}</span>
            </>
          )}
        </button>
      </div>

      {/* Real Map Viewport */}
      <div className="relative w-full h-[240px] sm:h-[280px] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Error Notice */}
        {errorStatus && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-lg bg-[var(--bg-surface)]/95 backdrop-blur-sm border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
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
      </div>
    </div>
  );
};
