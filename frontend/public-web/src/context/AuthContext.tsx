import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  type User 
} from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  isFirebaseAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearAuthError: () => {},
  isFirebaseAvailable: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isFirebaseAvailable = Boolean(auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setAuthError('Firebase Authentication is not configured.');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.warn('Google sign-in attempt:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in window closed before completing.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not yet authorized in Firebase Console. Add your deployment URL under Authentication > Settings > Authorized domains.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setAuthError('Multiple sign-in attempts detected.');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('Network error during Google Sign-in. Please check your internet connection.');
      } else {
        setAuthError(error.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message || 'Error signing out.');
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        clearAuthError,
        isFirebaseAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
