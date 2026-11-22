import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  Info,
  LocateFixed,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  PhoneCall,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  X,
} from 'lucide-react';
import {
  calculateDistanceKm,
  KazakhstanMedicalMap,
  MapFacilityItem,
  UserGeoLocation,
} from '../components/KazakhstanMedicalMap';
import { useHealth } from '../context/HealthContext';
import {
  DEMO_DOCTORS,
  DEMO_PHARMACIES,
  DemoDoctor,
  DemoPharmacy,
  FacilityReview,
  KZ_CITIES,
  KZ_HOSPITALS,
  KzHospital,
  PILOT_35_CLINICS_STATS,
} from '../data/kazakhstanData';
import { UI_TEXT } from '../i18n/translations';

const REVIEWS_STORAGE_KEY = 'dermasense_facility_reviews_v1';

type CustomReviewsMap = Record<string, FacilityReview[]>;

function loadCustomReviews(): CustomReviewsMap {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CustomReviewsMap) : {};
  } catch {
    return {};
  }
}

function saveCustomReviews(next: CustomReviewsMap) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

function getLiveRatingSummary(
  baseRating: number,
  baseCount: number,
  baseReviews: FacilityReview[],
  userReviews: FacilityReview[]
): { rating: number; reviewCount: number; allReviews: FacilityReview[] } {
  const allReviews = [...userReviews, ...baseReviews];
  if (userReviews.length === 0) {
    return { rating: baseRating, reviewCount: baseCount, allReviews };
  }
  const userSum = userReviews.reduce((acc, r) => acc + r.rating, 0);
  const totalCount = baseCount + userReviews.length;
  const weighted = (baseRating * baseCount + userSum) / totalCount;
  return {
    rating: Math.round(weighted * 10) / 10,
    reviewCount: totalCount,
    allReviews,
  };
}

interface OsmMedicalItem {
  id: string;
  name: string;
  kind: 'clinic' | 'pharmacy';
  lat: number;
  lng: number;
  address: string;
  phone: string;
  openingHours: string;
  is24h: boolean;
}

interface FacilityDetailsTarget {
  id: string;
  kind: 'clinic' | 'pharmacy';
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  photoUrl: string;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  reviews: FacilityReview[];
  hospital?: KzHospital;
}

interface FacilityDetailsModalProps {
  target: FacilityDetailsTarget | null;
  onClose: () => void;
  onSubmitReview: (facilityId: string, author: string, rating: number, text: string) => void;
  onBookHospital?: (hospital: KzHospital) => void;
  lang: 'ru' | 'kz';
}

