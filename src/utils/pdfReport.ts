import { jsPDF } from 'jspdf';
import { FamilyProfile, Language, SkinAnalysisRecord } from '../types/health';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generateSkinPdfReport(options: {
  record: SkinAnalysisRecord;
  profile: FamilyProfile;
  lang: Language;
  includeImages: boolean;
}): Promise<void> {
  const { record, profile, lang, includeImages } = options;
  const isKz = lang === 'kz';

  // High-DPI A4 canvas (1240 x 1754 at ~150dpi) guarantees crisp Russian & Kazakh Unicode rendering
  const W = 1240;
  const H = 1754;
  const MARGIN = 72;
  const CONTENT_W = W - MARGIN * 2;

  const pages: HTMLCanvasElement[] = [];

  const createPage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    pages.push(canvas);
    return { canvas, ctx };
  };

  let { ctx } = createPage();
  let y = 72;

  const drawHeader = (isFirst: boolean) => {
    // Logo mark
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.roundRect(MARGIN, 52, 42, 42, 10);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(MARGIN + 21, 73, 11, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 28px "Plus Jakarta Sans", "Manrope", Arial, sans-serif';
    ctx.fillText('DermaSense AI', MARGIN + 56, 82);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 18px "Manrope", Arial, sans-serif';
    const subtitle = isKz
      ? 'Медициналық ақпараттық есеп (Дәрігерге көрсетуге арналған)'
      : 'Информационный медицинский отчёт (Для консультации с врачом)';
    ctx.fillText(subtitle, MARGIN + 56, 108);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN, 132);
    ctx.lineTo(W - MARGIN, 132);
    ctx.stroke();

    y = isFirst ? 168 : 168;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > H - 100) {
      ({ ctx } = createPage());
      drawHeader(false);
    }
  };

  drawHeader(true);

  // Mode badge line
  ctx.fillStyle = record.mode === 'demo' ? '#B45309' : '#0369A1';
  ctx.font = '700 19px "Manrope", Arial, sans-serif';
  const modeLabel =
    record.mode === 'demo'
      ? isKz
        ? 'РЕЖИМ: ДЕМОНСТРАЦИЯЛЫҚ СИМУЛЯЦИЯ (МЕДИЦИНАЛЫҚ ДИАГНОЗ ЕМЕС)'
        : 'РЕЖИМ: ДЕМОНСТРАЦИОННАЯ СИМУЛЯЦИЯ (НЕ ЯВЛЯЕТСЯ ДИАГНОЗОМ)'
      : isKz
        ? `РЕЖИМ: AI-ТАЛДАУ (${record.modelName ?? 'Gemini Vision'})`
        : `РЕЖИМ: AI-АНАЛИЗ (${record.modelName ?? 'Gemini Vision'})`;
  ctx.fillText(modeLabel, MARGIN, y);
  y += 38;

  // Profile metadata box
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(MARGIN, y, CONTENT_W, 112, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '700 22px "Manrope", Arial, sans-serif';
  ctx.fillText(
    `${isKz ? 'Профиль' : 'Профиль'}: ${profile.name} (${profile.age} ${isKz ? 'жас' : 'лет'})`,
    MARGIN + 24,
    y + 42
  );

  ctx.fillStyle = '#475569';
  ctx.font = '500 19px "Manrope", Arial, sans-serif';
  const dateFormatted = new Date(record.createdAt).toLocaleString(isKz ? 'kk-KZ' : 'ru-RU');
  ctx.fillText(
    `${isKz ? 'Тексеру күні' : 'Дата проверки'}: ${dateFormatted}   ·   ${isKz ? 'Қала' : 'Город'}: ${profile.region}`,
    MARGIN + 24,
    y + 82
  );
  y += 144;

  // Consented images
  if (includeImages && record.images.length > 0) {
    ensureSpace(240);
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 22px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(
      isKz ? 'Тіркелген фотосуреттер (пациент келісімімен)' : 'Приложенные изображения (с согласия пользователя)',
      MARGIN,
      y
    );
    y += 22;

    let imgX = MARGIN;
    const thumbSize = 180;
    for (const src of record.images.slice(0, 4)) {
      const img = await loadImage(src);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, y, thumbSize, thumbSize, 12);
        ctx.clip();
        ctx.drawImage(img, imgX, y, thumbSize, thumbSize);
        ctx.restore();
        ctx.strokeStyle = '#CBD5E1';
        ctx.strokeRect(imgX, y, thumbSize, thumbSize);
        imgX += thumbSize + 20;
      }
    }
    y += thumbSize + 40;
  }

  // Summary
  ensureSpace(120);
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(isKz ? 'Жалпы қорытынды' : 'Общее резюме', MARGIN, y);
  y += 32;

  ctx.fillStyle = '#334155';
  ctx.font = '400 20px "Manrope", Arial, sans-serif';
  for (const line of wrapText(ctx, record.summary, CONTENT_W)) {
    ensureSpace(32);
    ctx.fillText(line, MARGIN, y);
    y += 29;
  }
  y += 22;

  // Signs
  ensureSpace(80);
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(isKz ? 'Көрінетін белгілерді бағалау' : 'Оценка видимых признаков', MARGIN, y);
  y += 34;

  for (const sign of record.signs) {
    ensureSpace(140);
    ctx.fillStyle = '#0369A1';
    ctx.font = '700 20px "Manrope", Arial, sans-serif';
    const confStr =
      typeof sign.confidence === 'number'
        ? ` · ${isKz ? 'Сенімділік' : 'Уверенность'}: ${Math.round(sign.confidence)}%`
        : '';
    ctx.fillText(`${sign.name} (${sign.severity.toUpperCase()}${confStr})`, MARGIN, y);
    y += 28;

    ctx.fillStyle = '#334155';
    ctx.font = '400 18px "Manrope", Arial, sans-serif';
    for (const line of wrapText(ctx, sign.explanation, CONTENT_W)) {
      ensureSpace(26);
      ctx.fillText(line, MARGIN, y);
      y += 25;
    }

    if (sign.recommendations.length > 0) {
      ctx.fillStyle = '#0F766E';
      ctx.font = '600 17px "Manrope", Arial, sans-serif';
      const recLine = `${isKz ? 'Ұсыныс' : 'Рекомендация'}: ${sign.recommendations.join(' ')}`;
      for (const line of wrapText(ctx, recLine, CONTENT_W)) {
        ensureSpace(24);
        ctx.fillText(line, MARGIN, y);
        y += 24;
      }
    }
    y += 16;
  }

  // Red Flags
  ensureSpace(150);
  ctx.fillStyle = '#FEF2F2';
  ctx.strokeStyle = '#FECACA';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(MARGIN, y, CONTENT_W, 128, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B91C1C';
  ctx.font = '700 20px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(
    isKz ? 'Қауіп белгілері (Қызыл жалаушалар)' : 'Красные флаги (Когда нужна срочная помощь)',
    MARGIN + 22,
    y + 36
  );

  ctx.fillStyle = '#7F1D1D';
  ctx.font = '400 17px "Manrope", Arial, sans-serif';
  const rfText =
    record.redFlagsDetected.length > 0
      ? record.redFlagsDetected.join('; ')
      : isKz
        ? 'Меңнің тез өзгеруі, қанау, беттің ісінуі, тыныс алудың қиындауы немесе жоғары температура кезінде дереу 103 / 112 нөміріне хабарласыңыз.'
        : 'При быстром изменении родинки, кровотечении, отёке лица, затруднении дыхания или высокой температуре немедленно обратитесь к врачу или звоните 103 / 112.';
  let rfY = y + 66;
  for (const line of wrapText(ctx, rfText, CONTENT_W - 44).slice(0, 3)) {
    ctx.fillText(line, MARGIN + 22, rfY);
    rfY += 24;
  }
  y += 156;

  // Medical Disclaimer
  ensureSpace(120);
  ctx.fillStyle = '#F1F5F9';
  ctx.beginPath();
  ctx.roundRect(MARGIN, y, CONTENT_W, 96, 10);
  ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.font = '600 16px "Manrope", Arial, sans-serif';
  const disc = isKz
    ? 'МЕДИЦИНАЛЫҚ ЕСКЕРТУ: Бұл есеп ақпараттық мақсатта жасалған, клиникалық диагноз болып табылмайды және дерматологтың немесе емдеуші дәрігердің кеңесін алмастырмайды.'
    : 'МЕДИЦИНСКИЙ ДИСКЛЕЙМЕР: Данный отчёт носит исключительно информационный характер, не является медицинским диагнозом и не заменяет очную консультацию дерматолога или лечащего врача.';
  let dY = y + 34;
  for (const line of wrapText(ctx, disc, CONTENT_W - 36)) {
    ctx.fillText(line, MARGIN + 18, dY);
    dY += 22;
  }

  // Export pages into jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  pages.forEach((canvas, idx) => {
    if (idx > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
  });

  const safeName = profile.name.replace(/[^a-zA-Zа-яА-ЯёЁәғқңөұүһіӘҒҚҢӨҰҮҺІ0-9_-]/g, '_');
  pdf.save(`DermaSense_AI_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
