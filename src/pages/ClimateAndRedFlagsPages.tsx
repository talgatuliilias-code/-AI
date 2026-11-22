import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Droplets,
  PhoneCall,
  ShieldAlert,
  Sun,
  Wind,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { KZ_CITIES } from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';

interface LiveWeatherData {
  live: boolean;
  source?: string;
  current?: {
    temperatureC: number | null;
    humidityPct: number | null;
    windKmh: number | null;
    uvIndex: number | null;
  };
}

export const ClimatePage: React.FC = () => {
  const { lang, activeProfile } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [selectedCityId, setSelectedCityId] = useState(activeProfile.cityId || 'almaty');
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const city = KZ_CITIES.find((c) => c.id === selectedCityId) || KZ_CITIES[0];

  useEffect(() => {
    let cancelled = false;
    setLoadingWeather(true);
    fetch(`/api/weather?cityId=${encodeURIComponent(selectedCityId)}`)
      .then((r) => r.json())
      .then((d: LiveWeatherData) => {
        if (!cancelled) setWeather(d.live ? d : { live: false });
      })
      .catch(() => {
        if (!cancelled) setWeather({ live: false });
      })
      .finally(() => {
        if (!cancelled) setLoadingWeather(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCityId]);

  const month = new Date().getMonth();
  const seasonLabel =
    month >= 11 || month <= 1
      ? isKz
        ? 'Қыс маусымы'
        : 'Зимний сезон'
      : month >= 2 && month <= 4
        ? isKz
          ? 'Көктем маусымы'
          : 'Весенний сезон'
        : month >= 5 && month <= 7
          ? isKz
            ? 'Жаз маусымы'
            : 'Летний сезон'
          : isKz
            ? 'Күз маусымы'
            : 'Осенний сезон';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes.climate}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'Қазақстан өңірлерінің климаттық ерекшеліктеріне бейімделген тері күтімі'
              : 'Рекомендации по уходу за кожей с учётом климата городов и областей Казахстана'}
          </p>
        </div>

        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white"
        >
          {KZ_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {isKz ? c.nameKz : c.nameRu}
            </option>
          ))}
        </select>
      </div>

      {/* Weather / Seasonal Status Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isKz ? city.regionKz : city.regionRu} · {seasonLabel}
            </p>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {isKz ? city.nameKz : city.nameRu}
            </h2>
          </div>

          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            {loadingWeather
              ? isKz
                ? 'Ауа райы жүктелуде...'
                : 'Загрузка погоды...'
              : weather?.live
                ? isKz
                  ? `Нақты деректер (${weather.source})`
                  : `Актуальная погода (${weather.source})`
                : isKz
                  ? 'Маусымдық профиль (live-API-сыз)'
                  : 'Сезонная модель региона (без live-API погоды)'}
          </span>
        </div>

        {weather?.live && weather.current && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Температура' : 'Температура'}
              </p>
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                {weather.current.temperatureC ?? '—'}°C
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Ылғалдылық' : 'Влажность'}
              </p>
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                {weather.current.humidityPct ?? '—'}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Жел' : 'Ветер'}
              </p>
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                {weather.current.windKmh ?? '—'} {isKz ? 'км/сағ' : 'км/ч'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">UV Index</p>
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                {weather.current.uvIndex ?? '—'}
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-700 dark:text-slate-300">
          {isKz ? city.climateTypeKz : city.climateTypeRu}
        </p>

        {/* Climate Risk Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Droplets className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Ауа құрғақтығы' : 'Сухость воздуха'}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {city.drynessRisk === 'high' ? (isKz ? 'Жоғары' : 'Высокая') : isKz ? 'Орташа' : 'Умеренная'}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'UV-жүктеме' : 'UV-индекс'}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {city.uvRisk === 'high' ? (isKz ? 'Жоғары' : 'Высокий') : isKz ? 'Маусымдық' : 'Умеренный'}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <CloudSun className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Аяз / ауытқу' : 'Морозы и перепады'}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {city.frostRisk === 'high' ? (isKz ? 'Жоғары' : 'Высокие') : isKz ? 'Орташа' : 'Умеренные'}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Wind className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isKz ? 'Шаң / жел' : 'Пыль и ветер'}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {city.dustRisk === 'high' ? (isKz ? 'Жоғары' : 'Высокие') : isKz ? 'Орташа' : 'Умеренные'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {isKz ? 'Өңірлік күтім бойынша ұсыныстар' : 'Персональные рекомендации по уходу'}
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {(isKz ? city.seasonalTipsKz : city.seasonalTipsRu).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const RedFlagsPage: React.FC = () => {
  const { lang } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [checkedRed, setCheckedRed] = useState<string[]>([]);
  const [checkedYellow, setCheckedYellow] = useState<string[]>([]);

  const redSymptoms = isKz
    ? [
        { id: 'r1', label: 'Беттің, еріннің немесе тамақтың кенет ісінуі' },
        { id: 'r2', label: 'Тыныс алудың қиындауы, ентігу' },
        { id: 'r3', label: 'Тез таралатын ауыр бөртпемен бірге жоғары температура (>38.5°C)' },
        { id: 'r4', label: 'Қатты қанайтын, тез өсетін немесе жараланған тері түзілісі' },
      ]
    : [
        { id: 'r1', label: 'Внезапный отёк лица, губ, век или языка' },
        { id: 'r2', label: 'Затруднение дыхания, свистящее дыхание, ощущение нехватки воздуха' },
        { id: 'r3', label: 'Высокая температура (>38.5°C) с тяжёлой быстро распространяющейся кожной реакцией' },
        { id: 'r4', label: 'Кровоточащее, изъязвлённое или стремительно меняющееся образование' },
      ];

  const yellowSymptoms = isKz
    ? [
        { id: 'y1', label: 'Пішіні, түсі немесе шекарасы өзгерген мең (ABCDE)' },
        { id: 'y2', label: '2 аптадан астам кетпейтін қабыну немесе бөртпе' },
        { id: 'y3', label: 'Ауырсынатын іріңді түйіндер немесе күшейетін қызару' },
      ]
    : [
        { id: 'y1', label: 'Быстро меняющаяся родинка (асимметрия, неровные края, несколько цветов)' },
        { id: 'y2', label: 'Сильное воспаление или сыпь, не проходящая дольше 10–14 дней' },
        { id: 'y3', label: 'Болезненные узлы или мокнущие участки раздражения' },
      ];

  const toggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes['red-flags']}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Үш деңгейлі қауіпсіздік бағдары: ақпараттық, жоспарлы дәрігер және шұғыл көмек.'
            : 'Система цветовой и текстовой маршрутизации опасных симптомов.'}
        </p>
      </div>

      {/* 3-tier legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/30 p-5 space-y-1.5">
          <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
            {isKz ? 'ЖАСЫЛ · Жалпы ақпарат' : 'ЗЕЛЁНЫЙ · Общая информация'}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {isKz
              ? 'Қауіп белгілері жоқ. Күнделікті күтім мен бақылау жеткілікті.'
              : 'Опасных симптомов нет. Поддерживайте базовый уход и плановую профилактику.'}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-5 space-y-1.5">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
            {isKz ? 'САРЫ · Маман кеңесі ұсынылады' : 'ЖЁЛТЫЙ · Консультация специалиста'}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {isKz
              ? 'Емханаға немесе дерматологқа жоспарлы түрде жазылыңыз.'
              : 'Запишитесь на очный приём к дерматологу или терапевту в поликлинику.'}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-5 space-y-1.5">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
            {isKz ? 'ҚЫЗЫЛ · Шұғыл медициналық көмек' : 'КРАСНЫЙ · Срочная медицинская помощь'}
          </p>
          <p className="text-xs text-rose-900 dark:text-rose-200">
            {isKz
              ? 'Жедел 103 немесе 112 нөміріне қоңырау шалыңыз.'
              : 'Немедленно обратитесь за неотложной помощью или звоните 103 / 112.'}
          </p>
        </div>
      </div>

      {/* Interactive Triage Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold">
              {isKz ? 'Шұғыл белгілер (Қызыл деңгей)' : 'Экстренные признаки (Красный уровень)'}
            </h2>
          </div>
          <div className="space-y-2.5">
            {redSymptoms.map((s) => (
              <label
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-rose-50/40 dark:hover:bg-rose-950/20"
              >
                <input
                  type="checkbox"
                  checked={checkedRed.includes(s.id)}
                  onChange={() => toggle(checkedRed, setCheckedRed, s.id)}
                  className="mt-0.5 rounded border-rose-400 text-rose-600"
                />
                <span className="text-sm text-slate-800 dark:text-slate-200">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold">
              {isKz ? 'Маманды талап ететін белгілер (Сары деңгей)' : 'Признаки для очного визита (Жёлтый уровень)'}
            </h2>
          </div>
          <div className="space-y-2.5">
            {yellowSymptoms.map((s) => (
              <label
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
              >
                <input
                  type="checkbox"
                  checked={checkedYellow.includes(s.id)}
                  onChange={() => toggle(checkedYellow, setCheckedYellow, s.id)}
                  className="mt-0.5 rounded border-amber-400 text-amber-600"
                />
                <span className="text-sm text-slate-800 dark:text-slate-200">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Action Banner */}
      {checkedRed.length > 0 ? (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-display text-lg font-bold text-rose-800 dark:text-rose-200">
              {isKz
                ? 'Қызыл деңгей белгілері таңдалды — дереу медициналық көмекке жүгініңіз!'
                : 'Отмечены экстренные симптомы — требуется срочная медицинская помощь!'}
            </p>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {isKz
                ? 'Жедел жәрдемді шақырыңыз немесе жақын маңдағы шұғыл қабылдау бөліміне барыңыз.'
                : 'Вызовите скорую помощь по номеру 103 или единой службы 112.'}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="tel:103"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span>103</span>
            </a>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span>112</span>
            </a>
          </div>
        </div>
      ) : checkedYellow.length > 0 ? (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-5 text-sm text-amber-900 dark:text-amber-200">
          {isKz
            ? 'Таңдалған белгілер бойынша дерматологқа немесе тіркелген емхана дәрігеріне жоспарлы қаралу ұсынылады.'
            : 'При отмеченных симптомах рекомендуется записаться на консультацию дерматолога или врача общей практики (в поликлинике прикрепления / Damumed).'}
        </div>
      ) : null}
    </div>
  );
};
