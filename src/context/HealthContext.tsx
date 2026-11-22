import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BmiRecord,
  ChatMessage,
  DemoUserAccount,
  EgovDemoState,
  FamilyProfile,
  LabAnalysisRecord,
  Language,
  MedicationItem,
  MoodEntry,
  NotificationSettings,
  PreventiveCheckItem,
  RouteId,
  SkinAnalysisRecord,
  ThemeMode,
  VitalRecord,
} from '../types/health';
import { hashSecret } from '../utils/crypto';

const STORAGE_KEY = 'dermasense_ai_kz_store_v1';

const ROUTE_PATHS: Record<RouteId, string> = {
  home: '/',
  cabinet: '/cabinet',
  'skin-analyzer': '/skin-analyzer',
  bmi: '/bmi',
  assistant: '/assistant',
  profile: '/profile',
  family: '/family',
  climate: '/climate',
  'red-flags': '/red-flags',
  'lab-analyzer': '/lab-analyzer',
  medications: '/medications',
  vitals: '/vitals',
  'mental-health': '/mental-health',
  'child-health': '/child-health',
  doctors: '/doctors',
  egov: '/egov',
  damumed: '/damumed',
  pharmacies: '/pharmacies',
  emergency: '/emergency',
  translator: '/translator',
  library: '/library',
  preventive: '/preventive',
  history: '/history',
  about: '/about',
  settings: '/settings',
};

function pathToRoute(pathname: string): RouteId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const entry = (Object.entries(ROUTE_PATHS) as Array<[RouteId, string]>).find(
    ([, p]) => p === clean
  );
  return entry ? entry[0] : 'home';
}

interface PersistedState {
  lang: Language;
  theme: ThemeMode;
  activeProfileId: string;
  profiles: FamilyProfile[];
  skinHistory: SkinAnalysisRecord[];
  bmiHistory: BmiRecord[];
  labHistory: LabAnalysisRecord[];
  medications: MedicationItem[];
  vitals: VitalRecord[];
  moodEntries: MoodEntry[];
  preventiveItems: PreventiveCheckItem[];
  chatMessages: ChatMessage[];
  egov: EgovDemoState;
  account: DemoUserAccount | null;
  dataConsentAccepted: boolean;
  notifications: NotificationSettings;
}

const DEFAULT_PROFILES: FamilyProfile[] = [
  {
    id: 'prof-self',
    role: 'self',
    name: 'Айсулу К.',
    age: 28,
    sex: 'female',
    cityId: 'almaty',
    region: 'г. Алматы',
    heightCm: 166,
    weightKg: 59,
    skinType: 'combination',
    complaints: 'Сезонная сухость щёк зимой',
    allergies: 'Пыльца полыни (сезонно)',
    preferredLang: 'ru',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'prof-child',
    role: 'child',
    name: 'Амир К.',
    age: 7,
    sex: 'male',
    cityId: 'almaty',
    region: 'г. Алматы',
    heightCm: 124,
    weightKg: 24.5,
    skinType: 'sensitive',
    complaints: 'Чувствительная кожа зимой',
    allergies: 'Нет известных',
    preferredLang: 'kz',
    createdAt: '2026-01-10T09:05:00.000Z',
  },
];

