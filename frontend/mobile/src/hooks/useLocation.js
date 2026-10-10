import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { getReverseGeocode } from '../utils/geocoding';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const watcherRef = useRef(null);

  const initLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission denied. Please enable location permissions.');
        setIsLoading(false);
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setErrorMsg('GPS is disabled. Please turn on location services.');
        setIsLoading(false);
        return;
      }

      // 1. Instantly use cached location if available
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          setLocation(prev => {
            if (!prev || lastKnown.timestamp > prev.timestamp) {
              return {
                lat: lastKnown.coords.latitude,
                lng: lastKnown.coords.longitude,
                accuracy: Math.round(lastKnown.coords.accuracy || 0),
                timestamp: lastKnown.timestamp,
                accuracyLevel: getAccuracyLevel(lastKnown.coords.accuracy),
                addressLabel: 'Updating...',
              };
            }
            return prev;
          });
          setErrorMsg(null);
          setIsLoading(false);
        }
      } catch (e) {
        console.log('Failed to get last known location:', e);
      }

      // 2. Start continuous GPS watcher
      if (watcherRef.current) {
        watcherRef.current.remove();
      }

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (currentLocation) => {
          const locData = {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            accuracy: Math.round(currentLocation.coords.accuracy || 0),
            timestamp: Date.now(),
            accuracyLevel: getAccuracyLevel(currentLocation.coords.accuracy),
          };

          setLocation(prev => {
             const currentLabel = prev?.addressLabel === 'Updating...' ? 'Resolving location...' : (prev?.addressLabel || 'Resolving location...');
             return { ...locData, addressLabel: currentLabel };
          });
          setErrorMsg(null);
          setIsLoading(false);

          // Asynchronously fetch reverse geocoding without blocking coordinates
          getReverseGeocode(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          ).then(addressLabel => {
            setLocation(prev => {
              if (!prev) return prev;
              if (prev.lat === locData.lat && prev.lng === locData.lng) {
                return {
                  ...prev,
                  addressLabel: addressLabel || prev.addressLabel
                };
              }
              return prev;
            });
          }).catch(() => {});
        }
      );
    } catch (e) {
      setErrorMsg('Failed to fetch location');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initLocation();
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
    };
  }, [initLocation]);

  return { location, errorMsg, isLoading, refreshLocation: initLocation };
}

function getAccuracyLevel(accuracyInMeters) {
  if (!accuracyInMeters) return 'UNKNOWN';
  if (accuracyInMeters <= 20) return 'HIGH';
  if (accuracyInMeters <= 60) return 'MODERATE';
  return 'LOW';
}
