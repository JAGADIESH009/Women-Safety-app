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
import { api } from '../services/api';
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

const GUEST_STORAGE_KEY = 'safeher_guest_mode_active';

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
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const isFirebaseAvailable = Boolean(auth);

  // Sync profile when auth state changes
  useEffect(() => {
    if (!auth) {
      const local = api.getLocalProfile();
      setProfile(local);
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
          
          // Try fetching remote profile from backend
          const remote = await api.getMyProfile();
          if (remote) {
            setProfile(remote);
            api.saveLocalProfile(remote);
          } else {
            // Create initial profile from Firebase user data
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              name: currentUser.displayName || 'SafeHer User',
              phone: currentUser.phoneNumber || '',
              bloodGroup: 'O+',
              isSyncedWithCloud: true,
            };
            setProfile(fallbackProfile);
            api.saveLocalProfile(fallbackProfile);
            
            // Sync with backend API
            api.syncUser({
              email: fallbackProfile.email,
              name: fallbackProfile.name,
              phone: fallbackProfile.phone,
              blood_group: fallbackProfile.bloodGroup,
            }).catch(() => {});
          }
        } else {
          // If no authenticated user, load local profile
          const local = api.getLocalProfile();
          setProfile(local);
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
      await signInWithPopup(auth, googleProvider);
      setAuthSuccess('Signed in successfully with Google.');
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
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setAuthSuccess('Signed in successfully.');
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
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user && name.trim()) {
        await updateProfile(res.user, { displayName: name.trim() });
      }

      // Initial user profile
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email,
        name: name.trim() || 'SafeHer User',
        phone: phone?.trim() || '',
        bloodGroup: 'O+',
        isSyncedWithCloud: true,
      };
      setProfile(newProfile);
      api.saveLocalProfile(newProfile);

      // Push to backend
      api.syncUser({
        email: newProfile.email,
        name: newProfile.name,
        phone: newProfile.phone,
        blood_group: newProfile.bloodGroup,
      }).catch(() => {});

      setAuthSuccess('Account created successfully! Welcome to SafeHer.');
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
    api.saveLocalProfile(merged);

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
      await firebaseSignOut(auth);
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setProfile(api.getLocalProfile());
      setAuthSuccess('Signed out successfully.');
    } catch (err) {
      setAuthError(formatFirebaseError(err));
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setAuthError(null);
    setAuthSuccess('Exploring SafeHer in Guest Mode. All public features are accessible.');
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
