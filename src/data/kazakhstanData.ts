export interface FacilityReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  textRu: string;
  textKz: string;
  isUserCreated?: boolean;
}

export interface KzCity {
  id: string;
  nameRu: string;
  nameKz: string;
  regionRu: string;
  regionKz: string;
  climateTypeRu: string;
  climateTypeKz: string;
  drynessRisk: 'high' | 'moderate';
  uvRisk: 'high' | 'moderate';
  frostRisk: 'high' | 'moderate';
  dustRisk: 'high' | 'moderate';
  seasonalTipsRu: string[];
  seasonalTipsKz: string[];
  mapX: number; // Relative % for legacy layout
  mapY: number;
  lat: number;
  lng: number;
}

export const KZ_CITIES: KzCity[] = [
  {
    id: 'almaty',
    nameRu: 'Алматы',
    nameKz: 'Алматы',
    regionRu: 'г. Алматы (Предгорья Заилийского Алатау)',
    regionKz: 'Алматы қ. (Іле Алатауы бөктері)',
    climateTypeRu: 'Предгорный континентальный, высокий UV летом, смог/сухой воздух зимой',
    climateTypeKz: 'Тау бөктерлік континенттік, жазда жоғары UV, қыста құрғақ ауа',
    drynessRisk: 'moderate',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'Используйте SPF 50+ круглый год в предгорной зоне и при поездках на Шымбулак/Медеу.',
      'В отопительный сезон применяйте увлажнитель воздуха и крем с церамидами для защиты барьера.',
      'Вечером тщательно очищайте кожу мягким средством от городской пыли и мелкодисперсных частиц.'
    ],
    seasonalTipsKz: [
      'Таулы аймақта және Шымбұлақ/Медеуге барғанда жыл бойы SPF 50+ қолданыңыз.',
      'Жылыту маусымында ауа ылғалдандырғыш және церамидті крем пайдаланыңыз.',
      'Кешке теріні қалалық шаңнан жұмсақ тазартқышпен мұқият жуыңыз.'
    ],
    mapX: 74,
    mapY: 78,
    lat: 43.2389,
    lng: 76.8897,
  },
  {
    id: 'astana',
    nameRu: 'Астана',
    nameKz: 'Астана',
    regionRu: 'г. Астана (Северный степной пояс)',
    regionKz: 'Астана қ. (Солтүстік дала белдеуі)',
    climateTypeRu: 'Резко континентальный, сильные ветры, морозы до -35°C, сухой воздух',
    climateTypeKz: 'Күрт континенттік, қатты жел, -35°C дейін аяз, құрғақ ауа',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'За 20–30 минут до выхода на мороз и ветер наносите плотный колд-крем или барьерный бальзам.',
      'Избегайте агрессивного умывания горячей водой после холода — перепады температур усиливают купероз.',
      'Используйте бальзам для губ с пантенолом и ланолином ежедневно в осенне-зимний период.'
    ],
    seasonalTipsKz: [
      'Аяз бен желге шығардан 20–30 минут бұрын қорғаныш барьерлік крем жағыңыз.',
      'Суықтан кейін бетті ыстық сумен жумаңыз — температура ауытқуы қызаруды күшейтеді.',
      'Күз-қыс маусымында пантенолы бар ерін бальзамын күн сайын қолданыңыз.'
    ],
    mapX: 56,
    mapY: 32,
    lat: 51.1605,
    lng: 71.4704,
  },
  {
    id: 'shymkent',
    nameRu: 'Шымкент',
    nameKz: 'Шымкент',
    regionRu: 'г. Шымкент (Южный Казахстан)',
    regionKz: 'Шымкент қ. (Оңтүстік Қазақстан)',
    climateTypeRu: 'Тёплый солнечный климат, очень высокий UV-индекс, летняя пыль',
    climateTypeKz: 'Жылы шуақты климат, өте жоғары UV-индекс, жазғы шаң',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Обязательное обновление солнцезащитного крема SPF 50 каждые 2–3 часа с апреля по октябрь.',
      'Лёгкие некомедогенные эмульсии с ниацинамидом помогут контролировать блеск в жаркую погоду.',
      'После ветреной пыльной погоды используйте мягкое двухэтапное очищение без спирта.'
    ],
    seasonalTipsKz: [
      'Сәуірден қазанға дейін SPF 50 кремін әр 2–3 сағат сайын жаңартып жағыңыз.',
      'Ыстықта тері майлылығын бақылау үшін ниацинамиді бар жеңіл эмульсия қолданыңыз.',
      'Шаңды желден кейін спиртсіз жұмсақ тазарту әдісін пайдаланыңыз.'
    ],
    mapX: 50,
    mapY: 84,
    lat: 42.3417,
    lng: 69.5901,
  },
  {
    id: 'karaganda',
    nameRu: 'Караганда',
    nameKz: 'Қарағанды',
    regionRu: 'Карагандинская область',
    regionKz: 'Қарағанды облысы',
    climateTypeRu: 'Сухой резко континентальный, длительная зима, промышленная пыль',
    climateTypeKz: 'Құрғақ күрт континенттік, ұзақ қыс, өнеркәсіптік шаң',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Восстанавливайте липидный барьер кремами с скваланом и церамидами после улицы.',
      'Не забывайте о SPF-защите зимой в солнечные снежные дни (снег отражает до 80% UV).',
      'Пейте достаточно воды и поддерживайте влажность дома на уровне 40–55%.'
    ],
    seasonalTipsKz: [
      'Көшеден кейін сквалан мен церамидтері бар креммен тері барьерін қалпына келтіріңіз.',
      'Қарлы ашық күндері қыста да SPF қолданыңыз (қар UV сәулесін шағылыстырады).',
      'Үйдегі ауа ылғалдылығын 40–55% деңгейінде сақтаңыз.'
    ],
    mapX: 60,
    mapY: 46,
    lat: 49.8047,
    lng: 73.1094,
  },
  {
    id: 'aktobe',
    nameRu: 'Актобе',
    nameKz: 'Ақтөбе',
    regionRu: 'Актюбинская область',
    regionKz: 'Ақтөбе облысы',
    climateTypeRu: 'Сухой степной, жаркое лето и морозная ветреная зима',
    climateTypeKz: 'Құрғақ далалық, ыстық жаз және аязды желді қыс',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'high',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Защищайте открытые участки кожи от степного ветра питательным бальзамом зимой.',
      'Летом используйте антиоксидантные сыворотки под солнцезащитный крем.'
    ],
    seasonalTipsKz: [
      'Қыста дала желінен бет пен қол терісін нәрлендіретін бальзаммен қорғаңыз.',
      'Жазда күннен қорғайтын кремнің астына антиоксидантты сарысу қолданыңыз.'
    ],
    mapX: 28,
    mapY: 40,
    lat: 50.2839,
    lng: 57.167,
  },
  {
    id: 'atyrau',
    nameRu: 'Атырау',
    nameKz: 'Атырау',
    regionRu: 'Атырауская область',
    regionKz: 'Атырау облысы',
    climateTypeRu: 'Полупустынный, высокая солнечная активность, солёные ветры и пыль',
    climateTypeKz: 'Шөлейтті, жоғары күн белсенділігі, тұзды жел мен шаң',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Используйте успокаивающие средства с пантенолом и мадекассосидом после пыльных ветров.',
      'Широкополый головной убор и SPF 50+ обязательны в тёплый сезон.'
    ],
    seasonalTipsKz: [
      'Шаңды желден кейін пантенолы бар тыныштандыратын құралдар қолданыңыз.',
      'Жылы маусымда бас киім және SPF 50+ міндетті.'
    ],
    mapX: 16,
    mapY: 56,
    lat: 47.0945,
    lng: 51.9238,
  },
  {
    id: 'aktau',
    nameRu: 'Актау',
    nameKz: 'Ақтау',
    regionRu: 'Мангистауская область',
    regionKz: 'Маңғыстау облысы',
    climateTypeRu: 'Приморско-пустынный, солёный бриз Каспия, яркое солнце',
    climateTypeKz: 'Теңіз маңы-шөлді, Каспийдің тұзды желі, жарқын күн',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Смывайте морскую соль и пыль мягким гелем, затем сразу наносите увлажняющий крем.',
      'Отражение солнца от воды усиливает UV-нагрузку — применяйте водостойкий SPF.'
    ],
    seasonalTipsKz: [
      'Теңіз тұзы мен шаңды жұмсақ гельмен жуып, бірден ылғалдандырғыш жағыңыз.',
      'Су бетінен шағылысқан күн сәулесі UV әсерін күшейтеді — суға төзімді SPF қолданыңыз.'
    ],
    mapX: 14,
    mapY: 72,
    lat: 43.6532,
    lng: 51.1975,
  },
  {
    id: 'pavlodar',
    nameRu: 'Павлодар',
    nameKz: 'Павлодар',
    regionRu: 'Павлодарская область',
    regionKz: 'Павлодар облысы',
    climateTypeRu: 'Северо-восточный континентальный, сильные зимние морозы',
    climateTypeKz: 'Солтүстік-шығыс континенттік, қатты қысқы аяз',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'В морозную погоду выбирайте кремы на безводной или липидной основе.',
      'Минимизируйте скрабы и кислоты в разгар зимы.'
    ],
    seasonalTipsKz: [
      'Аязды күндері липидті негіздегі қорғаныш кремдерді таңдаңыз.',
      'Қыс ортасында қышқылды пилингтер мен скрабтарды азайтыңыз.'
    ],
    mapX: 68,
    mapY: 26,
    lat: 52.2873,
    lng: 76.9674,
  },
  {
    id: 'oskemen',
    nameRu: 'Усть-Каменогорск',
    nameKz: 'Өскемен',
    regionRu: 'Восточно-Казахстанская область',
    regionKz: 'Шығыс Қазақстан облысы',
    climateTypeRu: 'Резко континентальный горно-долинный, резкие перепады температур',
    climateTypeKz: 'Күрт континенттік тау-аңғарлы, температураның күрт ауытқуы',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'При перепадах температуры от -25°C на улице к +24°C в помещении используйте защитные кремы с витамином E.',
      'Деликатное очищение без сульфатов поможет сохранить комфорт кожи.'
    ],
    seasonalTipsKz: [
      'Температура күрт ауысқанда E дәрумені бар қорғаныш кремдерді пайдаланыңыз.',
      'Сульфатсыз жұмсақ тазарту тері жайлылығын сақтайды.'
    ],
    mapX: 84,
    mapY: 36,
    lat: 49.9483,
    lng: 82.6285,
  },
  {
    id: 'kostanay',
    nameRu: 'Костанай',
    nameKz: 'Қостанай',
    regionRu: 'Костанайская область',
    regionKz: 'Қостанай облысы',
    climateTypeRu: 'Северный умеренно-континентальный, холодная зима',
    climateTypeKz: 'Солтүстік қоңыржай континенттік, суық қыс',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'Усиленное питание кожи рук и лица в ветреную погоду.',
      'Солнцезащитный уход с мая по сентябрь.'
    ],
    seasonalTipsKz: [
      'Желді ауа райында бет пен қол терісін қосымша нәрлендіріңіз.',
      'Мамырдан қыркүйекке дейін күннен қорғаныш қолданыңыз.'
    ],
    mapX: 40,
    mapY: 24,
    lat: 53.2198,
    lng: 63.6354,
  },
  {
    id: 'taraz',
    nameRu: 'Тараз',
    nameKz: 'Тараз',
    regionRu: 'Жамбылская область',
    regionKz: 'Жамбыл облысы',
    climateTypeRu: 'Южный тёплый, сухое жаркое лето, высокий UV',
    climateTypeKz: 'Оңтүстік жылы, құрғақ ыстық жаз, жоғары UV',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Лёгкие гелевые текстуры с гиалуроновой кислотой и ежедневный SPF 50.',
      'Защита от пигментации в весенне-летний период.'
    ],
    seasonalTipsKz: [
      'Гиалурон қышқылы бар жеңіл гель және күн сайын SPF 50 қолданыңыз.',
      'Көктем-жаз кезеңінде пигментациядан сақтаныңыз.'
    ],
    mapX: 60,
    mapY: 80,
    lat: 42.9,
    lng: 71.3667,
  },
  {
    id: 'kyzylorda',
    nameRu: 'Кызылорда',
    nameKz: 'Қызылорда',
    regionRu: 'Кызылординская область',
    regionKz: 'Қызылорда облысы',
    climateTypeRu: 'Засушливый пустынно-степной, высокая инсоляция, пылевые ветры',
    climateTypeKz: 'Қуаң шөл-далалы, жоғары күн радиациясы, шаңды жел',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Максимальная фотозащита (SPF 50+, очки, головной убор) и интенсивное увлажнение вечером.',
      'Мягкое удаление пыли и соли без жёстких скрабов.'
    ],
    seasonalTipsKz: [
      'Жоғары фотоқорғаныс (SPF 50+, көзілдірік, бас киім) және кешкі ылғалдандыру.',
      'Қатты скрабтарсыз шаңды жұмсақ тазалау.'
    ],
    mapX: 42,
    mapY: 70,
    lat: 44.8488,
    lng: 65.4823,
  },
  {
    id: 'turkestan',
    nameRu: 'Туркестан',
    nameKz: 'Түркістан',
    regionRu: 'Туркестанская область',
    regionKz: 'Түркістан облысы',
    climateTypeRu: 'Жаркий солнечный, очень высокий UV-индекс',
    climateTypeKz: 'Ыстық шуақты, өте жоғары UV-индекс',
    drynessRisk: 'high',
    uvRisk: 'high',
    frostRisk: 'moderate',
    dustRisk: 'high',
    seasonalTipsRu: [
      'Избегайте прямого солнца с 11:00 до 16:00 и обновляйте SPF 50+.',
      'Восстанавливайте влагу после солнца средствами с алоэ и пантенолом.'
    ],
    seasonalTipsKz: [
      '11:00–16:00 аралығында тікелей күннен сақтанып, SPF 50+ жаңартыңыз.',
      'Күннен кейін алоэ және пантенолмен теріні ылғалдандырыңыз.'
    ],
    mapX: 47,
    mapY: 79,
    lat: 43.2973,
    lng: 68.2518,
  },
  {
    id: 'semey',
    nameRu: 'Семей',
    nameKz: 'Семей',
    regionRu: 'Область Абай',
    regionKz: 'Абай облысы',
    climateTypeRu: 'Резко континентальный, сухие морозы и жаркое лето',
    climateTypeKz: 'Күрт континенттік, құрғақ аяз және ыстық жаз',
    drynessRisk: 'high',
    uvRisk: 'moderate',
    frostRisk: 'high',
    dustRisk: 'moderate',
    seasonalTipsRu: [
      'Плотная защита от мороза зимой и фотозащита в летний период.'
    ],
    seasonalTipsKz: [
      'Қыста аяздан қорғаныш, жазда күннен қорғаныш қолданыңыз.'
    ],
    mapX: 78,
    mapY: 38,
    lat: 50.4111,
    lng: 80.2275,
  }
];

