import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC51tyvDN_2xKimU_PAbTd2GyZyiGydsl4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'women-protection-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'women-protection-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'women-protection-project.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '592378767800',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:592378767800:web:69dd4029293212612e474d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WGX52916TY',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.error('SafeHer Firebase initialization error:', err);
  }
}

export { app, auth, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { User };
