import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { BmiRecord, Language } from '../types/health';

type TimeRange = 'month' | 'quarter' | 'year';
type MetricType = 'weight' | 'bmi';

interface WeightDynamicsChartProps {
  records: BmiRecord[];
  lang: Language;
}

export const WeightDynamicsChart: React.FC<WeightDynamicsChartProps> = ({
  records,
  lang,
}) => {
  const isKz = lang === 'kz';
  const [range, setRange] = useState<TimeRange>('quarter');
  const [metric, setMetric] = useState<MetricType>('weight');

  const filteredData = useMemo(() => {
    const now = Date.now();
    const days = range === 'month' ? 30 : range === 'quarter' ? 90 : 365;
    const cutoff = now - days * 86400000;

    return [...records]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .filter((r) => new Date(r.createdAt).getTime() >= cutoff)
      .map((item) => ({
        date: new Date(item.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU', {
          day: '2-digit',
          month: range === 'year' ? 'short' : '2-digit',
        }),
        fullDate: new Date(item.createdAt).toLocaleDateString(isKz ? 'kk-KZ' : 'ru-RU'),
        weight: item.weightKg,
        bmi: item.bmi,
      }));
  }, [records, range, isKz]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const values = filteredData.map((d) => (metric === 'weight' ? d.weight : d.bmi));
    const first = values[0];
    const last = values[values.length - 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = Number((last - first).toFixed(1));
    return { first, last, min, max, delta };
  }, [filteredData, metric]);

  const rangeLabels: Record<TimeRange, string> = isKz
    ? { month: 'Ай (1А)', quarter: 'Тоқсан (3А)', year: 'Жыл (1Ж)' }
    : { month: 'Месяц', quarter: 'Квартал', year: 'Год' };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Салмақ пен ДСИ тарихи динамикасы' : 'Историческая динамика веса и ИМТ'}
          </h2>
          {stats && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
              <span>
                {isKz ? 'Мин' : 'Мин'}: {stats.min.toFixed(1)} {metric === 'weight' ? 'кг' : ''}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {isKz ? 'Макс' : 'Макс'}: {stats.max.toFixed(1)} {metric === 'weight' ? 'кг' : ''}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  stats.delta < 0
                    ? 'text-teal-700 dark:text-teal-400'
                    : stats.delta > 0
                      ? 'text-sky-700 dark:text-sky-400'
                      : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {stats.delta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : stats.delta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : null}
                <span>
                  {stats.delta > 0 ? `+${stats.delta}` : stats.delta}{' '}
                  {metric === 'weight' ? 'кг' : 'BMI'}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric switch */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMetric('weight')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                metric === 'weight'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isKz ? 'Салмақ (кг)' : 'Вес (кг)'}
            </button>
            <button
              type="button"
              onClick={() => setMetric('bmi')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                metric === 'bmi'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isKz ? 'ДСИ' : 'ИМТ'}
            </button>
          </div>

          {/* Timeframe switch: Month / Quarter / Year */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(['month', 'quarter', 'year'] as TimeRange[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setRange(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  range === tf
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {rangeLabels[tf]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="bmiWeightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={metric === 'weight' ? '#0284C7' : '#0D9488'}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor={metric === 'weight' ? '#0284C7' : '#0D9488'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                contentStyle={{
                  borderRadius: '12px',
                  borderColor: '#cbd5e1',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                name={
                  metric === 'weight'
                    ? isKz
                      ? 'Салмақ (кг)'
                      : 'Вес (кг)'
                    : isKz
                      ? 'ДСИ'
                      : 'ИМТ'
                }
                stroke={metric === 'weight' ? '#0284C7' : '#0D9488'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#bmiWeightGradient)"
                dot={{ r: 3.5 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-12 text-center">
          {isKz
            ? 'Таңдалған кезеңде өлшемдер жоқ'
            : 'За выбранный период измерений пока нет'}
        </p>
      )}
    </div>
  );
};
