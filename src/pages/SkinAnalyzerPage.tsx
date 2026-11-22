import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  Download,
  Droplets,
  Eye,
  EyeOff,
  Flower2,
  ImagePlus,
  Layers,
  Loader2,
  MapPin,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Square,
  Sun,
  Trash2,
  Upload,
  Wind,
  Zap,
} from 'lucide-react';
import { ConsentNoticeCard } from '../components/LayoutChrome';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { SkinAnalysisRecord, SkinCauseIconType, SkinPhotoAnnotation } from '../types/health';
import { buildDemoSkinAnalysis } from '../utils/demoGenerators';
import { generateSkinPdfReport } from '../utils/pdfReport';

function getCauseVisualMeta(icon: SkinCauseIconType) {
  switch (icon) {
    case 'uv':
      return {
        Icon: Sun,
        badgeCls: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
        pinHex: '#f59e0b',
      };
    case 'climate':
      return {
        Icon: Wind,
        badgeCls: 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300',
        pinHex: '#0284c7',
      };
    case 'barrier':
      return {
        Icon: Droplets,
        badgeCls: 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300',
        pinHex: '#0d9488',
      };
    case 'sebum':
      return {
        Icon: Sparkles,
        badgeCls: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300',
        pinHex: '#6366f1',
      };
    case 'allergen':
      return {
        Icon: Flower2,
        badgeCls: 'bg-pink-50 dark:bg-pink-950/50 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-300',
        pinHex: '#db2777',
      };
    case 'stress':
      return {
        Icon: Zap,
        badgeCls: 'bg-orange-50 dark:bg-orange-950/50 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
        pinHex: '#ea580c',
      };
    case 'friction':
      return {
        Icon: Layers,
        badgeCls: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
        pinHex: '#64748b',
      };
    case 'pigment':
      return {
        Icon: Eye,
        badgeCls: 'bg-violet-50 dark:bg-violet-950/50 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300',
        pinHex: '#7c3aed',
      };
    case 'warning':
    default:
      return {
        Icon: ShieldAlert,
        badgeCls: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300',
        pinHex: '#e11d48',
      };
  }
}

