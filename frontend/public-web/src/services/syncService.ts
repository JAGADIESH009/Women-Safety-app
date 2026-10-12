import { api } from './api';
import { auth } from '../config/firebase';
import type { EmergencyContact, UserProfile } from '../types';

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  isOnline: boolean;
  contacts: EmergencyContact[];
  profile: UserProfile | null;
}

type SyncListener = (state: SyncState) => void;

class SharedSyncService {
  private state: SyncState = {
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    contacts: [],
    profile: null,
  };

  private listeners: Set<SyncListener> = new Set();
  private syncPromise: Promise<boolean> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateState({ isOnline: true, error: null });
        this.syncAll();
      });
      window.addEventListener('offline', () => {
        this.updateState({ isOnline: false });
      });
    }
  }

  public getState(): SyncState {
    return { ...this.state };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.getState()));
  }

  public async syncAll(force = false): Promise<boolean> {
    if (this.state.isSyncing && !force && this.syncPromise) {
      return this.syncPromise;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState({
        isOnline: false,
        error: 'Offline: cached data in use.',
        isSyncing: false,
      });
      return false;
    }

    if (!auth?.currentUser) {
      this.updateState({
        isSyncing: false,
        contacts: [],
        profile: null,
        error: null,
      });
      return true;
    }

    this.updateState({ isSyncing: true, error: null });

    this.syncPromise = (async () => {
      try {
        const [profileResult, contactsResult] = await Promise.allSettled([
          api.getMyProfile(),
          api.getContacts(),
        ]);

        let newProfile = this.state.profile;
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          newProfile = profileResult.value;
        }

        let newContacts = this.state.contacts;
        if (contactsResult.status === 'fulfilled' && Array.isArray(contactsResult.value)) {
          newContacts = contactsResult.value;
        }

        this.updateState({
          isSyncing: false,
          lastSyncedAt: new Date(),
          error: null,
          profile: newProfile,
          contacts: newContacts,
        });
        return true;
      } catch (err: any) {
        console.warn('[SyncService] Sync failure:', err);
        this.updateState({
          isSyncing: false,
          error: err.message || 'Sync failed. Using cached data.',
        });
        return false;
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }
}

export const syncService = new SharedSyncService();
