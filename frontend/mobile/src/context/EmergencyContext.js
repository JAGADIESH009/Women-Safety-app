import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { sendEmergencySMS, buildEmergencyMessage, initiateEmergencyCall }
  from '../services/emergencyCommunication';
import * as Location from 'expo-location';
import { getFastLocation } from '../hooks/useLocation';
import { getReverseGeocode } from '../utils/geocoding';
import { api } from '../services/api';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  // SOS State Machine: 'idle' | 'pending_confirmation' | 'cancelled' | 'submitting' | 'active' | 'failed' | 'ended'
  const [sosStatus, setSosStatus] = useState('idle');
  const [pendingTrigger, setPendingTrigger] = useState(null); // { triggerSource, idempotencyKey, startedAt }
  const [countdownRemaining, setCountdownRemaining] = useState(5.0);

  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(true);

  // Live Location Sharing state
  const [isSharingActive, setIsSharingActive] = useState(false);
  const [sharingSession, setSharingSession] = useState(null);
  const [sharingError, setSharingError] = useState(null);
  const [lastShareUploadTime, setLastShareUploadTime] = useState(null);

  const { user } = useAuth();

  // Refs for timers and subscriptions
  const countdownTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const locationWatchSubscriptionRef = useRef(null);
  const cachedContactsRef = useRef([]);

  const prefetchContacts = useCallback(async () => {
    try {
      let rawContacts = [];
      if (user?.uid) {
        const userStored = await AsyncStorage.getItem(`women_safety_contacts_${user.uid}`);
        if (userStored) rawContacts = JSON.parse(userStored);
      }
      if (!rawContacts || rawContacts.length === 0) {
        const globalStored = await AsyncStorage.getItem('women_safety_contacts');
        if (globalStored) {
          const all = JSON.parse(globalStored);
          rawContacts = user?.uid ? all.filter(c => !c.userId || c.userId === user.uid) : all;
        }
      }
      if (rawContacts && rawContacts.length > 0) {
        cachedContactsRef.current = rawContacts;
      }
    } catch (e) {}
  }, [user?.uid]);

  const getPrimaryContactFast = async () => {
    if (cachedContactsRef.current && cachedContactsRef.current.length > 0) {
      const primary = cachedContactsRef.current.find(c => (c.isPrimary || c.is_primary) && c.enabled !== false)
        || cachedContactsRef.current.find(c => c.enabled !== false && c.phone)
        || cachedContactsRef.current[0];
      if (primary) return primary;
    }
    try {
      if (user?.uid) {
        const userStored = await AsyncStorage.getItem(`women_safety_contacts_${user.uid}`);
        if (userStored) {
          const list = JSON.parse(userStored);
          if (Array.isArray(list) && list.length > 0) {
            cachedContactsRef.current = list;
            return list.find(c => (c.isPrimary || c.is_primary) && c.enabled !== false) || list[0];
          }
        }
      }
      const globalStored = await AsyncStorage.getItem('women_safety_contacts');
      if (globalStored) {
        const list = JSON.parse(globalStored);
        if (Array.isArray(list) && list.length > 0) {
          cachedContactsRef.current = list;
          return list.find(c => (c.isPrimary || c.is_primary) && c.enabled !== false) || list[0];
        }
      }
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    if (user) {
      loadState();
      checkActiveSharingSession();
      prefetchContacts();
    } else {
      // Clear state when user logs out
      stopLiveSharingInternal();
      cancelSOSTriggerInternal();
      setIsEmergencyActive(false);
      setActiveIncident(null);
      setSosStatus('idle');
      setIsEmergencyLoading(false);
    }
  }, [user, prefetchContacts]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem('women_safety_emergency');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.incident && parsed.incident.userId === user?.uid && parsed.isActive) {
          setIsEmergencyActive(true);
          setActiveIncident(parsed.incident);
          setSosStatus('active');
        } else if (parsed.isActive === false) {
          setIsEmergencyActive(false);
          setActiveIncident(null);
          setSosStatus('idle');
        }
      }
    } catch (e) {
      console.error('Error loading emergency state:', e);
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const checkActiveSharingSession = async () => {
    try {
      const active = await api.getActiveLocationShare();
      if (active && active.is_active) {
        setIsSharingActive(true);
        setSharingSession(active);
        setLastShareUploadTime(active.last_updated || new Date().toISOString());
        startLocationWatcher(active.session_token);
      }
    } catch (e) {
      // Offline or no active session
    }
  };

  const saveState = async (isActive, incident) => {
    try {
      await AsyncStorage.setItem('women_safety_emergency', JSON.stringify({
        isActive,
        incident
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // SHARED SOS STATE MACHINE
  // ==========================================

  const cancelSOSTriggerInternal = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setPendingTrigger(null);
    setCountdownRemaining(5.0);
  };

  const cancelSOSTrigger = useCallback(() => {
    if (sosStatus === 'pending_confirmation') {
      console.log('[SOS State Machine] SOS Trigger Cancelled by user before expiry.');
      cancelSOSTriggerInternal();
      setSosStatus('cancelled');
      // Reset back to idle after short UI acknowledgement
      setTimeout(() => {
        setSosStatus('idle');
      }, 700);
    }
  }, [sosStatus]);

  const requestSOSTrigger = useCallback((triggerSource = 'MANUAL', requireConfirmation = true, fallbackLocation = null) => {
    // Idempotency and duplicate prevention: If an SOS is already pending, submitting, or active, reject new trigger
    if (sosStatus === 'pending_confirmation' || sosStatus === 'submitting' || sosStatus === 'active') {
      console.warn(`[SOS State Machine] Duplicate trigger rejected. Current state: ${sosStatus}`);
      return false;
    }

    const idempotencyKey = `sos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (!requireConfirmation) {
      // Immediate submission (e.g., long-press manual button finished)
      console.log(`[SOS State Machine] Direct submission triggered via ${triggerSource}`);
      activateEmergency(fallbackLocation, triggerSource, idempotencyKey);
      return true;
    }

    // Enter pending confirmation state with 5.0 second countdown
    console.log(`[SOS State Machine] Entering pending_confirmation from ${triggerSource}`);
    setSosStatus('pending_confirmation');
    setPendingTrigger({
      triggerSource,
      idempotencyKey,
      startedAt: Date.now()
    });
    setCountdownRemaining(5.0);

    const startTime = Date.now();
    const durationMs = 5000;

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (durationMs - elapsed) / 1000);
      setCountdownRemaining(parseFloat(remaining.toFixed(1)));
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 100);

    countdownTimerRef.current = setTimeout(() => {
      console.log(`[SOS State Machine] 5s countdown expired without cancellation. Triggering SOS...`);
      cancelSOSTriggerInternal();
      activateEmergency(fallbackLocation, triggerSource, idempotencyKey);
    }, durationMs);

    return true;
  }, [sosStatus]);

  const activateEmergency = async (fallbackLocation, triggerType = 'MANUAL', idempotencyKey = null) => {
    // Atomically transition to submitting
    setSosStatus('submitting');
    const now = new Date();
    const resolvedKey = idempotencyKey || `sos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // =========================================================================
    // 1. INSTANT EMERGENCY CALL DISPATCH (ZERO DELAY)
    // Emergency calls must be placed immediately upon SOS activation without waiting
    // for GPS acquisition, network APIs, or SMS loops!
    // =========================================================================
    let callPromise = null;
    let targetDialNumber = '112';
    let primaryTargetContact = null;
    try {
      primaryTargetContact = await getPrimaryContactFast();
      let storedEmergencyNumber = null;
      try {
        storedEmergencyNumber = await AsyncStorage.getItem('safeher_emergency_number');
      } catch (e) {}
      targetDialNumber = primaryTargetContact?.phone || storedEmergencyNumber || '112';
      console.log(`[SOS Instant Call] Instantly launching emergency call to: ${targetDialNumber} (Contact: ${primaryTargetContact?.name || 'Primary'})`);
      callPromise = initiateEmergencyCall(primaryTargetContact, targetDialNumber);
    } catch (callErr) {
      console.error('[SOS Instant Call] Error initiating immediate emergency call:', callErr);
    }

    // =========================================================================
    // 2. ULTRA-FAST LOCATION RESOLUTION
    // Check fallbackLocation first, then fast location service cache
    // =========================================================================
    let locationData = fallbackLocation;
    if (!locationData || (locationData.lat == null && locationData.latitude == null)) {
      try {
        locationData = await getFastLocation();
      } catch (locErr) {
        console.log('[SOS Location] Fast location lookup:', locErr.message);
      }
    }

    const formattedLocation = locationData && (typeof locationData.lat === 'number' || typeof locationData.latitude === 'number') ? {
      latitude: locationData.latitude ?? locationData.lat,
      longitude: locationData.longitude ?? locationData.lng,
      accuracy: locationData.accuracy || 0,
      timestamp: new Date(locationData.timestamp || now.getTime()).toISOString(),
      addressLabel: locationData.addressLabel || null
    } : null;

    let initialTimeline = [
      { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), event: `SOS activated via ${triggerType}`, location: formattedLocation }
    ];

    // Load Emergency Contacts for SMS dispatch
    let selectedContacts = [];
    try {
      let rawContacts = cachedContactsRef.current;
      if (!rawContacts || rawContacts.length === 0) {
        if (user?.uid) {
          const userStored = await AsyncStorage.getItem(`women_safety_contacts_${user.uid}`);
          if (userStored) rawContacts = JSON.parse(userStored);
        }
      }
      if (!rawContacts || rawContacts.length === 0) {
        const globalStored = await AsyncStorage.getItem('women_safety_contacts');
        if (globalStored) {
          const all = JSON.parse(globalStored);
          rawContacts = user?.uid ? all.filter(c => !c.userId || c.userId === user.uid) : all;
        }
      }
      if (!rawContacts || rawContacts.length === 0) {
        try {
          const cloudContacts = await Promise.race([
            api.getContacts(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1500))
          ]);
          if (Array.isArray(cloudContacts) && cloudContacts.length > 0) {
            rawContacts = cloudContacts.map(bc => ({
              id: bc.id.toString(),
              backendId: bc.id,
              userId: user?.uid,
              name: bc.name,
              phone: bc.phone,
              relation: bc.relation,
              isPrimary: bc.is_primary,
              enabled: true
            }));
          }
        } catch (e) {}
      }

      const activeContacts = (rawContacts || [])
        .filter(c => c && c.phone && c.enabled !== false)
        .map(c => ({
          ...c,
          enabled: c.enabled !== false
        }));

      if (activeContacts.length > 0) {
        activeContacts.sort((a, b) => ((b.isPrimary || b.is_primary) ? 1 : 0) - ((a.isPrimary || a.is_primary) ? 1 : 0));
        cachedContactsRef.current = activeContacts;
        selectedContacts = activeContacts;
      }
    } catch (e) {
      console.error('Failed to read contacts during SOS activation', e);
    }

    const newIncident = {
      id: `#INC-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.uid,
      type: 'SOS Emergency',
      triggerType,
      idempotencyKey: resolvedKey,
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      endedAt: null,
      duration: 0,
      initialLocation: formattedLocation,
      latestLocation: formattedLocation,
      emergencyContacts: selectedContacts.map(c => ({ ...c, status: 'PENDING' })),
      riskScore: 75,
      timeline: initialTimeline
    };

    setIsEmergencyActive(true);
    setActiveIncident(newIncident);
    setSosStatus('active');
    saveState(true, newIncident);

    // Sync to backend asynchronously
    (async () => {
      try {
        const backendIncident = await api.createIncident({
          type: newIncident.type,
          trigger_source: triggerType,
          idempotency_key: resolvedKey,
          description: `Triggered via ${triggerType}`
        });

        if (backendIncident && backendIncident.id) {
          setActiveIncident(prev => {
             if (!prev || prev.id !== newIncident.id) return prev;
             const unsynced = prev.unsyncedLocations || [];
             unsynced.forEach(loc => {
                api.addLocation(backendIncident.id, {
                   latitude: loc.latitude,
                   longitude: loc.longitude,
                   accuracy: loc.accuracy
                }).catch(() => {});
             });

             const updatedWithBackend = { 
                ...prev, 
                backendId: backendIncident.id,
                unsyncedLocations: []
             };
             saveState(true, updatedWithBackend);
             return updatedWithBackend;
          });
        }
      } catch (err) {
        console.log("Failed to sync SOS incident to backend (offline mode active):", err.message);
      }
    })();

    // Generate client-side session token IMMEDIATELY (0ms) so Live Tracking link is ALWAYS present in SMS
    const liveSessionToken = sharingSession?.session_token || ('sh_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now());
    const configuredBase = (process.env.EXPO_PUBLIC_WEB_URL || 'https://safeherweb.vercel.app').replace(/\/+$/, '');

    // Start Live Location Sharing session on backend concurrently without blocking SMS dispatch
    if (user) {
      startLiveSharing(liveSessionToken).catch(shareErr => {
        console.warn('[SOS Emergency] Live sharing background start note:', shareErr.message);
      });
    }

    // Fire off native communications concurrently
    const executeCommunications = async (incidentToUpdate, locationToUse) => {
      // Ensure resolved location coordinates
      let resolvedLoc = locationToUse;
      if (!resolvedLoc || (resolvedLoc.latitude == null && resolvedLoc.lat == null)) {
        try {
          const fast = await getFastLocation();
          if (fast) {
            resolvedLoc = {
              latitude: fast.lat ?? fast.latitude,
              longitude: fast.lng ?? fast.longitude,
              addressLabel: fast.addressLabel
            };
          }
        } catch (e) {}
      }

      const resLat = resolvedLoc?.latitude ?? resolvedLoc?.lat;
      const resLng = resolvedLoc?.longitude ?? resolvedLoc?.lng;

      let senderName = user?.name || user?.displayName || 'User';
      if ((!senderName || senderName === 'User') && user?.uid) {
        try {
          const profileStr = await AsyncStorage.getItem(`@profile_${user.uid}`);
          if (profileStr) {
            const parsed = JSON.parse(profileStr);
            if (parsed.name) senderName = parsed.name;
          }
        } catch (e) {}
      }

      let trackingUrlWithCoords = `${configuredBase}/track?token=${encodeURIComponent(liveSessionToken)}`;
      if (resLat != null && resLng != null) {
        trackingUrlWithCoords += `&lat=${encodeURIComponent(Number(resLat).toFixed(6))}&lng=${encodeURIComponent(Number(resLng).toFixed(6))}&user=${encodeURIComponent(senderName)}`;
      }

      const message = buildEmergencyMessage(
        senderName,
        'SOS',
        resolvedLoc?.addressLabel,
        resLat,
        resLng,
        false,
        trackingUrlWithCoords
      );

      console.log('SMS payload constructed:', message);
      let updatedIncident = { ...incidentToUpdate };

      // Dispatch SMS
      try {
        const smsResults = await sendEmergencySMS(selectedContacts, message);
        const currentTimeline = [...updatedIncident.timeline];
        smsResults.forEach(res => {
          const cIndex = updatedIncident.emergencyContacts.findIndex(c => c.id === res.contact.id);
          if (cIndex >= 0) {
            updatedIncident.emergencyContacts[cIndex].status = res.status;
          }
          let eventText = `SMS ${res.status === 'DISPATCHED' ? 'dispatched to' : (res.status === 'COMPOSER_OPENED' ? 'composer opened for' : (res.status === 'QUEUED' ? 'queued for' : 'failed for'))} ${res.contact.name || 'Contact'}`;
          if (res.error) eventText += ` (${res.error})`;
          currentTimeline.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            event: eventText,
            location: updatedIncident.latestLocation
          });
        });
        
        setActiveIncident(prev => {
           if (!prev) return prev;
           const newTimeline = [...prev.timeline];
           const newEvents = currentTimeline.slice(incidentToUpdate.timeline.length);
           const finalInc = { ...prev, emergencyContacts: updatedIncident.emergencyContacts, timeline: [...newTimeline, ...newEvents] };
           saveState(true, finalInc);
           return finalInc;
        });
      } catch (err) {
        console.error('Exception in sendEmergencySMS:', err);
      }

      // Record Call status from the instant call promise
      if (callPromise) {
        try {
          const callResult = await callPromise;
          let eventText = `Emergency call initiated to ${primaryTargetContact?.name ? `${primaryTargetContact.name} (${targetDialNumber})` : targetDialNumber}`;
          if (callResult.status === 'CALL_PLACED') {
            eventText = `Calling ${primaryTargetContact?.name || 'Primary Contact'} (${targetDialNumber})`;
          } else if (callResult.status === 'DIALER_OPENED') {
            eventText = `Dialer opened for ${primaryTargetContact?.name || callResult.number || targetDialNumber}`;
          } else if (callResult.error) {
            eventText = `Call status: ${callResult.error}`;
          }

          addTimelineEvent(eventText);
        } catch (callErr) {
          console.error('[SOS Call] Error resolving call status:', callErr);
        }
      }
    };

    executeCommunications(newIncident, formattedLocation);

    // Request High Accuracy GPS in the background
    (async () => {
      try {
        const freshLocation = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            maximumAge: 3000,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 6000))
        ]);
        
        if (freshLocation?.coords) {
          let addressLabel = null;
          try {
            addressLabel = await getReverseGeocode(freshLocation.coords.latitude, freshLocation.coords.longitude);
          } catch (e) {}

          updateIncidentLocation({
            lat: freshLocation.coords.latitude,
            lng: freshLocation.coords.longitude,
            accuracy: Math.round(freshLocation.coords.accuracy || 0),
            addressLabel: addressLabel
          });
          addTimelineEvent('High-accuracy GPS location acquired');
        }
      } catch (e) {
        console.log('SOS Background GPS update note:', e.message);
      }
    })();
  };

  const addTimelineEvent = (eventText) => {
    setActiveIncident(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        timeline: [
          ...prev.timeline,
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            event: eventText,
            location: prev.latestLocation
          }
        ]
      };
      saveState(true, updated);
      return updated;
    });
  };

  const updateIncidentLocation = (newLocation) => {
    setActiveIncident(prev => {
      if (!prev || !newLocation) return prev;
      const formattedLocation = {
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        accuracy: newLocation.accuracy || 0,
        timestamp: new Date().toISOString(),
        addressLabel: newLocation.addressLabel || null
      };
      const updated = {
        ...prev,
        latestLocation: formattedLocation,
        unsyncedLocations: [...(prev.unsyncedLocations || []), formattedLocation]
      };
      
      if (prev.backendId) {
        const locationsToSync = [...updated.unsyncedLocations];
        updated.unsyncedLocations = [];
        
        locationsToSync.forEach(loc => {
           api.addLocation(prev.backendId, {
             latitude: loc.latitude,
             longitude: loc.longitude,
             accuracy: loc.accuracy
           }).catch(() => {});
        });
      }

      saveState(true, updated);
      return updated;
    });
  };

  const endEmergency = async () => {
    try {
      if (isSharingActive) {
        await stopLiveSharing();
      }
    } catch (shareErr) {
      console.warn('Error stopping live sharing on emergency end:', shareErr);
    }

    if (activeIncident) {
      try {
        const now = new Date();
        const startTime = new Date(activeIncident.createdAt);
        const durationSec = Math.floor((now - startTime) / 1000);

        const endedIncident = {
          ...activeIncident,
          status: 'ENDED',
          endedAt: now.toISOString(),
          duration: durationSec,
          timeline: [
            ...activeIncident.timeline,
            { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), event: 'Emergency ended', location: activeIncident.latestLocation }
          ]
        };

        const stored = await AsyncStorage.getItem('women_safety_incidents');
        const history = stored ? JSON.parse(stored) : [];
        const updatedHistory = [endedIncident, ...history];

        await AsyncStorage.setItem('women_safety_incidents', JSON.stringify(updatedHistory));

        if (activeIncident.backendId) {
          api.updateIncident(activeIncident.backendId, {
            status: 'RESOLVED',
            end_time: endedIncident.endedAt
          }).catch(err => console.log("Failed to sync incident resolution to backend:", err.message));
        }
      } catch (e) {
        console.error('Failed to save ended incident to history', e);
      }
    }

    setIsEmergencyActive(false);
    setActiveIncident(null);
    setSosStatus('ended');
    saveState(false, null);

    setTimeout(() => {
      setSosStatus('idle');
    }, 500);
  };

  // ==========================================
  // LIVE LOCATION SHARING
  // ==========================================

  const startLocationWatcher = async (sessionToken) => {
    try {
      if (locationWatchSubscriptionRef.current) {
        locationWatchSubscriptionRef.current.remove();
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 5  // 5 meters
        },
        async (loc) => {
          try {
            const uploadTime = new Date().toISOString();
            setLastShareUploadTime(uploadTime);
            setSharingSession(prev => prev ? {
              ...prev,
              last_latitude: loc.coords.latitude,
              last_longitude: loc.coords.longitude,
              last_accuracy: Math.round(loc.coords.accuracy || 0),
              last_updated: uploadTime
            } : null);

            await api.updateLocationShare({
              session_token: sessionToken,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy || 0
            });
            setSharingError(null);
          } catch (err) {
            console.warn('[Live Location Sharing] Background update warning:', err.message);
            setSharingError('Temporary network sync issue. Retrying...');
          }
        }
      );
      locationWatchSubscriptionRef.current = subscription;
    } catch (err) {
      console.error('[Live Location Sharing] Watcher error:', err);
      setSharingError(err.message || 'Unable to start location watcher');
    }
  };

  const startLiveSharing = async (explicitToken = null) => {
    if (!user) {
      throw new Error('Please sign in to start live location sharing.');
    }
    setSharingError(null);

    try {
      const session = await api.startLocationShare(explicitToken);
      setIsSharingActive(true);
      setSharingSession(session);
      setLastShareUploadTime(new Date().toISOString());

      // Upload initial position and start watcher in background WITHOUT BLOCKING
      (async () => {
        try {
          const fast = await getFastLocation();
          if (fast && session.session_token) {
            const lat = fast.lat ?? fast.latitude;
            const lng = fast.lng ?? fast.longitude;
            if (lat != null && lng != null) {
              await api.updateLocationShare({
                session_token: session.session_token,
                latitude: lat,
                longitude: lng,
                accuracy: fast.accuracy || 0
              });
            }
          }
          await startLocationWatcher(session.session_token);
        } catch (err) {
          console.warn('[Live Sharing] Initial position upload note:', err.message);
        }
      })();

      return session;
    } catch (err) {
      setSharingError(err.message || 'Failed to start live location sharing');
      setIsSharingActive(false);
      throw err;
    }
  };

  const stopLiveSharingInternal = () => {
    if (locationWatchSubscriptionRef.current) {
      locationWatchSubscriptionRef.current.remove();
      locationWatchSubscriptionRef.current = null;
    }
    setIsSharingActive(false);
    setSharingSession(null);
  };

  const stopLiveSharing = async () => {
    try {
      await api.stopLocationShare();
    } catch (err) {
      console.warn('Error stopping location share on backend:', err.message);
    } finally {
      stopLiveSharingInternal();
      setSharingError(null);
    }
  };

  return (
    <EmergencyContext.Provider value={{
      sosStatus,
      pendingTrigger,
      countdownRemaining,
      requestSOSTrigger,
      cancelSOSTrigger,
      isEmergencyActive: isEmergencyActive || sosStatus === 'active',
      activeIncident,
      isEmergencyLoading,
      activateEmergency,
      endEmergency,
      addTimelineEvent,
      updateIncidentLocation,

      // Live Location Sharing
      isSharingActive,
      sharingSession,
      sharingError,
      lastShareUploadTime,
      startLiveSharing,
      stopLiveSharing
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);

