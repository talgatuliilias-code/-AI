import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Menu,
  Moon,
  Phone,
  QrCode,
  ShieldCheck,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { RouteId } from '../types/health';
import { DermaSenseLogo } from './Logo';
import { ShareQrModal } from './ShareQrModal';

export const TopHeader: React.FC<{
  onOpenMobileMenu?: () => void;
  showWorkspaceMenuBtn?: boolean;
}> = ({ onOpenMobileMenu, showWorkspaceMenuBtn }) => {
  const {
    lang,
    setLang,
    theme,
    toggleTheme,
    route,
    navigate,
    account,
    setAuthModalOpen,
  } = useHealth();
  const t = UI_TEXT[lang];
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navItems: Array<{ id: RouteId; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'skin-analyzer', label: t.nav.skinAnalyzer },
    { id: 'cabinet', label: t.nav.cabinet },
    { id: 'assistant', label: t.nav.assistant },
    { id: 'egov', label: t.nav.egov },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 lg:gap-8">
        {/* Zone 1: Brand (always visible, never truncated) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {showWorkspaceMenuBtn && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-1.5 sm:gap-2 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          >
            <DermaSenseLogo className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            <span className="font-display text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {t.brandName}
            </span>
          </button>
        </div>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = route === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  active
                    ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: QR Share, Language RU/KZ, Theme, Auth */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            aria-label="QR Code"
            title={lang === 'kz' ? 'QR-кодпен бөлісу' : 'QR-код сайта'}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">QR</span>
          </button>

          <div
            className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => setLang('ru')}
              className={`px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'ru'
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLang('kz')}
              className={`px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'kz'
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              KZ
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>{account?.signedIn ? account.fullName.split(' ')[0] : t.nav.signIn}</span>
          </button>

          {!showWorkspaceMenuBtn && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown for public landing */}
      {mobileNavOpen && !showWorkspaceMenuBtn && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigate(item.id);
                setMobileNavOpen(false);
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileNavOpen(false);
              setQrModalOpen(true);
            }}
            className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40"
          >
            <QrCode className="w-4 h-4" />
            <span>{lang === 'kz' ? 'QR-код арқылы кіру' : 'QR-код для входа с телефона'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileNavOpen(false);
              setAuthModalOpen(true);
            }}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40"
          >
            {account?.signedIn ? account.fullName : t.nav.signIn}
          </button>
        </div>
      )}

      <ShareQrModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </header>
  );
};

export const AppFooter: React.FC = () => {
  const { lang, navigate } = useHealth();
  const isKz = lang === 'kz';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <DermaSenseLogo className="w-7 h-7" />
              <span className="font-display font-bold text-slate-900 dark:text-white">
                DermaSense AI
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {UI_TEXT[lang].slogan}
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isKz ? 'AI-мүмкіндіктер' : 'AI-модули'}
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button type="button" onClick={() => navigate('skin-analyzer')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes['skin-analyzer']}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('assistant')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.assistant}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('lab-analyzer')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes['lab-analyzer']}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('bmi')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.bmi}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isKz ? 'Қазақстан қызметтері' : 'Сервисы Казахстана'}
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button type="button" onClick={() => navigate('climate')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.climate}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('doctors')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.doctors}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('egov')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.egov}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('damumed')} className="hover:text-sky-600 dark:hover:text-sky-400">
                  {UI_TEXT[lang].routes.damumed}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isKz ? 'Шұғыл көмек' : 'Экстренная помощь'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:103"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>103</span>
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>112</span>
              </a>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <button type="button" onClick={() => navigate('about')} className="underline hover:text-sky-600">
                {UI_TEXT[lang].routes.about}
              </button>
              {' · '}
              <button type="button" onClick={() => navigate('settings')} className="underline hover:text-sky-600">
                {UI_TEXT[lang].routes.settings}
              </button>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{UI_TEXT[lang].home.disclaimer}</p>
          <p className="whitespace-nowrap shrink-0">© 2026 DermaSense AI · Kazakhstan</p>
        </div>
      </div>
    </footer>
  );
};

export const AuthModal: React.FC = () => {
  const {
    lang,
    authModalOpen,
    setAuthModalOpen,
    account,
    registerDemoAccount,
    signInDemoAccount,
    signOutDemoAccount,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';

  const [mode, setMode] = useState<'login' | 'register'>(account ? 'login' : 'register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(account?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || password.length < 6) {
      setError(
        isKz
          ? 'Дұрыс email және кемінде 6 таңбалы құпиясөз енгізіңіз'
          : 'Введите корректный email и пароль (минимум 6 символов)'
      );
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError(isKz ? 'Аты-жөніңізді енгізіңіз' : 'Введите имя');
        return;
      }
      await registerDemoAccount(fullName, email, password);
      showToast(
        isKz ? 'Демо-аккаунт сәтті құрылды' : 'Демо-аккаунт успешно создан',
        'success'
      );
      setAuthModalOpen(false);
    } else {
      const ok = await signInDemoAccount(email, password);
      if (!ok) {
        setError(
          isKz
            ? 'Email немесе құпиясөз сәйкес келмеді (алдымен тіркеліңіз)'
            : 'Неверный email или пароль (сначала создайте демо-аккаунт)'
        );
        return;
      }
      showToast(isKz ? 'Жүйеге сәтті кірдіңіз' : 'Вход выполнен', 'success');
      setAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isKz ? 'Артқа' : 'Назад'}</span>
            </button>
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {account?.signedIn
                ? isKz
                  ? 'Аккаунт басқару'
                  : 'Управление аккаунтом'
                : mode === 'register'
                  ? isKz
                    ? 'Тіркелу'
                    : 'Регистрация'
                  : isKz
                    ? 'Жүйеге кіру'
                    : 'Вход'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {account?.signedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {account.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{account.email}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKz
                ? 'Құпиясөз SHA-256 хэші түрінде қорғалған. Барлық негізгі функциялар тіркелусіз де қолжетімді.'
                : 'Пароль хранится в виде SHA-256 хэша (никогда в открытом виде). Все демонстрационные функции также доступны без регистрации.'}
            </p>
            <button
              type="button"
              onClick={() => {
                signOutDemoAccount();
                setAuthModalOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isKz ? 'Шығу' : 'Выйти из аккаунта'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isKz ? 'Тіркелу' : 'Регистрация'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isKz ? 'Кіру' : 'Вход'}
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Аты-жөні' : 'Имя'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isKz ? 'Мысалы: Айсұлу' : 'Например: Айсулу'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.kz"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Құпиясөз' : 'Пароль'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isKz
                  ? 'Демо-деректер тек браузерде хэштелген күйде сақталады.'
                  : 'Демо-доступ защищён SHA-256 хэшем. Можно пользоваться без входа.'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
            >
              {mode === 'register'
                ? isKz
                  ? 'Демо-аккаунт құру'
                  : 'Создать демо-аккаунт'
                : isKz
                  ? 'Кіру'
                  : 'Войти'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const ToastBanner: React.FC = () => {
  const { toast } = useHealth();
  if (!toast) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-50 sm:max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg flex items-center gap-2.5 text-sm text-slate-900 dark:text-slate-100">
      {toast.type === 'warning' ? (
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};

export const ConsentNoticeCard: React.FC<{ onAccept: () => void }> = ({ onAccept }) => {
  const { lang } = useHealth();
  const t = UI_TEXT[lang].common;

  return (
    <div className="rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/70 dark:bg-sky-950/30 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.consentRequired}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.consentText}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAccept}
        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
      >
        {t.acceptConsent}
      </button>
    </div>
  );
};
