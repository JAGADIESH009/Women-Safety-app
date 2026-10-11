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
