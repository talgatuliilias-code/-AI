import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Strict allowlist of Kazakhstan city coordinates for weather lookup (prevents SSRF)
const KZ_CITY_COORDS: Record<string, { lat: number; lon: number; nameRu: string; nameKz: string }> = {
  almaty: { lat: 43.2389, lon: 76.8897, nameRu: 'Алматы', nameKz: 'Алматы' },
  astana: { lat: 51.1605, lon: 71.4704, nameRu: 'Астана', nameKz: 'Астана' },
  shymkent: { lat: 42.3417, lon: 69.5901, nameRu: 'Шымкент', nameKz: 'Шымкент' },
  karaganda: { lat: 49.8047, lon: 73.1094, nameRu: 'Караганда', nameKz: 'Қарағанды' },
  aktobe: { lat: 50.2839, lon: 57.167, nameRu: 'Актобе', nameKz: 'Ақтөбе' },
  atyrau: { lat: 47.0945, lon: 51.9238, nameRu: 'Атырау', nameKz: 'Атырау' },
  aktau: { lat: 43.6532, lon: 51.1975, nameRu: 'Актау', nameKz: 'Ақтау' },
  pavlodar: { lat: 52.2873, lon: 76.9674, nameRu: 'Павлодар', nameKz: 'Павлодар' },
  oskemen: { lat: 49.9483, lon: 82.6285, nameRu: 'Усть-Каменогорск', nameKz: 'Өскемен' },
  kostanay: { lat: 53.2198, lon: 63.6354, nameRu: 'Костанай', nameKz: 'Қостанай' },
  taraz: { lat: 42.9, lon: 71.3667, nameRu: 'Тараз', nameKz: 'Тараз' },
  kyzylorda: { lat: 44.8488, lon: 65.4823, nameRu: 'Кызылорда', nameKz: 'Қызылорда' },
  uralsk: { lat: 51.2333, lon: 51.3667, nameRu: 'Уральск', nameKz: 'Орал' },
  petropavlovsk: { lat: 54.8753, lon: 69.1628, nameRu: 'Петропавловск', nameKz: 'Петропавл' },
  turkestan: { lat: 43.2973, lon: 68.2518, nameRu: 'Туркестан', nameKz: 'Түркістан' },
  semey: { lat: 50.4111, lon: 80.2275, nameRu: 'Семей', nameKz: 'Семей' },
};

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  if (typeof dataUrl !== 'string' || dataUrl.length > 10_000_000) {
    return null;
  }
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return null;
  }
  const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  return { mimeType, data: match[2] };
}

