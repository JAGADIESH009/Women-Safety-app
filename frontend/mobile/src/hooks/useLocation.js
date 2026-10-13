import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReverseGeocode } from '../utils/geocoding';

const CACHE_STORAGE_KEY = 'safeher_last_known_location';

function getAccuracyLevel(accuracyInMeters) {
  if (!accuracyInMeters) return 'UNKNOWN';
  if (accuracyInMeters <= 20) return 'HIGH';
  if (accuracyInMeters <= 60) return 'MODERATE';
  return 'LOW';
}

function formatLocationData(coords, timestamp, addressLabel = null) {
  const lat = coords.latitude ?? coords.lat;
  const lng = coords.longitude ?? coords.lng;
  const accuracy = Math.round(coords.accuracy || 0);
  return {
    lat,
    lng,
    accuracy,
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: coords.accuracy || 0,
    },
    timestamp: timestamp || Date.now(),
    accuracyLevel: getAccuracyLevel(coords.accuracy),
    addressLabel: addressLabel || null,
  };
}

// Global in-memory cache and subscribers for instant cross-screen availability
let globalLocation = null;
let globalError = null;
let globalIsLoading = true;
let isEngineRunning = false;
let activeWatcher = null;
const subscribers = new Set();

function notifySubscribers() {
  const currentSnapshot = {
    location: globalLocation,
    errorMsg: globalError,
    isLoading: globalLocation ? false : globalIsLoading,
  };
  subscribers.forEach(cb => {
    try {
      cb(currentSnapshot);
    } catch (e) {}
  });
}

function updateGlobalLocation(newLoc, saveToStorage = true) {
  if (!newLoc || typeof newLoc.lat !== 'number' || typeof newLoc.lng !== 'number') return;
  
  const existingLabel = globalLocation?.addressLabel;
  const resolvedLabel = (newLoc.addressLabel && newLoc.addressLabel !== 'Updating...' && newLoc.addressLabel !== 'Resolving location...')
    ? newLoc.addressLabel
    : (existingLabel || newLoc.addressLabel || null);

  globalLocation = {
    ...newLoc,
    addressLabel: resolvedLabel,
  };
  globalIsLoading = false;
  globalError = null;
  notifySubscribers();

  if (saveToStorage) {
    AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(globalLocation)).catch(() => {});
  }
}

// Immediately load cached location from AsyncStorage on module initialization
(async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        if (!globalLocation) {
          globalLocation = parsed;
          globalIsLoading = false;
          notifySubscribers();
        }
      }
    }
  } catch (e) {}
})();

/**
 * Returns a high-speed location immediately without blocking the caller.
 * Checks in-memory cache, AsyncStorage cache, and fast OS last known position.
 */
export async function getFastLocation() {
  // 1. Instant in-memory cache (<1ms)
  if (globalLocation && typeof globalLocation.lat === 'number' && typeof globalLocation.lng === 'number') {
    return globalLocation;
  }

  // 2. Storage cache (<20ms)
  try {
    const raw = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        updateGlobalLocation(parsed, false);
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Fast OS last known position (<50ms)
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        const formatted = formatLocationData(lastKnown.coords, lastKnown.timestamp);
        updateGlobalLocation(formatted);
        return formatted;
      }

      // 4. Fast balanced network position (1.5s max timeout)
      const fastPos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1500))
      ]);
      if (fastPos?.coords) {
        const formatted = formatLocationData(fastPos.coords, fastPos.timestamp || Date.now());
        updateGlobalLocation(formatted);
        return formatted;
      }
    }
  } catch (e) {}

  return globalLocation;
}

/**
 * Starts or re-ensures the global location engine with concurrent fast acquisition
 * and continuous high-accuracy background GPS updates.
 */
async function startLocationEngine() {
  if (isEngineRunning) return;
  isEngineRunning = true;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      globalError = 'Permission denied. Please enable location permissions.';
      globalIsLoading = false;
      notifySubscribers();
      isEngineRunning = false;
      return;
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      globalError = 'GPS is disabled. Please turn on location services.';
      globalIsLoading = false;
      notifySubscribers();
      isEngineRunning = false;
      return;
    }

    // Step 1: Instantly retrieve OS last known position
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        const formatted = formatLocationData(
          lastKnown.coords,
          lastKnown.timestamp,
          globalLocation?.addressLabel || 'Updating...'
        );
        updateGlobalLocation(formatted);
      }
    } catch (e) {}

    // Step 2: Concurrently request fast balanced network position (100-300ms fix)
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then(pos => {
        if (pos?.coords) {
          const formatted = formatLocationData(
            pos.coords,
            pos.timestamp || Date.now(),
            globalLocation?.addressLabel || 'Updating...'
          );
          updateGlobalLocation(formatted);

          getReverseGeocode(pos.coords.latitude, pos.coords.longitude)
            .then(label => {
              if (label && globalLocation) {
                updateGlobalLocation({ ...globalLocation, addressLabel: label });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Step 3: Singleton high-accuracy continuous GPS watcher
    if (activeWatcher) {
      activeWatcher.remove();
      activeWatcher = null;
    }

    activeWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 3,
      },
      (currentLocation) => {
        if (!currentLocation?.coords) return;
        const formatted = formatLocationData(
          currentLocation.coords,
          Date.now(),
          globalLocation?.addressLabel || 'Updating...'
        );
        updateGlobalLocation(formatted);

        getReverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude)
          .then(label => {
            if (label && globalLocation) {
              updateGlobalLocation({ ...globalLocation, addressLabel: label });
            }
          })
          .catch(() => {});
      }
    );
  } catch (err) {
    if (!globalLocation) {
      globalError = 'Failed to fetch location';
      globalIsLoading = false;
      notifySubscribers();
    }
  } finally {
    isEngineRunning = false;
  }
}

export function useLocation() {
  const [state, setState] = useState(() => ({
    location: globalLocation,
    errorMsg: globalError,
    isLoading: globalLocation ? false : globalIsLoading,
  }));

  const refreshLocation = useCallback(async () => {
    if (!globalLocation) {
      globalIsLoading = true;
      notifySubscribers();
    }
    try {
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000))
      ]);
      if (pos?.coords) {
        const formatted = formatLocationData(pos.coords, pos.timestamp || Date.now());
        updateGlobalLocation(formatted);
      }
    } catch (e) {
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown?.coords) {
          const formatted = formatLocationData(lastKnown.coords, lastKnown.timestamp);
          updateGlobalLocation(formatted);
        }
      } catch (err) {}
    }
    startLocationEngine().catch(() => {});
  }, []);

  useEffect(() => {
    setState({
      location: globalLocation,
      errorMsg: globalError,
      isLoading: globalLocation ? false : globalIsLoading,
    });

    const handler = (snapshot) => {
      setState(snapshot);
    };
    subscribers.add(handler);

    startLocationEngine().catch(() => {});

    return () => {
      subscribers.delete(handler);
    };
  }, []);

  return {
    location: state.location,
    errorMsg: state.errorMsg,
    isLoading: state.isLoading,
    refreshLocation,
  };
}
