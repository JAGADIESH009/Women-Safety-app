import { auth } from '../config/firebase';
import { Platform } from 'react-native';

// Use env var if available, else fallback to standard local dev ports
// For Android Emulator, localhost is 10.0.2.2
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (__DEV__) {
        // Use 127.0.0.1 over adb reverse to bypass Windows Firewall
        return Platform.OS === 'android' ? 'http://127.0.0.1:8000' : 'http://localhost:8000';
    }
    return 'https://women-safety-app-xo2h.onrender.com'; // Fallback for production if env missing
};

const API_URL = getBaseUrl();
console.log('[API Config] Resolved base URL:', API_URL);

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

// Generic API caller with error handling
const fetchApi = async (endpoint, options = {}) => {
    try {
        const headers = await getHeaders();
        
        const timeoutMs = options.timeout || 60000; // Increased to 60s for Render cold starts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return null; // No content
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

        return data;
    } catch (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        const isNetwork = msg.includes('network') || msg.includes('connect') || msg.includes('fetch failed');
        const isAuthOrNotFound = error.status === 404 || error.status === 403 || msg.includes('not found') || msg.includes('authorized');
        const isParseError = msg.includes('html instead of json') || msg.includes('invalid json') || msg.includes('json parse error');
        
        if (isNetwork || isAuthOrNotFound || isParseError) {
            console.warn(`[API Warning] ${endpoint}:`, error.message);
        } else {
            console.error(`[API Error] ${endpoint}:`, error.message);
        }
        throw error;
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
};