async function startServer() {
  const app = express();
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const ai = getAiClient();
    const rawAppUrl = process.env.APP_URL?.trim();
    const appUrl =
      rawAppUrl && rawAppUrl !== 'MY_APP_URL' && rawAppUrl.startsWith('http')
        ? rawAppUrl
        : null;
    res.json({
      status: 'ok',
      aiAvailable: Boolean(ai),
      appUrl,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/weather', async (req: Request, res: Response) => {
    const cityId = typeof req.query.cityId === 'string' ? req.query.cityId : 'almaty';
    const city = KZ_CITY_COORDS[cityId];
    if (!city) {
      return res.status(400).json({ error: 'Invalid cityId' });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index&timezone=Asia%2FAlmaty`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        return res.status(502).json({ live: false, error: 'Weather provider unavailable' });
      }
      const data = (await response.json()) as {
        current?: {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          wind_speed_10m?: number;
          uv_index?: number;
        };
      };
      return res.json({
        live: true,
        source: 'Open-Meteo',
        cityId,
        current: {
          temperatureC: data.current?.temperature_2m ?? null,
          humidityPct: data.current?.relative_humidity_2m ?? null,
          windKmh: data.current?.wind_speed_10m ?? null,
          uvIndex: data.current?.uv_index ?? null,
        },
      });
    } catch {
      return res.status(503).json({ live: false, error: 'Weather service unreachable' });
    }
  });

  app.get('/api/nearby-medical', async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusRaw = Number(req.query.radius);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -85 ||
      lat > 85 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters are required.' });
    }

    const radius = Number.isFinite(radiusRaw)
      ? Math.min(Math.max(Math.round(radiusRaw), 500), 12000)
      : 5000;

    const overpassQuery = `[out:json][timeout:4];(node["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lng});way["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${lat},${lng}););out center 24;`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.json({ source: 'unavailable', items: [] });
      }

      const data = (await response.json()) as {
        elements?: Array<{
          id: number;
          type: string;
          lat?: number;
          lon?: number;
          center?: { lat: number; lon: number };
          tags?: Record<string, string>;
        }>;
      };

      const items = (data.elements || [])
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          const tags = el.tags || {};
          const name = tags.name || tags['name:ru'] || tags['name:kk'] || '';
          if (!elLat || !elLng || !name) return null;
          const amenity = tags.amenity || 'clinic';
          const addressParts = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean);
          return {
            id: `osm-${el.type}-${el.id}`,
            name,
            kind: amenity === 'pharmacy' ? 'pharmacy' : 'clinic',
            lat: elLat,
            lng: elLng,
            address: addressParts.join(', ') || tags['addr:full'] || '',
            phone: tags.phone || tags['contact:phone'] || '',
            openingHours: tags.opening_hours || '',
            is24h: tags.opening_hours === '24/7',
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .slice(0, 20);

      return res.json({ source: 'openstreetmap', items });
    } catch {
      return res.json({ source: 'unavailable', items: [] });
    }
  });

  app.get('/api/route', async (req: Request, res: Response) => {
    const fromLat = Number(req.query.fromLat);
    const fromLng = Number(req.query.fromLng);
    const toLat = Number(req.query.toLat);
    const toLng = Number(req.query.toLng);
    const mode = req.query.mode === 'walking' ? 'foot' : 'driving';

    if (
      ![fromLat, fromLng, toLat, toLng].every((v) => Number.isFinite(v)) ||
      Math.abs(fromLat) > 85 ||
      Math.abs(toLat) > 85 ||
      Math.abs(fromLng) > 180 ||
      Math.abs(toLng) > 180
    ) {
      return res.status(400).json({ error: 'Valid coordinates are required.' });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = `https://router.project-osrm.org/route/v1/${mode}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.json({ source: 'direct', coordinates: [[fromLat, fromLng], [toLat, toLng]] });
      }

      const data = (await response.json()) as {
        routes?: Array<{
          distance: number;
          duration: number;
          geometry?: { coordinates?: Array<[number, number]> };
        }>;
      };
      const best = data.routes?.[0];
      const coords = best?.geometry?.coordinates;
      if (!best || !coords || coords.length < 2) {
        return res.json({ source: 'direct', coordinates: [[fromLat, fromLng], [toLat, toLng]] });
      }

      return res.json({
        source: 'osrm',
        distanceMeters: Math.round(best.distance),
        durationSeconds: Math.round(best.duration),
        coordinates: coords.map(([lng, lat]) => [lat, lng]),
      });
    } catch {
      return res.json({ source: 'direct', coordinates: [[fromLat, fromLng], [toLat, toLng]] });
    }
  });

  app.post('/api/analyze-skin', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        mode: 'unavailable',
        error: 'GEMINI_API_KEY is not configured on the server. Use Demo Mode or configure a key in Settings > Secrets.',
      });
    }

    const { images, lang, profileContext } = req.body as {
      images?: unknown;
      lang?: string;
      profileContext?: { age?: number; skinType?: string; city?: string; complaints?: string };
    };

    if (!Array.isArray(images) || images.length === 0 || images.length > 5) {
      return res.status(400).json({ error: 'Provide between 1 and 5 valid images.' });
    }

    const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
    for (const img of images) {
      if (typeof img !== 'string') {
        return res.status(400).json({ error: 'Invalid image payload.' });
      }
      const parsed = parseDataUrl(img);
      if (!parsed || !parsed.mimeType.startsWith('image/')) {
        return res.status(400).json({ error: 'Unsupported or oversized image format (allowed: JPEG, PNG, WebP).' });
      }
      parts.push({ inlineData: parsed });
    }

    const languageName = lang === 'kz' ? 'Kazakh (қазақ тілі)' : 'Russian (русский язык)';
    const contextText = profileContext
      ? `Profile context: age=${profileContext.age ?? 'unknown'}, skinType=${profileContext.skinType ?? 'unknown'}, city=${profileContext.city ?? 'Kazakhstan'}, complaints=${profileContext.complaints ?? 'none'}.`
      : 'No additional profile context.';

    parts.push({
      text: `Analyze the uploaded skin photograph(s) carefully for visible dermatological wellness indicators ONLY (not a medical diagnosis). Respond strictly in ${languageName}. ${contextText}
Evaluate all 8 required visible categories:
1. acne (Акне / Бездеу)
2. redness (Покраснение / Қызару)
3. irritation (Раздражение / Тітіркену)
4. pigmentation (Пигментация / Пигментация)
5. dryness (Сухость / Құрғақтық)
6. oiliness (Жирность / Майлылық)
7. inflammation (Воспалительные изменения / Қабыну өзгерістері)
8. moleChanges (Подозрительные изменения родинок / Меңдердің күмәнді өзгерістері)

For each category:
- State clearly what is visible (or not visible/minimal), confidence (0-100), possible non-diagnostic lifestyle/environmental factors, gentle skincare recommendations, and whether specialist dermatologist consultation is advised.
- Provide 1 to 2 visual causeBadges, where each badge has "icon" (strictly one of: 'uv', 'climate', 'barrier', 'sebum', 'allergen', 'stress', 'friction', 'pigment', 'warning') and a short localized "label".

ALSO provide 2 to 6 "annotations" marking exact visible regions/spots directly on the submitted photograph(s):
- imageIndex: 0-based index of the image where the feature appears (usually 0 if 1 image)
- signKey: matching category key (e.g. 'redness', 'acne', 'dryness', 'pigmentation', 'irritation', 'oiliness', 'inflammation', 'moleChanges')
- label: short title of the marked sign (2-4 words in ${languageName})
- xPct: horizontal center coordinate in percent (10 to 90, where 0 is left edge and 100 is right edge of that image) pointing directly at the visible skin area
- yPct: vertical center coordinate in percent (10 to 90, where 0 is top edge and 100 is bottom edge of that image) pointing directly at the visible skin area
- radiusPct: circle highlight diameter in percent (10 to 22)
- severity: 'mild', 'moderate', or 'notable'
- causeIcon: strictly one of 'uv', 'climate', 'barrier', 'sebum', 'allergen', 'stress', 'friction', 'pigment', 'warning'
- causeLabel: concise cause label explaining WHY this sign occurs (e.g. "Сухой воздух и ветер", "УФ-излучение", "Избыток себума")
- description: 1 concise sentence explaining what is visible at that marked spot and its likely non-diagnostic cause.

Flag any urgent warning signs honestly without alarmism. Do not diagnose cancer or disease.`,
    });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are DermaSense AI, a careful dermatological wellness observation assistant for residents of Kazakhstan. You describe visible skin traits objectively, mark exact observed regions on the image using normalized 0-100 percentage coordinates, explain likely causes with clear visual cause categories, recommend gentle care and dermatologist visits (or polyclinic/Damumed referral in Kazakhstan), and NEVER claim to provide a clinical medical diagnosis.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              overallUrgency: { type: Type.STRING, description: 'green, yellow, or red' },
              redFlagsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
              generalCare: { type: Type.ARRAY, items: { type: Type.STRING } },
              specialistAdvice: { type: Type.STRING },
              signs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    name: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'none, mild, moderate, or notable' },
                    confidence: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    possibleFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    causeBadges: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          icon: { type: Type.STRING },
                          label: { type: Type.STRING },
                        },
                      },
                    },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    needsSpecialist: { type: Type.BOOLEAN },
                  },
                },
              },
              annotations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    imageIndex: { type: Type.INTEGER },
                    signKey: { type: Type.STRING },
                    label: { type: Type.STRING },
                    xPct: { type: Type.NUMBER },
                    yPct: { type: Type.NUMBER },
                    radiusPct: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    causeIcon: { type: Type.STRING },
                    causeLabel: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as {
        annotations?: Array<Record<string, unknown>>;
        [k: string]: unknown;
      };

      const validIcons = new Set([
        'uv',
        'climate',
        'barrier',
        'sebum',
        'allergen',
        'stress',
        'friction',
        'pigment',
        'warning',
      ]);

      if (Array.isArray(parsed.annotations)) {
        parsed.annotations = parsed.annotations.slice(0, 8).map((ann, idx) => {
          const rawImgIdx = Number(ann.imageIndex);
          const imageIndex =
            Number.isFinite(rawImgIdx) && rawImgIdx >= 0 && rawImgIdx < images.length
              ? Math.floor(rawImgIdx)
              : 0;
          const xRaw = Number(ann.xPct);
          const yRaw = Number(ann.yPct);
          const rRaw = Number(ann.radiusPct);
          const rawIcon = String(ann.causeIcon || 'barrier');
          const rawSev = String(ann.severity || 'mild');
          return {
            ...ann,
            id: typeof ann.id === 'string' && ann.id ? ann.id : `ann-${idx + 1}`,
            imageIndex,
            xPct: Number.isFinite(xRaw) ? Math.min(92, Math.max(8, Math.round(xRaw))) : 50,
            yPct: Number.isFinite(yRaw) ? Math.min(92, Math.max(8, Math.round(yRaw))) : 50,
            radiusPct: Number.isFinite(rRaw) ? Math.min(24, Math.max(9, Math.round(rRaw))) : 14,
            severity: rawSev === 'notable' || rawSev === 'moderate' ? rawSev : 'mild',
            causeIcon: validIcons.has(rawIcon) ? rawIcon : 'barrier',
          };
        });
      }

      return res.json({ mode: 'ai', model: 'gemini-4-hydrogen', result: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI skin analysis failed';
      return res.status(502).json({ mode: 'error', error: message });
    }
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        mode: 'unavailable',
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { messages, lang, profileContext, attachedContext } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      lang?: string;
      profileContext?: {
        name?: string;
        age?: number;
        city?: string;
        region?: string;
        skinType?: string;
        allergies?: string;
      };
      attachedContext?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const recentMessages = messages.slice(-14).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 4000) }],
    }));

    const languageRule =
      lang === 'kz'
        ? 'Always respond in natural, literary Kazakh (қазақ тілі), unless the user writes in another language and asks for it.'
        : 'Always respond in clear, empathetic Russian (русский язык), unless the user writes in Kazakh or asks for another language.';

    const systemInstruction = `You are Derma AI Assistant inside DermaSense AI (Kazakhstan HealthTech platform).
${languageRule}
Patient profile context: ${JSON.stringify(profileContext ?? {})}.
${attachedContext ? `Recent attached health/skin analysis context: ${attachedContext.slice(0, 3000)}` : ''}
Guidelines:
- Explain medical terms simply.
- Account for Kazakhstan climate factors (continental dryness, dust, frost, high UV in south/mountains) when relevant.
- Help prepare questions for a doctor appointment (polyclinic attachment, Damumed, dermatologist).
- Give cautious, evidence-based wellness advice. NEVER prescribe prescription drugs or claim a definitive diagnosis.
- If severe/emergency symptoms are mentioned (breathing difficulty, facial/throat swelling, bleeding rapidly changing mole, high fever with severe rash), advise urgent care / calling 103 or 112 in Kazakhstan.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: recentMessages,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction,
        },
      });
      return res.json({
        mode: 'ai',
        model: 'gemini-4-hydrogen',
        reply: response.text ?? '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI chat failed';
      return res.status(502).json({ mode: 'error', error: message });
    }
  });

  app.post('/api/symptom-check', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        mode: 'unavailable',
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { symptoms, duration, intensity, temperatureC, lang, profileContext } = req.body as {
      symptoms?: string;
      duration?: string;
      intensity?: string;
      temperatureC?: string;
      lang?: string;
      profileContext?: { age?: number; city?: string; region?: string; allergies?: string };
    };

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return res.status(400).json({ error: 'Describe your symptoms (at least 3 characters).' });
    }

    const languageName = lang === 'kz' ? 'Kazakh (қазақ тілі)' : 'Russian (русский язык)';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Patient describes symptoms: "${symptoms.slice(0, 2000)}".
Duration: ${duration || 'unspecified'}. Intensity: ${intensity || 'moderate'}. Temperature: ${temperatureC || 'not measured'}.
Profile: ${JSON.stringify(profileContext ?? {})}.
Respond strictly in ${languageName}.
Provide cautious, non-diagnostic clinical AI-therapist triage:
- urgency: 'green' (general wellness), 'yellow' (schedule doctor visit), or 'red' (urgent/emergency care 103/112).
- redFlagWarning: brief warning if any dangerous symptom is present, otherwise empty string.
- possibleExplanations: 2-3 non-diagnostic general possibilities to discuss with a doctor.
- careRecommendations: 3-4 safe, practical supportive steps (rest, hydration, observation, avoiding self-medication with antibiotics/prescription drugs).
- recommendedSpecialty: strictly one of 'therapist', 'dermatologist', 'cardiologist', 'neurologist', 'ophthalmologist', 'dentist', 'endocrinologist', 'pediatrician', 'gynecologist'.
- recommendedSpecialtyLabel: localized name of that specialist in ${languageName}.
- doctorQuestions: 3 helpful questions to prepare for the clinic visit.
- medicationNote: safe reminder about tracking only physician-prescribed medications.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a Clinical AI Therapist triage assistant inside DermaSense AI (Kazakhstan). Give structured, cautious, empathetic wellness guidance, recommend the right medical specialty and Kazakhstan clinic/Damumed pathway, NEVER prescribe drugs, and NEVER claim a final medical diagnosis.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgency: { type: Type.STRING },
              redFlagWarning: { type: Type.STRING },
              summary: { type: Type.STRING },
              possibleExplanations: { type: Type.ARRAY, items: { type: Type.STRING } },
              careRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedSpecialty: { type: Type.STRING },
              recommendedSpecialtyLabel: { type: Type.STRING },
              doctorQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              medicationNote: { type: Type.STRING },
            },
          },
        },
      });

      const result = JSON.parse((response.text ?? '{}').trim());
      return res.json({ mode: 'ai', model: 'gemini-4-hydrogen', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Symptom check failed';
      return res.status(502).json({ mode: 'error', error: message });
    }
  });

  app.post('/api/analyze-lab', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        mode: 'unavailable',
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { fileDataUrl, fileName, lang } = req.body as {
      fileDataUrl?: string;
      fileName?: string;
      lang?: string;
    };

    if (!fileDataUrl) {
      return res.status(400).json({ error: 'File data is required.' });
    }

    const parsed = parseDataUrl(fileDataUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Unsupported or oversized file. Allowed: PDF, JPG, PNG (<= 7MB).' });
    }

    const languageName = lang === 'kz' ? 'Kazakh (қазақ тілі)' : 'Russian (русский язык)';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            { inlineData: parsed },
            {
              text: `Inspect this uploaded laboratory document (${fileName ?? 'lab_report'}). Respond in ${languageName}.
