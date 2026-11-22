import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Pill,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { LabAnalysisRecord } from '../types/health';
import { buildDemoLabReport } from '../utils/demoGenerators';

export const LabAnalyzerPage: React.FC = () => {
  const {
    lang,
    activeProfile,
    labHistory,
    addLabRecord,
    serverAiAvailable,
    preferDemoMode,
    setPreferDemoMode,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabAnalysisRecord | null>(
    () => labHistory[0] || null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6_500_000) {
      showToast(
        isKz ? 'Файл өлшемі 6.5 МБ-дан аспауы тиіс' : 'Размер файла не должен превышать 6.5 МБ',
        'warning'
      );
      return;
    }
    setFileName(file.name);
    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const runLabAnalysis = async (forceDemo = false) => {
    if (!fileDataUrl && !forceDemo) return;
    setAnalyzing(true);

    if (forceDemo || preferDemoMode || !serverAiAvailable) {
      await new Promise((r) => setTimeout(r, 800));
      const demo = buildDemoLabReport(
        fileName || (isKz ? 'demo_lab_report.pdf' : 'demo_lab_report.pdf'),
        activeProfile,
        lang
      );
      addLabRecord(demo);
      setSelectedLab(demo);
      setAnalyzing(false);
      showToast(isKz ? 'Демо-үлгі жүктелді' : 'Демо-пример загружен', 'info');
      return;
    }

    try {
      const res = await fetch('/api/analyze-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileDataUrl, fileName, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Error', 'warning');
        setAnalyzing(false);
        return;
      }

      const rec: LabAnalysisRecord = {
        id: `lab-${Date.now()}`,
        profileId: activeProfile.id,
        createdAt: new Date().toISOString(),
        mode: 'ai',
        fileName: fileName || 'document',
        readable: Boolean(data.result?.readable),
        unreadableReason: data.result?.unreadableReason,
        labTitle: data.result?.labTitle || fileName || 'Lab Report',
        summary: data.result?.summary || '',
        markers: Array.isArray(data.result?.markers) ? data.result.markers : [],
      };
      addLabRecord(rec);
      setSelectedLab(rec);
      showToast(isKz ? 'Құжат талданды' : 'Документ обработан', 'success');
    } catch {
      showToast(
        isKz ? 'Сервер қатесі. Демо-үлгіні қолданыңыз.' : 'Ошибка сети. Попробуйте Демо-режим.',
        'warning'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes['lab-analyzer']}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'PDF, JPG және PNG зертханалық бланкілерін жүктеп, көрсеткіштерді түсіндіру'
              : 'Загрузка бланков PDF, JPG, PNG с объяснением показателей и референсных границ'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
          <button
            type="button"
            disabled={!serverAiAvailable}
            onClick={() => setPreferDemoMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              serverAiAvailable && !preferDemoMode
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300'
                : 'text-slate-500 disabled:opacity-50'
            }`}
          >
            {serverAiAvailable ? 'AI OCR' : isKz ? 'AI жоқ' : 'AI не настроен'}
          </button>
          <button
            type="button"
            onClick={() => setPreferDemoMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              preferDemoMode || !serverAiAvailable
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300'
                : 'text-slate-500'
            }`}
          >
            {t.common.demoMode}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Бланкті жүктеу' : 'Загрузка файла анализа'}
          </h2>

          <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 cursor-pointer text-center transition-colors">
            <Upload className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isKz ? 'PDF, JPG немесе PNG таңдау' : 'Выберите PDF, JPG или PNG'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isKz ? 'Ең көбі 6.5 МБ' : 'До 6.5 МБ'}
            </span>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {fileDataUrl && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <FileText className="w-4 h-4 text-sky-600" />
                <span className="truncate">{fileName}</span>
              </div>
              {fileType.startsWith('image/') && (
                <img
                  src={fileDataUrl}
                  alt={fileName}
                  className="max-h-44 rounded-lg object-contain mx-auto"
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={!fileDataUrl || analyzing}
              onClick={() => runLabAnalysis(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{isKz ? 'Талдау' : 'Распознать и объяснить'}</span>
            </button>

            <button
              type="button"
              disabled={analyzing}
              onClick={() => runLabAnalysis(true)}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              {isKz ? 'Демо-үлгі' : 'Демо-бланк'}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKz
              ? 'Ескерту: файл оқылмаса, жүйе жалған сандар ойлап таппайды. Барлық интерпретация дәрігер кеңесін талап етеді.'
              : 'Если файл нечитаем, система честно сообщит об этом и не будет придумывать показатели. Все выводы требуют консультации врача.'}
          </p>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Талдаулар тарихы' : 'История загруженных бланков'}
          </h2>
          {labHistory.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              {t.common.noData}
            </p>
          ) : (
            <div className="space-y-2">
              {labHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedLab(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                    selectedLab?.id === item.id
                      ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.labTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU')} ·{' '}
                      {item.fileName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                    {item.mode === 'demo' ? 'Демо-режим' : 'AI'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedLab && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {selectedLab.labTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedLab.summary}
              </p>
            </div>
          </div>

          {!selectedLab.readable ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-sm text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                {selectedLab.unreadableReason ||
                  (isKz
                    ? 'Файлдағы мәтінді анық оқу мүмкін болмады. Анық сурет немесе PDF жүктеңіз.'
                    : 'Не удалось достоверно прочитать показатели с документа. Загрузите более чёткий файл.')}
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLab.markers.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {m.name}
                      </span>
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          m.status === 'normal'
                            ? 'text-teal-700 dark:text-teal-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {m.valueText ?? m.value} {m.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {isKz ? 'Референс' : 'Референс'}: {m.referenceRangeText} {m.unit}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{m.explanation}</p>
                  </div>
                ))}
              </div>

              {selectedLab.markers.some((m) => typeof m.value === 'number') && (
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedLab.markers.filter((m) => typeof m.value === 'number')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name={isKz ? 'Мәні' : 'Значение'} fill="#0284C7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const MedicationsPage: React.FC = () => {
  const {
    lang,
    medications,
    addMedication,
    toggleMedicationTakenToday,
    deleteMedication,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [durationDays, setDurationDays] = useState('14');
  const [confirmedDoctor, setConfirmedDoctor] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) {
      showToast(
        isKz ? 'Препарат атауы мен дозасын енгізіңіз' : 'Укажите название препарата и дозировку',
        'warning'
      );
      return;
    }
    if (!confirmedDoctor) {
      showToast(
        isKz
          ? 'Дәрігер тағайындағанын растаңыз'
          : 'Подтвердите, что препарат назначен лечащим врачом',
        'warning'
      );
      return;
    }
    addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      timeOfDay,
      durationDays: Number(durationDays) || 14,
      prescribedByDoctor: true,
    });
    setName('');
    setDosage('');
    setConfirmedDoctor(false);
    showToast(isKz ? 'Еске салғыш қосылды' : 'Напоминание добавлено', 'success');
  };

  const triggerTestNotification = async () => {
    if (!('Notification' in window)) {
      showToast(
        isKz ? 'Ішкі еске салғыш белсенді' : 'Внутриплатформенное уведомление активно',
        'info'
      );
      return;
    }
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification('DermaSense AI', {
        body: isKz
          ? 'Дәрі қабылдау уақытын тексеріңіз'
          : 'Напоминание: проверьте график приёма назначенных препаратов',
      });
    } else {
      showToast(
        isKz ? 'Хабарламалар браузерде шектелген' : 'Уведомления заблокированы в браузере',
        'warning'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes.medications}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'Платформа дәрі-дәрмек тағайындамайды — тек дәрігер жазған курсты бақылауға көмектеседі.'
              : 'Платформа не назначает препараты самостоятельно — только помогает соблюдать график, назначенный врачом.'}
          </p>
        </div>

        <button
          type="button"
          onClick={triggerTestNotification}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Bell className="w-4 h-4 text-sky-600" />
          <span>{isKz ? 'Хабарламаны тексеру' : 'Проверить уведомление'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAdd}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Дәрі қосу' : 'Добавить назначенный препарат'}
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Препарат атауы' : 'Название препарата'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isKz ? 'Мысалы: D3 дәрумені' : 'Например: Витамин D3'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Дәрігер жазған доза' : 'Дозировка (от врача)'}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="1000 МЕ"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Қабылдау уақыты' : 'Время приёма'}
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Курс ұзақтығы (күн)' : 'Продолжительность курса (дней)'}
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedDoctor}
              onChange={(e) => setConfirmedDoctor(e.target.checked)}
              className="mt-0.5 rounded border-slate-300"
            />
            <span>
              {isKz
                ? 'Бұл препарат маған дәрігермен тағайындалғанын растаймын.'
                : 'Подтверждаю, что препарат и дозировка назначены врачом.'}
            </span>
          </label>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>{isKz ? 'Кестеге қосу' : 'Добавить в график'}</span>
          </button>
        </form>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Белсенді курстар және бүгінгі белгі' : 'График приёма и история'}
          </h2>
          {medications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              {t.common.noData}
            </p>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => {
                const takenToday = med.takenDates.includes(today);
                return (
                  <div
                    key={med.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {med.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {med.dosage} · {med.timeOfDay} · {med.durationDays} {isKz ? 'күн' : 'дн.'} ·{' '}
                        {isKz ? 'Қабылданды' : 'Отметок'}: {med.takenDates.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleMedicationTakenToday(med.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          takenToday
                            ? 'bg-teal-600 text-white'
                            : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {takenToday
                            ? isKz
                              ? 'Бүгін қабылданды'
                              : 'Принято сегодня'
                            : isKz
                              ? 'Қабылдадым деп белгілеу'
                              : 'Отметить приём'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMedication(med.id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600"
                        aria-label="Delete medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
