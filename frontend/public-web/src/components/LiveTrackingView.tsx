import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';


interface LiveTrackingViewProps {
  token?: string;
  onNavigate?: (view: any) => void;
}

interface TrackData {
  user_name: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  last_updated?: string | null;
  last_updated_at?: string | null;
  expires_at: string | null;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ token: propToken, onNavigate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [token, setToken] = useState<string>('');
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Extract token and fallback coordinates from URL
  useEffect(() => {
    let resolvedToken = propToken || '';
    const searchParams = new URLSearchParams(window.location.search);
    let hashParams: URLSearchParams | null = null;
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf('?') + 1);
      hashParams = new URLSearchParams(hashQuery);
    }

    if (!resolvedToken) {
      resolvedToken = searchParams.get('token') || hashParams?.get('token') || '';
      if (!resolvedToken) {
        const match = window.location.href.match(/[?&]token=([^&#]+)/);
        if (match) {
          try {
            resolvedToken = decodeURIComponent(match[1]);
          } catch {
            resolvedToken = match[1];
          }
        }
      }
    }
    setToken(resolvedToken);

    // Initial / fallback coordinates embedded directly in the emergency link
    const rawLat = searchParams.get('lat') || hashParams?.get('lat');
    const rawLng = searchParams.get('lng') || hashParams?.get('lng');
    const rawUser = searchParams.get('user') || hashParams?.get('user') || 'SafeHer User';

    if (rawLat && rawLng) {
      const parsedLat = parseFloat(rawLat);
      const parsedLng = parseFloat(rawLng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setData({
          user_name: rawUser,
          is_active: true,
          latitude: parsedLat,
          longitude: parsedLng,
          accuracy: 20,
          last_updated_at: new Date().toISOString(),
          expires_at: null,
        });
        setLoading(false);
      }
    }
  }, [propToken]);

  const fetchTrackData = useCallback(async (isManual = false) => {
    if (!token) return;
    if (isManual) setIsRefreshing(true);
    try {
      const getApiUrl = () => {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          return 'http://127.0.0.1:8000';
        }
        return 'https://women-safety-app-xo2h.onrender.com';
      };
      const baseUrl = getApiUrl().replace(/\/+$/, '');
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(`${baseUrl}/locations/share/track/${encodedToken}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('This tracking link has expired or is invalid.');
        }
        throw new Error(`Tracking server error: ${res.status}`);
      }
      const json: TrackData = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      // If we already have coordinates from URL, show gentle status rather than blocking error
      setData(prev => {
        if (prev?.latitude && prev?.longitude) {
          setError(null);
          return prev;
        }
        setError(err.message || 'Unable to load live location details.');
        return prev;
      });
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [token]);

  // Initial fetch and polling
  useEffect(() => {
    if (!token) {
      setData(prev => {
        if (!prev) {
          setLoading(false);
          setError('No tracking token provided in link.');
        }
        return prev;
      });
      return;
    }

    fetchTrackData();
    const interval = setInterval(() => {
      fetchTrackData();
    }, 10000); // 10s poll

    return () => clearInterval(interval);
  }, [token, fetchTrackData]);

  // Leaflet initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = 20.5937;
    const initialLng = 78.9629;
    const initialZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map marker when coordinates arrive
  useEffect(() => {
    if (!mapInstanceRef.current || !data?.latitude || !data?.longitude) return;

    const map = mapInstanceRef.current;
    const lat = data.latitude;
    const lng = data.longitude;
    const accuracy = data.accuracy || 20;

    map.flyTo([lat, lng], 16, { duration: 1.2 });

    if (markerRef.current) markerRef.current.remove();
    if (circleRef.current) circleRef.current.remove();

    const markerHtml = `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 16px; height: 16px; border-radius: 50%; background: #D14D72; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(209,77,114,0.25); animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    markerRef.current = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${data.user_name || 'SafeHer User'}</b><br>Live GPS Signal`)
      .openPopup();

    circleRef.current = L.circle([lat, lng], {
      radius: accuracy,
      color: '#D14D72',
      fillColor: '#D14D72',
      fillOpacity: 0.12,
      weight: 1.5,
    }).addTo(map);
  }, [data]);

  const lastUpdatedTime = data?.last_updated_at || data?.last_updated;
  const isStale = lastUpdatedTime
    ? (Date.now() - new Date(lastUpdatedTime).getTime()) > 120000
    : false;

  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#28151D] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#EEE5E7] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-1.5 rounded-lg hover:bg-[#F5EFF1] text-[#81747D] transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-white border border-[#EEE5E7] p-1 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="SafeHer" className="w-full h-full rounded-md object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#28151D]">
              {data?.user_name ? `${data.user_name}'s Live Location` : 'SafeHer Live Tracking'}
            </h1>
            <p className="text-[11px] text-[#81747D]">
              Secure recipient view
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data?.is_active ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SHARING
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              SESSION ENDED
            </span>
          )}

          <button
            onClick={() => fetchTrackData(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-[#EEE5E7] hover:bg-[#F5EFF1] text-[#81747D] transition-colors"
            title="Refresh location"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D14D72]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Map Container */}
      <div className="flex-1 relative flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-[#D14D72] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#28151D]">Loading live GPS data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-4 shadow-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800">Tracking Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[400px]" />

        {/* Bottom Info Floating Card */}
        {data && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-lg mx-auto bg-white/95 backdrop-blur-md border border-[#EEE5E7] rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#81747D]">Coordinates</p>
                <p className="font-semibold text-[#28151D] mt-0.5">
                  {data.latitude && data.longitude
                    ? `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`
                    : 'Awaiting fix'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[#81747D]">Accuracy</p>
                <p className="font-semibold text-[#28151D] mt-0.5">
                  {data.accuracy ? `±${Math.round(data.accuracy)} meters` : 'Standard'}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-bold text-[#81747D]">Last Update</p>
                <p className={`font-semibold mt-0.5 ${isStale ? 'text-amber-600' : 'text-[#28151D]'}`}>
                  {lastUpdatedTime
                    ? `${new Date(lastUpdatedTime).toLocaleTimeString()}${isStale ? ' (Stale)' : ''}`
                    : 'Not available'}
                </p>
              </div>
            </div>

            {isStale && (
              <div className="mt-2.5 pt-2.5 border-t border-[#EEE5E7] flex items-center gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Device has not reported a location update in the last 2 minutes.</span>
              </div>
            )}

            {data.latitude != null && data.longitude != null && (
              <a
                href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#A61945] hover:bg-[#8A1439] text-white text-xs font-semibold shadow-xs transition-colors text-center"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
