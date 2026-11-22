import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calculator,
  Camera,
  Download,
  FileSpreadsheet,
  HeartPulse,
  History,
  Info,
  Pill,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { generateSkinPdfReport } from '../utils/pdfReport';

type TimelineItem = {
  id: string;
  type: 'skin' | 'lab' | 'bmi' | 'vital' | 'med';
  date: string;
  title: string;
  subtitle: string;
  details: string;
  skinRecordId?: string;
};

export const HistoryPage: React.FC = () => {
  const {
    lang,
    activeProfile,
    skinHistory,
    labHistory,
    bmiHistory,
    vitals,
    medications,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [filter, setFilter] = useState<'all' | TimelineItem['type']>('all');
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    skinHistory.forEach((s) =>
      list.push({
        id: s.id,
        type: 'skin',
        date: s.createdAt,
        title: isKz ? 'Теріні AI-талдау' : 'Анализ кожи',
        subtitle: s.mode === 'demo' ? 'Демо-режим' : s.modelName || 'AI Vision',
        details: s.summary,
        skinRecordId: s.id,
      })
    );

    labHistory.forEach((l) =>
      list.push({
        id: l.id,
        type: 'lab',
        date: l.createdAt,
        title: l.labTitle,
        subtitle: l.fileName,
        details: l.summary,
      })
    );

    bmiHistory.forEach((b) =>
      list.push({
        id: b.id,
        type: 'bmi',
        date: b.createdAt,
        title: `${isKz ? 'ДСИ' : 'ИМТ'}: ${b.bmi.toFixed(1)}`,
        subtitle: `${b.weightKg} кг · ${b.heightCm} см`,
        details: b.pediatricPercentileNote || `${isKz ? 'Санат' : 'Категория'}: ${b.categoryKey}`,
      })
    );

    vitals.forEach((v) =>
      list.push({
        id: v.id,
        type: 'vital',
        date: v.createdAt,
        title: isKz ? 'Өмірлік көрсеткіштер' : 'Измерение показателей',
        subtitle: [
          v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : '',
          v.pulse ? `${v.pulse} /min` : '',
          v.temperatureC ? `${v.temperatureC}°C` : '',
        ]
          .filter(Boolean)
          .join(' · '),
        details: v.note || (isKz ? 'Қолмен енгізілген өлшем' : 'Запись показателей здоровья'),
      })
    );

    medications.forEach((m) =>
      list.push({
        id: m.id,
        type: 'med',
        date: m.createdAt,
        title: m.name,
        subtitle: `${m.dosage} · ${m.timeOfDay}`,
        details: `${isKz ? 'Қабылданған күндер' : 'Отметок приёма'}: ${m.takenDates.length}`,
      })
    );

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [skinHistory, labHistory, bmiHistory, vitals, medications, isKz]);

  const filtered = items.filter((i) => filter === 'all' || i.type === filter);

  const iconForType = (type: TimelineItem['type']) => {
    switch (type) {
      case 'skin':
        return Camera;
      case 'lab':
        return FileSpreadsheet;
      case 'bmi':
        return Calculator;
      case 'vital':
        return HeartPulse;
      case 'med':
        return Pill;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.history}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? `${activeProfile.name} профилі бойынша бірыңғай медициналық оқиғалар хронологиясы`
            : `Единая лента записей для профиля «${activeProfile.name}»`}
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'all' as const, label: isKz ? 'Барлығы' : 'Все' },
          { id: 'skin' as const, label: isKz ? 'Тері' : 'Кожа' },
          { id: 'lab' as const, label: isKz ? 'Зертхана' : 'Анализы' },
          { id: 'bmi' as const, label: isKz ? 'ДСИ' : 'ИМТ' },
          { id: 'vital' as const, label: isKz ? 'Көрсеткіштер' : 'Пульс/Давление' },
          { id: 'med' as const, label: isKz ? 'Дәрілер' : 'Лекарства' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.id
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">{t.common.noData}</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = iconForType(item.type);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-500 shrink-0">
                    {new Date(item.date).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate-500">
                  {new Date(selectedItem.date).toLocaleString(isKz ? 'kk-KZ' : 'ru-RU')}
                </p>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedItem.title}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              {selectedItem.subtitle}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedItem.details}
            </p>

            {selectedItem.skinRecordId && (
              <button
                type="button"
                onClick={async () => {
                  const rec = skinHistory.find((s) => s.id === selectedItem.skinRecordId);
                  if (!rec) return;
                  await generateSkinPdfReport({
                    record: rec,
                    profile: activeProfile,
                    lang,
                    includeImages: true,
                  });
                  showToast(isKz ? 'PDF сақталды' : 'PDF-отчёт скачан', 'success');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>{t.common.downloadPdf}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { lang } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const blocks = isKz
    ? [
        {
          title: 'Жобаның миссиясы',
          text: 'Қазақстанның әрбір тұрғынына дербес, түсінікті және екі тілде қолжетімді цифрлық денсаулық сақтау экожүйесін ұсыну.',
        },
        {
          title: 'Мәселе және шешім',
          text: 'Өңірлерде дерматологтар мен алғашқы кеңес берудің тапшылығы, климаттық факторлар (аяз, шаң, жоғары UV) және медициналық ақпараттың шашыраңқылығы. DermaSense AI тері бақылауын, ДСИ-ді, дауыстық AI-көмекшіні және отбасылық картаны бір жерге біріктіреді.',
        },
        {
          title: 'Қазақ тілін қолдау және AI рөлі',
          text: 'Интерфейс, медициналық аудармашы, дауыстық көмекші және PDF-есептер қазақ және орыс тілдерінде толық жұмыс істейді. AI шешім қабылдауға көмектеседі, бірақ дәрігерді ешқашан алмастырмайды.',
        },
        {
          title: 'Даму перспективалары және 35 клиникадағы пилот',
          text: '35 медициналық клиникада клиникалық AI-терапевті енгізу жөніндегі мемлекеттік пилоттық жоба аясында алдын ала триажды кеңейту, Damumed және eGov Mobile-мен сертификатталған интеграция және телемедицина.',
        },
      ]
    : [
        {
          title: 'Миссия проекта',
          text: 'Сделать профилактическую цифровую медицину и грамотную подготовку к визиту врача доступными для каждого жителя Казахстана на русском и казахском языках.',
        },
        {
          title: 'Проблема и решение',
          text: 'Дефицит профильных дерматологов в отдельных регионах, суровый континентальный климат (морозы, пыль, высокий UV) и разрозненность медицинских записей семьи. DermaSense AI объединяет визуальную оценку кожи, ИМТ, клинического ИИ-терапевта, лабораторию и навигацию по лучшим больницам РК.',
        },
        {
          title: 'Применение ИИ и поддержка казахского языка',
          text: 'Все ключевые модули переведены на русский и казахский языки (включая голосовой ввод и Unicode PDF-отчёты). Искусственный интеллект помогает систематизировать жалобы и подготовиться к приёму, не подменяя собой врача.',
        },
        {
          title: 'Государственный пилотный проект в 35 клиниках',
          text: 'Архитектура ориентирована на масштабирование клинического ИИ-терапевта в 35 медицинских клиниках Казахстана для предварительного структурирования симптомов, маршрутизации пациентов по специальностям и интеграции с eGov/Damumed при наличии официальных соглашений.',
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.about}
        </h1>
        <p className="text-sm text-sky-700 dark:text-sky-400 font-medium mt-1">
          {t.slogan}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {blocks.map((b, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {b.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-5 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <span>
          {isKz
            ? 'Маңызды ескерту: DermaSense AI медициналық диагноз қоймайды, ем тағайындамайды және дәрігердің кәсіби тексеруін алмастырмайды.'
            : 'Важно: приложение не заменяет врача, не ставит клинических диагнозов и не назначает лечение.'}
        </span>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    navigate,
    notifications,
    updateNotifications,
    clearProfileHistory,
    exportAllDataJson,
    resetAllDemoData,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.settings}
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
        {/* Language & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isKz ? 'Интерфейс тілі' : 'Язык интерфейса'}
            </p>
            <div className="inline-flex gap-2">
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  lang === 'ru'
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Русский
              </button>
              <button
                type="button"
                onClick={() => setLang('kz')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  lang === 'kz'
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Қазақша
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {isKz ? 'Тақырып (Жарық / Қараңғы)' : 'Тема оформления'}
            </p>
            <div className="inline-flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  theme === 'light'
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {isKz ? 'Жарық' : 'Светлая'}
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                  theme === 'dark'
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                {isKz ? 'Қараңғы' : 'Тёмная'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {isKz ? 'Хабарламалар баптауы' : 'Уведомления и напоминания'}
          </p>
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.medicationReminders}
              onChange={(e) => updateNotifications({ medicationReminders: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>{isKz ? 'Дәрі қабылдау еске салғыштары' : 'Напоминания о приёме лекарств'}</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.preventiveAlerts}
              onChange={(e) => updateNotifications({ preventiveAlerts: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>{isKz ? 'Профилактика күнтізбесі' : 'События профилактического календаря'}</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.climateAlerts}
              onChange={(e) => updateNotifications({ climateAlerts: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>{isKz ? 'Өңірлік климат кеңестері' : 'Сезонные климатические рекомендации'}</span>
          </label>
        </div>

        {/* Data & Privacy Controls */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('family')}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isKz ? 'Профильдерді басқару' : 'Управление профилями'}
          </button>

          <button
            type="button"
            onClick={() => {
              exportAllDataJson();
              showToast(isKz ? 'JSON экспортталды' : 'Данные экспортированы в JSON', 'success');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isKz ? 'Деректерді экспорттау' : 'Экспорт данных (JSON)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{isKz ? 'Құпиялылық саясаты' : 'Политика конфиденциальности'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearProfileHistory();
              showToast(isKz ? 'Профиль тарихы тазаланды' : 'История профиля очищена', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold"
          >
            <History className="w-3.5 h-3.5" />
            <span>{isKz ? 'Тарихты тазалау' : 'Удалить историю профиля'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetAllDemoData();
              showToast(
                isKz ? 'Барлық демо-деректер жойылды' : 'Аккаунт и демо-данные сброшены',
                'info'
              );
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isKz ? 'Демо-аккаунтты жою' : 'Удалить демо-профиль и данные'}</span>
          </button>
        </div>
      </div>

      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>{isKz ? 'Құпиялылық саясаты' : 'Политика конфиденциальности и безопасности'}</span>
              </h2>
              <button type="button" onClick={() => setPrivacyOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                {isKz
                  ? '1. Барлық профильдер, фотосуреттер және денсаулық жазбалары сіздің браузеріңізде локальды сақталады және кез келген сәтте жойылуы мүмкін.'
                  : '1. Все пользовательские профили, загруженные снимки и история показателей хранятся локально в вашем браузере и могут быть полностью удалены в один клик.'}
              </p>
              <p>
                {isKz
                  ? '2. API-кілттер браузерге берілмейді; жасанды интеллектке сұраныстар тек сервер арқылы өңделеді.'
                  : '2. Секретные API-ключи никогда не размещаются в клиентском коде и используются только на сервере.'}
              </p>
              <p>
                {isKz
                  ? '3. eGov бөлімі демо-режимде жұмыс істейді және нақты ЖСН, ЭЦҚ немесе SMS-код жинамайды.'
                  : '3. Демонстрационный модуль eGov не собирает ИИН, пароли, SMS-коды и ключи ЭЦП.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