function createInitialState(): PersistedState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lang: 'ru',
    theme: 'light',
    activeProfileId: 'prof-self',
    profiles: DEFAULT_PROFILES,
    skinHistory: [],
    bmiHistory: [
      {
        id: 'bmi-seed-y1',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 330 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 63.2,
        age: 28,
        sex: 'female',
        bmi: 22.9,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-y2',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 250 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 62.4,
        age: 28,
        sex: 'female',
        bmi: 22.6,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-y3',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 170 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 61.5,
        age: 28,
        sex: 'female',
        bmi: 22.3,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-q1',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 60.8,
        age: 28,
        sex: 'female',
        bmi: 22.1,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-q2',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 48 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 60.1,
        age: 28,
        sex: 'female',
        bmi: 21.8,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-m1',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 59.7,
        age: 28,
        sex: 'female',
        bmi: 21.7,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-m2',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 59.3,
        age: 28,
        sex: 'female',
        bmi: 21.5,
        categoryKey: 'normal',
      },
      {
        id: 'bmi-seed-m3',
        profileId: 'prof-self',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        heightCm: 166,
        weightKg: 59.0,
        age: 28,
        sex: 'female',
        bmi: 21.4,
        categoryKey: 'normal',
      },
    ],
    labHistory: [],
    medications: [
      {
        id: 'med-seed-1',
        profileId: 'prof-self',
        name: 'Витамин D3 (по назначению врача)',
        dosage: '2000 МЕ',
        timeOfDay: '09:00',
        durationDays: 60,
        prescribedByDoctor: true,
        takenDates: [today],
        createdAt: '2026-11-01T09:00:00.000Z',
      },
    ],
    vitals: [
      {
        id: 'vit-seed-1',
        profileId: 'prof-self',
        createdAt: '2026-11-14T08:30:00.000Z',
        pulse: 72,
        systolic: 116,
        diastolic: 74,
        weightKg: 59.4,
        temperatureC: 36.6,
      },
      {
        id: 'vit-seed-2',
        profileId: 'prof-self',
        createdAt: '2026-11-18T08:30:00.000Z',
        pulse: 70,
        systolic: 114,
        diastolic: 72,
        weightKg: 59.0,
        temperatureC: 36.5,
      },
    ],
    moodEntries: [
      {
        id: 'mood-seed-1',
        profileId: 'prof-self',
        createdAt: '2026-11-19T20:00:00.000Z',
        score: 4,
        tags: ['Спокойствие', 'Прогулка'],
        note: 'Хороший сон и прогулка на свежем воздухе.',
      },
    ],
    preventiveItems: [
      {
        id: 'prev-1',
        profileId: 'prof-self',
        titleRu: 'Ежегодный профилактический осмотр у дерматолога (дерматоскопия)',
        titleKz: 'Дерматологта жыл сайынғы профилактикалық тексеру (дерматоскопия)',
        category: 'derma',
        dueDate: '2026-12-10',
        completed: false,
      },
      {
        id: 'prev-2',
        profileId: 'prof-self',
        titleRu: 'Плановый терапевтический осмотр в поликлинике прикрепления',
        titleKz: 'Тіркелген емханада жоспарлы терапиялық тексеру',
        category: 'screening',
        dueDate: '2026-12-20',
        completed: false,
      },
      {
        id: 'prev-3',
        profileId: 'prof-child',
        titleRu: 'Плановый осмотр педиатра (справочный календарь)',
        titleKz: 'Педиатрдың жоспарлы қарауы (анықтамалық күнтізбе)',
        category: 'vaccination',
        dueDate: '2026-12-05',
        completed: false,
      },
    ],
    chatMessages: [],
    egov: {
      connected: false,
      consentGiven: false,
      permissionLogs: [],
    },
    account: null,
    dataConsentAccepted: false,
    notifications: {
      medicationReminders: true,
      preventiveAlerts: true,
      climateAlerts: true,
    },
  };
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const defaults = createInitialState();
    return {
      ...defaults,
      ...parsed,
      profiles: Array.isArray(parsed.profiles) && parsed.profiles.length > 0 ? parsed.profiles : defaults.profiles,
      activeProfileId: parsed.activeProfileId || defaults.activeProfileId,
    };
  } catch {
    return createInitialState();
  }
}

