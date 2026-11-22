import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, HeartPulse, Play, Plus, Smile, Square, Wind } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';

export const VitalsPage: React.FC = () => {
  const { lang, vitals, addVitalRecord, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [pulse, setPulse] = useState('72');
  const [systolic, setSystolic] = useState('118');
  const [diastolic, setDiastolic] = useState('76');
  const [weightKg, setWeightKg] = useState('');
  const [temperatureC, setTemperatureC] = useState('36.6');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addVitalRecord({
      pulse: pulse ? Number(pulse) : undefined,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      temperatureC: temperatureC ? Number(temperatureC) : undefined,
    });
    showToast(isKz ? 'Көрсеткіштер сақталды' : 'Показатели записаны', 'success');
  };

  const chartData = vitals.map((v) => ({
    date: new Date(v.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU', {
      day: '2-digit',
      month: '2-digit',
    }),
    pulse: v.pulse ?? null,
    systolic: v.systolic ?? null,
    diastolic: v.diastolic ?? null,
  }));

  // Current month calendar days that have measurements
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const activeDays = new Set(
    vitals
      .filter((v) => {
        const d = new Date(v.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .map((v) => new Date(v.createdAt).getDate())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.vitals}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Пульс, қан қысымы, салмақ және температура күнделігі. Автоматты диагноз қойылмайды.'
            : 'Ручной дневник пульса, давления, веса и температуры. Система не ставит автоматических диагнозов.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAdd}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>{isKz ? 'Жаңа өлшем енгізу' : 'Записать измерения'}</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Пульс (соғу/мин)' : 'Пульс (уд/мин)'}
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Температура (°C)' : 'Температура (°C)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={temperatureC}
                onChange={(e) => setTemperatureC(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Жоғарғы қысым' : 'Систолическое (верх.)'}
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Төменгі қысым' : 'Диастолическое (ниж.)'}
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Салмақ (кг, міндетті емес)' : 'Вес (кг, опционально)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="60.0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>{t.common.save}</span>
          </button>
        </form>

        {/* Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Қысым және пульс динамикасы' : 'График пульса и давления'}
          </h2>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" name={isKz ? 'Жоғ. қысым' : 'Сист.'} stroke="#0284C7" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" name={isKz ? 'Төм. қысым' : 'Диаст.'} stroke="#0D9488" strokeWidth={2} />
                  <Line type="monotone" dataKey="pulse" name={isKz ? 'Пульс' : 'Пульс'} stroke="#E11D48" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-10 text-center">{t.common.noData}</p>
          )}
        </div>
      </div>

      {/* Calendar & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{isKz ? 'Өлшеулер күнтізбесі (осы ай)' : 'Календарь измерений (текущий месяц)'}</span>
          </h2>
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const hasLog = activeDays.has(day);
              return (
                <div
                  key={day}
                  className={`py-2 rounded-lg border ${
                    hasLog
                      ? 'bg-sky-600 text-white border-sky-600 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Өлшеулер журналы' : 'История измерений'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <th className="py-2 pr-3">{isKz ? 'Күні' : 'Дата'}</th>
                  <th className="py-2 pr-3 text-right">{isKz ? 'Қысым' : 'Давление'}</th>
                  <th className="py-2 pr-3 text-right">{isKz ? 'Пульс' : 'Пульс'}</th>
                  <th className="py-2 pr-3 text-right">{isKz ? 'Темп.' : 'Темп.'}</th>
                  <th className="py-2 text-right">{isKz ? 'Салмақ' : 'Вес'}</th>
                </tr>
              </thead>
              <tbody>
                {[...vitals].reverse().map((v) => (
                  <tr key={v.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                    <td className="py-2.5 pr-3 font-mono text-xs">
                      {new Date(v.createdAt).toLocaleString(isKz ? 'kk-KZ' : 'ru-RU')}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {v.pulse ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {v.temperatureC ? `${v.temperatureC}°C` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {v.weightKg ? `${v.weightKg} кг` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MentalHealthPage: React.FC = () => {
  const { lang, moodEntries, addMoodEntry, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Breathing exercise state
  const [breathingActive, setBreathingActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);

  const phases = isKz
    ? [
        { label: 'Тыныс алу (4 сек)', duration: 4 },
        { label: 'Тынысты ұстау (4 сек)', duration: 4 },
        { label: 'Баяу тыныс шығару (4 сек)', duration: 4 },
        { label: 'Үзіліс (4 сек)', duration: 4 },
      ]
    : [
        { label: 'Спокойный вдох (4 сек)', duration: 4 },
        { label: 'Задержка дыхания (4 сек)', duration: 4 },
        { label: 'Плавный выдох (4 сек)', duration: 4 },
        { label: 'Пауза (4 сек)', duration: 4 },
      ];

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIdx((p) => {
          const next = (p + 1) % 4;
          return next;
        });
        return 4;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive]);

  const moodTags = isKz
    ? ['Тыныштық', 'Сергектік', 'Шаршау', 'Уайым', 'Ұйқы сапалы', 'Серуен']
    : ['Спокойствие', 'Энергия', 'Усталость', 'Тревога', 'Хороший сон', 'Прогулка'];

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodEntry({ score, tags: selectedTags, note: note.trim() });
    setNote('');
    setSelectedTags([]);
    showToast(isKz ? 'Көңіл-күй жазбасы сақталды' : 'Запись настроения сохранена', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes['mental-health']}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Көңіл-күй күнделігі, тыныс алу жаттығулары және релаксация тәжірибелері'
            : 'Дневник настроения, дыхательная практика «квадрат 4-4-4-4» и упражнения для снижения напряжения'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mood Diary Form */}
        <form
          onSubmit={handleSaveMood}
          className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smile className="w-5 h-5 text-teal-600" />
            <span>{isKz ? 'Бүгінгі көңіл-күйді бағалау' : 'Оценка самочувствия сегодня'}</span>
          </h2>

          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setScore(val)}
                className={`py-2.5 rounded-xl border font-mono text-sm font-bold transition-colors ${
                  score === val
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {val}/5
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {moodTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTags(
                      active ? selectedTags.filter((x) => x !== tag) : [...selectedTags, tag]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isKz ? 'Күн туралы қысқаша жазба...' : 'Короткая заметка о самочувствии...'}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          />

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
          >
            {isKz ? 'Күнделікке сақтау' : 'Сохранить запись'}
          </button>
        </form>

        {/* Interactive Breathing Exercise */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-between space-y-5 text-center">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Wind className="w-5 h-5 text-sky-600" />
              <span>{isKz ? 'Тыныс алу жаттығуы (4-4-4-4)' : 'Дыхательное упражнение (4-4-4-4)'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKz
                ? 'Стресс пен қысымды азайтуға көмектесетін ырғақты тыныс алу'
                : 'Ритмичное дыхание для мягкого снижения напряжения'}
            </p>
          </div>

          <div
            className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-transform duration-1000 ${
              breathingActive
                ? phaseIdx === 0 || phaseIdx === 1
                  ? 'scale-110 border-teal-500 bg-teal-50/70 dark:bg-teal-950/40'
                  : 'scale-95 border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <span className="font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {breathingActive ? secondsLeft : '4s'}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 mt-1">
              {breathingActive ? phases[phaseIdx].label : isKz ? 'Бастауға дайын' : 'Готово к старту'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setBreathingActive((prev) => !prev);
              setPhaseIdx(0);
              setSecondsLeft(4);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
          >
            {breathingActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>
              {breathingActive
                ? isKz
                  ? 'Тоқтату'
                  : 'Остановить'
                : isKz
                  ? 'Жаттығуды бастау'
                  : 'Начать дыхание'}
            </span>
          </button>
        </div>
      </div>

      {/* Relaxation + Mood History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Босаңсу тәсілдері' : 'Упражнения для расслабления'}
          </h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-900 dark:text-white">
                {isKz ? '1. Бұлшықет релаксациясы: ' : '1. Прогрессивная релаксация: '}
              </strong>
              {isKz
                ? 'Иық пен қол бұлшықеттерін 5 секундқа жиырып, сосын 10 секунд босаңсытыңыз.'
                : 'Поочерёдно мягко напрягайте мышцы плеч и кистей на 5 секунд и полностью расслабляйте на 10 секунд.'}
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">
                {isKz ? '2. 5-4-3-2-1 әдісі: ' : '2. Заземление 5-4-3-2-1: '}
              </strong>
              {isKz
                ? 'Айналаңыздағы 5 затты көріңіз, 4 дыбысты естіңіз, 3 затты сезініңіз.'
                : 'Назовите 5 предметов вокруг, 4 звука, 3 тактильных ощущения — это возвращает внимание в настоящий момент.'}
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Эмоционалдық күй тарихы' : 'История эмоционального состояния'}
          </h2>
          {moodEntries.length === 0 ? (
            <p className="text-sm text-slate-500">{t.common.noData}</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {moodEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                      {entry.score}/5
                    </span>
                    <span className="text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU')}
                    </span>
                  </div>
                  {entry.tags.length > 0 && (
                    <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                      {entry.tags.join(' · ')}
                    </p>
                  )}
                  {entry.note && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