export interface DemoDoctor {
  id: string;
  nameRu: string;
  nameKz: string;
  specialty: 'therapist' | 'dermatologist' | 'cardiologist' | 'neurologist' | 'ophthalmologist' | 'dentist' | 'endocrinologist' | 'pediatrician' | 'gynecologist';
  cityId: string;
  clinicRu: string;
  clinicKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  hours: string;
  experienceYears: number;
}

export const DEMO_DOCTORS: DemoDoctor[] = [
  {
    id: 'doc-1',
    nameRu: 'Айгуль Нурланова',
    nameKz: 'Айгүл Нұрланова',
    specialty: 'dermatologist',
    cityId: 'almaty',
    clinicRu: 'Клиника DermaMed Almaty (Демо-данные)',
    clinicKz: 'DermaMed Almaty клиникасы (Демо-деректер)',
    addressRu: 'пр. Достык, 114',
    addressKz: 'Достық даңғ., 114',
    phone: '+7 (727) 000-01-14',
    hours: '09:00 – 18:00',
    experienceYears: 11,
  },
  {
    id: 'doc-2',
    nameRu: 'Ерлан Касымов',
    nameKz: 'Ерлан Қасымов',
    specialty: 'therapist',
    cityId: 'astana',
    clinicRu: 'Центр семейной медицины «Сарыарка» (Демо-данные)',
    clinicKz: '«Сарыарқа» отбасылық медицина орталығы (Демо-деректер)',
    addressRu: 'ул. Сыганак, 29',
    addressKz: 'Сығанақ көш., 29',
    phone: '+7 (7172) 00-02-29',
    hours: '08:00 – 19:00',
    experienceYears: 14,
  },
  {
    id: 'doc-3',
    nameRu: 'Мадина Серикова',
    nameKz: 'Мәдина Серікова',
    specialty: 'pediatrician',
    cityId: 'almaty',
    clinicRu: 'Детская поликлиника №4 (Демо-данные)',
    clinicKz: '№4 Балалар емханасы (Демо-деректер)',
    addressRu: 'ул. Тимирязева, 42',
    addressKz: 'Тимирязев көш., 42',
    phone: '+7 (727) 000-03-42',
    hours: '08:00 – 17:00',
    experienceYears: 9,
  },
  {
    id: 'doc-4',
    nameRu: 'Тимур Жумабаев',
    nameKz: 'Тимур Жұмабаев',
    specialty: 'cardiologist',
    cityId: 'shymkent',
    clinicRu: 'Кардиоцентр Оңтүстік (Демо-данные)',
    clinicKz: 'Оңтүстік Кардиоорталығы (Демо-деректер)',
    addressRu: 'пр. Тауке хана, 68',
    addressKz: 'Тәуке хан даңғ., 68',
    phone: '+7 (7252) 00-04-68',
    hours: '09:00 – 18:00',
    experienceYears: 16,
  },
  {
    id: 'doc-5',
    nameRu: 'Алия Бекенова',
    nameKz: 'Әлия Бекенова',
    specialty: 'endocrinologist',
    cityId: 'astana',
    clinicRu: 'Эндокринологический центр Астана (Демо-данные)',
    clinicKz: 'Астана Эндокринология орталығы (Демо-деректер)',
    addressRu: 'пр. Мангилик Ел, 55',
    addressKz: 'Мәңгілік Ел даңғ., 55',
    phone: '+7 (7172) 00-05-55',
    hours: '09:00 – 17:30',
    experienceYears: 12,
  },
  {
    id: 'doc-6',
    nameRu: 'Данияр Оспанов',
    nameKz: 'Данияр Оспанов',
    specialty: 'neurologist',
    cityId: 'karaganda',
    clinicRu: 'Нейроклиника Сарыарка (Демо-данные)',
    clinicKz: 'Сарыарқа Нейроклиникасы (Демо-деректер)',
    addressRu: 'пр. Бухар Жырау, 71',
    addressKz: 'Бұқар жырау даңғ., 71',
    phone: '+7 (7212) 00-06-71',
    hours: '08:30 – 18:00',
    experienceYears: 10,
  },
  {
    id: 'doc-7',
    nameRu: 'Сауле Абдрахманова',
    nameKz: 'Сәуле Әбдірахманова',
    specialty: 'ophthalmologist',
    cityId: 'almaty',
    clinicRu: 'Офтальмология «Жарык» (Демо-данные)',
    clinicKz: '«Жарық» офтальмологиясы (Демо-деректер)',
    addressRu: 'ул. Толе би, 98',
    addressKz: 'Төле би көш., 98',
    phone: '+7 (727) 000-07-98',
    hours: '09:00 – 18:00',
    experienceYears: 13,
  },
  {
    id: 'doc-8',
    nameRu: 'Арман Калиев',
    nameKz: 'Арман Қалиев',
    specialty: 'dentist',
    cityId: 'aktobe',
    clinicRu: 'Стоматология «Ақтөбе Дент» (Демо-данные)',
    clinicKz: '«Ақтөбе Дент» стоматологиясы (Демо-деректер)',
    addressRu: 'пр. Абилкайыр хана, 52',
    addressKz: 'Әбілқайыр хан даңғ., 52',
    phone: '+7 (7132) 00-08-52',
    hours: '09:00 – 20:00',
    experienceYears: 8,
  },
  {
    id: 'doc-9',
    nameRu: 'Гульнара Исаева',
    nameKz: 'Гүлнара Исаева',
    specialty: 'gynecologist',
    cityId: 'atyrau',
    clinicRu: 'Центр женского здоровья Каспий (Демо-данные)',
    clinicKz: 'Каспий әйелдер денсаулығы орталығы (Демо-деректер)',
    addressRu: 'ул. Сатпаева, 19',
    addressKz: 'Сәтбаев көш., 19',
    phone: '+7 (7122) 00-09-19',
    hours: '08:30 – 17:30',
    experienceYears: 15,
  },
  {
    id: 'doc-10',
    nameRu: 'Жанна Сулейменова',
    nameKz: 'Жанна Сүлейменова',
    specialty: 'dermatologist',
    cityId: 'astana',
    clinicRu: 'Институт дерматологии и ухода (Демо-данные)',
    clinicKz: 'Дерматология және күтім институты (Демо-деректер)',
    addressRu: 'ул. Достык, 16',
    addressKz: 'Достық көш., 16',
    phone: '+7 (7172) 00-10-16',
    hours: '09:00 – 19:00',
    experienceYears: 12,
  }
];

