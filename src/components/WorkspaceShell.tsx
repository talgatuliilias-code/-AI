import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  Baby,
  BookOpen,
  Bot,
  Building2,
  Calculator,
  CalendarCheck,
  Camera,
  CloudSun,
  FileSpreadsheet,
  HeartPulse,
  History,
  Info,
  Languages,
  LayoutDashboard,
  Lock,
  MapPin,
  Menu,
  PhoneCall,
  Pill,
  Settings,
  ShieldAlert,
  Smile,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { RouteId } from '../types/health';
import { TopHeader } from './LayoutChrome';

interface NavGroup {
  title: string;
  items: Array<{ id: RouteId; icon: React.ComponentType<{ className?: string }> }>;
}

export const WorkspaceShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    lang,
    route,
    previousRoute,
    navigate,
    goBack,
    profiles,
    activeProfile,
    switchProfile,
    unlockedChildIds,
    showToast,
  } = useHealth();
  const t = UI_TEXT[lang];
  const isKz = lang === 'kz';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pinModalProfileId, setPinModalProfileId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const groups: NavGroup[] = [
    {
      title: t.sidebarGroups.ai,
      items: [
        { id: 'skin-analyzer', icon: Camera },
        { id: 'assistant', icon: Bot },
        { id: 'lab-analyzer', icon: FileSpreadsheet },
        { id: 'translator', icon: Languages },
      ],
    },
    {
      title: t.sidebarGroups.health,
      items: [
        { id: 'cabinet', icon: LayoutDashboard },
        { id: 'bmi', icon: Calculator },
        { id: 'vitals', icon: HeartPulse },
        { id: 'medications', icon: Pill },
        { id: 'mental-health', icon: Smile },
        { id: 'child-health', icon: Baby },
        { id: 'preventive', icon: CalendarCheck },
        { id: 'history', icon: History },
      ],
    },
    {
      title: t.sidebarGroups.kazakhstan,
      items: [
        { id: 'climate', icon: CloudSun },
        { id: 'doctors', icon: Stethoscope },
        { id: 'pharmacies', icon: MapPin },
        { id: 'egov', icon: Building2 },
        { id: 'damumed', icon: Activity },
      ],
    },
    {
      title: t.sidebarGroups.safety,
      items: [
        { id: 'red-flags', icon: ShieldAlert },
        { id: 'emergency', icon: PhoneCall },
        { id: 'library', icon: BookOpen },
      ],
    },
    {
      title: t.sidebarGroups.system,
      items: [
        { id: 'profile', icon: UserCheck },
        { id: 'family', icon: Users },
        { id: 'about', icon: Info },
        { id: 'settings', icon: Settings },
      ],
    },
  ];

  const handleSelectProfile = async (profileId: string) => {
    const res = await switchProfile(profileId);
    if (!res.ok && res.needsPin) {
      setPinModalProfileId(profileId);
      setPinInput('');
      setPinError('');
    } else if (res.ok) {
      showToast(
        isKz ? 'Отбасы профилі ауыстырылды' : 'Активный профиль переключён',
        'success'
      );
    }
  };

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalProfileId) return;
    const res = await switchProfile(pinModalProfileId, pinInput);
    if (res.ok) {
      setPinModalProfileId(null);
      setPinInput('');
      showToast(isKz ? 'Профиль ашылды' : 'Детский профиль разблокирован', 'success');
    } else {
      setPinError(res.error || (isKz ? 'Қате PIN' : 'Неверный PIN'));
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Active Family Profile Switcher */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{t.common.activeProfile}</span>
          <button
            type="button"
            onClick={() => {
              navigate('family');
              setMobileMenuOpen(false);
            }}
            className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
          >
            {isKz ? 'Отбасы' : 'Семья'}
          </button>
        </div>
        <div className="space-y-1">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            const isLocked =
              p.role === 'child' && Boolean(p.pinHash) && !unlockedChildIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProfile(p.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="truncate">
                  {p.name} · {p.age} {isKz ? 'ж.' : 'л.'}
                </span>
                {isLocked && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            {group.items.map(({ id, icon: Icon }) => {
              const active = route === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    navigate(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    active
                      ? 'bg-sky-600 text-white'
                      : id === 'emergency' || id === 'red-flags'
                        ? 'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.routes[id]}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <TopHeader
        showWorkspaceMenuBtn
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">{sidebarContent}</div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex h-[100dvh]">
            <div
              className="fixed inset-0 bg-slate-950/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full z-10 flex flex-col pb-safe">
              <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
                <span className="font-display font-bold text-slate-900 dark:text-white">
                  DermaSense AI
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </aside>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 space-y-5">
          {/* Universal Back Button & Route Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{isKz ? 'Артқа қайту' : 'Назад'}</span>
              {previousRoute && previousRoute !== route && (
                <span className="hidden sm:inline text-xs font-normal text-slate-400 dark:text-slate-500">
                  · {t.routes[previousRoute]}
                </span>
              )}
            </button>

            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
              {t.routes[route]}
            </span>
          </div>

          {/* Persistent subtle safety notice */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <AlertOctagon className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="leading-snug">{t.common.disclaimerBanner}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:103"
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap"
              >
                {t.common.emergency103}
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="tel:112"
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap"
              >
                {t.common.emergency112}
              </a>
            </div>
          </div>

          {children}
        </main>
      </div>

      {/* Universal Mobile Bottom Navigation Bar (All iOS & Android Phones) */}
      <nav
        aria-label={isKz ? 'Мобильді мәзір' : 'Мобильная навигация'}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {[
            { id: 'cabinet' as const, icon: LayoutDashboard, ru: 'Кабинет', kz: 'Кабинет' },
            { id: 'skin-analyzer' as const, icon: Camera, ru: 'Кожа AI', kz: 'Тері AI' },
            { id: 'assistant' as const, icon: Bot, ru: 'ИИ-чат', kz: 'AI-чат' },
            { id: 'doctors' as const, icon: MapPin, ru: 'Карта РК', kz: 'Карта' },
          ].map(({ id, icon: Icon, ru, kz }) => {
            const active = route === id || (id === 'doctors' && route === 'pharmacies');
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(id);
                }}
                className={`flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors ${
                  active
                    ? 'text-sky-600 dark:text-sky-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-full">{isKz ? kz : ru}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-slate-600 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
            <span>{isKz ? 'Мәзір' : 'Меню'}</span>
          </button>
        </div>
      </nav>

      {/* Parental Control PIN Modal */}
      {pinModalProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>{isKz ? 'Ата-ана бақылауы' : 'Родительский контроль'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPinModalProfileId(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isKz
                ? 'Бала профилін ашу үшін PIN-кодты енгізіңіз.'
                : 'Введите PIN-код для доступа к защищённому детскому профилю.'}
            </p>
            <form onSubmit={handleUnlockPin} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-white"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-600 dark:text-rose-400">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
              >
                {isKz ? 'Ашу' : 'Разблокировать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
