import React, { useState } from 'react';
import { BookOpen, Check, Copy, Languages, Loader2, Search, X } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import {
  LIBRARY_ARTICLES,
  LibraryArticle,
  MEDICAL_DICTIONARY,
} from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';

export const TranslatorPage: React.FC = () => {
  const { lang, serverAiAvailable, preferDemoMode, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [pair, setPair] = useState<'kz-ru' | 'ru-kz' | 'en-ru' | 'en-kz'>('kz-ru');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    translation: string;
    explanation: string;
    mode: 'ai' | 'dictionary';
  } | null>(null);

  const handleTranslate = async (e?: React.FormEvent, presetTerm?: string) => {
    e?.preventDefault();
    const text = (presetTerm ?? query).trim();
    if (!text) return;
    if (presetTerm) setQuery(presetTerm);

    const lower = text.toLowerCase();
    const dictMatch = MEDICAL_DICTIONARY.find(
      (entry) =>
        entry.kz.toLowerCase().includes(lower) ||
        entry.ru.toLowerCase().includes(lower) ||
        entry.en.toLowerCase().includes(lower)
    );

    if (serverAiAvailable && !preferDemoMode) {
      setLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, pair }),
        });
        const data = await res.json();
        if (res.ok && data.result?.translation) {
          setResult({
            translation: data.result.translation,
            explanation: data.result.explanation || data.result.patientTip || '',
            mode: 'ai',
          });
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to local dictionary below
      }
      setLoading(false);
    }

    if (dictMatch) {
      let translated = dictMatch.ru;
      if (pair === 'ru-kz' || pair === 'en-kz') translated = dictMatch.kz;
      if (pair === 'kz-ru' || pair === 'en-ru') translated = dictMatch.ru;
      setResult({
        translation: translated,
        explanation:
          pair === 'ru-kz' || pair === 'en-kz'
            ? dictMatch.explanationKz
            : dictMatch.explanationRu,
        mode: 'dictionary',
      });
    } else {
      setResult({
        translation: isKz
          ? 'Сөздікте нақты сәйкестік табылмады (төмендегі терминдерді таңдаңыз немесе AI қосыңыз).'
          : 'Точного совпадения в офлайн-словаре нет (выберите термин из справочника ниже или подключите AI).',
        explanation: '',
        mode: 'dictionary',
      });
    }
  };

  const handleCopy = async () => {
    if (!result?.translation) return;
    await navigator.clipboard.writeText(result.translation);
    setCopied(true);
    showToast(isKz ? 'Мәтін көшірілді' : 'Текст скопирован', 'success');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.translator}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Медициналық терминдерді қазақ, орыс және ағылшын тілдеріне аудару және түсіндіру.'
            : 'Перевод и простое объяснение медицинских терминов (KZ ↔ RU, EN → RU/KZ).'}
        </p>
      </div>

      <form
        onSubmit={handleTranslate}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'kz-ru' as const, label: 'Қазақша → Русский' },
            { id: 'ru-kz' as const, label: 'Русский → Қазақша' },
            { id: 'en-ru' as const, label: 'English → Русский' },
            { id: 'en-kz' as const, label: 'English → Қазақша' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPair(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                pair === p.id
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isKz
                ? 'Медициналық терминді жазыңыз (мысалы: Қызару, Акне, Blood pressure)...'
                : 'Введите термин или фразу (например: Тері бөртпесі, Акне, Skin rash)...'
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-semibold shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            <span>{isKz ? 'Аудару' : 'Перевести'}</span>
          </button>
        </div>

        {result && (
          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  {result.mode === 'ai'
                    ? 'AI Translation'
                    : isKz
                      ? 'Медициналық сөздік'
                      : 'Медицинский словарь'}
                </p>
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {result.translation}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isKz ? 'Көшіру' : 'Копировать'}</span>
              </button>
            </div>
            {result.explanation && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {result.explanation}
              </p>
            )}
          </div>
        )}
      </form>

      {/* Curated Bilingual Medical Dictionary */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          {isKz ? 'Жиі қолданылатын медициналық терминдер' : 'Справочник медицинских терминов'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MEDICAL_DICTIONARY.map((entry, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                handleTranslate(
                  undefined,
                  pair.startsWith('kz') ? entry.kz : pair.startsWith('ru') ? entry.ru : entry.en
                )
              }
              className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-colors space-y-1"
            >
              <p className="text-xs font-bold text-sky-700 dark:text-sky-400">
                {entry.kz} · {entry.ru} · {entry.en}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isKz ? entry.explanationKz : entry.explanationRu}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LibraryPage: React.FC = () => {
  const { lang } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [category, setCategory] = useState<'all' | LibraryArticle['category']>('all');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<LibraryArticle | null>(null);

  const filtered = LIBRARY_ARTICLES.filter((a) => {
    const matchCat = category === 'all' || a.category === category;
    const text = (isKz ? `${a.titleKz} ${a.summaryKz}` : `${a.titleRu} ${a.summaryRu}`).toLowerCase();
    const matchSearch = !search.trim() || text.includes(search.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.library}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Қазақстан климатына сай тері күтімі, SPF, бездеу және профилактика бойынша мақалалар.'
            : 'Библиотека проверенных материалов по уходу за кожей, климату Казахстана и профилактике.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'all' as const, label: isKz ? 'Барлығы' : 'Все темы' },
            { id: 'climate' as const, label: isKz ? 'Климат' : 'Климат РК' },
            { id: 'skincare' as const, label: isKz ? 'Тері күтімі' : 'Уход за кожей' },
            { id: 'prevention' as const, label: isKz ? 'Алдын алу' : 'Профилактика' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c.id
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKz ? 'Мақала іздеу...' : 'Поиск по статьям...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((art) => (
          <button
            key={art.id}
            type="button"
            onClick={() => setActiveArticle(art)}
            className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                {art.readMinutes} {isKz ? 'мин оқу' : 'мин чтения'}
              </p>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {isKz ? art.titleKz : art.titleRu}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isKz ? art.summaryKz : art.summaryRu}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isKz ? 'Оқу' : 'Читать статью'}</span>
            </span>
          </button>
        ))}
      </div>

      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {isKz ? activeArticle.titleKz : activeArticle.titleRu}
              </h2>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {(isKz ? activeArticle.bodyKz : activeArticle.bodyRu).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              {t.common.disclaimerBanner}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