interface ToastState {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface HealthContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  route: RouteId;
  previousRoute: RouteId | null;
  navigate: (route: RouteId) => void;
  goBack: () => void;
  serverAiAvailable: boolean;
  preferDemoMode: boolean;
  setPreferDemoMode: (val: boolean) => void;
  profiles: FamilyProfile[];
  activeProfile: FamilyProfile;
  switchProfile: (profileId: string, pinAttempt?: string) => Promise<{ ok: boolean; needsPin?: boolean; error?: string }>;
  unlockedChildIds: string[];
  addProfile: (profile: Omit<FamilyProfile, 'id' | 'createdAt' | 'pinHash'>, rawPin?: string) => Promise<FamilyProfile>;
  updateProfile: (profileId: string, updates: Partial<FamilyProfile>, newRawPin?: string) => Promise<void>;
  deleteProfile: (profileId: string) => void;
  // Scoped records for activeProfile
  skinHistory: SkinAnalysisRecord[];
  allSkinHistory: SkinAnalysisRecord[];
  addSkinRecord: (rec: SkinAnalysisRecord) => void;
  bmiHistory: BmiRecord[];
  addBmiRecord: (rec: Omit<BmiRecord, 'id' | 'profileId' | 'createdAt'>) => void;
  labHistory: LabAnalysisRecord[];
  addLabRecord: (rec: LabAnalysisRecord) => void;
  medications: MedicationItem[];
  addMedication: (med: Omit<MedicationItem, 'id' | 'profileId' | 'createdAt' | 'takenDates'>) => void;
  toggleMedicationTakenToday: (medId: string) => void;
  deleteMedication: (medId: string) => void;
  vitals: VitalRecord[];
  addVitalRecord: (v: Omit<VitalRecord, 'id' | 'profileId' | 'createdAt'>) => void;
  moodEntries: MoodEntry[];
  addMoodEntry: (m: Omit<MoodEntry, 'id' | 'profileId' | 'createdAt'>) => void;
  preventiveItems: PreventiveCheckItem[];
  togglePreventiveItem: (id: string) => void;
  addPreventiveItem: (item: Omit<PreventiveCheckItem, 'id' | 'profileId' | 'completed'>) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'profileId' | 'createdAt'>) => void;
  clearChatForProfile: () => void;
  attachedSkinAnalysisId: string | null;
  setAttachedSkinAnalysisId: (id: string | null) => void;
  preselectedDoctorFilter: { cityId?: string; specialty?: string } | null;
  setPreselectedDoctorFilter: (filter: { cityId?: string; specialty?: string } | null) => void;
  egov: EgovDemoState;
  connectEgovDemo: () => void;
  disconnectEgovDemo: () => void;
  account: DemoUserAccount | null;
  registerDemoAccount: (fullName: string, email: string, password: string) => Promise<void>;
  signInDemoAccount: (email: string, password: string) => Promise<boolean>;
  signOutDemoAccount: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  dataConsentAccepted: boolean;
  acceptDataConsent: () => void;
  notifications: NotificationSettings;
  updateNotifications: (n: Partial<NotificationSettings>) => void;
  clearProfileHistory: () => void;
  resetAllDemoData: () => void;
  exportAllDataJson: () => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [route, setRoute] = useState<RouteId>(() => pathToRoute(window.location.pathname));
  const [routeHistory, setRouteHistory] = useState<RouteId[]>([]);
  const [serverAiAvailable, setServerAiAvailable] = useState(false);
  const [preferDemoMode, setPreferDemoMode] = useState(false);
  const [unlockedChildIds, setUnlockedChildIds] = useState<string[]>([]);
  const [attachedSkinAnalysisId, setAttachedSkinAnalysisId] = useState<string | null>(null);
  const [preselectedDoctorFilter, setPreselectedDoctorFilter] = useState<{ cityId?: string; specialty?: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3600);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.lang = state.lang === 'kz' ? 'kk' : 'ru';
  }, [state.theme, state.lang]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(pathToRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d: { aiAvailable?: boolean }) => {
        setServerAiAvailable(Boolean(d.aiAvailable));
      })
      .catch(() => setServerAiAvailable(false));
  }, []);

  const navigate = (nextRoute: RouteId) => {
    if (nextRoute !== route) {
      setRouteHistory((prev) => [...prev.slice(-19), route]);
    }
    setRoute(nextRoute);
    const targetPath = ROUTE_PATHS[nextRoute] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    let target: RouteId;
    if (routeHistory.length > 0) {
      target = routeHistory[routeHistory.length - 1];
      setRouteHistory((prev) => prev.slice(0, -1));
    } else if (route !== 'cabinet' && route !== 'home') {
      target = 'cabinet';
    } else {
      target = 'home';
    }
    setRoute(target);
    const targetPath = ROUTE_PATHS[target] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeProfile = useMemo(() => {
    return (
      state.profiles.find((p) => p.id === state.activeProfileId) ||
      state.profiles[0] ||
      DEFAULT_PROFILES[0]
    );
  }, [state.profiles, state.activeProfileId]);

  const setLang = (lang: Language) => setState((prev) => ({ ...prev, lang }));
  const toggleTheme = () =>
    setState((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  const setTheme = (theme: ThemeMode) => setState((prev) => ({ ...prev, theme }));

  const switchProfile = async (profileId: string, pinAttempt?: string) => {
    const target = state.profiles.find((p) => p.id === profileId);
    if (!target) return { ok: false, error: 'Profile not found' };

    if (target.role === 'child' && target.pinHash && !unlockedChildIds.includes(profileId)) {
      if (!pinAttempt) {
        return { ok: false, needsPin: true };
      }
      const attemptHash = await hashSecret(pinAttempt, profileId);
      if (attemptHash !== target.pinHash) {
        return {
          ok: false,
          needsPin: true,
          error: state.lang === 'kz' ? 'Қате PIN-код' : 'Неверный PIN-код',
        };
      }
      setUnlockedChildIds((prev) => [...prev, profileId]);
    }

    setState((prev) => ({ ...prev, activeProfileId: profileId }));
    return { ok: true };
  };

  const addProfile = async (
    profile: Omit<FamilyProfile, 'id' | 'createdAt' | 'pinHash'>,
    rawPin?: string
  ): Promise<FamilyProfile> => {
    const id = `prof-${Date.now()}`;
    const pinHash = rawPin && rawPin.trim() ? await hashSecret(rawPin.trim(), id) : undefined;
    const created: FamilyProfile = {
      ...profile,
      id,
      pinHash,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, created],
      activeProfileId: created.id,
    }));
    if (pinHash) {
      setUnlockedChildIds((prev) => [...prev, id]);
    }
    return created;
  };

  const updateProfile = async (
    profileId: string,
    updates: Partial<FamilyProfile>,
    newRawPin?: string
  ) => {
    let updatedPinHash: string | undefined;
    if (typeof newRawPin === 'string') {
      updatedPinHash = newRawPin.trim() ? await hashSecret(newRawPin.trim(), profileId) : undefined;
    }
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== profileId) return p;
        return {
          ...p,
          ...updates,
          ...(typeof newRawPin === 'string' ? { pinHash: updatedPinHash } : {}),
        };
      }),
    }));
  };

  const deleteProfile = (profileId: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      return {
        ...prev,
        profiles: remaining,
        activeProfileId:
          prev.activeProfileId === profileId ? remaining[0].id : prev.activeProfileId,
        skinHistory: prev.skinHistory.filter((r) => r.profileId !== profileId),
        bmiHistory: prev.bmiHistory.filter((r) => r.profileId !== profileId),
        labHistory: prev.labHistory.filter((r) => r.profileId !== profileId),
        medications: prev.medications.filter((r) => r.profileId !== profileId),
        vitals: prev.vitals.filter((r) => r.profileId !== profileId),
        moodEntries: prev.moodEntries.filter((r) => r.profileId !== profileId),
        preventiveItems: prev.preventiveItems.filter((r) => r.profileId !== profileId),
        chatMessages: prev.chatMessages.filter((r) => r.profileId !== profileId),
      };
    });
  };

  const pid = activeProfile.id;

  const skinHistory = useMemo(
    () => state.skinHistory.filter((r) => r.profileId === pid),
    [state.skinHistory, pid]
  );
  const bmiHistory = useMemo(
    () => state.bmiHistory.filter((r) => r.profileId === pid),
    [state.bmiHistory, pid]
  );
  const labHistory = useMemo(
    () => state.labHistory.filter((r) => r.profileId === pid),
    [state.labHistory, pid]
  );
  const medications = useMemo(
    () => state.medications.filter((r) => r.profileId === pid),
    [state.medications, pid]
  );
  const vitals = useMemo(
    () => state.vitals.filter((r) => r.profileId === pid),
    [state.vitals, pid]
  );
  const moodEntries = useMemo(
    () => state.moodEntries.filter((r) => r.profileId === pid),
    [state.moodEntries, pid]
  );
  const preventiveItems = useMemo(
    () => state.preventiveItems.filter((r) => r.profileId === pid),
    [state.preventiveItems, pid]
  );
  const chatMessages = useMemo(
    () => state.chatMessages.filter((r) => r.profileId === pid),
    [state.chatMessages, pid]
  );

  const addSkinRecord = (rec: SkinAnalysisRecord) => {
    setState((prev) => ({ ...prev, skinHistory: [rec, ...prev.skinHistory] }));
  };

  const addBmiRecord = (rec: Omit<BmiRecord, 'id' | 'profileId' | 'createdAt'>) => {
    const newRec: BmiRecord = {
      ...rec,
      id: `bmi-${Date.now()}`,
      profileId: pid,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      bmiHistory: [...prev.bmiHistory, newRec],
      profiles: prev.profiles.map((p) =>
        p.id === pid ? { ...p, heightCm: rec.heightCm, weightKg: rec.weightKg } : p
      ),
    }));
  };

  const addLabRecord = (rec: LabAnalysisRecord) => {
    setState((prev) => ({ ...prev, labHistory: [rec, ...prev.labHistory] }));
  };

  const addMedication = (
    med: Omit<MedicationItem, 'id' | 'profileId' | 'createdAt' | 'takenDates'>
  ) => {
    const item: MedicationItem = {
      ...med,
      id: `med-${Date.now()}`,
      profileId: pid,
      takenDates: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, medications: [item, ...prev.medications] }));
  };

  const toggleMedicationTakenToday = (medId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => {
        if (m.id !== medId) return m;
        const exists = m.takenDates.includes(today);
        return {
          ...m,
          takenDates: exists ? m.takenDates.filter((d) => d !== today) : [...m.takenDates, today],
        };
      }),
    }));
  };

  const deleteMedication = (medId: string) => {
    setState((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== medId),
    }));
  };

  const addVitalRecord = (v: Omit<VitalRecord, 'id' | 'profileId' | 'createdAt'>) => {
    const item: VitalRecord = {
      ...v,
      id: `vit-${Date.now()}`,
      profileId: pid,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, vitals: [...prev.vitals, item] }));
  };

  const addMoodEntry = (m: Omit<MoodEntry, 'id' | 'profileId' | 'createdAt'>) => {
    const item: MoodEntry = {
      ...m,
      id: `mood-${Date.now()}`,
      profileId: pid,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, moodEntries: [item, ...prev.moodEntries] }));
  };

  const togglePreventiveItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      preventiveItems: prev.preventiveItems.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
            }
          : item
      ),
    }));
  };

  const addPreventiveItem = (
    item: Omit<PreventiveCheckItem, 'id' | 'profileId' | 'completed'>
  ) => {
    const created: PreventiveCheckItem = {
      ...item,
      id: `prev-${Date.now()}`,
      profileId: pid,
      completed: false,
    };
    setState((prev) => ({ ...prev, preventiveItems: [created, ...prev.preventiveItems] }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'profileId' | 'createdAt'>) => {
    const created: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      profileId: pid,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, chatMessages: [...prev.chatMessages, created] }));
  };

  const clearChatForProfile = () => {
    setState((prev) => ({
      ...prev,
      chatMessages: prev.chatMessages.filter((m) => m.profileId !== pid),
    }));
  };

  const connectEgovDemo = () => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      egov: {
        connected: true,
        consentGiven: true,
        connectedAt: now,
        permissionLogs: [
          {
            id: `egov-log-${Date.now()}`,
            actionRu: 'Выдано демо-согласие на просмотр тестового медпаспорта (без передачи ИИН)',
            actionKz: 'Тестілік медпаспортты көруге демо-келісім берілді (ЖСН берілмейді)',
            timestamp: now,
          },
          ...prev.egov.permissionLogs,
        ],
      },
    }));
  };

  const disconnectEgovDemo = () => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      egov: {
        connected: false,
        consentGiven: false,
        permissionLogs: [
          {
            id: `egov-log-${Date.now()}`,
            actionRu: 'Демо-подключение eGov отключено пользователем',
            actionKz: 'eGov демо-қосылымы пайдаланушымен өшірілді',
            timestamp: now,
          },
          ...prev.egov.permissionLogs,
        ],
      },
    }));
  };

  const registerDemoAccount = async (fullName: string, email: string, password: string) => {
    const passwordHash = await hashSecret(password, email.toLowerCase().trim());
    setState((prev) => ({
      ...prev,
      account: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        signedIn: true,
      },
    }));
  };

  const signInDemoAccount = async (email: string, password: string): Promise<boolean> => {
    if (!state.account) return false;
    const attempt = await hashSecret(password, email.toLowerCase().trim());
    if (
      state.account.email === email.trim().toLowerCase() &&
      state.account.passwordHash === attempt
    ) {
      setState((prev) => ({
        ...prev,
        account: prev.account ? { ...prev.account, signedIn: true } : null,
      }));
      return true;
    }
    return false;
  };

  const signOutDemoAccount = () => {
    setState((prev) => ({
      ...prev,
      account: prev.account ? { ...prev.account, signedIn: false } : null,
    }));
  };

  const acceptDataConsent = () => setState((prev) => ({ ...prev, dataConsentAccepted: true }));

  const updateNotifications = (n: Partial<NotificationSettings>) => {
    setState((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...n },
    }));
  };

  const clearProfileHistory = () => {
    setState((prev) => ({
      ...prev,
      skinHistory: prev.skinHistory.filter((r) => r.profileId !== pid),
      bmiHistory: prev.bmiHistory.filter((r) => r.profileId !== pid),
      labHistory: prev.labHistory.filter((r) => r.profileId !== pid),
      vitals: prev.vitals.filter((r) => r.profileId !== pid),
      moodEntries: prev.moodEntries.filter((r) => r.profileId !== pid),
      chatMessages: prev.chatMessages.filter((r) => r.profileId !== pid),
    }));
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialState());
    setUnlockedChildIds([]);
  };

  const exportAllDataJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dermasense-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HealthContext.Provider
      value={{
        lang: state.lang,
        setLang,
        theme: state.theme,
        toggleTheme,
        setTheme,
        route,
        previousRoute: routeHistory.length > 0 ? routeHistory[routeHistory.length - 1] : null,
        navigate,
        goBack,
        serverAiAvailable,
        preferDemoMode,
        setPreferDemoMode,
        profiles: state.profiles,
        activeProfile,
        switchProfile,
        unlockedChildIds,
        addProfile,
        updateProfile,
        deleteProfile,
        skinHistory,
        allSkinHistory: state.skinHistory,
        addSkinRecord,
        bmiHistory,
        addBmiRecord,
        labHistory,
        addLabRecord,
        medications,
        addMedication,
        toggleMedicationTakenToday,
        deleteMedication,
        vitals,
        addVitalRecord,
        moodEntries,
        addMoodEntry,
        preventiveItems,
        togglePreventiveItem,
        addPreventiveItem,
        chatMessages,
        addChatMessage,
        clearChatForProfile,
        attachedSkinAnalysisId,
        setAttachedSkinAnalysisId,
        preselectedDoctorFilter,
        setPreselectedDoctorFilter,
        egov: state.egov,
        connectEgovDemo,
        disconnectEgovDemo,
        account: state.account,
        registerDemoAccount,
        signInDemoAccount,
        signOutDemoAccount,
        authModalOpen,
        setAuthModalOpen,
        dataConsentAccepted: state.dataConsentAccepted,
        acceptDataConsent,
        notifications: state.notifications,
        updateNotifications,
        clearProfileHistory,
        resetAllDemoData,
        exportAllDataJson,
        toast,
        showToast,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export function useHealth(): HealthContextValue {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
}
