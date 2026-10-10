import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile
} from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { api } from '../services/api';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '592378767800-va77s2e1manmlqu1sfk64cga7br8cvii.apps.googleusercontent.com',
  });
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configMissing, setConfigMissing] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock login for UI testing when Firebase is not configured
      setUser({
        uid: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        phone: 'Not provided',
        bloodGroup: 'O+',
      });
      setLoading(false);
      return;
    }

    // Firebase Auth State Listener
    console.log("AuthContext: setting up onAuthStateChanged listener, isFirebaseConfigured =", isFirebaseConfigured);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged fired, firebaseUser:", firebaseUser ? firebaseUser.uid : null);
      if (firebaseUser) {
        let extraProfile = {};
        try {
          const profileStr = await AsyncStorage.getItem(`@profile_${firebaseUser.uid}`);
          if (profileStr) {
            extraProfile = JSON.parse(profileStr);
          }
        } catch (e) {
          console.log("Failed to load extra profile data:", e);
        }

        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || extraProfile.name || 'User',
          phone: extraProfile.phone || firebaseUser.phoneNumber || 'Not provided',
          bloodGroup: extraProfile.bloodGroup || 'O+',
        };
        setUser(userData);
        setLoading(false); // Unblock UI immediately
        
        // Sync with backend (non-blocking in background)
        try {
          await api.syncUser({
            email: userData.email,
            name: userData.name !== 'User' ? userData.name : undefined,
            phone: userData.phone !== 'Not provided' ? userData.phone : undefined,
            blood_group: userData.bloodGroup,
          });
        } catch (e) {
          console.log("Backend sync failed, but user is logged in locally:", e);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!isFirebaseConfigured) throw new Error("Firebase Auth is not configured. Missing API keys.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name, phone) => {
    if (!isFirebaseConfigured) throw new Error("Firebase Auth is not configured. Missing API keys.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase profile name
      await updateProfile(user, {
        displayName: name
      });

      // Save additional profile data using existing persistence architecture
      const extraProfile = { name, phone };
      try {
        await AsyncStorage.setItem(`@profile_${user.uid}`, JSON.stringify(extraProfile));
      } catch (e) {
        console.error("Failed to save profile to storage", e);
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        phone: phone,
        bloodGroup: 'O+'
      };
      setUser(userData);
      
      // Sync with backend (non-blocking)
      try {
        await api.syncUser({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          blood_group: userData.bloodGroup,
        });
      } catch (e) {
        console.log("Backend sync failed on registration:", e);
      }

      return userCredential;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) throw new Error("Firebase Auth is not configured. Missing API keys.");
    
    if (Platform.OS === 'web') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (error) {
        throw error;
      }
    } else {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        // This handles both v11+ (data object) and older versions
        const response = await GoogleSignin.signIn();
        const idToken = response.data ? response.data.idToken : response.idToken;
        
        if (!idToken) {
           throw new Error("Google Sign-In failed: No ID token returned");
        }
        
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return result.user;
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('auth/popup-closed-by-user'); // map to existing error string expected by UI
        } else if (error.code === statusCodes.IN_PROGRESS) {
          throw new Error('Sign in is already in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Google Play Services not available or outdated');
        } else if (error.code === '12500' || (error.message && (error.message.includes('12500') || error.message.includes('non-recoverable sign in failure')))) {
          throw new Error('Google Sign-In configuration error: The app\'s signing certificate fingerprint (SHA-1) does not match the one registered in Firebase Console.');
        } else {
          console.error("Google Sign-In Error:", error);
          throw new Error(error.message || 'An unexpected error occurred during Google Sign-In');
        }
      }
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, configMissing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
