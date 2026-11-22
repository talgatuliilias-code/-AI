import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BellPlus,
  Bot,
  Building2,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  Send,
  ShieldAlert,
  Stethoscope,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import {
  buildDemoChatReply,
  buildDemoSymptomAssessment,
  SymptomAssessmentResult,
} from '../utils/demoGenerators';

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export const AssistantPage: React.FC = () => {
  const {
    lang,
    activeProfile,
    chatMessages,
    addChatMessage,
    clearChatForProfile,
    serverAiAvailable,
    preferDemoMode,
    setPreferDemoMode,
    skinHistory,
    attachedSkinAnalysisId,
    setAttachedSkinAnalysisId,
    setPreselectedDoctorFilter,
    addMedication,
    medications,
    navigate,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [activeTab, setActiveTab] = useState<'symptoms' | 'chat'>(() =>
    attachedSkinAnalysisId ? 'chat' : 'symptoms'
  );

  // Symptom checker state
  const [symptomsInput, setSymptomsInput] = useState('');
  const [duration, setDuration] = useState('1-3days');
  const [intensity, setIntensity] = useState('moderate');
  const [temperatureC, setTemperatureC] = useState('');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState<{
    mode: 'ai' | 'demo';
    data: SymptomAssessmentResult;
  } | null>(null);
  const [symptomError, setSymptomError] = useState('');

  // Quick medication reminder state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('09:00');
  const [medDays, setMedDays] = useState('7');
  const [medDoctorConfirmed, setMedDoctorConfirmed] = useState(true);

  // Chat state
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechNotice, setSpeechNotice] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const attachedAnalysis =
    skinHistory.find((s) => s.id === attachedSkinAnalysisId) || skinHistory[0] || null;
  const [attachLatest, setAttachLatest] = useState(Boolean(attachedSkinAnalysisId));

  useEffect(() => {
    if (attachedSkinAnalysisId) {
      setActiveTab('chat');
      setAttachLatest(true);
    }
  }, [attachedSkinAnalysisId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, sending, activeTab]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const symptomPresets = isKz
    ? [
        'Екі күн бойы тамақ ауырады, әлсіздік және 37.5°C қызу бар',
        'Қол мен бет терісінде құрғақтық, қышу және қызару байқалады',
        'Кешке қарай бас ауырып, қан қысымы көтерілгендей сезіледі',
      ]
    : [
        'Второй день першит горло, слабость и температура 37.5°C',
        'Появились зуд, сухость и покраснение на коже щёк и рук',
        'К вечеру болит голова, ощущается тяжесть и скачки давления',
      ];

  const handleSymptomSubmit = async (e: React.FormEvent, forceDemo = false) => {
    e.preventDefault();
    const text = symptomsInput.trim();
    if (text.length < 3 || symptomLoading) {
      showToast(
        isKz ? 'Белгілерді кемінде 3 таңбамен сипаттаңыз' : 'Опишите симптомы подробнее',
        'warning'
      );
      return;
    }

    setSymptomError('');
    setSymptomLoading(true);
    const shouldUseDemo = forceDemo || preferDemoMode || !serverAiAvailable;

    if (shouldUseDemo) {
      await new Promise((r) => setTimeout(r, 650));
      setSymptomResult({
        mode: 'demo',
        data: buildDemoSymptomAssessment(text, activeProfile, lang),
      });
      setSymptomLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: text,
          duration,
          intensity,
          temperatureC: temperatureC.trim() || undefined,
          lang,
          profileContext: {
            age: activeProfile.age,
            city: activeProfile.cityId,
            region: activeProfile.region,
            allergies: activeProfile.allergies,
          },
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setSymptomError(payload.error || 'AI symptom service error');
      } else {
        const raw = payload.result || {};
        const urgency =
          raw.urgency === 'red' || raw.urgency === 'green' || raw.urgency === 'yellow'
            ? raw.urgency
            : 'yellow';
        setSymptomResult({
          mode: 'ai',
          data: {
            urgency,
            redFlagWarning: raw.redFlagWarning || '',
            summary: raw.summary || '',
            possibleExplanations: Array.isArray(raw.possibleExplanations)
              ? raw.possibleExplanations
              : [],
            careRecommendations: Array.isArray(raw.careRecommendations)
              ? raw.careRecommendations
              : [],
            recommendedSpecialty: raw.recommendedSpecialty || 'therapist',
            recommendedSpecialtyLabel:
              raw.recommendedSpecialtyLabel || (isKz ? 'Терапевт' : 'Терапевт'),
            doctorQuestions: Array.isArray(raw.doctorQuestions) ? raw.doctorQuestions : [],
            medicationNote: raw.medicationNote || '',
          },
        });
      }
    } catch {
      setSymptomError(
        isKz
          ? 'Сервермен байланыс орнату мүмкін болмады. Демо-режимді іске қоса аласыз.'
          : 'Не удалось соединиться с сервером. Вы можете запустить Демо-режим.'
      );
    } finally {
      setSymptomLoading(false);
    }
  };

  const handleQuickAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      showToast(
        isKz ? 'Препарат атауын енгізіңіз' : 'Введите название препарата',
        'warning'
      );
      return;
    }
    addMedication({
      name: medName.trim(),
      dosage: medDosage.trim() || (isKz ? '1 доза' : '1 доза'),
      timeOfDay: medTime || '09:00',
      durationDays: Number(medDays) || 7,
      prescribedByDoctor: medDoctorConfirmed,
    });
    setMedName('');
    setMedDosage('');
    showToast(
      isKz
        ? 'Дәрі қабылдау еске салғышы қосылды'
        : 'Напоминание о приёме лекарств добавлено',
      'success'
    );
  };

  const quickQuestions = isKz
    ? [
        'Қазақстанның құрғақ қысында теріні қалай қорғауға болады?',
        'Бездеу (акне) кезінде дерматологқа қандай сұрақтар қою керек?',
        'ДСИ нәтижесін қалай түсінуге болады?',
        'Қандай белгілер кезінде шұғыл 103 шақыру керек?',
      ]
    : [
        'Как ухаживать за сухой кожей зимой в Казахстане?',
        'Как подготовиться к приёму дерматолога по поводу акне?',
        'Как правильно понимать мой результат ИМТ?',
        'Какие симптомы являются красными флагами?',
      ];

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || sending) return;
    setInput('');

    const attachedText =
      attachLatest && attachedAnalysis
        ? `${attachedAnalysis.summary} Signs: ${attachedAnalysis.signs
            .map((s) => `${s.name}:${s.severity}`)
            .join(', ')}`
        : undefined;

    addChatMessage({
      role: 'user',
      content,
      attachedAnalysisSummary: attachLatest && attachedAnalysis ? attachedAnalysis.summary : undefined,
    });

    setSending(true);
    const useDemo = preferDemoMode || !serverAiAvailable;

    if (useDemo) {
      await new Promise((r) => setTimeout(r, 600));
      const reply = buildDemoChatReply(content, activeProfile, lang, attachedText);
      addChatMessage({ role: 'assistant', content: reply, mode: 'demo' });
      setSending(false);
      return;
    }

    try {
      const historyPayload = [
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          lang,
          profileContext: {
            name: activeProfile.name,
            age: activeProfile.age,
            city: activeProfile.cityId,
            region: activeProfile.region,
            skinType: activeProfile.skinType,
            allergies: activeProfile.allergies,
          },
          attachedContext: attachedText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addChatMessage({
          role: 'assistant',
          content: `${isKz ? 'Қате' : 'Ошибка API'}: ${data.error || 'Unavailable'}. ${
            isKz ? 'Демо-режимді қоса аласыз.' : 'Вы можете переключиться в Демо-режим.'
          }`,
          mode: 'demo',
        });
      } else {
        addChatMessage({ role: 'assistant', content: data.reply, mode: 'ai' });
      }
    } catch {
      const fallback = buildDemoChatReply(content, activeProfile, lang, attachedText);
      addChatMessage({ role: 'assistant', content: fallback, mode: 'demo' });
    } finally {
      setSending(false);
    }
  };

  const toggleVoiceRecording = () => {
    setSpeechNotice('');
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechNotice(
        isKz
          ? 'Бұл браузерде Web Speech API дауыстық тану қолжетімсіз. Мәтіндік енгізуді қолданыңыз.'
          : 'Голосовой ввод Web Speech API не поддерживается этим браузером. Используйте текстовое поле.'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = lang === 'kz' ? 'kk-KZ' : 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          if (activeTab === 'symptoms') {
            setSymptomsInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        }
      };

      recognition.onerror = () => {
        setSpeechNotice(
          isKz
            ? 'Микрофонға рұқсат берілмеді немесе сөйлеу анықталмады.'
            : 'Не удалось распознать речь или отсутствует доступ к микрофону.'
        );
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      setSpeechNotice(
        isKz
          ? 'Дауыс жазуды бастау мүмкін болмады.'
          : 'Не удалось запустить распознавание речи.'
      );
      setIsRecording(false);
    }
  };

  const speakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast(
        isKz ? 'Дауыстап оқу браузерде қолдау таппайды' : 'Озвучивание не поддерживается браузером',
        'warning'
      );
      return;
    }

    window.speechSynthesis.cancel();
    if (speakingMessageId === msgId) {
      setSpeakingMessageId(null);
      return;
    }

    const clean = text.replace(/\[Демо-режим \(симуляция\)\]\s*/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === 'kz' ? 'kk-KZ' : 'ru-RU';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {isKz ? 'Клиникалық AI-терапевт және көмекші' : 'Клинический ИИ-терапевт и ассистент'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isKz
              ? `Профиль: ${activeProfile.name} · Аймақ: ${activeProfile.region}`
              : `Профиль: ${activeProfile.name} · Регион: ${activeProfile.region}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={!serverAiAvailable}
              onClick={() => setPreferDemoMode(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                serverAiAvailable && !preferDemoMode
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300'
                  : 'text-slate-500 disabled:opacity-50'
              }`}
            >
              AI
            </button>
            <button
              type="button"
              onClick={() => setPreferDemoMode(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                preferDemoMode || !serverAiAvailable
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300'
                  : 'text-slate-500'
              }`}
            >
              {t.common.demoMode}
            </button>
          </div>

          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => {
                clearChatForProfile();
                setAttachedSkinAnalysisId(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isKz ? 'Тазалау' : 'Очистить'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Mode Switch Tabs */}
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('symptoms')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'symptoms'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{isKz ? 'Белгілерді талдау (ИИ-терапевт)' : 'Разбор симптомов (ИИ-терапевт)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{isKz ? 'Диалог және дауыстық көмекші' : 'Диалог и голосовой помощник'}</span>
        </button>
      </div>

      {activeTab === 'symptoms' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Symptom Description Form */}
          <form
            onSubmit={(e) => handleSymptomSubmit(e, false)}
            className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                {isKz
                  ? '35 клиникадағы пилоттық жоба модулі'
                  : 'Модуль пилота в 35 клиниках РК · Без постановки диагноза'}
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {isKz ? 'Белгілеріңізді сипаттаңыз' : 'Опишите симптомы и самочувствие'}
              </h2>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isKz ? 'Сізді не мазалайды?' : 'Что вас беспокоит?'}
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    isRecording
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-sky-700 dark:text-sky-400 hover:underline'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>
                    {isRecording
                      ? isKz
                        ? 'Тоқтату'
                        : 'Остановить'
                      : isKz
                        ? 'Дауыспен айту'
                        : 'Надиктовать'}
                  </span>
                </button>
              </div>
              <textarea
                rows={4}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder={
                  isKz
                    ? 'Мысалы: екі күн бойы басым ауырып, әлсіздік сеземін, температура 37.4°C...'
                    : 'Например: второй день болит голова, першит в горле, температура 37.4°C...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {speechNotice && (
              <p className="text-xs text-amber-700 dark:text-amber-400">{speechNotice}</p>
            )}

            {/* Quick symptom presets */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Жылдам мысалдар:' : 'Примеры описания:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {symptomPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSymptomsInput(preset)}
                    className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-400 text-xs text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Ұзақтығы' : 'Длительность'}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                >
                  <option value="today">{isKz ? 'Бүгін басталды' : 'Сегодня'}</option>
                  <option value="1-3days">{isKz ? '1–3 күн' : '1–3 дня'}</option>
                  <option value="4-7days">{isKz ? '4–7 күн' : '4–7 дней'}</option>
                  <option value="week+">{isKz ? '1 аптадан астам' : 'Более недели'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Деңгейі' : 'Интенсивность'}
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                >
                  <option value="mild">{isKz ? 'Жеңіл' : 'Лёгкая'}</option>
                  <option value="moderate">{isKz ? 'Орташа' : 'Умеренная'}</option>
                  <option value="severe">{isKz ? 'Айқын / күшті' : 'Выраженная'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Қызу (°C)' : 'Темп. (°C)'}
                </label>
                <input
                  type="text"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(e.target.value)}
                  placeholder="36.6"
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {symptomError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 text-xs text-rose-700 dark:text-rose-300">
                <p>{symptomError}</p>
                <button
                  type="button"
                  onClick={(e) => handleSymptomSubmit(e as unknown as React.FormEvent, true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold"
                >
                  {isKz ? 'Демо-режимде тексеру' : 'Попробовать в Демо-режиме'}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={symptomLoading || symptomsInput.trim().length < 3}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              {symptomLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isKz ? 'Талдануда...' : 'Анализирую симптомы...'}</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  <span>{isKz ? 'ИИ-ұсыныс алу' : 'Получить рекомендации ИИ'}</span>
                </>
              )}
            </button>
          </form>

          {/* Right Panel: Structured AI Recommendations + Quick Medication Reminder */}
          <div className="lg:col-span-7 space-y-5">
            {symptomResult ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {symptomResult.mode === 'demo' ? (
                      <span className="text-amber-700 dark:text-amber-400 inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isKz ? 'Демо-режим (симуляция)' : 'Демо-режим (симуляция)'}</span>
                      </span>
                    ) : (
                      <span className="text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isKz ? 'Клиникалық AI-терапевт' : 'Клинический ИИ-терапевт'}</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-bold ${
                      symptomResult.data.urgency === 'red'
                        ? 'text-rose-600 dark:text-rose-400'
                        : symptomResult.data.urgency === 'yellow'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    {symptomResult.data.urgency === 'red'
                      ? isKz
                        ? 'Шұғыл көмек қажет болуы мүмкін'
                        : 'Высокий приоритет осмотра'
                      : symptomResult.data.urgency === 'yellow'
                        ? isKz
                          ? 'Дәрігерге жоспарлы қаралу ұсынылады'
                          : 'Рекомендуется консультация врача'
                        : isKz
                          ? 'Бақылау және базалық күтім'
                          : 'Спокойное наблюдение и уход'}
                  </span>
                </div>

                {(symptomResult.data.urgency === 'red' || symptomResult.data.redFlagWarning) && (
                  <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 space-y-2 text-xs text-rose-800 dark:text-rose-200">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{isKz ? 'Қауіп белгілеріне назар' : 'Внимание к красным флагам'}</span>
                    </div>
                    <p>{symptomResult.data.redFlagWarning}</p>
                    <div className="flex gap-4 font-mono font-bold">
                      <a href="tel:103" className="underline">
                        103
                      </a>
                      <a href="tel:112" className="underline">
                        112
                      </a>
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                  {symptomResult.data.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/60 dark:bg-slate-950/40">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isKz ? 'Дәрігермен талқылайтын жайттар' : 'Возможные причины для обсуждения'}
                    </h3>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {symptomResult.data.possibleExplanations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/60 dark:bg-slate-950/40">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {isKz ? 'Қауіпсіз ұсыныстар' : 'Безопасные рекомендации сейчас'}
                    </h3>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {symptomResult.data.careRecommendations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {symptomResult.data.doctorQuestions.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      {isKz ? 'Дәрігерге қоятын сұрақтар' : 'Вопросы, которые стоит задать врачу'}
                    </h3>
                    <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {symptomResult.data.doctorQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Route to Recommended Top Hospitals & Doctors */}
                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isKz ? 'Ұсынылатын бейінді маман' : 'Рекомендуемый специалист'}
                    </p>
                    <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {symptomResult.data.recommendedSpecialtyLabel} · {activeProfile.region}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedDoctorFilter({
                        cityId: activeProfile.cityId,
                        specialty: symptomResult.data.recommendedSpecialty,
                      });
                      navigate('doctors');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isKz ? 'Үздік ауруханалар мен жазылу' : 'Подобрать клинику и записаться'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {isKz ? 'ИИ-терапевт қалай көмектеседі?' : 'Как работает клинический ИИ-терапевт'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isKz
                    ? 'Симптомдарыңызды еркін түрде жазыңыз немесе дауыспен айтыңыз. Жүйе басымдық деңгейін бағалап, алғашқы қауіпсіз кеңестер береді, қай маманға бару керектігін көрсетеді және дәрі еске салғышын орнатуға көмектеседі.'
                    : 'Опишите жалобы своими словами или с помощью голоса. ИИ-терапевт структурирует симптомы, укажет уровень срочности, предложит безопасные шаги ухода, подберёт нужного специалиста в лучших клиниках РК и позволит сразу настроить напоминание о приёме лекарств.'}
                </p>
              </div>
            )}

            {/* Inline Quick Medication Reminder Widget */}
            <form
              onSubmit={handleQuickAddMedication}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BellPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {isKz ? 'Дәрі қабылдау туралы еске салғыш қою' : 'Поставить напоминание о приёме лекарств'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('medications')}
                  className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {isKz ? `Барлығы (${medications.length})` : `Все напоминания (${medications.length})`}
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {symptomResult?.data.medicationNote ||
                  (isKz
                    ? 'Дәрігер тағайындаған препараттар мен дәрумендерді уақытылы ішу үшін кестеге қосыңыз.'
                    : 'Добавьте лекарство или витамин, назначенный вашим врачом, в личный график напоминаний.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder={isKz ? 'Дәрі атауы (мысалы: Витамин D)' : 'Препарат (например, Магний B6)'}
                  className="lg:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder={isKz ? 'Дозасы (1 табл.)' : 'Дозировка (1 табл.)'}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="flex-1 px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={medDays}
                    onChange={(e) => setMedDays(e.target.value)}
                    title={isKz ? 'Күндер саны' : 'Дней'}
                    className="w-16 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medDoctorConfirmed}
                    onChange={(e) => setMedDoctorConfirmed(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>
                    {isKz
                      ? 'Дәрігер тағайындаған / келісілген'
                      : 'Согласовано / назначено врачом'}
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                >
                  <BellPlus className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Еске салғыш қосу' : 'Сохранить напоминание'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Chat Container */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[540px]">
          {attachedAnalysis && (
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3 text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={attachLatest}
                  onChange={(e) => setAttachLatest(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <Paperclip className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="truncate max-w-md">
                  {isKz
                    ? `Соңғы тері талдауын қосу (${new Date(attachedAnalysis.createdAt).toLocaleDateString()})`
                    : `Учитывать последний анализ кожи (${new Date(attachedAnalysis.createdAt).toLocaleDateString()})`}
                </span>
              </label>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="py-8 space-y-5 max-w-xl mx-auto text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {isKz ? 'Сұрағыңызды жазыңыз немесе дауыспен айтыңыз' : 'Задайте вопрос текстом или голосом'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isKz
                      ? 'Тері күтімі, ДСИ, зертхана, дәрігерге дайындық және профилактика.'
                      : 'Кожа, акне, аллергия, уход, ИМТ, подготовка к врачу и профилактика.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm space-y-2 ${
                        isUser
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {!isUser && (
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            {msg.mode === 'demo' ? 'Демо-симуляция' : 'Derma AI'}
                          </span>
                          <button
                            type="button"
                            onClick={() => speakText(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>{isKz ? 'Тоқтату' : 'Стоп'}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{isKz ? 'Тыңдау' : 'Озвучить'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>{isKz ? 'Жауап дайындалуда...' : 'Формирую ответ...'}</span>
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Voice status & input bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {speechNotice && (
              <p className="text-xs text-amber-700 dark:text-amber-400">{speechNotice}</p>
            )}
            {isRecording && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <Mic className="w-4 h-4 animate-bounce" />
                <span>
                  {isKz
                    ? 'Сөйлеңіз... Жазуды тоқтату үшін микрофонды басыңыз.'
                    : 'Идёт запись голоса... Нажмите микрофон ещё раз для остановки.'}
                </span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                  isRecording
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isKz ? 'Дауыстық енгізу' : 'Голосовой ввод'}
                aria-label="Voice input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isKz
                    ? 'Сұрағыңызды жазыңыз...'
                    : 'Введите медицинский вопрос...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