export interface KzHospital {
  id: string;
  cityId: string;
  nameRu: string;
  nameKz: string;
  typeRu: string;
  typeKz: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  lat: number;
  lng: number;
  photoUrl: string;
  rating: number;
  reviewCount: number;
  reviews: FacilityReview[];
  specialties: Array<DemoDoctor['specialty']>;
  bookingMethodsRu: string[];
  bookingMethodsKz: string[];
  isTopRecommended?: boolean;
  isPilotAiParticipant?: boolean;
}

const PHOTO_HOSPITAL = '/src/assets/images/hospital_exterior_kz_1795357547748.jpg';
const PHOTO_CLINIC = '/src/assets/images/clinic_modern_lobby_1795357548852.jpg';
const PHOTO_CENTER = '/src/assets/images/feature_kazakhstan_health_1795355229560.jpg';
const PHOTO_PHARMACY = '/src/assets/images/pharmacy_interior_kz_1795357547632.jpg';

export const KZ_HOSPITALS: KzHospital[] = [
  {
    id: 'hosp-astana-nnkc',
    cityId: 'astana',
    nameRu: 'Национальный научный кардиохирургический центр (ННКЦ)',
    nameKz: 'Ұлттық ғылыми кардиохирургия орталығы (ҰҒКО)',
    typeRu: 'Республиканский центр · JCI аккредитация',
    typeKz: 'Республикалық орталық · JCI аккредитация',
    addressRu: 'пр. Туран, 38',
    addressKz: 'Тұран даңғ., 38',
    phone: '+7 (7172) 70-31-00',
    lat: 51.1235,
    lng: 71.4046,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.9,
    reviewCount: 342,
    reviews: [
      { id: 'rev-1', author: 'Айдар М.', rating: 5, date: '2026-10-18', textRu: 'Высочайший уровень диагностики и внимательные кардиологи. Быстро прошли ЭКГ по направлению.', textKz: 'Диагностика деңгейі өте жоғары, кардиологтар мұқият қарайды.' },
      { id: 'rev-2', author: 'Галина С.', rating: 5, date: '2026-09-29', textRu: 'Чистый современный корпус, чёткая электронная очередь в регистратуре.', textKz: 'Таза заманауи ғимарат, тіркеу орнында кезек жүйесі ыңғайлы.' },
    ],
    specialties: ['cardiologist', 'therapist', 'pediatrician'],
    bookingMethodsRu: ['Кол-центр клиники', 'Направление ОСМС / Damumed', 'Онлайн-заявка'],
    bookingMethodsKz: ['Клиника кол-орталығы', 'МӘМС жолдамасы / Damumed', 'Онлайн-өтінім'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-astana-nnmc',
    cityId: 'astana',
    nameRu: 'Национальный научный медицинский центр (ННМЦ)',
    nameKz: 'Ұлттық ғылыми медициналық орталық (ҰҒМО)',
    typeRu: 'Многопрофильный республиканский центр',
    typeKz: 'Көпбейінді республикалық орталық',
    addressRu: 'пр. Абылай хана, 42',
    addressKz: 'Абылай хан даңғ., 42',
    phone: '+7 (7172) 57-76-64',
    lat: 51.1489,
    lng: 71.4822,
    photoUrl: PHOTO_CLINIC,
    rating: 4.8,
    reviewCount: 218,
    reviews: [
      { id: 'rev-3', author: 'Нурбек К.', rating: 5, date: '2026-11-04', textRu: 'Сильные эндокринологи и терапевты, анализы готовы в тот же день.', textKz: 'Эндокринологтар мен терапевтер өте білікті, талдау сол күні дайын.' },
    ],
    specialties: ['therapist', 'endocrinologist', 'neurologist', 'cardiologist'],
    bookingMethodsRu: ['Кол-центр клиники', 'Damumed (по направлению)', 'Личная регистратура'],
    bookingMethodsKz: ['Клиника кол-орталығы', 'Damumed (жолдамамен)', 'Тіркеу орны'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-astana-udp',
    cityId: 'astana',
    nameRu: 'Больница Медицинского центра УДП РК (Президентская клиника)',
    nameKz: 'ҚР ПІБ Медициналық орталығының ауруханасы',
    typeRu: 'Высокотехнологичный диагностический и клинический центр',
    typeKz: 'Жоғары технологиялық диагностикалық орталық',
    addressRu: 'ул. Е-495, зд. 2',
    addressKz: 'Е-495 көш., 2-ғим.',
    phone: '+7 (7172) 70-80-90',
    lat: 51.0875,
    lng: 71.4255,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.9,
    reviewCount: 415,
    reviews: [
      { id: 'rev-4', author: 'Динара А.', rating: 5, date: '2026-11-11', textRu: 'Оперативно записались к дерматологу и на МРТ. Всё организовано на уровне.', textKz: 'Дерматологқа және МРТ-ға жылдам жазылдық, қызмет көрсету тамаша.' },
    ],
    specialties: ['therapist', 'dermatologist', 'cardiologist', 'neurologist', 'ophthalmologist', 'endocrinologist', 'gynecologist'],
    bookingMethodsRu: ['Единый кол-центр +7 (7172) 70-80-90', 'Платный и ОСМС приём', 'Портал клиники'],
    bookingMethodsKz: ['Бірыңғай кол-орталық', 'Ақылы және МӘМС қабылдау', 'Клиника порталы'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-astana-neuro',
    cityId: 'astana',
    nameRu: 'Национальный центр нейрохирургии',
    nameKz: 'Ұлттық нейрохирургия орталығы',
    typeRu: 'Специализированный национальный центр',
    typeKz: 'Мамандандырылған ұлттық орталық',
    addressRu: 'пр. Туран, 34/1',
    addressKz: 'Тұран даңғ., 34/1',
    phone: '+7 (7172) 62-11-00',
    lat: 51.1268,
    lng: 71.4021,
    photoUrl: PHOTO_CENTER,
    rating: 4.9,
    reviewCount: 194,
    reviews: [
      { id: 'rev-5', author: 'Ермек Т.', rating: 5, date: '2026-10-05', textRu: 'Консультация невролога помогла быстро определиться с дальнейшим планом обследования.', textKz: 'Невролог кеңесі тексеру жоспарын нақтылауға көмектесті.' },
    ],
    specialties: ['neurologist', 'therapist'],
    bookingMethodsRu: ['Кол-центр клиники', 'Направление через Damumed'],
    bookingMethodsKz: ['Кол-орталық', 'Damumed арқылы жолдама'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-almaty-syzganov',
    cityId: 'almaty',
    nameRu: 'Научный центр хирургии им. А.Н. Сызганова (ННЦХ)',
    nameKz: 'А.Н. Сызғанов атындағы Ұлттық ғылыми хирургия орталығы',
    typeRu: 'Ведущий многопрофильный научный центр',
    typeKz: 'Жетекші көпбейінді ғылыми орталық',
    addressRu: 'ул. Желтоксан, 51',
    addressKz: 'Желтоқсан көш., 51',
    phone: '+7 (727) 279-24-91',
    lat: 43.2665,
    lng: 76.9395,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.8,
    reviewCount: 289,
    reviews: [
      { id: 'rev-6', author: 'Мадина О.', rating: 5, date: '2026-11-08', textRu: 'Опытные профессора и терапевты, удобное расположение в центре Алматы.', textKz: 'Тәжірибелі дәрігерлер, Алматы орталығында орналасқан.' },
    ],
    specialties: ['therapist', 'endocrinologist', 'cardiologist'],
    bookingMethodsRu: ['Регистратура / Кол-центр', 'Направление поликлиники (Damumed)'],
    bookingMethodsKz: ['Тіркеу орны / Кол-орталық', 'Емхана жолдамасы (Damumed)'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-almaty-bsmp',
    cityId: 'almaty',
    nameRu: 'Городская больница скорой неотложной помощи (БСНП Алматы)',
    nameKz: 'Алматы қалалық жедел шұғыл көмек ауруханасы',
    typeRu: 'Крупный городской многопрофильный стационар 24/7',
    typeKz: 'Ірі қалалық көпбейінді стационар 24/7',
    addressRu: 'ул. Казыбек би, 98',
    addressKz: 'Қазыбек би көш., 98',
    phone: '+7 (727) 292-31-01',
    lat: 43.2558,
    lng: 76.9301,
    photoUrl: PHOTO_CLINIC,
    rating: 4.6,
    reviewCount: 312,
    reviews: [
      { id: 'rev-7', author: 'Талгат Б.', rating: 5, date: '2026-10-21', textRu: 'Дежурные врачи в приёмном покое сработали быстро и профессионально.', textKz: 'Қабылдау бөлімінің кезекші дәрігерлері жедел көмек көрсетті.' },
    ],
    specialties: ['therapist', 'neurologist', 'cardiologist'],
    bookingMethodsRu: ['Приёмный покой 24/7', 'Экстренно 103', 'Направление Damumed'],
    bookingMethodsKz: ['Қабылдау бөлімі 24/7', 'Шұғыл 103', 'Damumed жолдамасы'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-almaty-perinatal',
    cityId: 'almaty',
    nameRu: 'Научный центр акушерства, гинекологии и перинатологии',
    nameKz: 'Акушерлік, гинекология және перинатология ғылыми орталығы',
    typeRu: 'Республиканский профильный центр',
    typeKz: 'Республикалық бейінді орталық',
    addressRu: 'пр. Достык, 125',
    addressKz: 'Достық даңғ., 125',
    phone: '+7 (727) 300-40-30',
    lat: 43.2312,
    lng: 76.9598,
    photoUrl: PHOTO_CENTER,
    rating: 4.8,
    reviewCount: 176,
    reviews: [
      { id: 'rev-8', author: 'Асель Н.', rating: 5, date: '2026-11-01', textRu: 'Очень заботливый персонал, уютные кабинеты и чёткая запись.', textKz: 'Персонал өте мейірімді, қабылдау уақыты нақты.' },
    ],
    specialties: ['gynecologist', 'pediatrician'],
    bookingMethodsRu: ['Кол-центр центра', 'Направление ОСМС / Damumed'],
    bookingMethodsKz: ['Орталық кол-орталығы', 'МӘМС / Damumed жолдамасы'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-almaty-derma',
    cityId: 'almaty',
    nameRu: 'Казахский научный центр дерматологии и инфекционных заболеваний',
    nameKz: 'Қазақ дерматология және инфекциялық аурулар ғылыми орталығы',
    typeRu: 'Республиканский дерматологический центр',
    typeKz: 'Республикалық дерматологиялық орталық',
    addressRu: 'пр. Райымбека, 60',
    addressKz: 'Райымбек даңғ., 60',
    phone: '+7 (727) 397-42-14',
    lat: 43.2704,
    lng: 76.9445,
    photoUrl: PHOTO_CLINIC,
    rating: 4.8,
    reviewCount: 254,
    reviews: [
      { id: 'rev-9', author: 'Камила Ж.', rating: 5, date: '2026-11-12', textRu: 'Провели дерматоскопию и подробно объяснили уход за чувствительной кожей.', textKz: 'Дерматоскопия жасап, тері күтімі бойынша толық кеңес берді.' },
    ],
    specialties: ['dermatologist', 'therapist'],
    bookingMethodsRu: ['Регистратура', 'Damumed по направлению', 'Консультативный приём'],
    bookingMethodsKz: ['Тіркеу орны', 'Damumed жолдамасы', 'Кеңес беру қабылдауы'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-shymkent-1',
    cityId: 'shymkent',
    nameRu: 'Городская клиническая больница №1 г. Шымкент',
    nameKz: 'Шымкент қалалық №1 клиникалық ауруханасы',
    typeRu: 'Многопрофильная клиническая больница',
    typeKz: 'Көпбейінді клиникалық аурухана',
    addressRu: 'ул. Байтурсынова, 78',
    addressKz: 'Байтұрсынов көш., 78',
    phone: '+7 (7252) 53-01-44',
    lat: 42.3318,
    lng: 69.5968,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.7,
    reviewCount: 163,
    reviews: [
      { id: 'rev-10', author: 'Бауыржан Е.', rating: 5, date: '2026-10-14', textRu: 'Хорошие кардиологи и терапевты, приняли вовремя по записи через Damumed.', textKz: 'Кардиологтар мен терапевтер жақсы, Damumed арқылы уақытылы қабылдады.' },
    ],
    specialties: ['therapist', 'cardiologist', 'neurologist', 'dermatologist'],
    bookingMethodsRu: ['Damumed (по прикреплению)', 'Регистратура больницы'],
    bookingMethodsKz: ['Damumed (тіркелу бойынша)', 'Аурухана тіркеу орны'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-karaganda-1',
    cityId: 'karaganda',
    nameRu: 'Многопрофильная больница №1 г. Караганды',
    nameKz: 'Қарағанды қаласының №1 көпбейінді ауруханасы',
    typeRu: 'Городская многопрофильная клиника',
    typeKz: 'Қалалық көпбейінді клиника',
    addressRu: 'ул. Ермекова, 127',
    addressKz: 'Ермеков көш., 127',
    phone: '+7 (7212) 42-63-42',
    lat: 49.7972,
    lng: 73.0811,
    photoUrl: PHOTO_CLINIC,
    rating: 4.7,
    reviewCount: 141,
    reviews: [
      { id: 'rev-11', author: 'Ольга В.', rating: 5, date: '2026-10-30', textRu: 'Вежливый персонал в регистратуре, быстро сделали анализы и ЭКГ.', textKz: 'Тіркеу орнындағы қызметкерлер сыпайы, ЭКГ жылдам жасалды.' },
    ],
    specialties: ['therapist', 'cardiologist', 'neurologist', 'endocrinologist'],
    bookingMethodsRu: ['Damumed', 'Телефон регистратуры', 'Портал поликлиники'],
    bookingMethodsKz: ['Damumed', 'Тіркеу орны телефоны', 'Емхана порталы'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-karaganda-obl',
    cityId: 'karaganda',
    nameRu: 'Областной клинический центр Карагандинской области',
    nameKz: 'Қарағанды облыстық клиникалық орталығы',
    typeRu: 'Областная клиническая больница',
    typeKz: 'Облыстық клиникалық аурухана',
    addressRu: 'ул. Ерубаева, 20',
    addressKz: 'Ерубаев көш., 20',
    phone: '+7 (7212) 55-93-10',
    lat: 49.8115,
    lng: 73.0955,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.6,
    reviewCount: 118,
    reviews: [
      { id: 'rev-12', author: 'Серик Р.', rating: 5, date: '2026-09-20', textRu: 'Профильный офтальмолог и дерматолог в одном корпусе, очень удобно.', textKz: 'Офтальмолог пен дерматолог бір ғимаратта орналасқан, өте ыңғайлы.' },
    ],
    specialties: ['therapist', 'dermatologist', 'ophthalmologist', 'gynecologist'],
    bookingMethodsRu: ['Направление через Damumed', 'Справочная клиники'],
    bookingMethodsKz: ['Damumed арқылы жолдама', 'Анықтама қызметі'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-aktobe-mc',
    cityId: 'aktobe',
    nameRu: 'Актюбинский медицинский центр (Многопрофильная клиника)',
    nameKz: 'Ақтөбе медициналық орталығы (Көпбейінді клиника)',
    typeRu: 'Региональный многопрофильный центр',
    typeKz: 'Өңірлік көпбейінді орталық',
    addressRu: 'мкр. Жанаконыс, 8',
    addressKz: 'Жаңақоныс шағын ауд., 8',
    phone: '+7 (7132) 74-20-00',
    lat: 50.2495,
    lng: 57.1188,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.8,
    reviewCount: 187,
    reviews: [
      { id: 'rev-13', author: 'Айжан С.', rating: 5, date: '2026-11-02', textRu: 'Современное оборудование и понятная маршрутизация по кабинетам.', textKz: 'Заманауи жабдықтар, кабинеттерге бағыттау түсінікті.' },
    ],
    specialties: ['therapist', 'cardiologist', 'neurologist', 'pediatrician', 'dentist'],
    bookingMethodsRu: ['Damumed', 'Кол-центр клиники'],
    bookingMethodsKz: ['Damumed', 'Клиника кол-орталығы'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-atyrau-obl',
    cityId: 'atyrau',
    nameRu: 'Атырауская областная больница',
    nameKz: 'Атырау облыстық ауруханасы',
    typeRu: 'Областной многопрофильный стационар',
    typeKz: 'Облыстық көпбейінді стационар',
    addressRu: 'ул. Владимирского, 98',
    addressKz: 'Владимирский көш., 98',
    phone: '+7 (7122) 28-23-40',
    lat: 47.1105,
    lng: 51.9082,
    photoUrl: PHOTO_CENTER,
    rating: 4.6,
    reviewCount: 112,
    reviews: [
      { id: 'rev-14', author: 'Марат Д.', rating: 5, date: '2026-10-12', textRu: 'Квалифицированные врачи, чистота в отделениях.', textKz: 'Білікті дәрігерлер, бөлімшелер таза.' },
    ],
    specialties: ['therapist', 'cardiologist', 'gynecologist', 'dermatologist'],
    bookingMethodsRu: ['Damumed', 'Регистратура'],
    bookingMethodsKz: ['Damumed', 'Тіркеу орны'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-aktau-obl',
    cityId: 'aktau',
    nameRu: 'Мангистауская областная многопрофильная больница',
    nameKz: 'Маңғыстау облыстық көпбейінді ауруханасы',
    typeRu: 'Областной клинический центр',
    typeKz: 'Облыстық клиникалық орталық',
    addressRu: '26 микрорайон, б/н',
    addressKz: '26 шағын аудан',
    phone: '+7 (7292) 21-03-45',
    lat: 43.6611,
    lng: 51.1795,
    photoUrl: PHOTO_CLINIC,
    rating: 4.7,
    reviewCount: 98,
    reviews: [
      { id: 'rev-15', author: 'Жандос К.', rating: 5, date: '2026-10-25', textRu: 'Отличное офтальмологическое и кардиологическое отделения.', textKz: 'Офтальмология және кардиология бөлімшелері өте жақсы.' },
    ],
    specialties: ['therapist', 'cardiologist', 'neurologist', 'ophthalmologist'],
    bookingMethodsRu: ['Damumed', 'Регистратура больницы'],
    bookingMethodsKz: ['Damumed', 'Аурухана тіркеу орны'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-pavlodar-1',
    cityId: 'pavlodar',
    nameRu: 'Павлодарская городская больница №1',
    nameKz: 'Павлодар қалалық №1 ауруханасы',
    typeRu: 'Многопрофильный клинический стационар',
    typeKz: 'Көпбейінді клиникалық стационар',
    addressRu: 'ул. Ломова, 49',
    addressKz: 'Ломов көш., 49',
    phone: '+7 (7182) 62-45-10',
    lat: 52.2738,
    lng: 76.9682,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.7,
    reviewCount: 129,
    reviews: [
      { id: 'rev-16', author: 'Елена П.', rating: 5, date: '2026-11-05', textRu: 'Быстро приняли в приёмном отделении, врач ответила на все вопросы.', textKz: 'Қабылдау бөлімінде тез қарады, дәрігер барлық сұраққа жауап берді.' },
    ],
    specialties: ['therapist', 'cardiologist', 'neurologist', 'dermatologist'],
    bookingMethodsRu: ['Damumed', 'Запись в поликлинике'],
    bookingMethodsKz: ['Damumed', 'Емханада жазылу'],
    isTopRecommended: true,
    isPilotAiParticipant: true,
  },
  {
    id: 'hosp-oskemen-vko',
    cityId: 'oskemen',
    nameRu: 'Восточно-Казахстанская областная больница',
    nameKz: 'Шығыс Қазақстан облыстық ауруханасы',
    typeRu: 'Областной центр специализированной помощи',
    typeKz: 'Облыстық мамандандырылған көмек орталығы',
    addressRu: 'пр. Ауэзова, 26',
    addressKz: 'Әуезов даңғ., 26',
    phone: '+7 (7232) 25-24-12',
    lat: 49.9562,
    lng: 82.6134,
    photoUrl: PHOTO_CLINIC,
    rating: 4.7,
    reviewCount: 134,
    reviews: [
      { id: 'rev-17', author: 'Асет Б.', rating: 5, date: '2026-10-19', textRu: 'Компетентные эндокринологи и удобная запись через кол-центр.', textKz: 'Эндокринологтар білікті, кол-орталық арқылы жазылу ыңғайлы.' },
    ],
    specialties: ['therapist', 'endocrinologist', 'ophthalmologist', 'cardiologist'],
    bookingMethodsRu: ['Damumed', 'Кол-центр'],
    bookingMethodsKz: ['Damumed', 'Кол-орталық'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-taraz-obl',
    cityId: 'taraz',
    nameRu: 'Жамбылская областная многопрофильная больница',
    nameKz: 'Жамбыл облыстық көпбейінді ауруханасы',
    typeRu: 'Областной клинический комплекс',
    typeKz: 'Облыстық клиникалық кешен',
    addressRu: 'ул. Айша биби, 2Б',
    addressKz: 'Айша бибі көш., 2Б',
    phone: '+7 (7262) 54-12-30',
    lat: 42.8935,
    lng: 71.3742,
    photoUrl: PHOTO_HOSPITAL,
    rating: 4.7,
    reviewCount: 109,
    reviews: [
      { id: 'rev-18', author: 'Гульназ Т.', rating: 5, date: '2026-10-08', textRu: 'Уютная педиатрия и внимательные дерматологи.', textKz: 'Педиатрия бөлімі жайлы, дерматологтар мұқият.' },
    ],
    specialties: ['therapist', 'cardiologist', 'pediatrician', 'dermatologist'],
    bookingMethodsRu: ['Damumed', 'Регистратура'],
    bookingMethodsKz: ['Damumed', 'Тіркеу орны'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-kostanay-obl',
    cityId: 'kostanay',
    nameRu: 'Костанайская областная больница',
    nameKz: 'Қостанай облыстық ауруханасы',
    typeRu: 'Областная многопрофильная больница',
    typeKz: 'Облыстық көпбейінді аурухана',
    addressRu: 'ул. 1 Мая, 151',
    addressKz: '1 Мамыр көш., 151',
    phone: '+7 (7142) 54-18-90',
    lat: 53.2145,
    lng: 63.6289,
    photoUrl: PHOTO_CLINIC,
    rating: 4.6,
    reviewCount: 94,
    reviews: [
      { id: 'rev-19', author: 'Ирина Л.', rating: 5, date: '2026-09-28', textRu: 'Хорошая неврология и диагностический блок.', textKz: 'Неврология және диагностика бөлімі жақсы.' },
    ],
    specialties: ['therapist', 'neurologist', 'cardiologist', 'endocrinologist'],
    bookingMethodsRu: ['Damumed', 'Регистратура поликлиники'],
    bookingMethodsKz: ['Damumed', 'Емхана тіркеу орны'],
    isTopRecommended: true,
  },
  {
    id: 'hosp-kyzylorda-obl',
    cityId: 'kyzylorda',
    nameRu: 'Многопрофильная областная больница г. Кызылорда',
    nameKz: 'Қызылорда облыстық көпбейінді ауруханасы',
    typeRu: 'Региональный клинический центр',
    typeKz: 'Өңірлік клиникалық орталық',
    addressRu: 'пр. Абая Кунанбаева, 65',
    addressKz: 'Абай Құнанбаев даңғ., 65',
    phone: '+7 (7242) 23-51-40',
    lat: 44.8398,
    lng: 65.5021,
    photoUrl: PHOTO_CENTER,
    rating: 4.7,
    reviewCount: 86,
    reviews: [
      { id: 'rev-20', author: 'Ерлан У.', rating: 5, date: '2026-10-16', textRu: 'Чёткая организация приёма и современное оборудование.', textKz: 'Қабылдау тәртібі нақты, жабдықтары заманауи.' },
    ],
    specialties: ['therapist', 'pediatrician', 'dermatologist', 'gynecologist'],
    bookingMethodsRu: ['Damumed', 'Регистратура'],
    bookingMethodsKz: ['Damumed', 'Тіркеу орны'],
    isTopRecommended: true,
  }
];

export const PILOT_35_CLINICS_STATS = [
  { regionRu: 'г. Астана и Акмолинская область', regionKz: 'Астана қ. және Ақмола облысы', clinicsCount: 8, focusRu: 'Первичный приём ВОП, структурирование симптомов и маршрутизация', focusKz: 'ЖПД алғашқы қабылдауы, белгілерді құрылымдау' },
  { regionRu: 'г. Алматы и Алматинская область', regionKz: 'Алматы қ. және Алматы облысы', clinicsCount: 9, focusRu: 'Дерматологический скрининг, аллерго-триаж, RU/KZ ассистент', focusKz: 'Дерматологиялық скрининг, аллерго-триаж, RU/KZ көмекші' },
  { regionRu: 'г. Шымкент и Туркестанская область', regionKz: 'Шымкент қ. және Түркістан облысы', clinicsCount: 6, focusRu: 'Двуязычный голосовой предприём и педиатрический чек-ап', focusKz: 'Екітілді дауыстық алдын ала қабылдау және педиатрия' },
  { regionRu: 'Карагандинская и Павлодарская области', regionKz: 'Қарағанды және Павлодар облыстары', clinicsCount: 6, focusRu: 'Мониторинг сердечно-сосудистых рисков и хроники', focusKz: 'Жүрек-қан тамыр қауіптерін бақылау' },
  { regionRu: 'Западный и Восточный Казахстан', regionKz: 'Батыс және Шығыс Қазақстан', clinicsCount: 6, focusRu: 'Дистанционная подготовка к визиту и телемедицинский PDF-отчёт', focusKz: 'Қашықтан дайындық және телемедициналық PDF-есеп' },
];


export interface DemoPharmacy {
  id: string;
  nameRu: string;
  nameKz: string;
  cityId: string;
  addressRu: string;
  addressKz: string;
  phone: string;
  is24h: boolean;
  lat: number;
  lng: number;
  photoUrl: string;
  rating: number;
  reviewCount: number;
  reviews: FacilityReview[];
  latOffset: number;
  lngOffset: number;
}

export const DEMO_PHARMACIES: DemoPharmacy[] = [
  {
    id: 'ph-1',
    nameRu: 'Аптека «Алатау Фарм 24»',
    nameKz: '«Алатау Фарм 24» дәріханасы',
    cityId: 'almaty',
    addressRu: 'пр. Абая, 48',
    addressKz: 'Абай даңғ., 48',
    phone: '+7 (727) 292-11-48',
    is24h: true,
    lat: 43.2405,
    lng: 76.9242,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 152,
    reviews: [
      { id: 'prev-1', author: 'Алия Р.', rating: 5, date: '2026-11-10', textRu: 'Работают круглосуточно, хороший выбор дерматологической косметики и SPF.', textKz: 'Тәулік бойы жұмыс істейді, тері күтіміне арналған құралдар мол.' },
    ],
    latOffset: 38,
    lngOffset: 44,
  },
  {
    id: 'ph-2',
    nameRu: 'Аптека «Медеу Дәріхана»',
    nameKz: '«Медеу Дәріхана»',
    cityId: 'almaty',
    addressRu: 'ул. Гоголя, 86',
    addressKz: 'Гоголь көш., 86',
    phone: '+7 (727) 273-12-86',
    is24h: false,
    lat: 43.2602,
    lng: 76.9421,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 94,
    reviews: [
      { id: 'prev-2', author: 'Руслан Т.', rating: 5, date: '2026-10-28', textRu: 'Вежливый провизор, помогли проверить рецепт.', textKz: 'Фармацевт мұқият кеңес берді.' },
    ],
    latOffset: 54,
    lngOffset: 62,
  },
  {
    id: 'ph-3',
    nameRu: 'Аптека «Бәйтерек Дәрі 24/7»',
    nameKz: '«Бәйтерек Дәрі 24/7» дәріханасы',
    cityId: 'astana',
    addressRu: 'пр. Туран, 21',
    addressKz: 'Тұран даңғ., 21',
    phone: '+7 (7172) 55-13-21',
    is24h: true,
    lat: 51.1328,
    lng: 71.4095,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.9,
    reviewCount: 184,
    reviews: [
      { id: 'prev-3', author: 'Дана М.', rating: 5, date: '2026-11-14', textRu: 'Удобно расположена рядом с медкластером на Туране, всегда открыта ночью.', textKz: 'Тұран даңғылындағы медициналық орталықтарға жақын, түнде де ашық.' },
    ],
    latOffset: 42,
    lngOffset: 35,
  },
  {
    id: 'ph-4',
    nameRu: 'Аптека «Есіл Фарм»',
    nameKz: '«Есіл Фарм» дәріханасы',
    cityId: 'astana',
    addressRu: 'ул. Кенесары, 44',
    addressKz: 'Кенесары көш., 44',
    phone: '+7 (7172) 32-14-44',
    is24h: false,
    lat: 51.1695,
    lng: 71.4342,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 78,
    reviews: [
      { id: 'prev-4', author: 'Азамат К.', rating: 5, date: '2026-10-19', textRu: 'Быстрое обслуживание и удобный вход.', textKz: 'Қызмет көрсету жылдам.' },
    ],
    latOffset: 62,
    lngOffset: 58,
  },
  {
    id: 'ph-5',
    nameRu: 'Аптека «Шымкент Денсаулық 24»',
    nameKz: '«Шымкент Денсаулық 24» дәріханасы',
    cityId: 'shymkent',
    addressRu: 'пр. Республики, 15',
    addressKz: 'Республика даңғ., 15',
    phone: '+7 (7252) 54-15-15',
    is24h: true,
    lat: 42.3185,
    lng: 69.5912,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 121,
    reviews: [
      { id: 'prev-5', author: 'Сабира Ж.', rating: 5, date: '2026-11-06', textRu: 'Всегда свежие препараты и круглосуточный отпуск.', textKz: 'Тәулік бойы ашық, дәрілер бар.' },
    ],
    latOffset: 48,
    lngOffset: 50,
  },
  {
    id: 'ph-6',
    nameRu: 'Аптека «Сарыарқа Дәрі»',
    nameKz: '«Сарыарқа Дәрі» дәріханасы',
    cityId: 'karaganda',
    addressRu: 'ул. Ерубаева, 32',
    addressKz: 'Ерубаев көш., 32',
    phone: '+7 (7212) 41-16-32',
    is24h: true,
    lat: 49.8082,
    lng: 73.0928,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 103,
    reviews: [
      { id: 'prev-6', author: 'Виктор Н.', rating: 5, date: '2026-11-03', textRu: 'Рядом с областной клиникой, удобная парковка.', textKz: 'Облыстық клиникаға жақын орналасқан.' },
    ],
    latOffset: 46,
    lngOffset: 52,
  },
  {
    id: 'ph-7',
    nameRu: 'Аптека «Ақтөбе Фармация 24»',
    nameKz: '«Ақтөбе Фармация 24» дәріханасы',
    cityId: 'aktobe',
    addressRu: 'пр. Абилкайыр хана, 62',
    addressKz: 'Әбілқайыр хан даңғ., 62',
    phone: '+7 (7132) 56-10-62',
    is24h: true,
    lat: 50.2895,
    lng: 57.1525,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 64,
    reviews: [
      { id: 'prev-7', author: 'Сания А.', rating: 5, date: '2026-10-22', textRu: 'Хорошая аптека в центре Актобе, есть линейка лечебного ухода.', textKz: 'Ақтөбе орталығындағы жақсы дәріхана.' },
    ],
    latOffset: 28,
    lngOffset: 40,
  },
  {
    id: 'ph-8',
    nameRu: 'Аптека «Каспий Мед Фарм»',
    nameKz: '«Каспий Мед Фарм» дәріханасы',
    cityId: 'atyrau',
    addressRu: 'ул. Сатпаева, 24',
    addressKz: 'Сәтбаев көш., 24',
    phone: '+7 (7122) 32-44-24',
    is24h: true,
    lat: 47.1012,
    lng: 51.9158,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 72,
    reviews: [
      { id: 'prev-8', author: 'Нурлан Г.', rating: 5, date: '2026-10-15', textRu: 'Большой зал, без очередей, работают 24/7.', textKz: 'Кезек жоқ, тәулік бойы жұмыс істейді.' },
    ],
    latOffset: 16,
    lngOffset: 56,
  },
  {
    id: 'ph-9',
    nameRu: 'Аптека «Ақтау Шипа 24»',
    nameKz: '«Ақтау Шипа 24» дәріханасы',
    cityId: 'aktau',
    addressRu: '14 микрорайон, 38',
    addressKz: '14 шағын аудан, 38',
    phone: '+7 (7292) 43-22-38',
    is24h: true,
    lat: 43.6498,
    lng: 51.1585,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 58,
    reviews: [
      { id: 'prev-9', author: 'Айгуль М.', rating: 5, date: '2026-10-27', textRu: 'Отличный выбор солнцезащитных средств для Каспийского климата.', textKz: 'Күннен қорғайтын құралдар таңдауы жақсы.' },
    ],
    latOffset: 14,
    lngOffset: 72,
  },
  {
    id: 'ph-10',
    nameRu: 'Аптека «Ертіс Фарм»',
    nameKz: '«Ертіс Фарм» дәріханасы',
    cityId: 'pavlodar',
    addressRu: 'ул. Каирбаева, 72',
    addressKz: 'Қайырбаев көш., 72',
    phone: '+7 (7182) 55-31-72',
    is24h: false,
    lat: 52.2835,
    lng: 76.9422,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 61,
    reviews: [
      { id: 'prev-10', author: 'Максим К.', rating: 5, date: '2026-10-11', textRu: 'Удобное расположение и грамотные консультанты.', textKz: 'Ыңғайлы орналасқан, кеңесшілері білікті.' },
    ],
    latOffset: 68,
    lngOffset: 26,
  },
  {
    id: 'ph-11',
    nameRu: 'Аптека «Алтай Дәрі 24»',
    nameKz: '«Алтай Дәрі 24» дәріханасы',
    cityId: 'oskemen',
    addressRu: 'ул. Казахстан, 68',
    addressKz: 'Қазақстан көш., 68',
    phone: '+7 (7232) 26-41-68',
    is24h: true,
    lat: 49.9512,
    lng: 82.6192,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 83,
    reviews: [
      { id: 'prev-11', author: 'Светлана П.', rating: 5, date: '2026-11-01', textRu: 'Открыта круглосуточно, рядом с остановкой.', textKz: 'Тәулік бойы ашық.' },
    ],
    latOffset: 84,
    lngOffset: 36,
  },
  {
    id: 'ph-12',
    nameRu: 'Аптека «Қостанай МедФарм»',
    nameKz: '«Қостанай МедФарм» дәріханасы',
    cityId: 'kostanay',
    addressRu: 'пр. Аль-Фараби, 88',
    addressKz: 'Әл-Фараби даңғ., 88',
    phone: '+7 (7142) 54-88-10',
    is24h: true,
    lat: 53.2158,
    lng: 63.6312,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 54,
    reviews: [
      { id: 'prev-12', author: 'Артем В.', rating: 5, date: '2026-10-20', textRu: 'Быстро отпускают рецептурные и безрецептурные средства.', textKz: 'Қызметі жылдам әрі сапалы.' },
    ],
    latOffset: 40,
    lngOffset: 24,
  },
  {
    id: 'ph-13',
    nameRu: 'Аптека «Тараз Шипагер»',
    nameKz: '«Тараз Шипагер» дәріханасы',
    cityId: 'taraz',
    addressRu: 'пр. Толе би, 45',
    addressKz: 'Төле би даңғ., 45',
    phone: '+7 (7262) 45-21-45',
    is24h: true,
    lat: 42.8992,
    lng: 71.3688,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.8,
    reviewCount: 69,
    reviews: [
      { id: 'prev-13', author: 'Жанар Е.', rating: 5, date: '2026-10-24', textRu: 'Светлая аптека в центре Тараза.', textKz: 'Тараз орталығындағы таза, жарық дәріхана.' },
    ],
    latOffset: 60,
    lngOffset: 80,
  },
  {
    id: 'ph-14',
    nameRu: 'Аптека «Сыр Дәрі 24»',
    nameKz: '«Сыр Дәрі 24» дәріханасы',
    cityId: 'kyzylorda',
    addressRu: 'ул. Коркыт Ата, 18',
    addressKz: 'Қорқыт Ата көш., 18',
    phone: '+7 (7242) 27-14-18',
    is24h: true,
    lat: 44.8475,
    lng: 65.4922,
    photoUrl: PHOTO_PHARMACY,
    rating: 4.7,
    reviewCount: 49,
    reviews: [
      { id: 'prev-14', author: 'Багдат С.', rating: 5, date: '2026-10-13', textRu: 'Работает ночью, выручили с детскими средствами.', textKz: 'Түнде де жұмыс істейді, өте ыңғайлы.' },
    ],
    latOffset: 42,
    lngOffset: 70,
  },
];

export interface LibraryArticle {
  id: string;
  category: 'climate' | 'skincare' | 'prevention';
  readMinutes: number;
  titleRu: string;
  titleKz: string;
  summaryRu: string;
  summaryKz: string;
  bodyRu: string[];
  bodyKz: string[];
}

export const LIBRARY_ARTICLES: LibraryArticle[] = [
  {
    id: 'winter-care-kz',
    category: 'climate',
    readMinutes: 4,
    titleRu: 'Уход за кожей зимой в Казахстане',
    titleKz: 'Қазақстанда қыс мезгілінде тері күтімі',
    summaryRu: 'Как защитить липидный барьер при степных ветрах, морозах до -35°C и сухом воздухе в квартирах.',
    summaryKz: 'Дала желі, -35°C дейінгі аяз және үйдегі құрғақ ауа кезінде терінің липидті барьерін қалай қорғауға болады.',
    bodyRu: [
      'Зимой в северных и центральных регионах Казахстана влажность воздуха в отапливаемых помещениях падает ниже 25%, а на улице кожу испытывают сильный ветер и мороз. Это приводит к трансэпидермальной потере влаги, шелушению и ощущению стянутости.',
      'Наносите плотный защитный крем с церамидами, скваланом или маслом ши минимум за 20–30 минут до выхода на улицу. Не выходите на мороз сразу после нанесения лёгкого увлажняющего геля.',
      'Замените агрессивные пенки на мягкое кремовое очищение без сульфатов и поддерживайте влажность воздуха дома на уровне 40–50%.'
    ],
    bodyKz: [
      'Қазақстанның солтүстік және орталық өңірлерінде қыста жылытылатын бөлмелерде ауа ылғалдылығы 25%-дан төмен түседі, ал сыртта қатты жел мен аяз әсер етеді. Бұл терінің ылғал жоғалтуына және қабыршақтануына әкеледі.',
      'Көшеге шығардан кемінде 20–30 минут бұрын церамидтер, сквалан немесе ши майы бар тығыз қорғаныш кремін жағыңыз. Жеңіл гель жаққаннан кейін бірден аязға шықпаңыз.',
      'Агрессивті жуғыш құралдарды жұмсақ сульфатсыз сүтшеге ауыстырып, үйдегі ауа ылғалдылығын 40–50% деңгейінде ұстаңыз.'
    ]
  },
  {
    id: 'sun-protection',
    category: 'skincare',
    readMinutes: 3,
    titleRu: 'Защита кожи от солнца',
    titleKz: 'Теріні күн сәулесінен қорғау',
    summaryRu: 'Почему южное солнце, степь и высокогорье требуют системной фотозащиты от UVA и UVB.',
    summaryKz: 'Неліктен оңтүстік күн, дала және таулы аймақ UVA және UVB сәулелерінен жүйелі қорғанысты талап етеді.',
    bodyRu: [
      'Ультрафиолетовые лучи типа A (UVA) проникают через облака и оконные стёкла круглый год, ускоряя фотостарение и гиперпигментацию. В южных регионах Казахстана и в предгорьях Алматы UV-индекс часто превышает 7–9.',
      'Помимо крема, носите солнцезащитные очки с UV400, головной убор и старайтесь находиться в тени в пиковые часы с 11:00 до 16:00.'
    ],
    bodyKz: [
      'UVA сәулелері бұлт пен терезе әйнегі арқылы жыл бойы өтеді, терінің ерте қартаюын және пигментацияны күшейтеді. Қазақстанның оңтүстік өңірлерінде және Алматы тау бөктерінде UV-индекс жиі 7–9-дан асады.',
      'Кремнен бөлек, UV400 көзілдірік пен бас киім киіңіз және 11:00–16:00 аралығында тікелей күн сәулесінен сақтаныңыз.'
    ]
  },
  {
    id: 'dryness-relief',
    category: 'skincare',
    readMinutes: 4,
    titleRu: 'Как бороться с сухостью кожи',
    titleKz: 'Терінің құрғауымен қалай күресуге болады',
    summaryRu: 'Разница между сухой и обезвоженной кожей и пошаговое восстановление комфорта.',
    summaryKz: 'Құрғақ және сусызданған терінің айырмашылығы және жайлылықты қалпына келтіру жолдары.',
    bodyRu: [
      'Сухость связана с нехваткой липидов, а обезвоженность — с дефицитом воды в роговом слое. В сухом климате часто сочетаются оба состояния.',
      'Правило трёх минут: наносите увлажняющую сыворотку (глицерин, гиалуроновая кислота) и закрепляющий крем сразу после умывания или душа на слегка влажную кожу.'
    ],
    bodyKz: [
      'Құрғақтық липидтердің жетіспеуімен, ал сусыздану мүйізді қабаттағы ылғал тапшылығымен байланысты. Құрғақ климатта екеуі де жиі қатар кездеседі.',
      'Үш минут ережесі: бет жуғаннан кейін сәл ылғал теріге ылғалдандырғыш сарысу және бекітуші кремді бірден жағыңыз.'
    ]
  },
  {
    id: 'acne-care',
    category: 'skincare',
    readMinutes: 5,
    titleRu: 'Уход при акне и воспалениях',
    titleKz: 'Бездеу (акне) және қабыну кезіндегі күтім',
    summaryRu: 'Бережное очищение, отказ от выдавливания и доказанные ингредиенты для ежедневной рутины.',
    summaryKz: 'Ұқыпты тазарту, сығудан бас тарту және күнделікті күтімдегі дәлелді ингредиенттер.',
    bodyRu: [
      'Главная ошибка при акне — пересушивание кожи спиртовыми лосьонами и частыми скрабами. Повреждённый барьер вызывает ещё большее воспаление и выработку кожного сала.',
      'Используйте мягкое очищение дважды в день, некомедогенное увлажнение и обязательный SPF. При узлах, рубцах или длительных высыпаниях обратитесь к дерматологу для подбора терапии.'
    ],
    bodyKz: [
      'Бездеу кезіндегі басты қате — спиртті лосьондармен және жиі скрабтармен теріні құрғатып жіберу. Зақымдалған барьер қабынуды күшейтеді.',
      'Күніне екі рет жұмсақ жуыну, комедогенді емес ылғалдандыру және міндетті SPF қолданыңыз. Түйіндер мен тыртықтар болса, дерматологқа қаралыңыз.'
    ]
  },
  {
    id: 'dust-impact',
    category: 'climate',
    readMinutes: 3,
    titleRu: 'Влияние пыли и городского воздуха на кожу',
    titleKz: 'Шаң мен қалалық ауаның теріге әсері',
    summaryRu: 'Как мелкие частицы PM2.5 и степная пыль вызывают оксидативный стресс и закупорку пор.',
    summaryKz: 'PM2.5 ұсақ бөлшектері мен дала шаңы тотығу стрессі мен тесіктердің бітелуін қалай тудырады.',
    bodyRu: [
      'Частицы пыли и выхлопных газов оседают на кожном сале, провоцируя воспаление и тусклый цвет лица. Вечернее умывание удаляет эти загрязнения до сна.',
      'Антиоксиданты (витамин C, ниацинамид, витамин E) в утреннем уходе помогают снизить воздействие городской среды.'
    ],
    bodyKz: [
      'Шаң мен түтін бөлшектері тері майына жабысып, қабыну мен терінің күңгірттенуіне себеп болады. Кешкі тазарту ластануды ұйқы алдында кетіреді.',
      'Таңғы күтімдегі антиоксиданттар (C дәрумені, ниацинамид, E дәрумені) сыртқы ортаның әсерін азайтады.'
    ]
  },
  {
    id: 'proper-spf',
    category: 'skincare',
    readMinutes: 3,
    titleRu: 'Правильное использование SPF',
    titleKz: 'SPF кремін дұрыс қолдану ережесі',
    summaryRu: 'Правило двух пальцев, частота обновления и выбор фильтров для чувствительной кожи.',
    summaryKz: 'Екі саусақ ережесі, жаңарту жиілігі және сезімтал теріге арналған сүзгілерді таңдау.',
    bodyRu: [
      'Чтобы заявленный SPF 50 работал, нужно наносить достаточное количество средства — ориентир «два пальца» для лица и шеи за 15 минут до выхода.',
      'При длительном пребывании на улице обновляйте защиту каждые 2–3 часа и после купания или вытирания полотенцем.'
    ],
    bodyKz: [
      'SPF 50 тиімді жұмыс істеуі үшін бет пен мойынға «екі саусақ» мөлшерінде күнге шығардан 15 минут бұрын жағу қажет.',
      'Сыртта ұзақ болғанда қорғанысты әр 2–3 сағат сайын және суға түскеннен кейін жаңартып отырыңыз.'
    ]
  },
  {
    id: 'daily-routine',
    category: 'skincare',
    readMinutes: 4,
    titleRu: 'Ежедневный базовый уход: 3 шага',
    titleKz: 'Күнделікті базалық күтім: 3 қадам',
    summaryRu: 'Минималистичная система: очищение, увлажнение и фотозащита без лишних баночек.',
    summaryKz: 'Артық құралсыз минималистік жүйе: тазарту, ылғалдандыру және фотоқорғаныс.',
    bodyRu: [
      'Здоровой коже достаточно трёх базовых этапов: мягкое очищение утром/вечером, крем по типу кожи и дневной SPF.',
      'Вводите новые активные компоненты по одному с интервалом 10–14 дней, чтобы вовремя заметить индивидуальную реакцию.'
    ],
    bodyKz: [
      'Сау теріге үш негізгі кезең жеткілікті: таңертең және кешке жұмсақ тазарту, тері типіне сай крем және күндізгі SPF.',
      'Жаңа белсенді компоненттерді 10–14 күн аралықпен біртіндеп енгізіңіз.'
    ]
  },
  {
    id: 'when-see-dermatologist',
    category: 'prevention',
    readMinutes: 4,
    titleRu: 'Когда обращаться к дерматологу',
    titleKz: 'Дерматологқа қашан жүгіну керек',
    summaryRu: 'Признаки, при которых домашний уход следует дополнить очной дерматоскопией.',
    summaryKz: 'Үй күтімін дерматологтың тексеруімен толықтыру қажет болатын белгілер.',
    bodyRu: [
      'Обязательно запишитесь к врачу, если родинка меняет форму, цвет, размер или границы (правило ABCDE), кровоточит, зудит или появилась новая быстрорастущая пигментная точка.',
      'Также повод для визита — сыпь, не проходящая более 2 недель, болезненные подкожные узлы, сильный зуд или признаки кожной инфекции.'
    ],
    bodyKz: [
      'Егер мең пішінін, түсін, өлшемін немесе шекарасын өзгертсе (ABCDE ережесі), қанаса, қышыса немесе тез өсетін жаңа дақ пайда болса, міндетті түрде дәрігерге жазылыңыз.',
      'Сондай-ақ 2 аптадан астам кетпейтін бөртпе, ауырсынатын түйіндер немесе қатты қышу дәрігерге көрінуге себеп болады.'
    ]
  },
  {
    id: 'disease-prevention',
    category: 'prevention',
    readMinutes: 5,
    titleRu: 'Профилактика заболеваний и чек-апы',
    titleKz: 'Аурулардың алдын алу және чек-аптар',
    summaryRu: 'Сон, питание, физическая активность и плановые обследования в поликлинике по месту прикрепления.',
    summaryKz: 'Ұйқы, тамақтану, физикалық белсенділік және тіркелген емханадағы жоспарлы тексерулер.',
    bodyRu: [
      'Регулярный сон 7–9 часов, сбалансированный рацион и ежедневная ходьба поддерживают иммунитет и состояние сосудов, что напрямую отражается на коже и общем самочувствии.',
      'Уточняйте график профилактических скринингов в вашей поликлинике прикрепления или через информационную систему Damumed.'
    ],
    bodyKz: [
      'Күнделікті 7–9 сағаттық ұйқы, теңгерімді тамақтану және жаяу жүру иммунитет пен қан тамырларын қолдайды.',
      'Жоспарлы скринингтер кестесін тіркелген емханаңыздан немесе Damumed жүйесі арқылы нақтылаңыз.'
    ]
  }
];

export interface TranslatorEntry {
  kz: string;
  ru: string;
  en: string;
  explanationRu: string;
  explanationKz: string;
}

export const MEDICAL_DICTIONARY: TranslatorEntry[] = [
  { kz: 'Тері бөртпесі', ru: 'Кожная сыпь', en: 'Skin rash', explanationRu: 'Изменение цвета или текстуры участка кожи, требующее оценки причины.', explanationKz: 'Терінің түсі немесе құрылымының өзгеруі, себебін бағалауды қажет етеді.' },
  { kz: 'Бездеу (Акне)', ru: 'Акне (Угревая сыпь)', en: 'Acne', explanationRu: 'Воспаление сальных желёз и волосяных фолликулов.', explanationKz: 'Май бездері мен шаш фолликулдарының қабынуы.' },
  { kz: 'Қызару', ru: 'Покраснение (Эритема)', en: 'Redness / Erythema', explanationRu: 'Усиление притока крови к капиллярам кожи из-за раздражения, тепла или воспаления.', explanationKz: 'Тітіркену немесе қабыну салдарынан тері капиллярларына қан келуінің күшеюі.' },
  { kz: 'Мең', ru: 'Родинка (Невус)', en: 'Mole / Nevus', explanationRu: 'Пигментное образование на коже; при изменениях рекомендуется дерматоскопия.', explanationKz: 'Терідегі пигментті түзіліс; өзгерістер байқалса дерматоскопия ұсынылады.' },
  { kz: 'Құрғақ тері', ru: 'Сухость кожи (Ксероз)', en: 'Dry skin / Xerosis', explanationRu: 'Снижение содержания влаги и липидов в верхнем слое кожи.', explanationKz: 'Терінің жоғарғы қабатында ылғал мен липидтердің азаюы.' },
  { kz: 'Қышу', ru: 'Зуд', en: 'Itching / Pruritus', explanationRu: 'Неприятное ощущение, вызывающее желание расчесать кожу.', explanationKz: 'Теріні қасу ниетін тудыратын жағымсыз сезім.' },
  { kz: 'Аллергиялық реакция', ru: 'Аллергическая реакция', en: 'Allergic reaction', explanationRu: 'Повышенная чувствительность иммунной системы к определённому веществу.', explanationKz: 'Иммундық жүйенің белгілі бір затқа жоғары сезімталдығы.' },
  { kz: 'Ісіну', ru: 'Отёк', en: 'Swelling / Edema', explanationRu: 'Скопление жидкости в тканях; внезапный отёк лица или губ требует срочной помощи.', explanationKz: 'Тіндерде сұйықтықтың жиналуы; бет не ерін ісінуі шұғыл көмекті қажет етеді.' },
  { kz: 'Қан қысымы', ru: 'Артериальное давление', en: 'Blood pressure', explanationRu: 'Сила давления крови на стенки сосудов (систолическое / диастолическое).', explanationKz: 'Қанның тамыр қабырғаларына түсіретін қысымы.' },
  { kz: 'Жүрек соғу жиілігі', ru: 'Пульс (Частота сердечных сокращений)', en: 'Heart rate / Pulse', explanationRu: 'Количество ударов сердца в минуту в покое или при нагрузке.', explanationKz: 'Бір минуттағы жүрек соғу саны.' },
  { kz: 'Дене қызуы', ru: 'Температура тела', en: 'Body temperature', explanationRu: 'Показатель теплового состояния организма (норма около 36.6°C).', explanationKz: 'Ағзаның жылу күйінің көрсеткіші.' },
  { kz: 'Дәрумен D', ru: 'Витамин D', en: 'Vitamin D', explanationRu: 'Жирорастворимый витамин, важный для костей, иммунитета и общего обмена веществ.', explanationKz: 'Сүйек, иммунитет және зат алмасу үшін маңызды дәрумен.' },
  { kz: 'Қан анализі', ru: 'Анализ крови', en: 'Blood test', explanationRu: 'Лабораторное исследование показателей крови для оценки здоровья.', explanationKz: 'Денсаулықты бағалауға арналған зертханалық қан зерттеуі.' },
  { kz: 'Дәрігерге жазылу', ru: 'Запись к врачу', en: 'Doctor appointment', explanationRu: 'Планирование очной консультации в поликлинике или медицинском центре.', explanationKz: 'Емханада немесе медициналық орталықта дәрігер қабылдауына жазылу.' },
  { kz: 'Жедел жәрдем', ru: 'Скорая медицинская помощь', en: 'Emergency medical services', explanationRu: 'Экстренная служба в Казахстане по номерам 103 и 112.', explanationKz: 'Қазақстандағы 103 және 112 нөмірлері бойынша шұғыл қызмет.' },
  { kz: 'Дене салмағының индексі (ДСИ)', ru: 'Индекс массы тела (ИМТ)', en: 'Body Mass Index (BMI)', explanationRu: 'Расчётный показатель соотношения веса и квадрата роста.', explanationKz: 'Салмақ пен бой квадратының арақатынасының есептік көрсеткіші.' },
];

export const KZ_VACCINATION_SCHEDULE = [
  { ageRu: 'Первые 24 часа', ageKz: 'Алғашқы 24 сағат', vaccinesRu: 'БЦЖ (туберкулёз), Гепатит B (V1)', vaccinesKz: 'БЦЖ (туберкулез), В гепатиті (V1)' },
  { ageRu: '2 месяца', ageKz: '2 ай', vaccinesRu: 'АбКДС + ИПВ + Hib + Гепатит B (1), Пневмококковая (1)', vaccinesKz: 'АбКДС + ИПВ + Hib + В гепатиті (1), Пневмококк (1)' },
  { ageRu: '3 месяца', ageKz: '3 ай', vaccinesRu: 'АбКДС + ИПВ + Hib (2)', vaccinesKz: 'АбКДС + ИПВ + Hib (2)' },
  { ageRu: '4 месяца', ageKz: '4 ай', vaccinesRu: 'АбКДС + ИПВ + Hib + Гепатит B (3), Пневмококковая (2)', vaccinesKz: 'АбКДС + ИПВ + Hib + В гепатиті (3), Пневмококк (2)' },
  { ageRu: '12–15 месяцев', ageKz: '12–15 ай', vaccinesRu: 'ККП (Корь, Краснуха, Паротит), Пневмококковая (3), ОПВ', vaccinesKz: 'ҚҚП (Қызылша, Қызамық, Паротит), Пневмококк (3), ОПВ' },
  { ageRu: '18 месяцев', ageKz: '18 ай', vaccinesRu: 'АбКДС + ИПВ + Hib (ревакцинация)', vaccinesKz: 'АбКДС + ИПВ + Hib (ревакцинация)' },
  { ageRu: '6 лет', ageKz: '6 жас', vaccinesRu: 'АбКДС, ККП (ревакцинация)', vaccinesKz: 'АбКДС, ҚҚП (ревакцинация)' },
];