export const SkinAnalyzerPage: React.FC = () => {
  const {
    lang,
    activeProfile,
    skinHistory,
    addSkinRecord,
    serverAiAvailable,
    preferDemoMode,
    setPreferDemoMode,
    dataConsentAccepted,
    acceptDataConsent,
    navigate,
    setAttachedSkinAnalysisId,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [images, setImages] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SkinAnalysisRecord | null>(
    () => skinHistory[0] || null
  );
  const [includeImagesInPdf, setIncludeImagesInPdf] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showPhotoMarkers, setShowPhotoMarkers] = useState(true);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const rec = skinHistory[0] || null;
    setSelectedRecord(rec);
    setActivePhotoIndex(0);
    setSelectedAnnotationId(rec?.annotations?.[0]?.id || null);
  }, [activeProfile.id, skinHistory]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const attachStreamToVideo = (stream: MediaStream) => {
    streamRef.current = stream;
    setCameraActive(true);
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    });
  };

  const startCamera = async (overrideMode?: 'user' | 'environment') => {
    const targetMode = overrideMode ?? facingMode;
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        isKz
          ? 'Браузер веб-камераны қолдамайды немесе HTTPS қосылымы қажет.'
          : 'Ваш браузер не поддерживает веб-камеру или требуется HTTPS-соединение.'
      );
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      attachStreamToVideo(stream);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        attachStreamToVideo(fallbackStream);
      } catch {
        setCameraError(
          isKz
            ? 'Камераға рұқсат берілмеді немесе құрылғы табылмады. Құрылғыдан фото жүктей аласыз.'
            : 'Доступ к камере отклонён или камера не найдена. Вы можете загрузить фотографии с устройства.'
        );
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImages((prev) => [...prev.slice(0, 4), dataUrl]);
    showToast(isKz ? 'Сурет түсірілді' : 'Фотография сделана', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.slice(0, 5 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev.slice(0, 4), reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const loadSampleDemoPhoto = async () => {
    try {
      const res = await fetch('/src/assets/images/demo_skin_sample_1795355230023.jpg');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev.slice(0, 4), reader.result as string]);
          showToast(
            isKz ? 'Демо-үлгі сурет жүктелді' : 'Тестовое фото загружено',
            'info'
          );
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      showToast(isKz ? 'Суретті жүктеу сәтсіз' : 'Не удалось загрузить тестовое фото', 'warning');
    }
  };

  const runAnalysis = async (forceDemo = false) => {
    if (images.length === 0) return;
    setApiError('');
    setIsAnalyzing(true);

    const shouldUseDemo = forceDemo || preferDemoMode || !serverAiAvailable;

    if (shouldUseDemo) {
      await new Promise((r) => setTimeout(r, 950));
      const demoResult = buildDemoSkinAnalysis(images, activeProfile, lang);
      addSkinRecord(demoResult);
      setSelectedRecord(demoResult);
      setActivePhotoIndex(0);
      setSelectedAnnotationId(demoResult.annotations?.[0]?.id || null);
      setIsAnalyzing(false);
      showToast(
        isKz ? 'Демо-талдау аяқталды' : 'Демонстрационный анализ завершён',
        'info'
      );
      return;
    }

    try {
      const res = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          lang,
          profileContext: {
            age: activeProfile.age,
            skinType: activeProfile.skinType,
            city: activeProfile.region,
            complaints: activeProfile.complaints,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || 'AI service error');
        setIsAnalyzing(false);
        return;
      }

      const aiRecord: SkinAnalysisRecord = {
        id: `skin-${Date.now()}`,
        profileId: activeProfile.id,
        createdAt: new Date().toISOString(),
        mode: 'ai',
        modelName: data.model || 'Gemini Vision',
        images,
        summary: data.result?.summary || '',
        overallUrgency:
          data.result?.overallUrgency === 'red' || data.result?.overallUrgency === 'yellow'
            ? data.result.overallUrgency
            : 'green',
        redFlagsDetected: Array.isArray(data.result?.redFlagsDetected)
          ? data.result.redFlagsDetected
          : [],
        generalCare: Array.isArray(data.result?.generalCare) ? data.result.generalCare : [],
        specialistAdvice: data.result?.specialistAdvice || '',
        signs: Array.isArray(data.result?.signs) ? data.result.signs : [],
        annotations: Array.isArray(data.result?.annotations) ? data.result.annotations : [],
      };
      addSkinRecord(aiRecord);
      setSelectedRecord(aiRecord);
      setActivePhotoIndex(0);
      setSelectedAnnotationId(aiRecord.annotations?.[0]?.id || null);
      showToast(isKz ? 'AI-талдау сәтті аяқталды' : 'AI-анализ успешно выполнен', 'success');
    } catch {
      setApiError(
        isKz
          ? 'Сервермен байланыс қатесі. Демо-режимді қолданып көріңіз.'
          : 'Ошибка соединения с сервером. Вы можете запустить Демо-режим.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPdf = async (rec: SkinAnalysisRecord) => {
    setExportingPdf(true);
    try {
      await generateSkinPdfReport({
        record: rec,
        profile: activeProfile,
        lang,
        includeImages: includeImagesInPdf,
      });
      showToast(isKz ? 'PDF-есеп сақталды' : 'PDF-отчёт сохранён', 'success');
    } catch {
      showToast(isKz ? 'PDF жасау қатесі' : 'Не удалось создать PDF', 'warning');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadAnnotatedPhoto = async (
    imgSrc: string,
    annotationsToDraw: SkinPhotoAnnotation[]
  ) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load error'));
        img.src = imgSrc;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 960;
      canvas.height = img.naturalHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      annotationsToDraw.forEach((ann, idx) => {
        const cx = (ann.xPct / 100) * canvas.width;
        const cy = (ann.yPct / 100) * canvas.height;
        const r = Math.max(24, ((ann.radiusPct || 14) / 200) * Math.min(canvas.width, canvas.height));
        const color =
          ann.severity === 'notable' ? '#e11d48' : ann.severity === 'moderate' ? '#d97706' : '#0284c7';

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}28`;
        ctx.fill();
        ctx.lineWidth = Math.max(3, canvas.width * 0.004);
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = color;
        ctx.stroke();

        // Number badge at top-right of circle
        const bx = Math.min(canvas.width - 20, cx + r * 0.72);
        const by = Math.max(20, cy - r * 0.72);
        const br = Math.max(14, canvas.width * 0.02);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(br * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), bx, by + 1);
        ctx.restore();
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'DermaSense-Skin-Annotated.png';
      link.click();
      showToast(isKz ? 'Белгіленген фото жүктелді' : 'Фото с отметками сохранено (PNG)', 'success');
    } catch {
      showToast(isKz ? 'Сақтау сәтсіз болды' : 'Не удалось сохранить отмеченное фото', 'warning');
    }
  };

  const severityLabel = (sev: string) => {
    if (isKz) {
      if (sev === 'notable') return 'Айқын';
      if (sev === 'moderate') return 'Орташа';
      if (sev === 'mild') return 'Жеңіл';
      return 'Байқалмады';
    }
    if (sev === 'notable') return 'Выраженно';
    if (sev === 'moderate') return 'Умеренно';
    if (sev === 'mild') return 'Лёгкая степень';
    return 'Минимально / нет';
  };

  return (
    <div className="space-y-6">
      {/* Header + Mode selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes['skin-analyzer']}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? `${activeProfile.name} профилі үшін камера немесе фотосурет арқылы 8 тері белгісін бағалау`
              : `Оценка 8 видимых признаков кожи по фото или камере для профиля «${activeProfile.name}»`}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setPreferDemoMode(false)}
            disabled={!serverAiAvailable}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              serverAiAvailable && !preferDemoMode
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 disabled:opacity-50'
            }`}
          >
            {serverAiAvailable ? t.common.aiMode : isKz ? 'AI сервері өшірулі' : 'AI не настроен'}
          </button>
          <button
            type="button"
            onClick={() => setPreferDemoMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              preferDemoMode || !serverAiAvailable
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.common.demoMode}
          </button>
        </div>
      </div>

      {!dataConsentAccepted && <ConsentNoticeCard onAccept={acceptDataConsent} />}

      {/* Capture / Upload Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? '1. Сурет түсіру немесе жүктеу' : '1. Камера и загрузка фотографий'}
          </h2>

          {/* Camera controls */}
          <div className="flex flex-wrap gap-2.5">
            {!cameraActive ? (
              <button
                type="button"
                onClick={() => startCamera()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {isKz
                    ? `Камераны қосу (${facingMode === 'user' ? 'Алдыңғы' : 'Артқы'})`
                    : `Включить камеру (${facingMode === 'user' ? 'Фронтальная' : 'Основная'})`}
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isKz ? 'Суретке түсіру' : 'Сделать снимок'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Камераны өшіру' : 'Остановить'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={toggleFacingMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              title={isKz ? 'Алдыңғы/Артқы камераны ауыстыру' : 'Переключить фронтальную / основную камеру'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {facingMode === 'user'
                  ? isKz
                    ? 'Алдыңғы'
                    : 'Фронтальная'
                  : isKz
                    ? 'Артқы'
                    : 'Основная'}
              </span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{isKz ? 'Фото жүктеу (бірнеше)' : 'Загрузить фото (до 5)'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={loadSampleDemoPhoto}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              <span>{isKz ? 'Демо-фото үлгісі' : 'Тестовое фото'}</span>
            </button>
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              {cameraError}
            </div>
          )}

          {cameraActive && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                }}
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {/* Live framing guide overlay for clear AI spot marking */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[62%] h-[74%] rounded-3xl border-2 border-dashed border-sky-300/80 shadow-[0_0_0_9999px_rgba(2,6,23,0.22)]" />
              </div>
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/75 text-white text-[11px] font-medium">
                {facingMode === 'user'
                  ? isKz
                    ? 'Алдыңғы камера · Теріні ортаға қойыңыз'
                    : 'Фронтальная · Поместите кожу в рамку'
                  : isKz
                    ? 'Негізгі камера · Теріні ортаға қойыңыз'
                    : 'Основная · Поместите кожу в рамку'}
              </span>
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isKz ? 'Түсіру және белгілеу' : 'Снять для AI-разметки'}</span>
              </button>
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isKz ? `Таңдалған фотосуреттер: ${images.length}` : `Выбрано изображений: ${images.length}`}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={src}
                      alt={`Skin upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/75 text-white hover:bg-rose-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-2">
              <ImagePlus className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isKz
                  ? 'Камера арқылы суретке түсіріңіз немесе құрылғыдан таңдаңыз'
                  : 'Сделайте снимок камерой или загрузите 1–5 фотографий кожи'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz
                  ? 'Жақсы жарық жағдайында түсірілген анық фото дәлірек нәтиже береді.'
                  : 'Для наглядности используйте чёткое фото при дневном освещении или нажмите «Тестовое фото».'}
              </p>
            </div>
          )}

          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
              <p className="text-xs text-rose-700 dark:text-rose-300">{apiError}</p>
              <button
                type="button"
                onClick={() => runAnalysis(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isKz ? 'Демо-режимде іске қосу' : 'Запустить в Демо-режиме'}
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={images.length === 0 || isAnalyzing || !dataConsentAccepted}
            onClick={() => runAnalysis(false)}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isKz ? 'Талдау жүргізілуде...' : 'Идёт анализ изображений...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{isKz ? 'Талдауды бастау' : 'Запустить анализ'}</span>
              </>
            )}
          </button>
        </div>

        {/* History Sidebar Card */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {isKz ? 'Алдыңғы тексерулер тарихы' : 'История проверок профиля'}
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {skinHistory.length}
            </span>
          </div>

          {skinHistory.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {isKz
                ? 'Осы профиль үшін тері тексерулері әлі сақталмаған.'
                : 'Для этого профиля пока нет сохранённых проверок кожи.'}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {skinHistory.map((item) => {
                const active = selectedRecord?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRecord(item)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center gap-3 ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt="Check thumbnail"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {new Date(item.createdAt).toLocaleString(isKz ? 'kk-KZ' : 'ru-RU')}
                        </span>
                        <span
                          className={`font-medium ${
                            item.mode === 'demo'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-teal-700 dark:text-teal-400'
                          }`}
                        >
                          {item.mode === 'demo' ? 'Демо-режим' : item.modelName || 'AI'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                        {item.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Results View */}
      {isAnalyzing && (
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin mx-auto" />
          <p className="font-display text-base font-bold text-slate-900 dark:text-white">
            {isKz
              ? 'Көрінетін белгілер талдануда...'
              : 'Выполняется визуальная оценка признаков кожи...'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isKz
              ? 'Бездеу, қызару, құрғақтық, пигментация және қауіп белгілері тексерілуде.'
              : 'Проверяем акне, покраснение, сухость, жирность, пигментацию и красные флаги.'}
          </p>
        </div>
      )}

      {selectedRecord && !isAnalyzing && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          {/* Explicit Mode & Non-Diagnostic Notice */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {selectedRecord.mode === 'demo' ? (
                  <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {isKz
                        ? 'ДЕМО-РЕЖИМ · Медициналық диагноз емес'
                        : 'ДЕМО-РЕЖИМ · Симуляция, не является медицинской диагностикой'}
                    </span>
                  </span>
                ) : (
                  <span className="text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      AI Vision ({selectedRecord.modelName}) ·{' '}
                      {isKz ? 'Ақпараттық бақылау' : 'Информационное наблюдение'}
                    </span>
                  </span>
                )}
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {isKz ? 'Талдау нәтижелері' : 'Результаты оценки кожи'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImagesInPdf}
                  onChange={(e) => setIncludeImagesInPdf(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>{isKz ? 'PDF-ке фото қосу' : 'Включить фото в PDF'}</span>
              </label>

              <button
                type="button"
                disabled={exportingPdf}
                onClick={() => handleDownloadPdf(selectedRecord)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                <span>{t.common.downloadPdf}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAttachedSkinAnalysisId(selectedRecord.id);
                  navigate('assistant');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span>{t.common.askAiAboutThis}</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {selectedRecord.summary}
          </p>

          {/* Interactive Annotated Photo Inspector + Cause Signs */}
          {selectedRecord.images.length > 0 && (() => {
            const allAnnotations = selectedRecord.annotations || [];
            const safeImgIdx = Math.min(activePhotoIndex, selectedRecord.images.length - 1);
            const activePhotoSrc = selectedRecord.images[safeImgIdx];
            const photoAnnotations = allAnnotations.filter((a) => a.imageIndex === safeImgIdx);
            const focusedAnn =
              allAnnotations.find((a) => a.id === selectedAnnotationId) ||
              photoAnnotations[0] ||
              allAnnotations[0] ||
              null;
            const focusedSign = focusedAnn
              ? selectedRecord.signs.find((s) => s.key === focusedAnn.signKey)
              : undefined;

            return (
              <div
                id="skin-annotated-photo"
                className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/40 dark:bg-slate-950/60 p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>
                        {isKz
                          ? 'Фотодағы белгілер және себеп белгілері'
                          : 'Отмеченные признаки на фото и знаки причин'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {isKz
                        ? 'Суреттегі нүктені басыңыз — ИИ қандай белгіні және оның негізгі себебін көрсетеді.'
                        : 'Нажмите на любую отмеченную зону на снимке — ИИ покажет признак и знак его вероятной причины.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoMarkers((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {showPhotoMarkers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>
                        {showPhotoMarkers
                          ? isKz
                            ? 'Белгілерді жасыру'
                            : 'Скрыть метки'
                          : isKz
                            ? 'Белгілерді көрсету'
                            : 'Показать метки'}
                      </span>
                    </button>

                    {photoAnnotations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDownloadAnnotatedPhoto(activePhotoSrc, photoAnnotations)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isKz ? 'Белгіленген фото (PNG)' : 'Фото с метками (PNG)'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multi-photo tabs */}
                {selectedRecord.images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.images.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActivePhotoIndex(idx);
                          const firstOnPhoto = allAnnotations.find((a) => a.imageIndex === idx);
                          if (firstOnPhoto) setSelectedAnnotationId(firstOnPhoto.id);
                        }}
                        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
                          safeImgIdx === idx
                            ? 'border-sky-500 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <img src={imgSrc} alt="" className="w-6 h-6 rounded-md object-cover" />
                        <span>
                          {isKz ? `Фото #${idx + 1}` : `Фото #${idx + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Photo Canvas with Interactive Target Rings & Cause Pins */}
                  <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm">
                    <img
                      src={activePhotoSrc}
                      alt={isKz ? 'Талданған тері фотосы' : 'Проанализированное фото кожи'}
                      className="w-full h-auto max-h-[420px] object-contain mx-auto block"
                    />

                    {showPhotoMarkers &&
                      photoAnnotations.map((ann, idx) => {
                        const isFocused = focusedAnn?.id === ann.id;
                        const { Icon: CauseIcon } = getCauseVisualMeta(ann.causeIcon);
                        const ringColors =
                          ann.severity === 'notable'
                            ? 'border-rose-500 bg-rose-500/20'
                            : ann.severity === 'moderate'
                              ? 'border-amber-400 bg-amber-400/20'
                              : 'border-sky-400 bg-sky-400/20';
                        const badgeBg =
                          ann.severity === 'notable'
                            ? 'bg-rose-600'
                            : ann.severity === 'moderate'
                              ? 'bg-amber-500'
                              : 'bg-sky-600';
                        const diameterPct = ann.radiusPct || 14;

                        return (
                          <button
                            key={ann.id}
                            type="button"
                            onClick={() => setSelectedAnnotationId(ann.id)}
                            aria-label={`${idx + 1}. ${ann.label}`}
                            style={{
                              left: `${ann.xPct}%`,
                              top: `${ann.yPct}%`,
                              width: `${diameterPct}%`,
                            }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 aspect-square rounded-full border-2 border-dashed transition-all cursor-pointer ${ringColors} ${
                              isFocused
                                ? 'scale-110 ring-4 ring-white/80 z-20'
                                : 'opacity-90 hover:scale-105 z-10'
                            }`}
                          >
                            <span
                              className={`absolute -top-2.5 -right-2.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${badgeBg} text-white text-[10px] font-bold shadow-md border border-white`}
                            >
                              <span>{idx + 1}</span>
                              <CauseIcon className="w-2.5 h-2.5" />
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {/* Cause Sign Detail Card + Clickable Annotations List */}
                  <div className="lg:col-span-6 space-y-3">
                    {focusedAnn ? (
                      (() => {
                        const { Icon: FocusedIcon, badgeCls } = getCauseVisualMeta(focusedAnn.causeIcon);
                        const idxOnPhoto =
                          photoAnnotations.findIndex((a) => a.id === focusedAnn.id) + 1 || 1;
                        return (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                <span className="w-5 h-5 rounded-full bg-sky-600 text-white inline-flex items-center justify-center text-[11px]">
                                  {idxOnPhoto}
                                </span>
                                <span>{focusedAnn.label}</span>
                              </span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  focusedAnn.severity === 'notable'
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : focusedAnn.severity === 'moderate'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-teal-700 dark:text-teal-400'
                                }`}
                              >
                                {severityLabel(focusedAnn.severity)}
                              </span>
                            </div>

                            {/* Visual Cause Sign Box */}
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${badgeCls}`}
                            >
                              <FocusedIcon className="w-4 h-4 shrink-0" />
                              <span>{focusedAnn.causeLabel}</span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                              {focusedAnn.description}
                            </p>

                            {focusedSign && focusedSign.recommendations.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300">
                                <span className="font-semibold">
                                  {isKz ? 'Ұсыныс: ' : 'Что помогает: '}
                                </span>
                                {focusedSign.recommendations.join(' ')}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500">
                        {isKz
                          ? 'Осы фотода қосымша нүктелік белгілер табылмады.'
                          : 'На этом снимке явных точечных зон не выделено.'}
                      </div>
                    )}

                    {/* List of all annotated spots on current or other photos */}
                    {allAnnotations.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {isKz
                            ? `Фотода белгіленген аймақтар (${allAnnotations.length})`
                            : `Отмеченные зоны и причины (${allAnnotations.length})`}
                        </p>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {allAnnotations.map((ann, idx) => {
                            const active = focusedAnn?.id === ann.id;
                            const { Icon: CauseIcon, badgeCls } = getCauseVisualMeta(ann.causeIcon);
                            return (
                              <button
                                key={ann.id}
                                type="button"
                                onClick={() => {
                                  setActivePhotoIndex(ann.imageIndex);
                                  setSelectedAnnotationId(ann.id);
                                  setShowPhotoMarkers(true);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                                  active
                                    ? 'border-sky-500 bg-white dark:bg-slate-900 shadow-2xs'
                                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {ann.label}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                      {ann.causeLabel}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold shrink-0 ${badgeCls}`}
                                >
                                  <CauseIcon className="w-3 h-3" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cause Icons Legend */}
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[11px]">
                      {(
                        [
                          { icon: 'uv' as const, ru: 'УФ / солнце', kz: 'UV / күн' },
                          { icon: 'climate' as const, ru: 'Ветер / мороз', kz: 'Жел / аяз' },
                          { icon: 'barrier' as const, ru: 'Барьер / влага', kz: 'Ылғал тапшылығы' },
                          { icon: 'sebum' as const, ru: 'Себум / поры', kz: 'Себум / кеуек' },
                          { icon: 'allergen' as const, ru: 'Аллерген / уход', kz: 'Аллерген' },
                          { icon: 'stress' as const, ru: 'Стресс', kz: 'Стресс' },
                        ] as const
                      ).map((item) => {
                        const { Icon, badgeCls } = getCauseVisualMeta(item.icon);
                        return (
                          <span
                            key={item.icon}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border ${badgeCls}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{isKz ? item.kz : item.ru}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Urgency / Red flags box */}
          {selectedRecord.overallUrgency === 'red' || selectedRecord.redFlagsDetected.length > 0 ? (
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-semibold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>
                  {isKz
                    ? 'Маманға шұғыл қаралу ұсынылады'
                    : 'Обнаружены признаки, требующие очного осмотра врача'}
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {selectedRecord.redFlagsDetected.join('; ')}
              </p>
              <div className="flex gap-3 pt-1 text-xs font-semibold">
                <a href="tel:103" className="text-rose-700 dark:text-rose-300 underline">
                  103
                </a>
                <a href="tel:112" className="text-rose-700 dark:text-rose-300 underline">
                  112
                </a>
              </div>
            </div>
          ) : null}

          {/* 8 Visible Signs Grid with Visual Cause Badges & Photo Pin Jump */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedRecord.signs.map((sign) => {
              const linkedAnnIndex = (selectedRecord.annotations || []).findIndex(
                (a) => a.signKey === sign.key
              );
              const linkedAnn =
                linkedAnnIndex >= 0 ? selectedRecord.annotations?.[linkedAnnIndex] : undefined;

              return (
                <div
                  key={sign.key}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      {sign.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold ${
                        sign.severity === 'notable'
                          ? 'text-rose-600 dark:text-rose-400'
                          : sign.severity === 'moderate'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-teal-700 dark:text-teal-400'
                      }`}
                    >
                      {severityLabel(sign.severity)}
                      {typeof sign.confidence === 'number'
                        ? ` · ${Math.round(sign.confidence)}%`
                        : ''}
                    </span>
                  </div>

                  {/* Visual Cause Badges */}
                  {sign.causeBadges && sign.causeBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sign.causeBadges.map((cb, cbIdx) => {
                        const { Icon: CbIcon, badgeCls } = getCauseVisualMeta(cb.icon);
                        return (
                          <span
                            key={cbIdx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${badgeCls}`}
                          >
                            <CbIcon className="w-3 h-3 shrink-0" />
                            <span>{cb.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sign.explanation}
                  </p>

                  {sign.possibleFactors.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isKz ? 'Ықтимал факторлар: ' : 'Возможные факторы: '}
                      </span>
                      {sign.possibleFactors.join(', ')}
                    </p>
                  )}

                  {sign.recommendations.length > 0 && (
                    <p className="text-xs text-teal-700 dark:text-teal-300">
                      <span className="font-semibold">
                        {isKz ? 'Ұсыныс: ' : 'Рекомендация: '}
                      </span>
                      {sign.recommendations.join(' ')}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {sign.needsSpecialist
                        ? isKz
                          ? 'Дерматолог кеңесі ұсынылады'
                          : 'Рекомендуется консультация дерматолога'
                        : isKz
                          ? 'Қосымша бақылау жеткілікті'
                          : 'Достаточно планового наблюдения'}
                    </p>

                    {linkedAnn && (
                      <button
                        type="button"
                        onClick={() => {
                          setActivePhotoIndex(linkedAnn.imageIndex);
                          setSelectedAnnotationId(linkedAnn.id);
                          setShowPhotoMarkers(true);
                          document
                            .getElementById('skin-annotated-photo')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>
                          {isKz
                            ? `Фотода #${linkedAnnIndex + 1} белгіні көру`
                            : `Показать на фото (#${linkedAnnIndex + 1})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              {isKz ? 'Жалпы ұсыныстар және дәрігерге бағыт:' : 'Общие рекомендации и маршрутизация в РК:'}
            </p>
            <ul className="space-y-1 list-disc list-inside">
              {selectedRecord.generalCare.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            {selectedRecord.specialistAdvice && (
              <p className="pt-1 font-medium text-sky-700 dark:text-sky-400">
                {selectedRecord.specialistAdvice}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
