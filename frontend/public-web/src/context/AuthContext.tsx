import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  firebaseSignOut, 
  onAuthStateChanged,
  type User 
} from '../config/firebase';
import { api, clearUserLocalData } from '../services/api';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isGuest: boolean;
  loading: boolean;
  authError: string | null;
  authSuccess: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  clearAuthMessages: () => void;
  isFirebaseAvailable: boolean;
}

const GUEST_STORAGE_KEY = 'safeher_guest_session_active';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isGuest: false,
  loading: true,
  authError: null,
  authSuccess: null,
  signInWithGoogle: async () => false,
  signInWithEmail: async () => false,
  registerWithEmail: async () => false,
  sendPasswordReset: async () => false,
  updateUserProfile: async () => false,
  signOut: async () => {},
  continueAsGuest: () => {},
  clearAuthMessages: () => {},
  isFirebaseAvailable: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return sessionStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const isFirebaseAvailable = Boolean(auth);

  // Sync profile when auth state changes
  useEffect(() => {
    if (!auth) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setIsGuest(false);
          localStorage.removeItem(GUEST_STORAGE_KEY);
          
          try {
            // First attempt to fetch existing remote profile
            const remote = await api.getMyProfile();
            if (remote) {
              setProfile(remote);
            } else {
              // Create initial profile from Firebase user data
              const fallbackProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'SafeHer User'),
                phone: currentUser.phoneNumber || '',
                bloodGroup: 'O+',
                isSyncedWithCloud: true,
              };
              setProfile(fallbackProfile);
              
              // Sync with backend API
              api.syncUser({
                email: fallbackProfile.email,
                name: fallbackProfile.name,
                phone: fallbackProfile.phone,
                blood_group: fallbackProfile.bloodGroup,
              }).then((synced) => {
                if (synced) setProfile(synced);
              }).catch(() => {});
            }
          } catch (e) {
            console.warn('[SafeHer Auth] Profile synchronization warning:', e);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('[SafeHer Auth] Listener error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatFirebaseError = (err: unknown): string => {
    const error = err as { code?: string; message?: string };
    if (!error.code) return error.message || 'An unexpected error occurred.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in window closed before completing.';
      case 'auth/unauthorized-domain':
        return 'Domain not authorized in Firebase Console. Add your deployment URL under Authentication > Settings > Authorized domains.';
      case 'auth/cancelled-popup-request':
        return 'Previous sign-in attempt was cancelled.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please verify your internet connection.';
      default:
        return error.message || 'Authentication error. Please try again.';
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured.');
      return false;
    }
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      
      const remote = await api.getMyProfile();
      if (remote) {
        setProfile(remote);
      } else {
        const fallbackProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'SafeHer User',
          phone: result.user.phoneNumber || '',
          bloodGroup: 'O+',
          isSyncedWithCloud: true,
        };
        setProfile(fallbackProfile);
        api.syncUser({
          email: fallbackProfile.email,
          name: fallbackProfile.name,
          phone: fallbackProfile.phone,
          blood_group: fallbackProfile.bloodGroup,
        }).catch(() => {});
      }

      setAuthSuccess('Successfully signed in with Google.');
      return true;
    } catch (err) {
      setAuthError(formatFirebaseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured.');
      return false;
    }
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);

      const remote = await api.getMyProfile();
      if (remote) {
        setProfile(remote);
      } else {
        const fallbackProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || email.split('@')[0],
          phone: '',
          bloodGroup: 'O+',
          isSyncedWithCloud: true,
        };
        setProfile(fallbackProfile);
        api.syncUser({
          email: fallbackProfile.email,
          name: fallbackProfile.name,
          phone: fallbackProfile.phone,
          blood_group: fallbackProfile.bloodGroup,
        }).catch(() => {});
      }

      setAuthSuccess('Successfully signed in.');
      return true;
    } catch (err) {
      setAuthError(formatFirebaseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    phone?: string
  ): Promise<boolean> => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured.');
      return false;
    }
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      try {
        await updateProfile(userCredential.user, { displayName: name });
      } catch (e) {
        console.warn('Failed to update displayName on registration:', e);
      }

      setUser(userCredential.user);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);

      const initialProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        name,
        phone: phone || '',
        bloodGroup: 'O+',
        isSyncedWithCloud: true,
      };
      setProfile(initialProfile);

      // Sync user profile to backend
      await api.syncUser({
        email,
        name,
        phone: phone || '',
        blood_group: 'O+',
      });

      setAuthSuccess('Account created successfully.');
      return true;
    } catch (err) {
      setAuthError(formatFirebaseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured.');
      return false;
    }
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthSuccess('Password reset link sent! Check your inbox.');
      return true;
    } catch (err) {
      setAuthError(formatFirebaseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    const merged: UserProfile = {
      ...profile,
      ...updates,
    };
    setProfile(merged);

    // If user is authenticated, sync with backend & Firebase
    if (user && auth?.currentUser) {
      if (updates.name && updates.name !== auth.currentUser.displayName) {
        try {
          await updateProfile(auth.currentUser, { displayName: updates.name });
        } catch (e) {
          console.warn('Firebase name update warning:', e);
        }
      }

      try {
        await api.syncUser({
          email: merged.email,
          name: merged.name,
          phone: merged.phone,
          blood_group: merged.bloodGroup,
        });
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
    }
    return true;
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      const currentUid = user?.uid;
      await firebaseSignOut(auth);
      clearUserLocalData(currentUid);
      setUser(null);
      setProfile(null);
      setIsGuest(false);
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setAuthSuccess('Signed out successfully.');
    } catch (err) {
      setAuthError(formatFirebaseError(err));
    }
  };

  const continueAsGuest = () => {
    const currentUid = user?.uid;
    clearUserLocalData(currentUid);
    setIsGuest(true);
    sessionStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setUser(null);
    setProfile(null);
    setAuthError(null);
    setAuthSuccess('Browsing in Guest Mode. Public safety guidelines & helplines are available.');
  };

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isGuest,
        loading,
        authError,
        authSuccess,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        sendPasswordReset,
        updateUserProfile,
        signOut,
        continueAsGuest,
        clearAuthMessages,
        isFirebaseAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
