import { auth } from '../config/firebase';
import type { EmergencyContact, UserProfile } from '../types';

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 'https://women-safety-app-xo2h.onrender.com';

const STORAGE_KEYS = {
  CONTACTS: 'safeher_web_contacts',
  PROFILE: 'safeher_web_profile',
  REPORTS: 'safeher_web_reports',
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('[SafeHer API] Failed to get Firebase ID token:', e);
    }
  }
  return headers;
};

export const api = {
  async checkHealth(): Promise<{ status: string; online: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { status: data.status || 'ok', online: true };
      }
      return { status: `HTTP ${res.status}`, online: false };
    } catch {
      return { status: 'offline', online: false };
    }
  },

  // --- Users / Profile ---
  async syncUser(userData: {
    email: string;
    name?: string;
    phone?: string;
    blood_group?: string;
  }): Promise<UserProfile | null> {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      // Local fallback
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sync failed (${res.status}): ${errText}`);
      }
      const data = await res.json();
      return {
        uid: data.firebase_uid,
        email: data.email,
        name: data.name || '',
        phone: data.phone || '',
        bloodGroup: data.blood_group || 'O+',
        isSyncedWithCloud: true,
      };
    } catch (err) {
      console.warn('[SafeHer API] User sync remote error, keeping local copy:', err);
      return null;
    }
  },

  async getMyProfile(): Promise<UserProfile | null> {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        uid: data.firebase_uid,
        email: data.email,
        name: data.name || '',
        phone: data.phone || '',
        bloodGroup: data.blood_group || 'O+',
        isSyncedWithCloud: true,
      };
    } catch (err) {
      console.warn('[SafeHer API] Profile fetch error:', err);
      return null;
    }
  },

  // --- Contacts ---
  async getContacts(): Promise<EmergencyContact[]> {
    const headers = await getAuthHeaders();
    if (headers['Authorization']) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/`, {
          headers,
        });
        if (res.ok) {
          const remoteContacts = await res.json();
          if (Array.isArray(remoteContacts) && remoteContacts.length > 0) {
            localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(remoteContacts));
            return remoteContacts;
          }
        }
      } catch (err) {
        console.warn('[SafeHer API] Contacts remote fetch fallback to local:', err);
      }
    }

    // Local / Guest fallback
    try {
      const local = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 1,
        name: 'Family Emergency (Default)',
        phone: '+91 98765 43210',
        relation: 'Parent',
        is_primary: true,
      },
    ];
  },

  async createContact(contactData: {
    name: string;
    phone: string;
    relation: string;
    is_primary: boolean;
  }): Promise<EmergencyContact> {
    const headers = await getAuthHeaders();
    if (headers['Authorization']) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(contactData),
        });
        if (res.ok) {
          const created = await res.json();
          // Update local cache
          const contacts = await this.getContacts();
          localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([...contacts, created]));
          return created;
        }
      } catch (err) {
        console.warn('[SafeHer API] Create contact remote error, storing locally:', err);
      }
    }

    // Local storage fallback for guest or offline
    const contacts = await this.getContacts();
    const newContact: EmergencyContact = {
      id: Date.now(),
      ...contactData,
      createdAt: new Date().toISOString(),
    };
    const updated = [...contacts, newContact];
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updated));
    return newContact;
  },

  async updateContact(
    id: number | string,
    contactData: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const headers = await getAuthHeaders();
    if (typeof id === 'number' && headers['Authorization']) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(contactData),
        });
        if (res.ok) {
          const updated = await res.json();
          return updated;
        }
      } catch (err) {
        console.warn('[SafeHer API] Update contact remote error:', err);
      }
    }

    // Local fallback
    const contacts = await this.getContacts();
    const idx = contacts.findIndex((c) => String(c.id) === String(id));
    if (idx !== -1) {
      contacts[idx] = { ...contacts[idx], ...contactData };
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      return contacts[idx];
    }
    throw new Error('Contact not found');
  },

  async deleteContact(id: number | string): Promise<boolean> {
    const headers = await getAuthHeaders();
    if (typeof id === 'number' && headers['Authorization']) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'DELETE',
          headers,
        });
        if (res.ok || res.status === 204) {
          // Success
        }
      } catch (err) {
        console.warn('[SafeHer API] Delete contact remote error:', err);
      }
    }

    const contacts = await this.getContacts();
    const filtered = contacts.filter((c) => String(c.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filtered));
    return true;
  },

  // --- Local Persistence Helpers for Profile & Reports ---
  getLocalProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@safeher.app',
      name: 'SafeHer Guest',
      phone: '',
      bloodGroup: 'O+',
      medicalNotes: '',
      allergies: '',
      isSyncedWithCloud: false,
    };
  },

  saveLocalProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save local profile:', e);
    }
  },

  getLocalReports(): any[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },

  saveLocalReport(report: any): void {
    try {
      const current = this.getLocalReports();
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([report, ...current]));
    } catch (e) {
      console.warn('Failed to save local report:', e);
    }
  },
};
