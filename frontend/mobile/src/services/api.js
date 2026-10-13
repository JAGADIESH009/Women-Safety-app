import { auth } from '../config/firebase';
import { Platform } from 'react-native';

// Multi-tier API endpoints for extreme connection resilience:
// 1. Local over adb reverse (127.0.0.1:8000)
// 2. Production cloud backend (https://women-safety-app-xo2h.onrender.com)
const CLOUD_API_URL = 'https://women-safety-app-xo2h.onrender.com';
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://192.168.0.131:8000' : 'http://localhost:8000';

const getInitialBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    return __DEV__ ? LOCAL_API_URL : CLOUD_API_URL;
};

let activeBaseUrl = getInitialBaseUrl();
console.log('[API Config] Initial base URL:', activeBaseUrl);

// Helper to get fresh token and configure headers
const getHeaders = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No authenticated user found for API request.");
    }
    // Get fresh token (true = force refresh if needed)
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const executeFetch = async (baseUrl, endpoint, options, headers) => {
    const timeoutMs = options.timeout || (baseUrl.includes('127.0.0.1') ? 3500 : 7000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return { ok: true, data: null };
        }

        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            const isHtml = text.trim().startsWith('<');
            const errorMsg = isHtml 
                ? `Server returned HTML instead of JSON. Check your API_URL configuration.` 
                : `Invalid JSON response from server.`;
            const errorObj = new Error(errorMsg);
            errorObj.status = response.status;
            throw errorObj;
        }

        if (!response.ok) {
            const errorObj = new Error(data.detail || data.message || `API Error: ${response.status}`);
            errorObj.status = response.status;
            throw errorObj;
        }

        return { ok: true, data };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
};

// Generic API caller with resilient automatic cloud / local fallback
const fetchApi = async (endpoint, options = {}) => {
    const headers = await getHeaders();

    // 1. First attempt with active base URL
    try {
        const res = await executeFetch(activeBaseUrl, endpoint, options, headers);
        return res.data;
    } catch (primaryErr) {
        const primaryErrMsg = primaryErr.message ? primaryErr.message.toLowerCase() : '';
        const isConnectionErr = primaryErrMsg.includes('connect') || 
                                primaryErrMsg.includes('network') || 
                                primaryErrMsg.includes('failed to fetch') ||
                                primaryErrMsg.includes('aborted');

        // If it was a network/connection failure, attempt fallback immediately
        const fallbackUrl = activeBaseUrl === LOCAL_API_URL ? CLOUD_API_URL : LOCAL_API_URL;
        if (isConnectionErr) {
            console.warn(`[API Fallback] ${activeBaseUrl} failed (${primaryErr.message}). Retrying on ${fallbackUrl}...`);
            try {
                const fallbackRes = await executeFetch(fallbackUrl, endpoint, options, headers);
                // Remember the working endpoint
                activeBaseUrl = fallbackUrl;
                console.log(`[API Fallback] Switched activeBaseUrl to ${fallbackUrl}`);
                return fallbackRes.data;
            } catch (fallbackErr) {
                console.error(`[API Error] Both endpoints failed for ${endpoint}`);
            }
        }

        // Re-throw or format error
        const msg = primaryErr.message ? primaryErr.message.toLowerCase() : '';
        const isAuthOrNotFound = primaryErr.status === 404 || primaryErr.status === 403;
        if (isConnectionErr || isAuthOrNotFound) {
            console.warn(`[API Warning] ${endpoint}:`, primaryErr.message);
        } else {
            console.error(`[API Error] ${endpoint}:`, primaryErr.message);
        }
        throw primaryErr;
    }
};

let syncPromise = null;

export const api = {
    // User endpoints
    syncUser: async (userData) => {
        if (syncPromise) return syncPromise;
        
        const executeSync = async () => {
            try {
                return await fetchApi('/users/sync', {
                    method: 'POST',
                    body: JSON.stringify(userData)
                });
            } catch (error) {
                throw error;
            }
        };

        syncPromise = executeSync().finally(() => {
            syncPromise = null;
        });

        return syncPromise;
    },
    getMyProfile: () => fetchApi('/users/me'),

    // Contacts endpoints
    getContacts: () => fetchApi('/contacts/'),
    createContact: (contactData) => fetchApi('/contacts/', {
        method: 'POST',
        body: JSON.stringify(contactData)
    }),
    updateContact: (id, contactData) => fetchApi(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
    }),
    deleteContact: (id) => fetchApi(`/contacts/${id}`, {
        method: 'DELETE'
    }),

    // Incident endpoints
    getIncidents: () => fetchApi('/incidents/'),
    createIncident: (incidentData) => fetchApi('/incidents/', {
        method: 'POST',
        body: JSON.stringify(incidentData)
    }),
    updateIncident: (id, incidentData) => fetchApi(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incidentData)
    }),

    // Location endpoints
    addLocation: (incidentId, locationData) => fetchApi(`/locations/${incidentId}`, {
        method: 'POST',
        body: JSON.stringify(locationData)
    }),
    getIncidentLocations: (incidentId) => fetchApi(`/incidents/${incidentId}/locations`),

    // Live Location Sharing
    startLocationShare: (sessionToken = null) => fetchApi('/locations/share/start', {
        method: 'POST',
        body: sessionToken ? JSON.stringify({ session_token: sessionToken }) : undefined
    }),
    updateLocationShare: (locationData) => fetchApi('/locations/share/update', {
        method: 'POST',
        body: JSON.stringify(locationData)
    }),
    stopLocationShare: () => fetchApi('/locations/share/stop', {
        method: 'POST'
    }),
    getActiveLocationShare: () => fetchApi('/locations/share/active'),

    // Location Safety Rating
    getSafetyScore: (latitude, longitude, accuracy) => {
        const accParam = accuracy ? `&accuracy=${accuracy}` : '';
        return fetchApi(`/locations/safety-score?latitude=${latitude}&longitude=${longitude}${accParam}`);
    },
};