const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({
  target,
  onClose,
  onSubmitReview,
  onBookHospital,
  lang,
}) => {
  const isKz = lang === 'kz';
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmitReview(
      target.id,
      author.trim() || (isKz ? 'Пациент' : 'Пациент'),
      rating,
      text.trim()
    );
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="relative h-52 sm:h-60 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <img
            src={target.photoUrl}
            alt={target.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white text-xs font-semibold inline-flex items-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isKz ? 'Артқа' : 'Назад'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/65 hover:bg-slate-950 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/75 text-white text-xs font-semibold backdrop-blur-xs">
              {target.subtitle}
              {typeof target.distanceKm === 'number' ? ` · ${target.distanceKm} км` : ''}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {target.rating.toFixed(1)} · {target.reviewCount} {isKz ? 'пікір' : 'отз.'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {target.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {target.address} ·{' '}
                <a
                  href={`tel:${target.phone.replace(/[^\d+]/g, '')}`}
                  className="font-mono font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {target.phone}
                </a>
              </p>
            </div>

            {target.hospital && onBookHospital && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookHospital(target.hospital!);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isKz ? 'Қабылдауға жазылу' : 'Записаться на приём'}</span>
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>
                  {isKz
                    ? 'Пациенттер пікірлері (Демо-үлгілер және сіздің бағаларыңыз)'
                    : 'Отзывы пациентов (Демо-примеры и ваши оценки)'}
                </span>
              </h4>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {target.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {rev.author}
                      {rev.isUserCreated && (
                        <span className="ml-2 text-[11px] font-medium text-teal-600 dark:text-teal-400">
                          {isKz ? 'Сіздің пікіріңіз' : 'Ваш отзыв'}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      ★ {rev.rating}.0 · <span className="text-slate-400 font-normal">{rev.date}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isKz ? rev.textKz : rev.textRu}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add User Review Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/60 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isKz ? 'Өз пікіріңізді қалдыру' : 'Оставить свой отзыв'}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 cursor-pointer"
                    aria-label={`${star} stars`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={isKz ? 'Сіздің атыңыз' : 'Ваше имя'}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isKz
                    ? 'Қызмет сапасы, дәрігер немесе кезек туралы әсеріңіз...'
                    : 'Поделитесь впечатлением о клинике или аптеке...'
                }
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isKz ? 'Картаға қайту' : 'Назад к карте'}</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                {isKz ? 'Пікірді жариялау' : 'Опубликовать отзыв'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface BookingRequestItem {
  id: string;
  institutionName: string;
  cityLabel: string;
  specialtyLabel: string;
  phone: string;
  method: string;
  date: string;
  note: string;
  clinicPhone: string;
}

export const DoctorsPage: React.FC = () => {
  const {
    lang,
    theme,
    activeProfile,
    preselectedDoctorFilter,
    setPreselectedDoctorFilter,
    navigate,
    showToast,
  } = useHealth();
  const isKz = lang === 'kz';

  const [cityFilter, setCityFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPilotClinics, setOnlyPilotClinics] = useState(false);

  // Interactive Map & Geolocation State
  const initialCity = useMemo(
    () => KZ_CITIES.find((c) => c.id === activeProfile.cityId) || KZ_CITIES[0],
    [activeProfile.cityId]
  );
  const [userLocation, setUserLocation] = useState<UserGeoLocation>({
    lat: initialCity.lat,
    lng: initialCity.lng,
    source: 'city',
    label: isKz ? initialCity.nameKz : initialCity.nameRu,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState<'all' | 'clinics' | 'pharmacies' | '24h'>('all');
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [osmItems, setOsmItems] = useState<OsmMedicalItem[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmSearchedOnce, setOsmSearchedOnce] = useState(false);

  // Reviews state (persisted in localStorage)
  const [customReviews, setCustomReviews] = useState<CustomReviewsMap>(() => loadCustomReviews());
  const [detailsModalId, setDetailsModalId] = useState<{ id: string; kind: 'clinic' | 'pharmacy' } | null>(null);

  // Booking modal state (supports Hospital or Doctor)
  const [bookingTarget, setBookingTarget] = useState<{
    title: string;
    cityId: string;
    specialty: DemoDoctor['specialty'];
    clinicPhone: string;
    address: string;
    methods: string[];
  } | null>(null);
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingMethod, setBookingMethod] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-11-28');
  const [bookingSpecialty, setBookingSpecialty] = useState<DemoDoctor['specialty']>('therapist');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingRequests, setBookingRequests] = useState<BookingRequestItem[]>([]);
  const [bookingReturnDetailsId, setBookingReturnDetailsId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedDoctorFilter) {
      if (preselectedDoctorFilter.cityId) {
        setCityFilter(preselectedDoctorFilter.cityId);
      }
      if (preselectedDoctorFilter.specialty) {
        setSpecialtyFilter(preselectedDoctorFilter.specialty);
      }
    }
  }, [preselectedDoctorFilter]);

  // Sync city reference when user switches city filter (unless active real GPS)
  useEffect(() => {
    if (userLocation.source === 'gps') return;
    const targetCity =
      cityFilter !== 'all'
        ? KZ_CITIES.find((c) => c.id === cityFilter) || initialCity
        : initialCity;
    setUserLocation({
      lat: targetCity.lat,
      lng: targetCity.lng,
      source: 'city',
      label: isKz ? targetCity.nameKz : targetCity.nameRu,
    });
  }, [cityFilter, initialCity, isKz, userLocation.source]);

  const fetchNearbyOsm = useCallback(
    async (lat: number, lng: number, quiet = false) => {
      setOsmLoading(true);
      try {
        const res = await fetch(`/api/nearby-medical?lat=${lat}&lng=${lng}&radius=5000`);
        if (!res.ok) throw new Error('OSM error');
        const data = (await res.json()) as { source: string; items: OsmMedicalItem[] };
        setOsmItems(data.items || []);
        setOsmSearchedOnce(true);
        if (!quiet) {
          showToast(
            data.items && data.items.length > 0
              ? isKz
                ? `OpenStreetMap-тан жақын маңда ${data.items.length} нысан табылды`
                : `Найдено ${data.items.length} объектов рядом в OpenStreetMap`
              : isKz
                ? 'OpenStreetMap уақытша қолжетімсіз — Қазақстан клиникалары мен дәріханаларының базасы көрсетілуде'
                : 'Live OpenStreetMap не вернул точек — отображается полная база по Казахстану',
            data.items && data.items.length > 0 ? 'success' : 'info'
          );
        }
      } catch {
        setOsmSearchedOnce(true);
        if (!quiet) {
          showToast(
            isKz
              ? 'Жергілікті клиникалар мен дәріханалар базасы көрсетілуде'
              : 'Отображается база клиник и аптек Казахстана',
            'info'
          );
        }
      } finally {
        setOsmLoading(false);
      }
    },
    [isKz, showToast]
  );

  const handleRequestGps = useCallback(() => {
    if (!navigator.geolocation) {
      showToast(
        isKz ? 'Браузер геолокацияны қолдамайды' : 'Геолокация не поддерживается браузером',
        'warning'
      );
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          source: 'gps',
          label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        setGpsLoading(false);
        showToast(
          isKz ? 'Нақты GPS орныңыз анықталды!' : 'Текущее местоположение (GPS) определено!',
          'success'
        );
        fetchNearbyOsm(latitude, longitude, true);
      },
      () => {
        setGpsLoading(false);
        showToast(
          isKz
            ? 'GPS рұқсаты берілмеді — қала орталығы бойынша есептелуде'
            : 'Доступ к GPS отклонён — показываем расстояния от центра выбранного города',
          'warning'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [fetchNearbyOsm, isKz, showToast]);

  const handleAddReview = useCallback(
    (facilityId: string, author: string, rating: number, text: string) => {
      const review: FacilityReview = {
        id: `usr-rev-${Date.now()}`,
        author,
        rating,
        date: new Date().toISOString().slice(0, 10),
        textRu: text,
        textKz: text,
        isUserCreated: true,
      };
      setCustomReviews((prev) => {
        const next: CustomReviewsMap = {
          ...prev,
          [facilityId]: [review, ...(prev[facilityId] || [])],
        };
        saveCustomReviews(next);
        return next;
      });
      showToast(
        isKz ? 'Пікіріңіз сәтті қосылды!' : 'Спасибо! Ваш отзыв сохранён и учтён в рейтинге.',
        'success'
      );
    },
    [isKz, showToast]
  );

  const specialties: Array<{ key: DemoDoctor['specialty']; ru: string; kz: string }> = [
    { key: 'therapist', ru: 'Терапевт', kz: 'Терапевт' },
    { key: 'dermatologist', ru: 'Дерматолог', kz: 'Дерматолог' },
    { key: 'cardiologist', ru: 'Кардиолог', kz: 'Кардиолог' },
    { key: 'neurologist', ru: 'Невролог', kz: 'Невролог' },
    { key: 'ophthalmologist', ru: 'Офтальмолог', kz: 'Офтальмолог' },
    { key: 'dentist', ru: 'Стоматолог', kz: 'Стоматолог' },
    { key: 'endocrinologist', ru: 'Эндокринолог', kz: 'Эндокринолог' },
    { key: 'pediatrician', ru: 'Педиатр', kz: 'Педиатр' },
    { key: 'gynecologist', ru: 'Гинеколог', kz: 'Гинеколог' },
  ];

  const getSpecialtyLabel = (key: string) => {
    const found = specialties.find((s) => s.key === key);
    return found ? (isKz ? found.kz : found.ru) : key;
  };

  const getCityLabel = (cityId: string) => {
    const found = KZ_CITIES.find((c) => c.id === cityId);
    return found ? (isKz ? found.nameKz : found.nameRu) : cityId;
  };

  // Enriched & distance-sorted Hospitals
  const filteredHospitals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return KZ_HOSPITALS.filter((h) => {
      if (cityFilter !== 'all' && h.cityId !== cityFilter) return false;
      if (
        specialtyFilter !== 'all' &&
        !h.specialties.includes(specialtyFilter as DemoDoctor['specialty'])
      ) {
        return false;
      }
      if (onlyPilotClinics && !h.isPilotAiParticipant) return false;
      if (q) {
        const hay = `${h.nameRu} ${h.nameKz} ${h.addressRu} ${h.addressKz} ${getCityLabel(h.cityId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
      .map((h) => {
        const summary = getLiveRatingSummary(
          h.rating,
          h.reviewCount,
          h.reviews,
          customReviews[h.id] || []
        );
        const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng);
        return { hospital: h, summary, distanceKm };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [cityFilter, specialtyFilter, onlyPilotClinics, searchQuery, customReviews, userLocation, isKz]);

  // Enriched & distance-sorted Pharmacies across Kazakhstan
  const filteredPharmacies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DEMO_PHARMACIES.filter((ph) => {
      if (cityFilter !== 'all' && ph.cityId !== cityFilter) return false;
      if (mapLayer === '24h' && !ph.is24h) return false;
      if (q) {
        const hay = `${ph.nameRu} ${ph.nameKz} ${ph.addressRu} ${ph.addressKz} ${getCityLabel(ph.cityId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
      .map((ph) => {
        const summary = getLiveRatingSummary(
          ph.rating,
          ph.reviewCount,
          ph.reviews,
          customReviews[ph.id] || []
        );
        const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, ph.lat, ph.lng);
        return { pharmacy: ph, summary, distanceKm };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [cityFilter, mapLayer, searchQuery, customReviews, userLocation, isKz]);

  // Unified Map Items (Clinics + Pharmacies + OpenStreetMap Live finds) sorted by distance
  const mapItems: MapFacilityItem[] = useMemo(() => {
    const items: MapFacilityItem[] = [];

    if (mapLayer === 'all' || mapLayer === 'clinics') {
      filteredHospitals.forEach(({ hospital: h, summary, distanceKm }) => {
        items.push({
          id: h.id,
          kind: 'clinic',
          name: isKz ? h.nameKz : h.nameRu,
          subtitle: `${getCityLabel(h.cityId)} · ${isKz ? h.typeKz : h.typeRu}`,
          address: isKz ? h.addressKz : h.addressRu,
          phone: h.phone,
          lat: h.lat,
          lng: h.lng,
          distanceKm,
          photoUrl: h.photoUrl,
          rating: summary.rating,
          reviewCount: summary.reviewCount,
          isPilotAiParticipant: h.isPilotAiParticipant,
          cityId: h.cityId,
        });
      });
    }

    if (mapLayer === 'all' || mapLayer === 'pharmacies' || mapLayer === '24h') {
      filteredPharmacies.forEach(({ pharmacy: ph, summary, distanceKm }) => {
        items.push({
          id: ph.id,
          kind: 'pharmacy',
          name: isKz ? ph.nameKz : ph.nameRu,
          subtitle: `${getCityLabel(ph.cityId)} · ${ph.is24h ? '24/7' : isKz ? 'Дәріхана' : 'Аптека'}`,
          address: isKz ? ph.addressKz : ph.addressRu,
          phone: ph.phone,
          lat: ph.lat,
          lng: ph.lng,
          distanceKm,
          photoUrl: ph.photoUrl,
          rating: summary.rating,
          reviewCount: summary.reviewCount,
          is24h: ph.is24h,
          cityId: ph.cityId,
        });
      });
    }

    osmItems.forEach((osm) => {
      if (mapLayer === 'clinics' && osm.kind !== 'clinic') return;
      if (mapLayer === 'pharmacies' && osm.kind !== 'pharmacy') return;
      if (mapLayer === '24h' && (!osm.is24h || osm.kind !== 'pharmacy')) return;
      items.push({
        id: osm.id,
        kind: 'osm',
        osmSubKind: osm.kind,
        name: osm.name,
        subtitle:
          osm.kind === 'pharmacy'
            ? isKz
              ? 'OpenStreetMap · Дәріхана'
              : 'OpenStreetMap · Аптека рядом'
            : isKz
              ? 'OpenStreetMap · Клиника'
              : 'OpenStreetMap · Клиника рядом',
        address: osm.address || (isKz ? 'Қала картасы бойынша' : 'По данным OpenStreetMap'),
        phone: osm.phone || '',
        lat: osm.lat,
        lng: osm.lng,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, osm.lat, osm.lng),
        is24h: osm.is24h,
      });
    });

    return items.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [filteredHospitals, filteredPharmacies, osmItems, mapLayer, userLocation, isKz]);

  const activeDetailsTarget: FacilityDetailsTarget | null = useMemo(() => {
    if (!detailsModalId) return null;
    if (detailsModalId.kind === 'clinic') {
      const found = filteredHospitals.find((x) => x.hospital.id === detailsModalId.id) ||
        (() => {
          const h = KZ_HOSPITALS.find((item) => item.id === detailsModalId.id);
          if (!h) return null;
          return {
            hospital: h,
            summary: getLiveRatingSummary(h.rating, h.reviewCount, h.reviews, customReviews[h.id] || []),
            distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng),
          };
        })();
      if (!found) return null;
      const { hospital: h, summary, distanceKm } = found;
      return {
        id: h.id,
        kind: 'clinic',
        name: isKz ? h.nameKz : h.nameRu,
        subtitle: `${getCityLabel(h.cityId)} · ${isKz ? h.typeKz : h.typeRu}`,
        address: isKz ? h.addressKz : h.addressRu,
        phone: h.phone,
        photoUrl: h.photoUrl,
        rating: summary.rating,
        reviewCount: summary.reviewCount,
        distanceKm,
        reviews: summary.allReviews,
        hospital: h,
      };
    }

    const foundPh = filteredPharmacies.find((x) => x.pharmacy.id === detailsModalId.id) ||
      (() => {
        const ph = DEMO_PHARMACIES.find((item) => item.id === detailsModalId.id);
        if (!ph) return null;
        return {
          pharmacy: ph,
          summary: getLiveRatingSummary(ph.rating, ph.reviewCount, ph.reviews, customReviews[ph.id] || []),
          distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, ph.lat, ph.lng),
        };
      })();
    if (!foundPh) return null;
    const { pharmacy: ph, summary, distanceKm } = foundPh;
    return {
      id: ph.id,
      kind: 'pharmacy',
      name: isKz ? ph.nameKz : ph.nameRu,
      subtitle: `${getCityLabel(ph.cityId)} · ${ph.is24h ? '24/7' : isKz ? 'Дәріхана' : 'Аптека'}`,
      address: isKz ? ph.addressKz : ph.addressRu,
      phone: ph.phone,
      photoUrl: ph.photoUrl,
      rating: summary.rating,
      reviewCount: summary.reviewCount,
      distanceKm,
      reviews: summary.allReviews,
    };
  }, [detailsModalId, filteredHospitals, filteredPharmacies, customReviews, userLocation, isKz]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DEMO_DOCTORS.filter((d) => {
      if (cityFilter !== 'all' && d.cityId !== cityFilter) return false;
      if (specialtyFilter !== 'all' && d.specialty !== specialtyFilter) return false;
      if (q) {
        const hay = `${d.nameRu} ${d.nameKz} ${d.clinicRu} ${d.clinicKz} ${d.addressRu}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cityFilter, specialtyFilter, searchQuery]);

  // Smart recommendations based on active filters (or profile city)
  const recommendedHospitals = useMemo(() => {
    const byFilters = filteredHospitals.filter((x) => x.hospital.isTopRecommended);
    if (byFilters.length > 0) return byFilters.slice(0, 2);

    const targetCity = cityFilter !== 'all' ? cityFilter : activeProfile.cityId;
    const byProfileCity = KZ_HOSPITALS.filter(
      (h) =>
        h.cityId === targetCity &&
        (specialtyFilter === 'all' ||
          h.specialties.includes(specialtyFilter as DemoDoctor['specialty']))
    ).map((h) => ({
      hospital: h,
      summary: getLiveRatingSummary(h.rating, h.reviewCount, h.reviews, customReviews[h.id] || []),
      distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng),
    }));
    if (byProfileCity.length > 0) return byProfileCity.slice(0, 2);

    return filteredHospitals.slice(0, 2);
  }, [filteredHospitals, cityFilter, specialtyFilter, activeProfile.cityId, customReviews, userLocation]);

  const openHospitalBooking = (h: KzHospital, fromDetails = false) => {
    const defaultSpec =
      specialtyFilter !== 'all' && h.specialties.includes(specialtyFilter as DemoDoctor['specialty'])
        ? (specialtyFilter as DemoDoctor['specialty'])
        : h.specialties[0] || 'therapist';
    const methods = isKz ? h.bookingMethodsKz : h.bookingMethodsRu;
    setBookingReturnDetailsId(fromDetails ? h.id : null);
    setBookingSpecialty(defaultSpec);
    setBookingMethod(methods[0] || 'Damumed');
    setBookingTarget({
      title: isKz ? h.nameKz : h.nameRu,
      cityId: h.cityId,
      specialty: defaultSpec,
      clinicPhone: h.phone,
      address: isKz ? h.addressKz : h.addressRu,
      methods,
    });
  };

  const openDoctorBooking = (doc: DemoDoctor) => {
    const defaultMethods = isKz
      ? ['Damumed арқылы жазылу', 'Тіркеу орнынан кері қоңырау', 'МӘМС / ТМККК жолдамасы']
      : ['Запись через Damumed', 'Обратный звонок регистратуры', 'По направлению ОСМС / ГОБМП'];
    setBookingSpecialty(doc.specialty);
    setBookingMethod(defaultMethods[0]);
    setBookingTarget({
      title: `${isKz ? doc.nameKz : doc.nameRu} — ${isKz ? doc.clinicKz : doc.clinicRu}`,
      cityId: doc.cityId,
      specialty: doc.specialty,
      clinicPhone: doc.phone,
      address: isKz ? doc.addressKz : doc.addressRu,
      methods: defaultMethods,
    });
  };

  const focusFacilityOnMap = (id: string) => {
    setSelectedMapId(id);
    const el = document.getElementById('kz-medical-map');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTarget) return;
    const digits = patientPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      showToast(
        isKz ? 'Дұрыс телефон нөмірін енгізіңіз (+7...)' : 'Введите корректный номер телефона (+7...)',
        'warning'
      );
      return;
    }

    const req: BookingRequestItem = {
      id: `req-${Date.now()}`,
      institutionName: bookingTarget.title,
      cityLabel: getCityLabel(bookingTarget.cityId),
      specialtyLabel: getSpecialtyLabel(bookingSpecialty),
      phone: patientPhone.trim(),
      method: bookingMethod,
      date: bookingDate,
      note: bookingNote.trim(),
      clinicPhone: bookingTarget.clinicPhone,
    };
    setBookingRequests((prev) => [req, ...prev]);
    setBookingTarget(null);
    setBookingNote('');
    showToast(
      isKz
        ? 'Өтінім тіркелді! Нақты растау үшін клиника нөміріне қоңырау шалыңыз.'
        : 'Заявка оформлена! Для подтверждения времени вы также можете позвонить в клинику.',
      'success'
    );
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {isKz
              ? 'Қазақстанның үздік ауруханалары, дәріханалары және интерактивті карта'
              : 'Медучреждения, аптеки и интерактивная карта Казахстана'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'Нақты геолокация бойынша жақын клиникалар мен дәріханалар, фотосуреттер, пациент пікірлері және Damumed / МӘМС арқылы жазылу.'
              : 'Ближайшие клиники и аптеки относительно вашего местоположения по всему Казахстану: фото, отзывы пациентов, рейтинги и запись на приём.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleRequestGps}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>
              {gpsLoading
                ? isKz
                  ? 'Анықталуда...'
                  : 'Определяем...'
                : isKz
                  ? 'Менің геолокациямды анықтау'
                  : 'Определить моё местоположение'}
            </span>
          </button>

          {preselectedDoctorFilter && (
            <button
              type="button"
              onClick={() => {
                setPreselectedDoctorFilter(null);
                setCityFilter('all');
                setSpecialtyFilter('all');
              }}
              className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline px-2 py-1"
            >
              {isKz ? 'ИИ-сүзгіні тазалау' : 'Сбросить фильтр ИИ-терапевта'}
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKz ? 'Аурухана, дәріхана, көше...' : 'Больница, аптека или адрес...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => {
              const nextCity = e.target.value;
              setCityFilter(nextCity);
              if (nextCity !== 'all') {
                const found = KZ_CITIES.find((c) => c.id === nextCity);
                if (found) {
                  setUserLocation({
                    lat: found.lat,
                    lng: found.lng,
                    source: 'city',
                    label: isKz ? found.nameKz : found.nameRu,
                  });
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">{isKz ? 'Барлық қалалар (ҚР)' : 'Все города Казахстана'}</option>
            {KZ_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {isKz ? c.nameKz : c.nameRu}
              </option>
            ))}
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">{isKz ? 'Барлық мамандықтар' : 'Все специальности'}</option>
            {specialties.map((s) => (
              <option key={s.key} value={s.key}>
                {isKz ? s.kz : s.ru}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyPilotClinics}
              onChange={(e) => setOnlyPilotClinics(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>{isKz ? 'Тек ИИ-пилот клиникалары (35)' : 'Участники пилота ИИ-терапевта'}</span>
          </label>
        </div>
      </div>

      {/* Interactive Geolocation Map + Nearest Clinics & Pharmacies Sidebar */}
      <section id="kz-medical-map" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', ru: 'Все (Клиники и Аптеки)', kz: 'Барлығы (Клиника және Дәріхана)' },
                { id: 'clinics', ru: 'Только клиники', kz: 'Тек клиникалар' },
                { id: 'pharmacies', ru: 'Только аптеки', kz: 'Тек дәріханалар' },
                { id: '24h', ru: 'Аптеки 24/7', kz: 'Дәріханалар 24/7' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMapLayer(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  mapLayer === tab.id
                    ? 'bg-sky-600 text-white'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isKz ? tab.kz : tab.ru}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {userLocation.source === 'gps'
                ? isKz
                  ? `GPS нүктесі: ${userLocation.label}`
                  : `Точка GPS: ${userLocation.label}`
                : isKz
                  ? `Анықтау орталығы: ${userLocation.label}`
                  : `Центр отсчёта: ${userLocation.label}`}
            </span>
            <button
              type="button"
              onClick={() => fetchNearbyOsm(userLocation.lat, userLocation.lng)}
              disabled={osmLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold disabled:opacity-60"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>
                {osmLoading
                  ? isKz
                    ? 'OpenStreetMap іздеу...'
                    : 'Поиск в OpenStreetMap...'
                  : osmSearchedOnce
                    ? isKz
                      ? `OpenStreetMap жаңарту (${osmItems.length})`
                      : `Обновить OpenStreetMap (${osmItems.length})`
                    : isKz
                      ? 'Жақын маңды OSM-нен іздеу (5 км)'
                      : 'Найти вокруг в OpenStreetMap (5 км)'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-8">
            <KazakhstanMedicalMap
              items={mapItems}
              userLocation={userLocation}
              selectedId={selectedMapId}
              onSelectFacility={(item) => setSelectedMapId(item ? item.id : null)}
              onOpenReviews={(item) => {
                if (item.kind === 'clinic' || item.kind === 'pharmacy') {
                  setDetailsModalId({ id: item.id, kind: item.kind });
                }
              }}
              onJumpToCity={(city) => {
                setUserLocation({
                  lat: city.lat,
                  lng: city.lng,
                  source: 'city',
                  label: city.label,
                });
              }}
              onRequestGps={handleRequestGps}
              gpsLoading={gpsLoading}
              lang={lang}
              theme={theme}
              heightClass="h-[390px] sm:h-[460px] lg:h-[520px]"
            />
          </div>

          {/* Nearest Facilities Sorted List */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col max-h-[500px]">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {isKz ? 'Сізге ең жақын нысандар' : 'Ближайшие к вам'}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {mapItems.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
              {mapItems.slice(0, 16).map((item) => {
                const isSelected = selectedMapId === item.id;
                const isPharm = item.kind === 'pharmacy' || item.osmSubKind === 'pharmacy';
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 ring-1 ring-sky-300 dark:ring-sky-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMapId(item.id)}
                      className="w-full text-left flex items-start gap-2.5"
                    >
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span
                            className={`font-semibold truncate ${
                              isPharm
                                ? 'text-teal-700 dark:text-teal-400'
                                : item.kind === 'osm'
                                  ? 'text-indigo-700 dark:text-indigo-400'
                                  : 'text-sky-700 dark:text-sky-400'
                            }`}
                          >
                            {item.subtitle}
                          </span>
                          {typeof item.distanceKm === 'number' && (
                            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                              {item.distanceKm} км
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate">{item.address}</span>
                          {typeof item.rating === 'number' && (
                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                              ★ {item.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {item.kind !== 'osm' && (
                      <div className="mt-2 flex items-center gap-2 pl-14">
                        <button
                          type="button"
                          onClick={() =>
                            setDetailsModalId({
                              id: item.id,
                              kind: item.kind === 'pharmacy' ? 'pharmacy' : 'clinic',
                            })
                          }
                          className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>
                            {isKz ? 'Фото және пікірлер' : 'Фото и отзывы'} ({item.reviewCount ?? 0})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Filter-based Smart Recommendations Card */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {isKz ? 'Сіздің сүзгілеріңіз бойынша үздік ұсыныстар' : 'Рекомендации по выбранным фильтрам'}
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {cityFilter === 'all' ? getCityLabel(activeProfile.cityId) : getCityLabel(cityFilter)} ·{' '}
            {specialtyFilter === 'all'
              ? isKz
                ? 'Барлық бейіндер'
                : 'Многопрофильный приём'
              : getSpecialtyLabel(specialtyFilter)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedHospitals.map(({ hospital: h, summary, distanceKm }) => (
            <div
              key={h.id}
              className="rounded-xl border border-sky-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div className="flex flex-col sm:flex-row gap-3 p-4">
                <img
                  src={h.photoUrl}
                  alt={isKz ? h.nameKz : h.nameRu}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-28 h-32 sm:h-28 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {getCityLabel(h.cityId)} · {distanceKm} км
                    </span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                      ★ {summary.rating.toFixed(1)} ({summary.reviewCount})
                    </span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {isKz ? h.nameKz : h.nameRu}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isKz ? h.addressKz : h.addressRu} ·{' '}
                    <a
                      href={`tel:${h.phone.replace(/[^\d+]/g, '')}`}
                      className="font-mono text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      {h.phone}
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isKz ? 'Жазылу: ' : 'Запись: '}
                    {(isKz ? h.bookingMethodsKz : h.bookingMethodsRu).join(' · ')}
                  </p>
                </div>
              </div>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openHospitalBooking(h)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Телефон қалдырып жазылу' : 'Записаться по телефону'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalId({ id: h.id, kind: 'clinic' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Фото және пікірлер' : 'Фото и отзывы'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Submitted Booking Requests */}
      {bookingRequests.length > 0 && (
        <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{isKz ? 'Сіздің жазылу өтінімдеріңіз' : 'Ваши заявки на приём'}</span>
          </h2>
          <div className="space-y-2">
            {bookingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {req.institutionName} ({req.cityLabel})
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {req.specialtyLabel} · {req.date} · {req.method} · {isKz ? 'Сіздің нөміріңіз' : 'Ваш телефон'}:{' '}
                    <span className="font-mono font-semibold">{req.phone}</span>
                  </p>
                </div>
                <a
                  href={`tel:${req.clinicPhone.replace(/[^\d+]/g, '')}`}
                  className="font-mono font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  {req.clinicPhone}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Hospitals Across Kazakhstan Directory with Photos & Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {isKz
              ? `Қазақстанның жетекші ауруханалары (${filteredHospitals.length})`
              : `Ведущие больницы и медицинские центры РК (${filteredHospitals.length})`}
          </h2>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
            {isKz
              ? 'Таңдалған сүзгілер бойынша мекеме табылмады. Қала немесе мамандық сүзгісін өзгертіңіз.'
              : 'По выбранным фильтрам учреждения не найдены. Попробуйте сбросить город или специальность.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHospitals.map(({ hospital: h, summary, distanceKm }) => {
              const latestReview = summary.allReviews[0];
              return (
                <div
                  key={h.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={h.photoUrl}
                        alt={isKz ? h.nameKz : h.nameRu}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/75 text-white text-[11px] font-semibold backdrop-blur-xs">
                        {getCityLabel(h.cityId)} · {distanceKm} км
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>
                          {summary.rating.toFixed(1)} ({summary.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          {isKz ? h.typeKz : h.typeRu}
                        </span>
                        {h.isPilotAiParticipant && (
                          <span className="font-semibold text-sky-700 dark:text-sky-400">
                            {isKz ? 'ИИ-пилот (35 клиника)' : 'Пилот ИИ-терапевта'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        {isKz ? h.nameKz : h.nameRu}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p>{isKz ? h.addressKz : h.addressRu}</p>
                        <p>
                          <a
                            href={`tel:${h.phone.replace(/[^\d+]/g, '')}`}
                            className="font-mono font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                          >
                            {h.phone}
                          </a>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {isKz ? 'Мамандықтар: ' : 'Специальности: '}
                          {h.specialties.map((s) => getSpecialtyLabel(s)).join(', ')}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {isKz ? 'Қолжетімді жазылу: ' : 'Доступная запись: '}
                          {(isKz ? h.bookingMethodsKz : h.bookingMethodsRu).join(' · ')}
                        </p>
                      </div>

                      {latestReview && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {latestReview.author} · ★ {latestReview.rating}.0
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                            «{isKz ? latestReview.textKz : latestReview.textRu}»
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openHospitalBooking(h)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isKz ? 'Жазылу' : 'Записаться'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsModalId({ id: h.id, kind: 'clinic' })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {isKz ? 'Фото және пікірлер' : 'Фото и отзывы'} ({summary.reviewCount})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => focusFacilityOnMap(h.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{isKz ? 'Картада' : 'На карте'}</span>
                    </button>
                    <a
                      href={`tel:${h.phone.replace(/[^\d+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pharmacies Across Kazakhstan Directory with Photos & Reviews */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {isKz
                ? `Қазақстан бойынша дәріханалар (${filteredPharmacies.length})`
                : `Ближайшие аптеки по всему Казахстану (${filteredPharmacies.length})`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isKz
                ? 'Қалалар бойынша 24/7 дәріханалар, фотосуреттер және пациенттер пікірлері.'
                : 'Круглосуточные и районные аптеки по городам РК с фотографиями, расстоянием и отзывами.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('pharmacies')}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{isKz ? 'Барлық дәріханалар бөлімі' : 'Открыть отдельный каталог аптек'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPharmacies.map(({ pharmacy: ph, summary, distanceKm }) => (
            <div
              key={ph.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={ph.photoUrl}
                    alt={isKz ? ph.nameKz : ph.nameRu}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/75 text-white text-[11px] font-semibold">
                    {getCityLabel(ph.cityId)} · {distanceKm} км
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-bold">
                    ★ {summary.rating.toFixed(1)} ({summary.reviewCount})
                  </div>
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {ph.is24h ? '24/7' : '08:00–22:00'}
                    </span>
                    <a
                      href={`tel:${ph.phone.replace(/[^\d+]/g, '')}`}
                      className="font-mono text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      {ph.phone}
                    </a>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {isKz ? ph.nameKz : ph.nameRu}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isKz ? ph.addressKz : ph.addressRu}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsModalId({ id: ph.id, kind: 'pharmacy' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Фото және пікірлер' : 'Фото и отзывы'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => focusFacilityOnMap(ph.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isKz ? 'Картада' : 'На карте'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Pilot Project Showcase: Clinical AI Therapist in 35 Clinics */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-sky-50/70 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {isKz
                ? 'Қазақстан Республикасы · Пилоттық бағдарлама'
                : 'Республика Казахстан · Цифровая медицина'}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isKz
                ? '35 медициналық клиникада клиникалық AI-терапевті енгізу жөніндегі мемлекеттік пилоттық жоба'
                : 'Государственный пилотный проект по внедрению клинического ИИ-терапевта в 35 медицинских клиниках'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isKz
                ? 'Пилот аясында клиникалық AI-терапевт пациент шағымдарын алдын ала құрылымдап, дәрігерге бағыттауды жеделдетеді және екі тілде (KZ/RU) қауіпсіз профилактикалық ақпарат береді.'
                : 'В рамках пилотной архитектуры клинический ИИ-терапевт помогает поликлиникам и больницам предварительно структурировать жалобы пациента, оценивать красные флаги и направлять к нужному профильному специалисту до очного приёма.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('assistant')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <span>{isKz ? 'ИИ-терапевті іске қосу' : 'Пройти разбор у ИИ-терапевта'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PILOT_35_CLINICS_STATS.map((item) => (
            <div
              key={item.regionRu}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-1.5"
            >
              <p className="font-display text-2xl font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                {item.clinicsCount} {isKz ? 'клиника' : 'клиник'}
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {isKz ? item.regionKz : item.regionRu}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {isKz ? item.focusKz : item.focusRu}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Specialists (Demo) */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {isKz ? 'Бейінді дәрігерлер (Демо-үлгілер)' : 'Карточки профильных врачей (Демо-данные)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isKz
              ? 'Мамандардың үлгі тізімі танысу мақсатында көрсетілген.'
              : 'Карточки врачей представлены для демонстрации сценария выбора специалиста.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doc) => {
            const spec = specialties.find((s) => s.key === doc.specialty);
            const city = KZ_CITIES.find((c) => c.id === doc.cityId);
            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {isKz ? spec?.kz : spec?.ru} · {isKz ? city?.nameKz : city?.nameRu}
                    </p>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {isKz ? doc.nameKz : doc.nameRu}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {doc.experienceYears} {isKz ? 'жыл' : 'лет'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-medium">{isKz ? doc.clinicKz : doc.clinicRu}</p>
                  <p>
                    {isKz ? doc.addressKz : doc.addressRu} · {doc.hours}
                  </p>
                  <p className="font-mono">{doc.phone}</p>
                </div>

                <button
                  type="button"
                  onClick={() => openDoctorBooking(doc)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Қабылдауға сұраныс' : 'Записаться с номером телефона'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo & Reviews Modal */}
      <FacilityDetailsModal
        target={activeDetailsTarget}
        onClose={() => setDetailsModalId(null)}
        onSubmitReview={handleAddReview}
        onBookHospital={(h) => openHospitalBooking(h, true)}
        lang={lang}
      />

      {/* Booking Modal with Phone Number */}
      {bookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleConfirmBooking}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const retId = bookingReturnDetailsId;
                    setBookingTarget(null);
                    setBookingReturnDetailsId(null);
                    if (retId) {
                      setDetailsModalId({ id: retId, kind: 'clinic' });
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Артқа' : 'Назад'}</span>
                </button>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">
                  {isKz ? 'Қабылдауға жазылу' : 'Запись на приём'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingTarget(null);
                  setBookingReturnDetailsId(null);
                }}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">{bookingTarget.title}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {getCityLabel(bookingTarget.cityId)} · {bookingTarget.address}
              </p>
              <p className="font-mono text-sky-700 dark:text-sky-400">{bookingTarget.clinicPhone}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Сіздің телефон нөміріңіз *' : 'Ваш номер телефона *'}
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+7 (701) 123-45-67"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isKz ? 'Маман' : 'Специальность'}
                  </label>
                  <select
                    value={bookingSpecialty}
                    onChange={(e) => setBookingSpecialty(e.target.value as DemoDoctor['specialty'])}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  >
                    {specialties.map((s) => (
                      <option key={s.key} value={s.key}>
                        {isKz ? s.kz : s.ru}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isKz ? 'Күні' : 'Желаемая дата'}
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Жазылу тәсілі' : 'Способ записи'}
                </label>
                <select
                  value={bookingMethod}
                  onChange={(e) => setBookingMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                >
                  {bookingTarget.methods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isKz ? 'Шағым немесе түсініктеме' : 'Комментарий или симптомы'}
                </label>
                <textarea
                  rows={2}
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder={isKz ? 'Қысқаша себебі...' : 'Краткий комментарий для регистратуры...'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold"
            >
              {isKz ? 'Өтінімді жіберу' : 'Отправить заявку на запись'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export const EgovPage: React.FC = () => {
  const { lang, egov, connectEgovDemo, disconnectEgovDemo, activeProfile, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [step, setStep] = useState<'idle' | 'auth' | 'consent'>('idle');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.egov}
        </h1>
        <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold mt-1">
          {isKz
            ? 'Демонстрациялық режим · Мемлекеттік жүйелерге қосылмаған · ЖСН, құпиясөз, SMS немесе ЭЦҚ жиналмайды.'
            : 'Демонстрационный режим · Не подключено к государственным системам РК · Не собирает ИИН, пароли, SMS-коды или ЭЦП.'}
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Building2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {egov.connected
                ? isKz
                  ? 'eGov Демо қосылған (Тестілік деректер)'
                  : 'eGov Демо подключено (Тестовые данные)'
                : isKz
                  ? 'eGov жүйесіне қосылмаған'
                  : 'Статус: Не подключено к государственным системам'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isKz
                ? 'Ресми келісімдер мен API алынғанда OAuth 2.0 / eGov Mobile интеграциясына дайын сәулет.'
                : 'Архитектура подготовлена для будущей официальной интеграции при наличии соглашений и разрешений.'}
            </p>
          </div>
        </div>

        {!egov.connected ? (
          <button
            type="button"
            onClick={() => setStep('auth')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            {isKz ? 'eGov қосу (Демо)' : 'Подключить eGov (Демо)'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              disconnectEgovDemo();
              setStep('idle');
              showToast(isKz ? 'eGov демо өшірілді' : 'eGov Демо отключено', 'info');
            }}
            className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold whitespace-nowrap shrink-0"
          >
            {isKz ? 'Өшіру' : 'Отключить'}
          </button>
        )}
      </div>

      {/* Demo Auth & Consent Steps */}
      {!egov.connected && step === 'auth' && (
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? '1-қадам: Демонстрациялық авторизация экраны' : 'Шаг 1: Демонстрационный экран авторизации'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isKz
              ? 'Қауіпсіздік талабына сәйкес бұл демо-қадамда ЖСН, SMS-код немесе ЭЦҚ сұралмайды. Тестілік сессияны жалғастыру үшін батырманы басыңыз.'
              : 'В целях безопасности в демонстрационном режиме не запрашиваются ИИН, пароли, SMS-коды и ключи ЭЦП. Нажмите «Продолжить» для перехода к экрану согласия.'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('consent')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
            >
              {isKz ? 'Келісім экранына өту' : 'Перейти к экрану согласия'}
            </button>
            <button
              type="button"
              onClick={() => setStep('idle')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {!egov.connected && step === 'consent' && (
        <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold">
              {isKz ? '2-қадам: Деректерді өңдеуге келісім' : 'Шаг 2: Согласие на обработку данных (Демо)'}
            </h2>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>{isKz ? 'Тестілік медициналық профильді қарау' : 'Просмотр демонстрационной карточки прикрепления'}</li>
            <li>{isKz ? 'Электрондық үлгі құжаттарды көрсету' : 'Отображение тестовых электронных справок'}</li>
            <li>{isKz ? 'Рұқсаттарды кез келген уақытта қайтарып алу мүмкіндігі' : 'Возможность мгновенно отозвать доступ'}</li>
          </ul>
          <button
            type="button"
            onClick={() => {
              connectEgovDemo();
              setStep('idle');
              showToast(isKz ? 'Демо-келісім берілді' : 'Демо-согласие активировано', 'success');
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
          >
            {isKz ? 'Келісімді растау (Демо)' : 'Подтвердить согласие (Демо)'}
          </button>
        </div>
      )}

      {egov.connected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {isKz ? 'Медициналық профиль (Демо-деректер)' : 'Медицинский профиль (Тестовые данные)'}
            </h2>
            <div className="text-xs sm:text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <p><strong>{isKz ? 'Пациент' : 'Пациент'}:</strong> {activeProfile.name}</p>
              <p><strong>{isKz ? 'Тіркелген емхана' : 'Поликлиника прикрепления (Демо)'}:</strong> №7 Қалалық емхана · {activeProfile.region}</p>
              <p><strong>{isKz ? 'Мәртебесі' : 'Статус ОСМС (Демо)'}:</strong> {isKz ? 'Тестілік сақтандырылған үлгі' : 'Демо-статус: Застрахован (тест)'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {isKz ? 'Электрондық құжаттар (Демо)' : 'Электронные документы (Демо)'}
            </h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                <span>{isKz ? 'Екпе паспорты (Үлгі)' : 'Паспорт здоровья / вакцинации (Тест)'}</span>
                <span className="text-teal-600 font-semibold">PDF Demo</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                <span>{isKz ? 'Диспансерлік бақылау анықтамасы (Үлгі)' : 'Справка о профилактическом осмотре (Тест)'}</span>
                <span className="text-teal-600 font-semibold">Demo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Logs */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
          {isKz ? 'Рұқсаттар тарихы' : 'История разрешений и согласий'}
        </h2>
        {egov.permissionLogs.length === 0 ? (
          <p className="text-xs text-slate-500">{t.common.noData}</p>
        ) : (
          <div className="space-y-2">
            {egov.permissionLogs.map((log) => (
              <div
                key={log.id}
                className="text-xs flex flex-wrap justify-between gap-2 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {isKz ? log.actionKz : log.actionRu}
                </span>
                <span className="font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleString(isKz ? 'kk-KZ' : 'ru-RU')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const DamumedPage: React.FC = () => {
  const { lang } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.routes.damumed}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Қазақстандағы медициналық көмек алу тәртібі туралы ақпараттық нұсқаулық.'
            : 'Информационный справочник по получению медицинской помощи в Республике Казахстан.'}
        </p>
      </div>

      <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-4 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span>
          {isKz
            ? 'DermaSense AI ресми келісімсіз Damumed жүйесімен тікелей интеграцияланбаған. Төмендегі сілтеме ресми ресурсқа бағыттайды.'
            : 'DermaSense AI не заявляет о прямой технической интеграции с Damumed без официального подключения. Кнопка ниже ведёт на официальный ресурс.'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isKz ? 'Тіркелген емхана және Damumed' : 'Поликлиника по месту прикрепления'}
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                {isKz
                  ? 'Алғашқы тексеру үшін тіркелген емханадағы учаскелік дәрігерге (ЖПД/терапевт) жазылыңыз.'
                  : 'Для первичного осмотра обратитесь к участковому врачу (ВОП/терапевту) в поликлинике прикрепления.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                {isKz
                  ? 'Damumed қосымшасы арқылы қабылдауға жазылуға, талдау нәтижелерін көруге және дәрігер шақыруға болады.'
                  : 'В приложении Damumed доступна запись на приём, просмотр направлений и результатов обследований.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                {isKz
                  ? 'Тері мәселелері кезінде жолдама бойынша дерматолог кеңесіне және скринингтерге барыңыз.'
                  : 'При кожных жалобах врач поликлиники выдаёт направление к профильному дерматологу и на профилактические обследования.'}
              </span>
            </li>
          </ul>
          <a
            href="https://damumed.kz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            <span>{isKz ? 'Ресми Damumed сайтына өту' : 'Перейти на официальный сайт Damumed'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <img
            src="/src/assets/images/feature_kazakhstan_health_1795355229560.jpg"
            alt="Kazakhstan medical center"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover min-h-[240px]"
          />
        </div>
      </div>
    </div>
  );
};

export const PharmaciesPage: React.FC = () => {
  const { lang, theme, activeProfile, showToast } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const [cityId, setCityId] = useState('all');
  const [only24h, setOnly24h] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [customReviews, setCustomReviews] = useState<CustomReviewsMap>(() => loadCustomReviews());
  const [modalPharmacyId, setModalPharmacyId] = useState<string | null>(null);
  const [osmPharmacies, setOsmPharmacies] = useState<OsmMedicalItem[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const initialCity = useMemo(
    () => KZ_CITIES.find((c) => c.id === activeProfile.cityId) || KZ_CITIES[0],
    [activeProfile.cityId]
  );

  const [userLocation, setUserLocation] = useState<UserGeoLocation>({
    lat: initialCity.lat,
    lng: initialCity.lng,
    source: 'city',
    label: isKz ? initialCity.nameKz : initialCity.nameRu,
  });

  useEffect(() => {
    if (userLocation.source === 'gps') return;
    const targetCity =
      cityId !== 'all' ? KZ_CITIES.find((c) => c.id === cityId) || initialCity : initialCity;
    setUserLocation({
      lat: targetCity.lat,
      lng: targetCity.lng,
      source: 'city',
      label: isKz ? targetCity.nameKz : targetCity.nameRu,
    });
  }, [cityId, initialCity, isKz, userLocation.source]);

  const fetchOsmPharmacies = useCallback(
    async (lat: number, lng: number, quiet = false) => {
      setOsmLoading(true);
      try {
        const res = await fetch(`/api/nearby-medical?lat=${lat}&lng=${lng}&radius=5000`);
        if (!res.ok) throw new Error('OSM unavailable');
        const data = (await res.json()) as { source: string; items: OsmMedicalItem[] };
        const onlyPh = (data.items || []).filter((i) => i.kind === 'pharmacy');
        setOsmPharmacies(onlyPh);
        if (!quiet) {
          showToast(
            onlyPh.length > 0
              ? isKz
                ? `OpenStreetMap-тан ${onlyPh.length} дәріхана табылды`
                : `Найдено ${onlyPh.length} аптек рядом в OpenStreetMap`
              : isKz
                ? 'Қазақстан дәріханаларының базасы көрсетілуде'
                : 'Отображается база аптек Казахстана',
            onlyPh.length > 0 ? 'success' : 'info'
          );
        }
      } catch {
        if (!quiet) {
          showToast(
            isKz ? 'Демо-каталог дәріханалары көрсетілуде' : 'Отображается каталог аптек РК',
            'info'
          );
        }
      } finally {
        setOsmLoading(false);
      }
    },
    [isKz, showToast]
  );

  const handleRequestGps = useCallback(() => {
    if (!navigator.geolocation) {
      showToast(
        isKz ? 'Браузер геолокацияны қолдамайды' : 'Геолокация не поддерживается браузером',
        'warning'
      );
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          source: 'gps',
          label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        setGpsLoading(false);
        showToast(
          isKz ? 'GPS орныңыз анықталды!' : 'Текущее местоположение (GPS) определено!',
          'success'
        );
        fetchOsmPharmacies(latitude, longitude, true);
      },
      () => {
        setGpsLoading(false);
        showToast(
          isKz ? 'GPS рұқсаты берілмеді' : 'Доступ к GPS отклонён',
          'warning'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [fetchOsmPharmacies, isKz, showToast]);

  const handleAddReview = useCallback(
    (facilityId: string, author: string, rating: number, text: string) => {
      const review: FacilityReview = {
        id: `usr-phrev-${Date.now()}`,
        author,
        rating,
        date: new Date().toISOString().slice(0, 10),
        textRu: text,
        textKz: text,
        isUserCreated: true,
      };
      setCustomReviews((prev) => {
        const next = { ...prev, [facilityId]: [review, ...(prev[facilityId] || [])] };
        saveCustomReviews(next);
        return next;
      });
      showToast(isKz ? 'Пікіріңіз сақталды!' : 'Ваш отзыв о аптеке сохранён!', 'success');
    },
    [isKz, showToast]
  );

  const enrichedPharmacies = useMemo(() => {
    return DEMO_PHARMACIES.filter((p) => {
      if (cityId !== 'all' && p.cityId !== cityId) return false;
      if (only24h && !p.is24h) return false;
      return true;
    })
      .map((ph) => ({
        pharmacy: ph,
        summary: getLiveRatingSummary(ph.rating, ph.reviewCount, ph.reviews, customReviews[ph.id] || []),
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, ph.lat, ph.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [cityId, only24h, customReviews, userLocation]);

  const mapItems: MapFacilityItem[] = useMemo(() => {
    const base: MapFacilityItem[] = enrichedPharmacies.map(({ pharmacy: ph, summary, distanceKm }) => {
      const city = KZ_CITIES.find((c) => c.id === ph.cityId);
      return {
        id: ph.id,
        kind: 'pharmacy',
        name: isKz ? ph.nameKz : ph.nameRu,
        subtitle: `${city ? (isKz ? city.nameKz : city.nameRu) : ph.cityId} · ${ph.is24h ? '24/7' : '08:00–22:00'}`,
        address: isKz ? ph.addressKz : ph.addressRu,
        phone: ph.phone,
        lat: ph.lat,
        lng: ph.lng,
        distanceKm,
        photoUrl: ph.photoUrl,
        rating: summary.rating,
        reviewCount: summary.reviewCount,
        is24h: ph.is24h,
        cityId: ph.cityId,
      };
    });

    osmPharmacies.forEach((osm) => {
      if (only24h && !osm.is24h) return;
      base.push({
        id: osm.id,
        kind: 'osm',
        osmSubKind: 'pharmacy',
        name: osm.name,
        subtitle: isKz ? 'OpenStreetMap · Дәріхана' : 'OpenStreetMap · Аптека рядом',
        address: osm.address || (isKz ? 'Карта деректері' : 'По данным OpenStreetMap'),
        phone: osm.phone || '',
        lat: osm.lat,
        lng: osm.lng,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, osm.lat, osm.lng),
        is24h: osm.is24h,
      });
    });

    return base.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [enrichedPharmacies, osmPharmacies, only24h, userLocation, isKz]);

  const modalTarget: FacilityDetailsTarget | null = useMemo(() => {
    if (!modalPharmacyId) return null;
    const ph = DEMO_PHARMACIES.find((p) => p.id === modalPharmacyId);
    if (!ph) return null;
    const city = KZ_CITIES.find((c) => c.id === ph.cityId);
    const summary = getLiveRatingSummary(ph.rating, ph.reviewCount, ph.reviews, customReviews[ph.id] || []);
    return {
      id: ph.id,
      kind: 'pharmacy',
      name: isKz ? ph.nameKz : ph.nameRu,
      subtitle: `${city ? (isKz ? city.nameKz : city.nameRu) : ph.cityId} · ${ph.is24h ? '24/7' : '08:00–22:00'}`,
      address: isKz ? ph.addressKz : ph.addressRu,
      phone: ph.phone,
      photoUrl: ph.photoUrl,
      rating: summary.rating,
      reviewCount: summary.reviewCount,
      distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, ph.lat, ph.lng),
      reviews: summary.allReviews,
    };
  }, [modalPharmacyId, customReviews, userLocation, isKz]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t.routes.pharmacies}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isKz
              ? 'Қазақстан бойынша дәріханалардың интерактивті картасы, фотосуреттер және пациент пікірлері (ойдан шығарылған бағасыз).'
              : 'Интерактивная карта аптек по всему Казахстану: ближайшие пункты к вашему GPS, фото, рейтинги и отзывы (без вымышленных цен).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={cityId}
            onChange={(e) => {
              const next = e.target.value;
              setCityId(next);
              if (next !== 'all') {
                const found = KZ_CITIES.find((c) => c.id === next);
                if (found) {
                  setUserLocation({
                    lat: found.lat,
                    lng: found.lng,
                    source: 'city',
                    label: isKz ? found.nameKz : found.nameRu,
                  });
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
          >
            <option value="all">{isKz ? 'Барлық қалалар (ҚР)' : 'Все города Казахстана'}</option>
            {KZ_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {isKz ? c.nameKz : c.nameRu}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={only24h}
              onChange={(e) => setOnly24h(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>24/7</span>
          </label>

          <button
            type="button"
            onClick={() => fetchOsmPharmacies(userLocation.lat, userLocation.lng)}
            disabled={osmLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>{osmLoading ? '...' : isKz ? 'OSM дәріханалар' : 'Найти рядом (OSM)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {enrichedPharmacies.map(({ pharmacy: ph, summary, distanceKm }) => {
            const city = KZ_CITIES.find((c) => c.id === ph.cityId);
            const active = selectedPharmacyId === ph.id;
            return (
              <div
                key={ph.id}
                className={`rounded-2xl border overflow-hidden transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedPharmacyId(ph.id)}
                  className="w-full text-left flex gap-3 p-3.5"
                >
                  <img
                    src={ph.photoUrl}
                    alt={isKz ? ph.nameKz : ph.nameRu}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        {ph.is24h ? '24/7' : '08:00–22:00'} · {distanceKm} км
                      </span>
                      <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                        ★ {summary.rating.toFixed(1)} ({summary.reviewCount})
                      </span>
                    </div>
                    <p className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {isKz ? ph.nameKz : ph.nameRu}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {isKz ? city?.nameKz : city?.nameRu} · {isKz ? ph.addressKz : ph.addressRu}
                    </p>
                    <p className="text-xs font-mono text-slate-500">{ph.phone}</p>
                  </div>
                </button>
                <div className="px-3.5 pb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setModalPharmacyId(ph.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isKz ? 'Фото және пікірлер' : 'Фото и отзывы'}</span>
                  </button>
                  <a
                    href={`tel:${ph.phone.replace(/[^\d+]/g, '')}`}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    {isKz ? 'Қоңырау шалу' : 'Позвонить'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          <KazakhstanMedicalMap
            items={mapItems}
            userLocation={userLocation}
            selectedId={selectedPharmacyId}
            onSelectFacility={(item) => setSelectedPharmacyId(item ? item.id : null)}
            onOpenReviews={(item) => {
              if (item.kind === 'pharmacy') setModalPharmacyId(item.id);
            }}
            onJumpToCity={(city) => {
              setUserLocation({
                lat: city.lat,
                lng: city.lng,
                source: 'city',
                label: city.label,
              });
            }}
            onRequestGps={handleRequestGps}
            gpsLoading={gpsLoading}
            lang={lang}
            theme={theme}
            heightClass="h-[400px] sm:h-[470px] lg:h-[540px]"
          />
        </div>
      </div>

      <FacilityDetailsModal
        target={modalTarget}
        onClose={() => setModalPharmacyId(null)}
        onSubmitReview={handleAddReview}
        lang={lang}
      />
    </div>
  );
};

export const EmergencyPage: React.FC = () => {
  const { lang, navigate } = useHealth();
  const isKz = lang === 'kz';
  const t = UI_TEXT[lang];

  const protocols = isKz
    ? [
        {
          title: 'Анафилаксия / беттің ісінуі / тыныстың тарылуы',
          steps: 'Дереу 103 немесе 112 нөміріне қоңырау шалыңыз. Қысатын киімді шешіңіз, тыныш отырыңыз немесе жатыңыз.',
        },
        {
          title: 'Терінің ауыр күйігі',
          steps: 'Күйген жерді 15–20 минут салқын (мұзды емес!) ағынды сумен салқындатыңыз. Май немесе жақпа жақпаңыз.',
        },
        {
          title: 'Жоғары қызумен қатар жүретін ауыр бөртпе',
          steps: 'Өздігінен дәрі қабылдамаңыз, жедел жәрдем шақырыңыз немесе кезекші стационарға жүгініңіз.',
        },
      ]
    : [
        {
          title: 'Отёк лица/горла или затруднение дыхания',
          steps: 'Немедленно нажмите 103 или 112 (вызов совершается только вами). Расстегните тесную одежду, обеспечьте доступ воздуха.',
        },
        {
          title: 'Термический или солнечный ожог с пузырями',
          steps: 'Охлаждайте участок прохладной (не ледяной) водой 15–20 минут. Не наносите масло, сметану или жирные кремы.',
        },
        {
          title: 'Высокая температура и быстро распространяющаяся сыпь',
          steps: 'Не занимайтесь самолечением — вызовите 103 и дождитесь осмотра бригады или врача стационара.',
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-rose-700 dark:text-rose-400">
          {t.routes.emergency}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isKz
            ? 'Қазақстан Республикасы бойынша шұғыл қызметтер. Қоңырау тек сіз басқанда басталады.'
            : 'Единые номера экстренной помощи в Казахстане. Вызов запускается только по вашему нажатию.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="tel:103"
          className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-medium text-rose-100">
              {isKz ? 'Жедел медициналық жәрдем' : 'Скорая медицинская помощь'}
            </p>
            <p className="font-mono text-4xl font-extrabold mt-1">103</p>
          </div>
          <PhoneCall className="w-8 h-8" />
        </a>

        <a
          href="tel:112"
          className="rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white p-6 flex items-center justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-medium text-slate-300">
              {isKz ? 'Бірыңғай шұғыл қызмет' : 'Единая дежурно-диспетчерская служба'}
            </p>
            <p className="font-mono text-4xl font-extrabold mt-1">112</p>
          </div>
          <Phone className="w-8 h-8" />
        </a>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          {isKz ? 'Алғашқы көмек жөніндегі нұсқаулықтар' : 'Памятка первой помощи'}
        </h2>
        <div className="space-y-3">
          {protocols.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.title}</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{p.steps}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('doctors')}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isKz ? 'Медициналық мекемені табу' : 'Найти медицинское учреждение'}
        </button>
      </div>
    </div>
  );
};
