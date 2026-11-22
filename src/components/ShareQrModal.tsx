import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Check, Copy, Download, QrCode, Share2, Smartphone, X } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

function resolveDefaultPublicUrl(serverAppUrl?: string | null): string {
  if (typeof window === 'undefined') {
    return serverAppUrl || '';
  }
  const { origin, hostname } = window.location;
  // If running on AI Studio dev preview URL, convert dev host to public shared host so anyone can scan & open
  if (hostname.includes('ais-dev-')) {
    return origin.replace('ais-dev-', 'ais-pre-');
  }
  if (serverAppUrl && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return serverAppUrl.replace('ais-dev-', 'ais-pre-');
  }
  return origin;
}

export function usePublicShareUrl() {
  const [shareUrl, setShareUrl] = useState<string>(() => resolveDefaultPublicUrl(null));
  const [currentRouteUrl, setCurrentRouteUrl] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.href : ''
  );

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { appUrl?: string | null } | null) => {
        if (!active) return;
        const resolved = resolveDefaultPublicUrl(data?.appUrl);
        if (resolved) setShareUrl(resolved);
      })
      .catch(() => {
        // Fallback already set from window.location
      });

    if (typeof window !== 'undefined') {
      const origin = resolveDefaultPublicUrl(null);
      setCurrentRouteUrl(`${origin}${window.location.pathname}`);
    }
    return () => {
      active = false;
    };
  }, []);

  return { shareUrl, setShareUrl, currentRouteUrl };
}

export const QrCodeGraphic: React.FC<{
  value: string;
  size?: number;
  label?: string;
}> = ({ value, size = 132, label = 'DermaSense AI' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        // Ignore transient QR encoding error
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR-код ${label}`}
          style={{ width: size, height: size }}
          className="rounded-md block"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-md bg-slate-100 flex items-center justify-center text-slate-400"
        >
          <QrCode className="w-7 h-7" />
        </div>
      )}
      <span className="font-display text-[11px] font-bold tracking-tight text-slate-900">
        {label}
      </span>
    </div>
  );
};

export const ShareQrSectionCard: React.FC = () => {
  const { lang, showToast } = useHealth();
  const isKz = lang === 'kz';
  const { shareUrl, setShareUrl } = usePublicShareUrl();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast(isKz ? 'Сілтеме көшірілді!' : 'Ссылка скопирована!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(shareUrl, 'info');
    }
  };

  const handleDownloadPng = async () => {
    try {
      const pngUrl = await QRCode.toDataURL(shareUrl, {
        width: 720,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'DermaSense-AI-QR.png';
      link.click();
      showToast(isKz ? 'QR-код жүктелді' : 'QR-код сохранён (PNG)', 'success');
    } catch {
      showToast(isKz ? 'Жүктеу сәтсіз болды' : 'Не удалось скачать QR-код', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DermaSense AI',
          text: isKz
            ? 'DermaSense AI — Қазақстанның зияткерлік медициналық платформасы'
            : 'DermaSense AI — Интеллектуальная медицинская платформа Казахстана',
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled native share
      }
    }
    handleCopy();
  };

  return (
    <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50/80 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-8 space-y-3.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Smartphone className="w-4 h-4" />
            <span>
              {isKz
                ? 'Тіркелусіз барлық телефондарда ашық (iOS және Android)'
                : 'Открыто для всех без регистрации · Любые смартфоны iOS и Android'}
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isKz
              ? 'QR-код арқылы сайтқа лезде кіріңіз'
              : 'Мгновенный вход по QR-коду с любого телефона'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isKz
              ? 'Кез келген телефонның камерасын QR-кодқа бағыттаңыз — DermaSense AI платформасы, тері талдауы, AI-терапевт және клиникалар картасы бірден ашылады.'
              : 'Наведите камеру любого смартфона на QR-код, чтобы открыть DermaSense AI, карту клиник и аптек, AI-анализ кожи и голосового помощника без установки приложений и регистрации.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              aria-label="Website URL"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isKz ? 'Көшірілді' : 'Скопировано') : (isKz ? 'Көшіру' : 'Копировать')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{isKz ? 'QR-кодты жүктеу (PNG)' : 'Скачать QR-код (PNG)'}</span>
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isKz ? 'Сілтемені бөлісу' : 'Поделиться ссылкой'}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center md:justify-end">
          <QrCodeGraphic value={shareUrl} size={124} label="DermaSense AI" />
        </div>
      </div>
    </div>
  );
};

export const ShareQrModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { lang, showToast } = useHealth();
  const isKz = lang === 'kz';
  const { shareUrl, setShareUrl, currentRouteUrl } = usePublicShareUrl();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast(isKz ? 'Сілтеме көшірілді!' : 'Ссылка скопирована!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(shareUrl, 'info');
    }
  };

  const handleDownloadPng = async () => {
    try {
      const pngUrl = await QRCode.toDataURL(shareUrl, {
        width: 720,
        margin: 3,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'DermaSense-AI-QR.png';
      link.click();
      showToast(isKz ? 'QR-код жүктелді' : 'QR-код сохранён (PNG)', 'success');
    } catch {
      showToast(isKz ? 'Жүктеу сәтсіз болды' : 'Не удалось скачать QR-код', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isKz ? 'Артқа' : 'Назад'}</span>
            </button>
            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              DermaSense AI · QR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          {isKz
            ? 'Кез келген смартфон камерасымен сканерлеп, сайтты тіркелусіз ашыңыз.'
            : 'Отсканируйте камерой любого смартфона (iPhone / Android) — сайт открывается свободно для всех без регистрации.'}
        </p>

        <div className="flex justify-center py-0.5">
          <QrCodeGraphic value={shareUrl} size={136} label="DermaSense AI" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{isKz ? 'Кіру сілтемесі' : 'Публичная ссылка'}</span>
            {currentRouteUrl && currentRouteUrl !== shareUrl && (
              <button
                type="button"
                onClick={() => setShareUrl(currentRouteUrl)}
                className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                {isKz ? 'Осы бетті қосу' : 'Ссылка на текущий раздел'}
              </button>
            )}
          </div>
          <input
            type="url"
            value={shareUrl}
            onChange={(e) => setShareUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isKz ? 'Көшірілді' : 'Скопировано') : (isKz ? 'Көшіру' : 'Копировать')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isKz ? 'Жүктеу PNG' : 'Скачать PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
