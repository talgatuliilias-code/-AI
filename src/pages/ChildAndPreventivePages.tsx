import React, { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Baby, CalendarCheck, CheckCircle2, Info, Plus } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { KZ_VACCINATION_SCHEDULE } from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';

export const ChildHealthPage: React.FC = () => {
  const { lang, activeProfile, bmiHistory } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const growthSeed =
    bmiHistory.length > 0
      ? bmiHistory.map((b) => ({
          date: new Date(b.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU'),
          height: b.heightCm,
          weight: b.weightKg,
        }))
      : [
          { date: '2026-01', height: 118, weight: 21.8 },
          { date: '2026-05', height: 121, weight: 23.0 },
          { date: '2026-10', height: 124, weight: 24.5 },
        ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes['child-health']}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Баланың өсуі, даму күнтізбесі және вакцинация бойынша анықтамалық деректер (автоматты тағайындау жоқ).'
            : 'Справочный календарь прививок РК, история роста/веса и памятки для родителей (без автоматических назначений).'}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          {isKz
            ? `Демонстрациялық анықтамалық деректер (${activeProfile.name}). Нақты екпе кестесін педиатр бекітеді.`
            : `Демонстрационные справочные данные (${activeProfile.name}). Индивидуальный график осмотров и вакцинации определяет педиатр.`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Baby className="w-5 h-5 text-sky-600" />
            <span>{isKz ? 'ҚР Ұлттық екпе күнтізбесі (анықтама)' : 'Календарь вакцинации РК (справочно)'}</span>
          </h2>
          <div className="space-y-2.5">
            {KZ_VACCINATION_SCHEDULE.map((row, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                  {isKz ? row.ageKz : row.ageRu}
                </span>
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {isKz ? row.vaccinesKz : row.vaccinesRu}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {isKz ? 'Өсу және салмақ динамикасы (Демо)' : 'История роста и веса (Демо)'}
            </h2>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthSeed}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="height" name={isKz ? 'Бой (см)' : 'Рост (см)'} stroke="#0284C7" strokeWidth={2} />
                  <Line type="monotone" dataKey="weight" name={isKz ? 'Салмақ (кг)' : 'Вес (кг)'} stroke="#0D9488" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {isKz ? 'Ата-аналарға арналған жадынама' : 'Памятки для родителей'}
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>
                {isKz
                  ? 'Баланың терісі жұқа — аязды күні қорғаныш кремін 20 минут бұрын жағыңыз.'
                  : 'Детская кожа чувствительнее к холоду и солнцу — используйте мягкие барьерные средства и детский SPF 50+.'}
              </li>
              <li>
                {isKz
                  ? 'Жоғары қызу немесе тез таралатын бөртпе кезінде 103 шақырыңыз.'
                  : 'При высокой температуре, вялости или быстро распространяющейся сыпи обращайтесь к педиатру или 103.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PreventiveHealthPage: React.FC = () => {
  const { lang, preventiveItems, togglePreventiveItem, addPreventiveItem, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-25');
  const [category, setCategory] = useState<'vaccination' | 'screening' | 'dental' | 'derma'>('screening');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addPreventiveItem({
      titleRu: title.trim(),
      titleKz: title.trim(),
      category,
      dueDate,
    });
    setTitle('');
    showToast(isKz ? 'Іс-шара қосылды' : 'Мероприятие добавлено в календарь', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.preventive}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Профилактикалық тексерулер күнтізбесі. Жеке мерзімдер дәрігердің ұсынысымен белгіленеді.'
            : 'Календарь профилактических обследований. Индивидуальную периодичность определяет ваш врач.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAdd}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Еске салғыш қосу' : 'Добавить плановое напоминание'}
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Тексеру атауы' : 'Название обследования'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isKz ? 'Мысалы: Стоматолог қарауы' : 'Например: Осмотр стоматолога'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Санат' : 'Категория'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="screening">{isKz ? 'Скрининг' : 'Скрининг'}</option>
                <option value="derma">{isKz ? 'Дерматология' : 'Дерматология'}</option>
                <option value="vaccination">{isKz ? 'Вакцинация' : 'Вакцинация'}</option>
                <option value="dental">{isKz ? 'Стоматология' : 'Стоматология'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Күні' : 'Плановая дата'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>{isKz ? 'Күнтізбеге қосу' : 'Добавить'}</span>
          </button>
        </form>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-teal-600" />
            <span>{isKz ? 'Алдын алу тізімі' : 'Профилактические мероприятия'}</span>
          </h2>
          <div className="space-y-2.5">
            {preventiveItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p
                    className={`text-sm font-medium ${
                      item.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isKz ? item.titleKz : item.titleRu}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{item.dueDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreventiveItem(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    item.completed
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.completed ? (isKz ? 'Өтілді' : 'Выполнено') : isKz ? 'Белгілеу' : 'Отметить'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
