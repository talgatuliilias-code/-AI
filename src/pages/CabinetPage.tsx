import React from 'react';
import {
  ArrowRight,
  Bot,
  Calculator,
  Camera,
  CloudSun,
  FileSpreadsheet,
  HeartPulse,
  Pill,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { KZ_CITIES } from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';

export const CabinetPage: React.FC = () => {
  const {
    lang,
    navigate,
    activeProfile,
    skinHistory,
    bmiHistory,
    medications,
    vitals,
    labHistory,
    preventiveItems,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const city = KZ_CITIES.find((c) => c.id === activeProfile.cityId) || KZ_CITIES[0];
  const latestBmi = bmiHistory[bmiHistory.length - 1];
  const latestVital = vitals[vitals.length - 1];
  const latestSkin = skinHistory[0];
  const today = new Date().toISOString().slice(0, 10);
  const takenTodayCount = medications.filter((m) => m.takenDates.includes(today)).length;
  const openPreventive = preventiveItems.filter((p) => !p.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.common.activeProfile} · {activeProfile.name} ({activeProfile.age} {isKz ? 'жас' : 'лет'})
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
            {t.routes.cabinet}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => navigate('skin-analyzer')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>{t.home.startAnalysis}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('assistant')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>{isKz ? 'Белгілерді AI-мен талдау' : 'ИИ-терапевт (симптомы)'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('doctors')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isKz ? 'Үздік ауруханалар' : 'Больницы РК'}</span>
          </button>
        </div>
      </div>

      {/* Key Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => navigate('skin-analyzer')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">{isKz ? 'Тері талдаулары' : 'Проверки кожи'}</span>
            <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {skinHistory.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {latestSkin
              ? new Date(latestSkin.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU')
              : isKz
                ? 'Алғашқы талдауды бастаңыз'
                : 'Проведите первый анализ'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('bmi')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">{isKz ? 'Соңғы ДСИ' : 'Последний ИМТ'}</span>
            <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {latestBmi ? latestBmi.bmi.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {latestBmi
              ? `${latestBmi.weightKg} ${isKz ? 'кг' : 'кг'} · ${latestBmi.heightCm} ${isKz ? 'см' : 'см'}`
              : isKz
                ? 'Деректер жоқ'
                : 'Нет измерений'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('vitals')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">{isKz ? 'Пульс және қысым' : 'Пульс и давление'}</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {latestVital?.systolic && latestVital?.diastolic
              ? `${latestVital.systolic}/${latestVital.diastolic}`
              : '—'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {latestVital?.pulse
              ? `${isKz ? 'Пульс' : 'Пульс'}: ${latestVital.pulse} / мин`
              : isKz
                ? 'Көрсеткіш қосыңыз'
                : 'Добавьте измерение'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('medications')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">{isKz ? 'Бүгінгі дәрілер' : 'Приём лекарств'}</span>
            <Pill className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {takenTodayCount} / {medications.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKz ? `Алдын алу: ${openPreventive} белсенді` : `Профилактика: ${openPreventive} в плане`}
          </p>
        </button>
      </div>

      {/* Regional Climate Highlight & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {isKz ? `Климаттық ұсыныстар: ${city.nameKz}` : `Климат и уход: ${city.nameRu}`}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('climate')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{isKz ? 'Толығырақ' : 'Подробнее'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKz ? city.climateTypeKz : city.climateTypeRu}
          </p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {(isKz ? city.seasonalTipsKz : city.seasonalTipsRu).map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Жылдам ауысу' : 'Быстрый доступ'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'lab-analyzer' as const, icon: FileSpreadsheet, label: `${t.routes['lab-analyzer']} (${labHistory.length})` },
              { id: 'red-flags' as const, icon: ShieldAlert, label: t.routes['red-flags'] },
              { id: 'doctors' as const, icon: Stethoscope, label: t.routes.doctors },
              { id: 'family' as const, icon: Users, label: t.routes.family },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
