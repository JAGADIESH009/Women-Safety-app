export type PageView = 
  | 'welcome'
  | 'dashboard'
  | 'emergency'
  | 'contacts'
  | 'incidents'
  | 'map'
  | 'mobile-app'
  | 'profile'
  | 'settings'
  | 'features'
  | 'resources'
  | 'reports'
  | 'privacy'
  | 'terms';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  bloodGroup: string;
  medicalNotes?: string;
  allergies?: string;
  isSyncedWithCloud?: boolean;
}

export interface EmergencyContact {
  id: number | string;
  user_id?: number;
  name: string;
  phone: string;
  relation: string;
  is_primary: boolean;
  createdAt?: string;
}

export interface IncidentTimelineEvent {
  time: string;
  event: string;
  location?: {
    latitude: number;
    longitude: number;
    addressLabel?: string;
  };
}

export interface IncidentReport {
  id: string; // e.g. #REP-849201
  type: string;
  description: string;
  createdAt: string;
  location: {
    latitude: number;
    longitude: number;
    addressLabel?: string;
    accuracy?: number;
  };
  status: 'Submitted' | 'Under Review' | 'Resolved';
  timeline: IncidentTimelineEvent[];
}

export interface ContactFormData {
  name: string;
  email: string;
  category: 'general' | 'bug' | 'sos-feedback' | 'hardware-iot' | 'emergency';
  subject: string;
  message: string;
  honeypot?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  technicalDetails: string[];
  iconName: string;
  accentColor: string;
  isMobileNativeOnly?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SafetyReadinessItem {
  id: string;
  label: string;
  description: string;
  points: number;
  completed: boolean;
}
