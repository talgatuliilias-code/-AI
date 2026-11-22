import { Language, RouteId } from '../types/health';

export const UI_TEXT: Record<Language, {
  brandName: string;
  slogan: string;
  nav: {
    home: string;
    skinAnalyzer: string;
    cabinet: string;
    assistant: string;
    egov: string;
    signIn: string;
    account: string;
  };
  sidebarGroups: {
    ai: string;
    health: string;
    kazakhstan: string;
    safety: string;
    system: string;
  };
  routes: Record<RouteId, string>;
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    startAnalysis: string;
    openCabinet: string;
    trustMetrics: Array<{ value: string; label: string }>;
    capabilitiesTitle: string;
    capabilitiesSubtitle: string;
    advantagesTitle: string;
    techTitle: string;
    egovSectionTitle: string;
    egovSectionText: string;
    egovBtn: string;
    aboutSectionTitle: string;
    aboutSectionText: string;
    aboutBtn: string;
    disclaimer: string;
  };
  common: {
    demoMode: string;
    aiMode: string;
    disclaimerBanner: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    downloadPdf: string;
    askAiAboutThis: string;
    loading: string;
    back: string;
    close: string;
    emergency103: string;
    emergency112: string;
    activeProfile: string;
    consentRequired: string;
    consentText: string;
    acceptConsent: string;
    noData: string;
  };
}> = {
  ru: {
    brandName: 'DermaSense AI',
    slogan: 'Технологии искусственного интеллекта для заботы о здоровье каждого человека',
    nav: {
      home: 'Главная',
      skinAnalyzer: 'Анализ кожи',
      cabinet: 'Мед. кабинет',
      assistant: 'ИИ-ассистент',
      egov: 'eGov и сервисы',
      signIn: 'Войти',
      account: 'Кабинет',
    },
    sidebarGroups: {
      ai: 'AI-инструменты',
      health: 'Здоровье и семья',
      kazakhstan: 'Казахстан и сервисы',
      safety: 'Безопасность и знания',
      system: 'Профиль и система',
    },
    routes: {
      home: 'Главная',
      cabinet: 'Мой медицинский кабинет',
      'skin-analyzer': 'AI-анализ кожи',
      bmi: 'Калькулятор ИМТ',
      assistant: 'Медицинский ИИ-чат',
      profile: 'Личный профиль',
      family: 'Семейный режим',
      climate: 'Климат Казахстана AI',
      'red-flags': 'Красные флаги',
      'lab-analyzer': 'Анализ лаборатории',
      medications: 'Напоминания о лекарствах',
      vitals: 'Монитор показателей',
      'mental-health': 'Психологическое здоровье',
      'child-health': 'Здоровье детей',
      doctors: 'Поиск врачей',
      egov: 'eGov Kazakhstan (Демо)',
      damumed: 'Damumed и медицина РК',
      pharmacies: 'Поиск аптек',
      emergency: 'Экстренная помощь 103/112',
      translator: 'Мед-переводчик',
      library: 'Полезная информация',
      preventive: 'Профилактика',
      history: 'История здоровья',
      about: 'О проекте',
      settings: 'Настройки',
    },
    home: {
      heroEyebrow: 'DermaSense AI · Интеллектуальная медицинская платформа Казахстана',
      heroTitle: 'Твоё здоровье под контролем искусственного интеллекта',
      heroSubtitle: 'Технологии искусственного интеллекта для заботы о здоровье каждого человека: AI-наблюдение кожи, расчёт ИМТ с учётом возраста, голосовой ИИ-помощник на русском и казахском языках, семейный контроль и навигация по медицинским сервисам Казахстана.',
      startAnalysis: 'Начать анализ',
      openCabinet: 'Мой медицинский кабинет',
      trustMetrics: [
        { value: '2 языка', label: 'Полный интерфейс и чат на русском и казахском (RU / KZ)' },
        { value: '8 признаков', label: 'Структурированная визуальная оценка кожи и красных флагов' },
        { value: '14 городов', label: 'Персональные рекомендации с учётом климата регионов РК' },
        { value: 'PDF-отчёт', label: 'Готовый документ с историей и дисклеймером для визита к врачу' },
      ],
      capabilitiesTitle: 'Ключевые возможности платформы',
      capabilitiesSubtitle: 'Единое пространство заботы о здоровье: от компьютерного зрения для оценки кожи до семейной карты профилактики.',
      advantagesTitle: 'Почему DermaSense AI создан для Казахстана',
      techTitle: 'Архитектура и технологии искусственного интеллекта',
      egovSectionTitle: 'Готовность к интеграции с eGov Kazakhstan и Damumed',
      egovSectionText: 'Платформа проектируется с архитектурой безопасного согласия пациента (OAuth2 / Consent Flow). В демонстрационном режиме вы можете изучить экран согласия, электронный паспорт здоровья и журнал разрешений без передачи ИИН или ЭЦП.',
      egovBtn: 'Открыть eGov Демо',
      aboutSectionTitle: 'Социальная миссия проекта',
      aboutSectionText: 'DermaSense AI помогает жителям городов и отдалённых районов Казахстана вовремя заметить тревожные признаки, подготовиться к приёму в поликлинике и вести системный контроль здоровья семьи на родном языке.',
      aboutBtn: 'Подробнее о проекте',
      disclaimer: 'Важно: DermaSense AI является информационно-аналитической платформой поддержки заботы о здоровье и не заменяет очную консультацию врача. Демонстрационные результаты не являются медицинским диагнозом.',
    },
    common: {
      demoMode: 'Демо-режим (симуляция)',
      aiMode: 'AI-анализ активен',
      disclaimerBanner: 'Информационный инструмент: не ставит диагноз и не заменяет консультацию врача. При экстренных симптомах звоните 103 или 112.',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      downloadPdf: 'Скачать PDF-отчёт',
      askAiAboutThis: 'Обсудить с ИИ-ассистентом',
      loading: 'Выполняется обработка...',
      back: 'Назад',
      close: 'Закрыть',
      emergency103: 'Скорая 103',
      emergency112: 'Служба 112',
      activeProfile: 'Активный профиль',
      consentRequired: 'Согласие на обработку изображений и данных',
      consentText: 'Для проведения анализа подтвердите согласие на временную обработку выбранных данных. Все сохранённые записи хранятся локально в вашем браузере и могут быть удалены в любой момент.',
      acceptConsent: 'Подтвердить согласие',
      noData: 'Записи пока отсутствуют',
    },
  },
  kz: {
    brandName: 'DermaSense AI',
    slogan: 'Әр адамның денсаулығына қамқорлық жасауға арналған жасанды интеллект технологиялары',
    nav: {
      home: 'Басты бет',
      skinAnalyzer: 'Тері талдауы',
      cabinet: 'Мед. кабинет',
      assistant: 'AI-көмекші',
      egov: 'eGov және қызметтер',
      signIn: 'Кіру',
      account: 'Кабинет',
    },
    sidebarGroups: {
      ai: 'AI-құралдар',
      health: 'Денсаулық және отбасы',
      kazakhstan: 'Қазақстан және қызметтер',
      safety: 'Қауіпсіздік және білім',
      system: 'Профиль және жүйе',
    },
    routes: {
      home: 'Басты бет',
      cabinet: 'Менің медициналық кабинетім',
      'skin-analyzer': 'Теріні AI-талдау',
      bmi: 'ДСИ калькуляторы',
      assistant: 'Медициналық AI-чат',
      profile: 'Жеке профиль',
      family: 'Отбасылық режим',
      climate: 'Қазақстан климаты AI',
      'red-flags': 'Қауіп белгілері',
      'lab-analyzer': 'Зертханалық талдау',
      medications: 'Дәрі еске салғыштары',
      vitals: 'Көрсеткіштер мониторы',
      'mental-health': 'Психологиялық саулық',
      'child-health': 'Балалар денсаулығы',
      doctors: 'Дәрігер іздеу',
      egov: 'eGov Kazakhstan (Демо)',
      damumed: 'Damumed және ҚР жүйесі',
      pharmacies: 'Дәріхана іздеу',
      emergency: 'Шұғыл көмек 103/112',
      translator: 'Мед-аудармашы',
      library: 'Пайдалы ақпарат',
      preventive: 'Алдын алу',
      history: 'Денсаулық тарихы',
      about: 'Жоба туралы',
      settings: 'Баптаулар',
    },
    home: {
      heroEyebrow: 'DermaSense AI · Қазақстанның зияткерлік медициналық платформасы',
      heroTitle: 'Денсаулығың жасанды интеллект бақылауында',
      heroSubtitle: 'Әр адамның денсаулығына қамқорлық жасауға арналған жасанды интеллект технологиялары: теріні AI-бақылау, жасқа сай ДСИ есептеу, қазақ және орыс тілдеріндегі дауыстық AI-көмекші, отбасылық бақылау және Қазақстан медициналық қызметтері.',
      startAnalysis: 'Талдауды бастау',
      openCabinet: 'Менің медициналық кабинетім',
      trustMetrics: [
        { value: '2 тіл', label: 'Қазақ және орыс тілдеріндегі толық интерфейс пен чат (KZ / RU)' },
        { value: '8 белгі', label: 'Тері күйін және қауіп белгілерін құрылымдалған бағалау' },
        { value: '14 қала', label: 'ҚР өңірлерінің климатын ескеретін дербес ұсыныстар' },
        { value: 'PDF-есеп', label: 'Дәрігер қабылдауына дайын тарих пен ескерту құжаты' },
      ],
      capabilitiesTitle: 'Платформаның негізгі мүмкіндіктері',
      capabilitiesSubtitle: 'Денсаулыққа қамқорлық жасаудың бірыңғай кеңістігі: теріні компьютерлік көруден бастап отбасылық алдын алу картасына дейін.',
      advantagesTitle: 'DermaSense AI неліктен Қазақстан үшін жасалған',
      techTitle: 'Жасанды интеллект сәулеті және технологиялары',
      egovSectionTitle: 'eGov Kazakhstan және Damumed жүйелерімен интеграцияға дайындық',
      egovSectionText: 'Платформа пациенттің қауіпсіз келісім сәулетімен (OAuth2 / Consent Flow) жобаланған. Демонстрациялық режимде ЖСН немесе ЭЦҚ бермей-ақ келісім экраны мен электрондық денсаулық паспортын көре аласыз.',
      egovBtn: 'eGov Демо ашу',
      aboutSectionTitle: 'Жобаның әлеуметтік миссиясы',
      aboutSectionText: 'DermaSense AI Қазақстанның қалалары мен шалғай ауылдарының тұрғындарына қауіп белгілерін уақытылы байқауға, емханаға баруға дайындалуға және отбасы денсаулығын ана тілінде бақылауға көмектеседі.',
      aboutBtn: 'Жоба туралы толығырақ',
      disclaimer: 'Маңызды: DermaSense AI дәрігердің бетпе-бет кеңесін алмастырмайтын ақпараттық-талдау платформасы болып табылады. Демонстрациялық нәтижелер медициналық диагноз болып табылмайды.',
    },
    common: {
      demoMode: 'Демо-режим (симуляция)',
      aiMode: 'AI-талдау белсенді',
      disclaimerBanner: 'Ақпараттық құрал: диагноз қоймайды және дәрігер кеңесін алмастырмайды. Шұғыл белгілер кезінде 103 немесе 112 нөміріне қоңырау шалыңыз.',
      save: 'Сақтау',
      cancel: 'Бас тарту',
      delete: 'Жою',
      edit: 'Өңдеу',
      downloadPdf: 'PDF-есепті жүктеу',
      askAiAboutThis: 'AI-көмекшімен талқылау',
      loading: 'Өңделуде...',
      back: 'Артқа',
      close: 'Жабу',
      emergency103: 'Жедел жәрдем 103',
      emergency112: '112 қызметі',
      activeProfile: 'Белсенді профиль',
      consentRequired: 'Суреттер мен деректерді өңдеуге келісім',
      consentText: 'Талдау жүргізу үшін таңдалған деректерді уақытша өңдеуге келісіміңізді растаңыз. Барлық сақталған жазбалар браузеріңізде жергілікті сақталады және кез келген уақытта жойылуы мүмкін.',
      acceptConsent: 'Келісімді растау',
      noData: 'Әзірге жазбалар жоқ',
    },
  },
};
