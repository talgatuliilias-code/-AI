import React, { useState } from 'react';
import { Lock, Plus, ShieldCheck, Trash2, UserCheck, Users } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { KZ_CITIES } from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';
import { BiologicalSex, FamilyRole, Language, SkinType } from '../types/health';

export const ProfilePage: React.FC = () => {
  const { lang, activeProfile, profiles, updateProfile, deleteProfile, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [name, setName] = useState(activeProfile.name);
  const [age, setAge] = useState(String(activeProfile.age));
  const [sex, setSex] = useState<BiologicalSex>(activeProfile.sex);
  const [cityId, setCityId] = useState(activeProfile.cityId);
  const [heightCm, setHeightCm] = useState(String(activeProfile.heightCm));
  const [weightKg, setWeightKg] = useState(String(activeProfile.weightKg));
  const [skinType, setSkinType] = useState<SkinType>(activeProfile.skinType);
  const [complaints, setComplaints] = useState(activeProfile.complaints);
  const [allergies, setAllergies] = useState(activeProfile.allergies);
  const [preferredLang, setPreferredLang] = useState<Language>(activeProfile.preferredLang);
  const [newPin, setNewPin] = useState('');

  React.useEffect(() => {
    setName(activeProfile.name);
    setAge(String(activeProfile.age));
    setSex(activeProfile.sex);
    setCityId(activeProfile.cityId);
    setHeightCm(String(activeProfile.heightCm));
    setWeightKg(String(activeProfile.weightKg));
    setSkinType(activeProfile.skinType);
    setComplaints(activeProfile.complaints);
    setAllergies(activeProfile.allergies);
    setPreferredLang(activeProfile.preferredLang);
    setNewPin('');
  }, [activeProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const city = KZ_CITIES.find((c) => c.id === cityId) || KZ_CITIES[0];
    await updateProfile(
      activeProfile.id,
      {
        name: name.trim() || activeProfile.name,
        age: Number(age) || activeProfile.age,
        sex,
        cityId,
        region: isKz ? city.regionKz : city.regionRu,
        heightCm: Number(heightCm) || activeProfile.heightCm,
        weightKg: Number(weightKg) || activeProfile.weightKg,
        skinType,
        complaints,
        allergies,
        preferredLang,
      },
      newPin ? newPin : undefined
    );
    showToast(isKz ? 'Профиль жаңартылды' : 'Профиль обновлён', 'success');
    setNewPin('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes.profile}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'Жеке медициналық деректер, климат аймағы және тері типі'
              : 'Персональные параметры здоровья, регион Казахстана и особенности кожи'}
          </p>
        </div>

        {profiles.length > 1 && (
          <button
            type="button"
            onClick={() => {
              deleteProfile(activeProfile.id);
              showToast(isKz ? 'Профиль жойылды' : 'Профиль удалён', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isKz ? 'Профильді жою' : 'Удалить профиль'}</span>
          </button>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Аты' : 'Имя'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Жасы' : 'Возраст'}
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Жынысы' : 'Пол'}
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as BiologicalSex)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              <option value="female">{isKz ? 'Әйел' : 'Женский'}</option>
              <option value="male">{isKz ? 'Ер' : 'Мужской'}</option>
              <option value="unspecified">{isKz ? 'Көрсетілмеген' : 'Не указан'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Қала және облыс (ҚР)' : 'Город и область (РК)'}
            </label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              {KZ_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {isKz ? `${c.nameKz} — ${c.regionKz}` : `${c.nameRu} — ${c.regionRu}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Бой (см)' : 'Рост (см)'}
            </label>
            <input
              type="number"
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
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Тері типі' : 'Тип кожи'}
            </label>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value as SkinType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              <option value="normal">{isKz ? 'Қалыпты' : 'Нормальная'}</option>
              <option value="dry">{isKz ? 'Құрғақ' : 'Сухая'}</option>
              <option value="oily">{isKz ? 'Майлы' : 'Жирная'}</option>
              <option value="combination">{isKz ? 'Аралас' : 'Комбинированная'}</option>
              <option value="sensitive">{isKz ? 'Сезімтал' : 'Чувствительная'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Таңдаулы тіл' : 'Предпочитаемый язык'}
            </label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as Language)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              <option value="ru">Русский</option>
              <option value="kz">Қазақша</option>
            </select>
          </div>

          {activeProfile.role === 'child' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Ата-ана PIN-коды (жаңарту)' : 'PIN-код защиты детского профиля'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={activeProfile.pinHash ? '••••' : isKz ? 'Жаңа PIN (міндетті емес)' : 'Задать PIN (опционально)'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Шағымдар / Ескертпелер' : 'Жалобы и заметки'}
            </label>
            <textarea
              rows={3}
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Аллергиялар' : 'Аллергии'}
            </label>
            <textarea
              rows={3}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.common.save}</span>
        </button>
      </form>
    </div>
  );
};

export const FamilyPage: React.FC = () => {
  const {
    lang,
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    deleteProfile,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [role, setRole] = useState<FamilyRole>('mother');
  const [name, setName] = useState('');
  const [age, setAge] = useState('34');
  const [cityId, setCityId] = useState('almaty');
  const [heightCm, setHeightCm] = useState('168');
  const [weightKg, setWeightKg] = useState('64');
  const [childPin, setChildPin] = useState('');

  const roleLabels: Record<FamilyRole, string> = isKz
    ? {
        self: 'Мен',
        child: 'Бала',
        mother: 'Ана',
        father: 'Әке',
        spouse: 'Жұбайы',
      }
    : {
        self: 'Я',
        child: 'Ребёнок',
        mother: 'Мама',
        father: 'Папа',
        spouse: 'Супруг / Супруга',
      };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(isKz ? 'Профиль атын енгізіңіз' : 'Введите имя профиля', 'warning');
      return;
    }
    const city = KZ_CITIES.find((c) => c.id === cityId) || KZ_CITIES[0];
    await addProfile(
      {
        role,
        name: name.trim(),
        age: Number(age) || 30,
        sex: role === 'mother' ? 'female' : role === 'father' ? 'male' : 'unspecified',
        cityId,
        region: isKz ? city.regionKz : city.regionRu,
        heightCm: Number(heightCm) || 168,
        weightKg: Number(weightKg) || 64,
        skinType: 'normal',
        complaints: '',
        allergies: '',
        preferredLang: lang,
      },
      role === 'child' && childPin.trim() ? childPin.trim() : undefined
    );
    setName('');
    setChildPin('');
    showToast(isKz ? 'Отбасылық профиль қосылды' : 'Семейный профиль добавлен', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.family}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Әр отбасы мүшесінің талдаулары, ДСИ, фотолары мен еске салғыштары бөлек сақталады.'
            : 'Полная изоляция данных: анализы кожи, фото, ИМТ, напоминания и история хранятся отдельно для каждого члена семьи.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const active = p.id === activeProfile.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 space-y-3 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    {roleLabels[p.role]}
                  </p>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {p.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {p.age} {isKz ? 'жас' : 'лет'} · {p.region}
                  </p>
                </div>
                {p.pinHash && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                    title="PIN protected"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>PIN</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await switchProfile(p.id);
                    if (res.ok) {
                      showToast(
                        isKz ? `Белсенді: ${p.name}` : `Активен профиль: ${p.name}`,
                        'success'
                      );
                    } else if (res.needsPin) {
                      showToast(
                        isKz
                          ? 'Бүйірлік панельден PIN арқылы ашыңыз'
                          : 'Разблокируйте профиль через переключатель в боковом меню',
                        'warning'
                      );
                    }
                  }}
                  disabled={active}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {active
                    ? isKz
                      ? 'Таңдалған'
                      : 'Активный'
                    : isKz
                      ? 'Профильге өту'
                      : 'Переключиться'}
                </button>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteProfile(p.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600"
                    aria-label="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Family Member Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Отбасы мүшесін қосу' : 'Добавить члена семьи'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Рөлі' : 'Роль в семье'}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FamilyRole)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              {(Object.keys(roleLabels) as FamilyRole[]).map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Аты' : 'Имя'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isKz ? 'Мысалы: Арман' : 'Например: Гульназ'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Жасы' : 'Возраст'}
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Қала' : 'Город Казахстана'}
            </label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              {KZ_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {isKz ? c.nameKz : c.nameRu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isKz ? 'Бой / Салмақ' : 'Рост (см) / Вес (кг)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {role === 'child' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isKz ? 'Ата-ана PIN-коды (қорғаныс)' : 'Родительский PIN-код (защита)'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={childPin}
                onChange={(e) => setChildPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>
              {isKz
                ? 'Балалар профильдері SHA-256 PIN-кодымен қорғалуы мүмкін.'
                : 'Детские профили поддерживают защиту PIN-кодом (родительский контроль).'}
            </span>
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isKz ? 'Профиль қосу' : 'Создать профиль'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
