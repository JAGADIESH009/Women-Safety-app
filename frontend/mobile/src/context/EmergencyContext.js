import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { sendEmergencySMS, buildEmergencyMessage, initiateEmergencyCall }
  from '../services/emergencyCommunication';
import * as Location from 'expo-location';
import { getReverseGeocode } from '../utils/geocoding';
import { api } from '../services/api';

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadState();
    } else {
      // Clear state when user logs out
      setIsEmergencyActive(false);
      setActiveIncident(null);
      setIsEmergencyLoading(false);
    }
  }, [user]);

  const loadState = async () => {
    try {
      console.log('loadState: calling AsyncStorage.getItem');
      const stored = await AsyncStorage.getItem('women_safety_emergency');
      console.log('loadState: AsyncStorage.getItem returned', !!stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load active incident if it belongs to the current user
        if (parsed.incident && parsed.incident.userId === user?.uid) {
          setIsEmergencyActive(parsed.isActive);
          setActiveIncident(parsed.incident);
        } else if (parsed.isActive === false) {
          setIsEmergencyActive(false);
          setActiveIncident(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      console.log('loadState: setting isEmergencyLoading(false)');
      setIsEmergencyLoading(false);
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

  const activateEmergency = async (fallbackLocation, triggerType = 'MANUAL_SOS') => {
    const now = new Date();

    let locationData = fallbackLocation;
    // Discard stale fallback location (> 2 minutes old)
    if (locationData && locationData.timestamp) {
      if ((Date.now() - locationData.timestamp) > 120000) {
        console.log('SOS fallback location is stale. Discarding.');
        locationData = null;
      }
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
         const lastKnown = await Location.getLastKnownPositionAsync();
         if (lastKnown && (!locationData || lastKnown.timestamp > locationData.timestamp)) {
             locationData = {
                 lat: lastKnown.coords.latitude,
                 lng: lastKnown.coords.longitude,
                 accuracy: Math.round(lastKnown.coords.accuracy || 0),
                 timestamp: lastKnown.timestamp,
                 addressLabel: null
             };
         }
      }
    } catch (e) {
      console.log('Error getting initial quick location', e);
    }

    const formattedLocation = locationData && typeof locationData.lat === 'number' && typeof locationData.lng === 'number' ? {
      latitude: locationData.lat,
      longitude: locationData.lng,
      accuracy: locationData.accuracy || 0,
      timestamp: new Date(locationData.timestamp || now.getTime()).toISOString(),
      addressLabel: locationData.addressLabel || null
    } : null;

    let initialTimeline = [
      { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), event: 'SOS activated', location: formattedLocation }
    ];

    let selectedContacts = [];
    try {
      const contactsStore = await AsyncStorage.getItem('women_safety_contacts');
      if (contactsStore) {
        const parsedContacts = JSON.parse(contactsStore).filter(c => (c.userId === user?.uid || !c.userId) && c.enabled !== false);
        if (parsedContacts.length > 0) {
          initialTimeline.push({ time: new Date(now.getTime() + 100).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), event: 'Emergency contacts ready' });
          selectedContacts = parsedContacts;
        }
      }
    } catch (e) {
      console.error('Failed to read contacts during SOS activation', e);
    }


    const newIncident = {
      id: `#INC-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.uid,
      type: 'SOS Emergency',
      triggerType,
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      endedAt: null,
      duration: 0,
      initialLocation: formattedLocation,
      latestLocation: formattedLocation,
      emergencyContacts: selectedContacts.map(c => ({ ...c, status: 'PENDING' })),
      riskScore: 72,
      timeline: initialTimeline
    };

    setIsEmergencyActive(true);
    setActiveIncident(newIncident);
    saveState(true, newIncident);

    // Background sync to create incident on backend
    (async () => {
      try {
        const backendIncident = await api.createIncident({ type: newIncident.type });
        if (backendIncident && backendIncident.id) {
          setActiveIncident(prev => {
             if (!prev || prev.id !== newIncident.id) return prev;
             // Flush any locations that queued up while waiting for creation
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

    // Fire off native communications immediately
    const executeCommunications = async (incidentToUpdate, locationToUse) => {
      const message = buildEmergencyMessage(
        user?.displayName || 'User',
        'SOS',
        locationToUse?.addressLabel,
        locationToUse?.latitude,
        locationToUse?.longitude,
        false
      );

      console.log('SMS payload constructed:', message);
      let updatedIncident = { ...incidentToUpdate };

      // ==========================================
      // 1. SMS LOGIC (INDEPENDENT)
      // ==========================================
      try {
        console.log('--- [SMS] BEFORE sendEmergencySMS (Context) ---');
        const smsResults = await sendEmergencySMS(selectedContacts, message);
        console.log(`--- [SMS] AFTER sendEmergencySMS, result length: ${smsResults ? smsResults.length : 0} ---`);

        const currentTimeline = [...updatedIncident.timeline];
        smsResults.forEach(res => {
          const cIndex = updatedIncident.emergencyContacts.findIndex(c => c.id === res.contact.id);
          if (cIndex >= 0) {
            updatedIncident.emergencyContacts[cIndex].status = res.status;
          }
          let eventText = `SMS ${res.status === 'DISPATCHED' ? 'dispatched to' : (res.status === 'QUEUED' ? 'queued for' : 'failed for')} ${res.contact.name || 'Contact'}`;
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
           // Append new sms timeline events that aren't in prev
           const newEvents = currentTimeline.slice(incidentToUpdate.timeline.length);
           const finalInc = { ...prev, emergencyContacts: updatedIncident.emergencyContacts, timeline: [...newTimeline, ...newEvents] };
           saveState(true, finalInc);
           return finalInc;
        });
      } catch (err) {
        console.error('--- [SMS] EXCEPTION in sendEmergencySMS block ---', err);
      }

      // ==========================================
      // 2. CALL LOGIC (INDEPENDENT)
      // ==========================================
      try {
        const primaryContact = selectedContacts.find(c => c.isPrimary && c.enabled) || selectedContacts.find(c => c.enabled) || selectedContacts[0];
        if (primaryContact) {
          console.log(`--- [CALL] BEFORE initiateEmergencyCall to ${primaryContact.name} ---`);
          const callResult = await initiateEmergencyCall(primaryContact);
          console.log(`--- [CALL] AFTER initiateEmergencyCall, status: ${callResult?.status} ---`);
          
          let eventText = `Call unavailable for ${primaryContact.name || 'Primary'}`;
          if (callResult.status === 'DIALER_OPENED') {
            eventText = `Call ready — ${primaryContact.name || 'Primary'}`;
          } else if (callResult.status === 'CALL_INITIATED') {
            eventText = `Call initiated to ${primaryContact.name || 'Primary'}`;
          } else if (callResult.error) {
            eventText += ` (${callResult.error})`;
          }
          
          setActiveIncident(prev => {
              if (!prev) return prev;
              const finalInc = {
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
              saveState(true, finalInc);
              return finalInc;
          });
        } else {
          console.log('--- [CALL] No primary contact found for Call ---');
        }
      } catch (err) {
        console.error('--- [CALL] EXCEPTION in initiateEmergencyCall block ---', err);
      }
    };

    executeCommunications(newIncident, formattedLocation);

    // Request High Accuracy GPS in the background
    (async () => {
      try {
        console.log('SOS Background: Requesting fresh location...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const servicesEnabled = await Location.hasServicesEnabledAsync();
          if (servicesEnabled) {
            const freshLocation = await Promise.race([
              Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                maximumAge: 5000,
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 10000))
            ]);
            
            console.log('SOS Background GPS acquired:', freshLocation.coords.latitude, freshLocation.coords.longitude);
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
            addTimelineEvent('High-accuracy location acquired');
          }
        }
      } catch (e) {
        console.log('SOS Background GPS failed or timed out:', e);
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
      
      // Sync location to backend if we have a backend ID
      if (prev.backendId) {
        const locationsToSync = [...updated.unsyncedLocations];
        updated.unsyncedLocations = []; // optimistic clear
        
        locationsToSync.forEach(loc => {
           api.addLocation(prev.backendId, {
             latitude: loc.latitude,
             longitude: loc.longitude,
             accuracy: loc.accuracy
           }).catch(err => {
             console.log("Failed to sync location to backend:", err.message);
             // We could add it back to the queue here if we wanted robust retry, 
             // but keeping it simple for the foreground tracking.
           });
        });
      }

      saveState(true, updated);
      return updated;
    });
  };

  const endEmergency = async () => {
    if (activeIncident) {
      try {
        const now = new Date();
        const startTime = new Date(activeIncident.createdAt);
        const durationSec = Math.floor((now - startTime) / 1000);

        const endedIncident = {
          ...activeIncident,
          status: 'ENDED', // explicitly use ENDED status
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

        // Sync resolved status to backend
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
    // Explicitly set isActive to false and incident to null in storage
    saveState(false, null);
  };

  return (
    <EmergencyContext.Provider value={{
      isEmergencyActive,
      activeIncident,
      isEmergencyLoading,
      activateEmergency,
      endEmergency,
      addTimelineEvent,
      updateIncidentLocation
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => useContext(EmergencyContext);