CRITICAL RULE: ONLY extract parameters that are clearly visible and legible in the document. If the document is blurry, blank, unreadable, or not a lab report, set readable=false and return an empty markers array — NEVER invent or fabricate lab numbers.
For each clearly legible lab marker, provide: name, value (number if numeric), unit, referenceRange, status ('normal', 'low', 'high'), and plain-language explanation.`,
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a careful medical lab document reader. Never fabricate values. Always remind the user to discuss results with their physician.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readable: { type: Type.BOOLEAN },
              unreadableReason: { type: Type.STRING },
              labTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              markers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    valueText: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    referenceMin: { type: Type.NUMBER },
                    referenceMax: { type: Type.NUMBER },
                    referenceRangeText: { type: Type.STRING },
                    status: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const result = JSON.parse((response.text ?? '{}').trim());
      return res.json({ mode: 'ai', model: 'gemini-4-hydrogen', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lab analysis failed';
      return res.status(502).json({ mode: 'error', error: message });
    }
  });

  app.post('/api/translate', async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        mode: 'unavailable',
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { text, pair } = req.body as { text?: string; pair?: string };
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const pairMap: Record<string, string> = {
      'kz-ru': 'Kazakh to Russian',
      'ru-kz': 'Russian to Kazakh',
      'en-ru': 'English to Russian',
      'en-kz': 'English to Kazakh',
    };
    const direction = pairMap[pair ?? 'kz-ru'] ?? 'Kazakh to Russian';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Translate and briefly explain this medical term or phrase from ${direction}: "${text.slice(0, 1200)}"`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              explanation: { type: Type.STRING },
              patientTip: { type: Type.STRING },
            },
          },
        },
      });
      const result = JSON.parse((response.text ?? '{}').trim());
      return res.json({ mode: 'ai', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed';
      return res.status(502).json({ mode: 'error', error: message });
    }
  });

  // Vite dev middleware or static dist serving
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DermaSense AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
