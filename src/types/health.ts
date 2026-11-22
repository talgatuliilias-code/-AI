export type Language = 'ru' | 'kz';
export type ThemeMode = 'light' | 'dark';

export type FamilyRole = 'self' | 'child' | 'mother' | 'father' | 'spouse';
export type BiologicalSex = 'female' | 'male' | 'unspecified';
export type SkinType = 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';

export type RouteId =
  | 'home'
  | 'cabinet'
  | 'skin-analyzer'
  | 'bmi'
  | 'assistant'
  | 'profile'
  | 'family'
  | 'climate'
  | 'red-flags'
  | 'lab-analyzer'
  | 'medications'
  | 'vitals'
  | 'mental-health'
  | 'child-health'
  | 'doctors'
  | 'egov'
  | 'damumed'
  | 'pharmacies'
  | 'emergency'
  | 'translator'
  | 'library'
  | 'preventive'
  | 'history'
  | 'about'
  | 'settings';

export interface FamilyProfile {
  id: string;
  role: FamilyRole;
  name: string;
  age: number;
  sex: BiologicalSex;
  cityId: string;
  region: string;
  heightCm: number;
  weightKg: number;
  skinType: SkinType;
  complaints: string;
  allergies: string;
  preferredLang: Language;
  pinHash?: string; // SHA-256 salted hash for parental lock on child profiles
  createdAt: string;
}

export type SkinCauseIconType =
  | 'uv'
  | 'climate'
  | 'barrier'
  | 'sebum'
  | 'allergen'
  | 'stress'
  | 'friction'
  | 'pigment'
  | 'warning';

export interface SkinCauseBadge {
  icon: SkinCauseIconType;
  label: string;
}

export interface SkinPhotoAnnotation {
  id: string;
  imageIndex: number;
  signKey: string;
  label: string;
  xPct: number;
  yPct: number;
  radiusPct?: number;
  severity: 'mild' | 'moderate' | 'notable';
  causeIcon: SkinCauseIconType;
  causeLabel: string;
  description: string;
}

export interface SkinSignResult {
  key: string;
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'notable';
  confidence?: number;
  explanation: string;
  possibleFactors: string[];
  causeBadges?: SkinCauseBadge[];
  recommendations: string[];
  needsSpecialist: boolean;
}

export interface SkinAnalysisRecord {
  id: string;
  profileId: string;
  createdAt: string;
  mode: 'ai' | 'demo';
  modelName?: string;
  images: string[];
  summary: string;
  overallUrgency: 'green' | 'yellow' | 'red';
  redFlagsDetected: string[];
  generalCare: string[];
  specialistAdvice: string;
  signs: SkinSignResult[];
  annotations?: SkinPhotoAnnotation[];
}

export interface BmiRecord {
  id: string;
  profileId: string;
  createdAt: string;
  heightCm: number;
  weightKg: number;
  age: number;
  sex: BiologicalSex;
  bmi: number;
  categoryKey: 'underweight' | 'normal' | 'overweight' | 'obesity' | 'pediatric';
  pediatricPercentileNote?: string;
}

export interface LabMarker {
  name: string;
  value: number;
  valueText?: string;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  referenceRangeText: string;
  status: 'normal' | 'low' | 'high';
  explanation: string;
}

export interface LabAnalysisRecord {
  id: string;
  profileId: string;
  createdAt: string;
  mode: 'ai' | 'demo';
  fileName: string;
  labTitle: string;
  readable: boolean;
  unreadableReason?: string;
  summary: string;
  markers: LabMarker[];
}

export interface MedicationItem {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  durationDays: number;
  prescribedByDoctor: boolean;
  takenDates: string[]; // YYYY-MM-DD
  createdAt: string;
}

export interface VitalRecord {
  id: string;
  profileId: string;
  createdAt: string;
  pulse?: number;
  systolic?: number;
  diastolic?: number;
  weightKg?: number;
  temperatureC?: number;
  note?: string;
}

export interface MoodEntry {
  id: string;
  profileId: string;
  createdAt: string;
  score: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  note: string;
}

export interface PreventiveCheckItem {
  id: string;
  profileId: string;
  titleRu: string;
  titleKz: string;
  category: 'vaccination' | 'screening' | 'dental' | 'derma';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  profileId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mode?: 'ai' | 'demo';
  attachedAnalysisSummary?: string;
}

export interface EgovDemoState {
  connected: boolean;
  consentGiven: boolean;
  connectedAt?: string;
  permissionLogs: Array<{
    id: string;
    actionRu: string;
    actionKz: string;
    timestamp: string;
  }>;
}

export interface DemoUserAccount {
  email: string;
  fullName: string;
  passwordHash: string;
  signedIn: boolean;
}

export interface NotificationSettings {
  medicationReminders: boolean;
  preventiveAlerts: boolean;
  climateAlerts: boolean;
}
