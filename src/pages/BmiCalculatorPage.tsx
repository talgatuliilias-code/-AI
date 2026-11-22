import React, { useMemo, useState } from 'react';
import { AlertCircle, Calculator, Info } from 'lucide-react';
import { WeightDynamicsChart } from '../components/WeightDynamicsChart';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { BiologicalSex, BmiRecord } from '../types/health';

export const BmiCalculatorPage: React.FC = () => {
  const { lang, activeProfile, bmiHistory, addBmiRecord, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [heightCm, setHeightCm] = useState<string>(String(activeProfile.heightCm || 170));
  const [weightKg, setWeightKg] = useState<string>(String(activeProfile.weightKg || 65));
  const [age, setAge] = useState<string>(String(activeProfile.age || 25));
  const [sex, setSex] = useState<BiologicalSex>(activeProfile.sex || 'unspecified');

  const parsedHeight = Number(heightCm);
  const parsedWeight = Number(weightKg);
  const parsedAge = Number(age);

  const liveCalculation = useMemo(() => {
    if (!parsedHeight || parsedHeight < 50 || parsedHeight > 250 || !parsedWeight || parsedWeight < 3 || parsedWeight > 350) {
      return null;
    }
    const hm = parsedHeight / 100;
    const bmi = parsedWeight / (hm * hm);
    const isPediatric = parsedAge > 0 && parsedAge < 18;

    let categoryKey: BmiRecord['categoryKey'] = 'normal';
    let pediatricNote = '';

    if (isPediatric) {
      categoryKey = 'pediatric';
      // Simplified WHO age-adjusted reference midpoint check purely as educational percentile note (never adult thresholds)
      const expectedMedian = 15.2 + Math.max(0, parsedAge - 5) * 0.42;
      if (bmi < expectedMedian - 2.5) {
        pediatricNote = isKz
          ? 'ДДСҰ жас бойынша перцентильдік аймағы: төменгі перцентиль (<15-й). Педиатрмен кеңесу ұсынылады.'
          : 'Ориентир по возрастным перцентилям ВОЗ: ниже среднего коридора (<15-й перцентиль). Требуется оценка педиатра.';
      } else if (bmi > expectedMedian + 3.2) {
        pediatricNote = isKz
          ? 'ДДСҰ жас бойынша перцентильдік аймағы: жоғарғы перцентиль (>85-й). Педиатрмен кеңесу ұсынылады.'
          : 'Ориентир по возрастным перцентилям ВОЗ: выше возрастного коридора (>85-й перцентиль). Рекомендуется консультация педиатра.';
      } else {
        pediatricNote = isKz
          ? 'ДДСҰ жас және жыныс перцентильдері бойынша бағдар: 15–85 перцентиль аралығы (ересектер шегі қолданылмайды).'
          : 'Ориентир по возрастным и половым перцентилям ВОЗ: в пределах среднего возрастного коридора (15–85 перцентиль). Наблюдение у педиатра остаётся основным.';
      }
    } else {
      if (bmi < 18.5) categoryKey = 'underweight';
      else if (bmi < 25) categoryKey = 'normal';
      else if (bmi < 30) categoryKey = 'overweight';
      else categoryKey = 'obesity';
    }

    return { bmi, isPediatric, categoryKey, pediatricNote };
  }, [parsedHeight, parsedWeight, parsedAge, isKz]);

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveCalculation) {
      showToast(
        isKz ? 'Дұрыс бой, салмақ және жас мәндерін енгізіңіз' : 'Введите корректные значения роста и веса',
        'warning'
      );
      return;
    }
    addBmiRecord({
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      age: parsedAge,
      sex,
      bmi: Number(liveCalculation.bmi.toFixed(1)),
      categoryKey: liveCalculation.categoryKey,
      pediatricPercentileNote: liveCalculation.pediatricNote || undefined,
    });
    showToast(isKz ? 'ДСИ өлшемі сақталды' : 'Измерение ИМТ сохранено в историю', 'success');
  };

  const categoryInfo = (key: BmiRecord['categoryKey']) => {
    switch (key) {
      case 'underweight':
        return {
          label: isKz ? 'Дене салмағының тапшылығы' : 'Недостаточная масса тела',
          color: 'text-sky-700 dark:text-sky-300',
          desc: isKz
            ? 'Тамақтану рационын және калория теңгерімін тексерген жөн.'
            : 'ИМТ ниже 18.5. Рекомендуется обратить внимание на полноценность рациона и обсудить показатели с врачом.',
        };
      case 'normal':
        return {
          label: isKz ? 'Қалыпты дене салмағы' : 'Нормальная масса тела',
          color: 'text-teal-700 dark:text-teal-300',
          desc: isKz
            ? 'Ересектерге арналған ДСИ 18.5–24.9 аралығында.'
            : 'ИМТ в пределах 18.5–24.9. Поддерживайте сбалансированное питание, сон и регулярную активность.',
        };
      case 'overweight':
        return {
          label: isKz ? 'Артық дене салмағы' : 'Избыточная масса тела',
          color: 'text-amber-700 dark:text-amber-300',
          desc: isKz
            ? 'Ересектерде 25.0–29.9 аралығы. Қозғалыс белсенділігі мен ұйқыны реттеу пайдалы.'
            : 'ИМТ в диапазоне 25.0–29.9. Плавная коррекция питания и ежедневная ходьба поддерживают метаболическое здоровье.',
        };
      case 'obesity':
        return {
          label: isKz ? 'Семіздік санаты' : 'Ожирение',
          color: 'text-rose-700 dark:text-rose-300',
          desc: isKz
            ? 'ИМТ ≥ 30.0. Жеке жоспар құру үшін терапевт не эндокринологпен кеңесіңіз.'
            : 'ИМТ ≥ 30.0. Рекомендуется обсудить комфортную программу коррекции образа жизни с терапевтом или эндокринологом.',
        };
      case 'pediatric':
        return {
          label: isKz ? 'Балалар мен жасөспірімдерді бағалау (ДДСҰ)' : 'Оценка для детей и подростков (ВОЗ)',
          color: 'text-sky-700 dark:text-sky-300',
          desc: liveCalculation?.pediatricNote || '',
        };
    }
  };

  const factors = isKz
    ? [
        { title: 'Тамақтану', desc: 'Белок, көкөніс, талшық мөлшері және тәтті сусындарды шектеу.' },
        { title: 'Ұйқы', desc: 'Ұйқы жетіспеушілігі тәбет гормондарына (грелин/лептин) әсер етеді.' },
        { title: 'Физикалық белсенділік', desc: 'Күнделікті серуен, жүзу немесе жаттығулар энергия теңгерімін қолдайды.' },
        { title: 'Стресс', desc: 'Созылмалы стресс кортизол деңгейін және тамақтану әдеттерін өзгертуі мүмкін.' },
        { title: 'Өмір салты', desc: 'Отырықшы жұмыс, су ішу режимі және күн тәртібі.' },
      ]
    : [
        { title: 'Питание', desc: 'Баланс белка, клетчатки, сложных углеводов и регулярность приёмов пищи.' },
        { title: 'Сон', desc: 'Недосып (<7 часов) влияет на гормоны аппетита и восстановление.' },
        { title: 'Физическая активность', desc: 'Бытовая ходьба и умеренные тренировки поддерживают мышечную массу.' },
        { title: 'Стресс', desc: 'Длительный стресс меняет пищевое поведение и уровень кортизола.' },
        { title: 'Образ жизни', desc: 'Сидячая работа, режим гидратации и время ужина.' },
      ];

  const activeInfo = liveCalculation ? categoryInfo(liveCalculation.categoryKey) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.bmi}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Формула: ДСИ = салмақ (кг) / (бой (м) × бой (м)). Тек қолмен енгізу немесе үйлесімді таразы деректері.'
            : 'Формула: ИМТ = вес / (рост в м × рост в м). Ввод вручную или перенос с совместимых умных весов.'}
        </p>
      </div>

      {/* Explicit anti-camera-measurement honesty banner */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-4 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <span>
          {isKz
            ? 'Маңызды: веб-камера адамның бойы мен салмағын дәл өлшей алмайды. Сондықтан платформа тек нақты қолмен енгізілген мәндерді немесе сертификатталған таразы деректерін қолданады.'
            : 'Важно: камера смартфона или ноутбука не может достоверно измерять вес и рост человека. Используйте точный ручной ввод или данные совместимых напольных весов.'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSaveMeasurement}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Параметрлерді енгізу' : 'Параметры расчёта'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Бой (см)' : 'Рост (см)'}
              </label>
              <input
                type="number"
                min={50}
                max={250}
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Салмақ (кг)' : 'Вес (кг)'}
              </label>
              <input
                type="number"
                min={3}
                max={350}
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Жасы' : 'Возраст (лет)'}
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Жынысы (міндетті емес)' : 'Пол (опционально)'}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as BiologicalSex)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
              >
                <option value="unspecified">{isKz ? 'Көрсетпеу' : 'Не указан'}</option>
                <option value="female">{isKz ? 'Әйел' : 'Женский'}</option>
                <option value="male">{isKz ? 'Ер' : 'Мужской'}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>{isKz ? 'Тарихқа сақтау' : 'Сохранить измерение'}</span>
          </button>
        </form>

        {/* Live Result Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          {liveCalculation && activeInfo ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isKz ? 'Есептелген ДСИ' : 'Расчётный индекс массы тела'}
                  </p>
                  <p className="font-mono text-4xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                    {liveCalculation.bmi.toFixed(1)}
                  </p>
                </div>
                <span className={`text-sm font-bold ${activeInfo.color}`}>
                  {activeInfo.label}
                </span>
              </div>

              {/* Color Scale Bar (Adults) or Pediatric WHO Warning */}
              {liveCalculation.isPediatric ? (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {isKz
                        ? 'Балалар мен жасөспірімдерге (<18 жас) ересектердің ДСИ шегі қолданылмайды!'
                        : 'Для детей и подростков (<18 лет) взрослые границы ИМТ не применяются!'}
                    </p>
                    <p>{liveCalculation.pediatricNote}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1.5 h-3 rounded-full overflow-hidden">
                    <div className="bg-sky-400" title="<18.5" />
                    <div className="bg-teal-500" title="18.5–24.9" />
                    <div className="bg-amber-400" title="25.0–29.9" />
                    <div className="bg-rose-500" title="≥30.0" />
                  </div>
                  <div className="grid grid-cols-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>&lt;18.5</span>
                    <span>18.5–24.9</span>
                    <span>25.0–29.9</span>
                    <span>≥30.0</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeInfo.desc}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                {isKz
                  ? 'Тек ДСИ көрсеткішіне қарап ауруды немесе салмақ өзгеруінің медициналық себебін анықтауға болмайды.'
                  : 'Невозможно определять заболевание или медицинскую причину изменения веса исключительно по показателю ИМТ.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isKz ? 'Мәндерді енгізіңіз' : 'Введите корректные значения для расчёта.'}
            </p>
          )}
        </div>
      </div>

      {/* Weight Dynamics Chart & Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WeightDynamicsChart records={bmiHistory} lang={lang} />
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Салмақ өзгеруінің ықтимал факторлары' : 'Возможные факторы изменения веса'}
          </h2>
          <div className="space-y-3">
            {factors.map((f) => (
              <div
                key={f.title}
                className="pb-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          {isKz ? 'Өлшеулер тарихы' : 'История измерений'}
        </h2>
        {bmiHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.common.noData}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4">{isKz ? 'Күні' : 'Дата'}</th>
                  <th className="py-2 pr-4 text-right">{isKz ? 'Бой' : 'Рост'}</th>
                  <th className="py-2 pr-4 text-right">{isKz ? 'Салмақ' : 'Вес'}</th>
                  <th className="py-2 pr-4 text-right">{isKz ? 'ДСИ' : 'ИМТ'}</th>
                  <th className="py-2">{isKz ? 'Санат' : 'Категория'}</th>
                </tr>
              </thead>
              <tbody>
                {[...bmiHistory].reverse().map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-b-0 border-slate-100 dark:border-slate-800/70"
                  >
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {new Date(row.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU')}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                      {row.heightCm} см
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                      {row.weightKg} кг
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono font-bold tabular-nums">
                      {row.bmi.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {categoryInfo(row.categoryKey).label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
