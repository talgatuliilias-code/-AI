import React from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  Calculator,
  Camera,
  CloudSun,
  FileText,
  Mic,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { UI_TEXT } from '../i18n/translations';
import { AppFooter, TopHeader } from '../components/LayoutChrome';
import { ShareQrSectionCard } from '../components/ShareQrModal';

export const HomePage: React.FC = () => {
  const { lang, navigate } = useHealth();
  const t = UI_TEXT[lang];
  const isKz = lang === 'kz';

  const capabilities = [
    {
      id: 'skin-analyzer' as const,
      span: 'lg:col-span-2',
      icon: Camera,
      title: isKz ? '01. Теріні AI-талдау және PDF-есеп' : '01. AI-анализ кожи и PDF-отчёт',
      desc: isKz
        ? 'Веб-камера немесе фото арқылы 8 негізгі тері белгісін (бездеу, қызару, құрғақтық, пигментация, мең өзгерістері) құрылымды бағалау және дәрігерге дайын PDF.'
        : 'Снимок с камеры или загрузка нескольких фото для структурированной оценки 8 видимых признаков кожи (акне, покраснение, сухость, пигментация, изменения родинок) и выгрузка PDF-отчёта.',
    },
    {
      id: 'assistant' as const,
      span: 'lg:col-span-1',
      icon: Mic,
      title: isKz ? '02. Дауыстық AI-көмекші' : '02. Голосовой ИИ-ассистент',
      desc: isKz
        ? 'Қазақ және орыс тілдерінде дауыспен сұрақ қойып, жауапты тыңдаңыз. Профиль мен талдау нәтижесін ескереді.'
        : 'Задавайте вопросы голосом на русском или казахском и прослушивайте ответы с учётом вашего профиля и анализов.',
    },
    {
      id: 'bmi' as const,
      span: 'lg:col-span-1',
      icon: Calculator,
      title: isKz ? '03. ДСИ және көрсеткіштер' : '03. ИМТ, пульс и давление',
      desc: isKz
        ? 'Ересектерге арналған дәл ДСИ формуласы, балаларға ДДСҰ перцентильдік ескертуі және салмақ динамикасы.'
        : 'Расчёт ИМТ с отдельными возрастными ориентирами ВОЗ для детей, графиками веса, пульса и давления.',
    },
    {
      id: 'family' as const,
      span: 'lg:col-span-1',
      icon: Users,
      title: isKz ? '04. Отбасылық режим' : '04. Семейный режим с PIN-защитой',
      desc: isKz
        ? 'Өзіңіз, балаңыз, анаңыз және әкеңіз үшін деректері араласпайтын бөлек медициналық профильдер.'
        : 'Раздельные карты для вас, детей и родителей без смешивания данных и с родительским PIN-контролем.',
    },
    {
      id: 'climate' as const,
      span: 'lg:col-span-1',
      icon: CloudSun,
      title: isKz ? '05. Қазақстан климаты AI' : '05. Климат Казахстана AI',
      desc: isKz
        ? 'Алматы, Астана, Шымкент, Ақтау және басқа қалалардың аязы, шаңы мен UV-индексіне бейімделген күтім.'
        : 'Персональные рекомендации по защите кожи от мороза, сухого степного ветра, пыли и высокого UV по городам РК.',
    },
  ];

  const advantages = [
    {
      num: '01',
      title: isKz ? 'Толық екітілділік (KZ / RU)' : 'Полная двуязычность (RU / KZ)',
      text: isKz
        ? 'Барлық беттер, медициналық аудармашы, дауыстық енгізу және PDF-есептер қазақ және орыс тілдерінде.'
        : 'Все страницы, калькуляторы, голосовой чат, медицинский переводчик и PDF-отчёты работают на русском и казахском.',
    },
    {
      num: '02',
      title: isKz ? 'Қауіпсіздік және адалдық' : 'Медицинская честность и Red Flags',
      text: isKz
        ? 'Демо-режим нақты белгіленген, қауіпті белгілер кезінде 103 және 112 нөмірлеріне жедел сілтеме беріледі.'
        : 'Чёткое разделение ИИ и Демо-режима, отказ от ложных диагнозов и заметный триаж красных флагов с вызовом 103 / 112.',
    },
    {
      num: '03',
      title: isKz ? 'Қазақстан экожүйесіне бағытталған' : 'Фокус на здравоохранение РК',
      text: isKz
        ? 'Тіркелген емхана, Damumed бағыты, дәрігерлер мен дәріханалар каталогы және eGov Демо сәулеті.'
        : 'Навигация по поликлиникам прикрепления, Damumed, регионам Казахстана и архитектура согласия eGov.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <TopHeader />

      {/* Hero Section */}
      <section className="border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-sky-50/70 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                {t.home.heroEyebrow}
              </p>
              <h1
                className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                {t.home.heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('skin-analyzer')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  <span>{t.home.startAnalysis}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('cabinet')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors"
                >
                  <span>{t.home.openCabinet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('doctors')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-teal-300 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-sm font-semibold transition-colors"
                >
                  <span>{isKz ? 'Клиникалар картасы' : 'Карта клиник и аптек РК'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[240px] sm:min-h-[300px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img
                  src="/src/assets/images/hero_dermasense_assistant_1795355230330.jpg"
                  alt={isKz ? 'DermaSense AI медициналық көмекшісі' : 'Иллюстрация AI-медицинского помощника DermaSense AI'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Proof Strip below Hero */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.home.trustMetrics.map((m) => (
              <div
                key={m.value}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1.5"
              >
                <p className="font-display text-2xl font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                  {m.value}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Asymmetric Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.home.capabilitiesTitle}
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            {t.home.capabilitiesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => navigate(cap.id)}
                className={`${cap.span} group text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex flex-col justify-between gap-5`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <span>{isKz ? 'Бөлімді ашу' : 'Открыть модуль'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick access strip to remaining major tools */}
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'lab-analyzer' as const, icon: FileText, label: t.routes['lab-analyzer'] },
            { id: 'red-flags' as const, icon: ShieldAlert, label: t.routes['red-flags'] },
            { id: 'doctors' as const, icon: Activity, label: t.routes.doctors },
            { id: 'library' as const, icon: Bot, label: t.routes.library },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700 text-left text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <ShareQrSectionCard />
      </section>

      {/* Advantages + Technology Split */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          <div className="space-y-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.home.advantagesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {advantages.map((adv) => (
                <div
                  key={adv.num}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3"
                >
                  <p className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">
                    {adv.num}
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {adv.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[260px]">
              <img
                src="/src/assets/images/feature_skin_optics_1795355230317.jpg"
                alt={isKz ? 'Оптикалық тері сканері технологиясы' : 'Технология визуального анализа кожи'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.home.techTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isKz
                  ? 'DermaSense AI серверлік мультимодальды AI-талдауды (Gemini Vision), браузерлік Web Speech API дауыстық технологиясын, Unicode PDF-құжат генерациясын және локальды профиль оқшаулауын біріктіреді.'
                  : 'DermaSense AI объединяет серверный мультимодальный анализ изображений и лабораторных бланков, голосовой ввод и синтез речи Web Speech API, интерактивные графики показателей и локальную изоляцию семейных профилей.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {isKz ? 'Серверлік AI прокси' : 'Серверный AI-прокси'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isKz
                      ? 'API кілттері тек серверде сақталады, браузерге берілмейді.'
                      : 'Все ключи остаются на сервере. При отсутствии API доступна честная Демо-симуляция.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {isKz ? 'Қауіпсіз PDF-есеп' : 'PDF-отчёт с кириллицей и KZ'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isKz
                      ? 'Қазақ және орыс әріптерін мінсіз басып шығару.'
                      : 'Полноценная поддержка русских и казахских символов для печати и показа врачу.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* eGov Kazakhstan & Damumed + About Project */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
              <Building2 className="w-4 h-4" />
              <span>eGov Kazakhstan · Damumed · {isKz ? '35 клиника пилоты' : 'Пилот в 35 клиниках РК'}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.home.egovSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.home.egovSectionText}
            </p>
            <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-400 font-medium">
              {isKz
                ? 'Мемлекеттік пилоттық жоба: 35 медициналық клиникада клиникалық AI-терапевті енгізу — белгілерді талдау және Қазақстанның үздік ауруханаларына бағыттау.'
                : 'Государственный пилотный проект по внедрению клинического ИИ-терапевта в 35 медицинских клиниках: разбор симптомов, напоминания о лекарствах и маршрутизация в ведущие больницы РК.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('assistant')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
              >
                {isKz ? 'ИИ-терапевт' : 'ИИ-терапевт'}
              </button>
              <button
                type="button"
                onClick={() => navigate('doctors')}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                {isKz ? '35 клиника және ауруханалар' : '35 клиник и больницы РК'}
              </button>
              <button
                type="button"
                onClick={() => navigate('egov')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                {t.home.egovBtn}
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 min-h-[260px]">
            <img
              src="/src/assets/images/feature_kazakhstan_health_1795355229560.jpg"
              alt={isKz ? 'Қазақстандағы заманауи медицина орталығы' : 'Современный медицинский центр в Казахстане'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* About block */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-900/60 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.home.aboutSectionTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.home.aboutSectionText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('about')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            {t.home.aboutBtn}
          </button>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};
