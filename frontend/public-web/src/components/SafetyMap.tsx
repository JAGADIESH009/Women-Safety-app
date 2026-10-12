import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, AlertCircle, RefreshCw, Maximize2 } from 'lucide-react';

interface SafetyMapProps {
  onLocationCaptured?: (lat: number, lng: number, accuracy: number) => void;
  onOpenFullMap?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({ 
  onLocationCaptured, 
  onOpenFullMap 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Initialize Leaflet Map using OpenStreetMap (Admin parity)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default overview center
    const initialLat = 20.5937;
    const initialLng = 78.9629;
    const initialZoom = 4;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      dragging: false, // compact preview is static/click-to-open
    });

    // Standard OpenStreetMap tiles
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

  // Browser Geolocation
  const handleLocateMe = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

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
          setErrorStatus('Location permission denied. Please allow access in browser settings.');
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
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={13} className="text-[var(--brand-primary)] shrink-0" />
          <span className="font-medium text-[var(--text-primary)] truncate">
            {location
              ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° (±${Math.round(location.accuracy)}m)`
              : 'Current Location Preview'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] font-medium text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50 text-xs"
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

          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--brand-primary)] font-medium transition-colors cursor-pointer text-xs"
              title="Open full interactive map"
            >
              <Maximize2 size={11} />
              <span>Full Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Clickable Compact Map Preview Viewport */}
      <div 
        onClick={onOpenFullMap}
        role={onOpenFullMap ? 'button' : undefined}
        tabIndex={onOpenFullMap ? 0 : undefined}
        onKeyDown={(e) => {
          if (onOpenFullMap && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpenFullMap();
          }
        }}
        className={`relative w-full h-[170px] sm:h-[190px] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${
          onOpenFullMap ? 'cursor-pointer hover:border-[var(--brand-primary)] transition-colors group' : ''
        }`}
        title={onOpenFullMap ? 'Click to open full-page map' : undefined}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0 pointer-events-none" />

        {/* Subtle clickable badge overlay */}
        {onOpenFullMap && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[var(--bg-surface)]/90 backdrop-blur-xs border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] flex items-center gap-1 z-10 transition-colors pointer-events-none">
            <Maximize2 size={10} />
            <span>Click to expand map</span>
          </div>
        )}

        {/* Error Notice */}
        {errorStatus && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-[var(--bg-surface)]/95 backdrop-blur-sm border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2 z-20"
          >
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
