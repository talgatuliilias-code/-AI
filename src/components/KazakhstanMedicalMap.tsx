import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  Camera,
  Car,
  ExternalLink,
  Footprints,
  Globe2,
  Layers,
  LocateFixed,
  Minus,
  Navigation,
  Phone,
  Plus,
  Route,
  Star,
  X,
} from 'lucide-react';

export interface MapFacilityItem {
  id: string;
  kind: 'clinic' | 'pharmacy' | 'osm';
  osmSubKind?: 'clinic' | 'pharmacy';
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  is24h?: boolean;
  isPilotAiParticipant?: boolean;
  cityId?: string;
}

export interface UserGeoLocation {
  lat: number;
  lng: number;
  source: 'gps' | 'city';
  label: string;
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

type MapStyleMode = 'street' | 'satellite' | 'dark';

interface ActiveRouteState {
  targetId: string;
  mode: 'driving' | 'walking';
  coordinates: Array<[number, number]>;
  distanceKm: number;
  durationMinutes: number;
  source: 'osrm' | 'direct';
}

interface KazakhstanMedicalMapProps {
  items: MapFacilityItem[];
  userLocation: UserGeoLocation;
  selectedId: string | null;
  onSelectFacility: (item: MapFacilityItem | null) => void;
  onOpenReviews?: (item: MapFacilityItem) => void;
  onRequestGps?: () => void;
  onJumpToCity?: (city: { id: string; lat: number; lng: number; label: string }) => void;
  gpsLoading?: boolean;
  lang: 'ru' | 'kz';
  theme: 'light' | 'dark';
  heightClass?: string;
}

const KZ_CENTER: [number, number] = [48.0196, 66.9237];

const QUICK_CITIES = [
  { id: 'almaty', ru: 'Алматы', kz: 'Алматы', lat: 43.2389, lng: 76.8897 },
  { id: 'astana', ru: 'Астана', kz: 'Астана', lat: 51.1605, lng: 71.4704 },
  { id: 'shymkent', ru: 'Шымкент', kz: 'Шымкент', lat: 42.3417, lng: 69.5901 },
  { id: 'karaganda', ru: 'Караганда', kz: 'Қарағанды', lat: 49.8047, lng: 73.1094 },
  { id: 'aktobe', ru: 'Актобе', kz: 'Ақтөбе', lat: 50.2839, lng: 57.167 },
  { id: 'atyrau', ru: 'Атырау', kz: 'Атырау', lat: 47.0945, lng: 51.9238 },
  { id: 'aktau', ru: 'Актау', kz: 'Ақтау', lat: 43.6532, lng: 51.1975 },
  { id: 'pavlodar', ru: 'Павлодар', kz: 'Павлодар', lat: 52.2873, lng: 76.9674 },
  { id: 'oskemen', ru: 'Усть-Каменогорск', kz: 'Өскемен', lat: 49.9483, lng: 82.6285 },
];

function createFacilityPin(item: MapFacilityItem, isSelected: boolean): L.DivIcon {
  const isPharmacy =
    item.kind === 'pharmacy' || (item.kind === 'osm' && item.osmSubKind === 'pharmacy');
  const isOsm = item.kind === 'osm';

  let bg = '#1a73e8'; // Crisp Google Maps blue for hospitals/clinics
  if (isOsm) {
    bg = isPharmacy ? '#0d9488' : '#6366f1';
  } else if (isPharmacy) {
    bg = '#0f9d58'; // Crisp green for pharmacies
  }

  const size = isSelected ? 40 : 32;
  const shadow = isSelected
    ? '0 0 0 4px rgba(26,115,232,0.32), 0 8px 18px rgba(15,23,42,0.42)'
    : '0 4px 10px rgba(15,23,42,0.32)';

  const glyph = isPharmacy
    ? `<svg width="${isSelected ? 18 : 14}" height="${isSelected ? 18 : 14}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`
    : `<svg width="${isSelected ? 18 : 14}" height="${isSelected ? 18 : 14}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;

  // Teardrop Google-Maps-inspired pin + smooth pointer stem
  return L.divIcon({
    className: 'dermasense-map-marker',
    html: `<div style="position:relative;width:${size}px;height:${size + 7}px;display:flex;flex-direction:column;align-items:center;">
      <div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};border:2.5px solid #ffffff;box-shadow:${shadow};display:flex;align-items:center;justify-content:center;">${glyph}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${bg};margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.22));"></div>
    </div>`,
    iconSize: [size, size + 7],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 6)],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'dermasense-user-marker',
    html: `<div class="dermasense-user-ring" style="width:20px;height:20px;border-radius:9999px;background:#10b981;border:3px solid #ffffff;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

function isSafeImageUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('/src/assets/') || url.startsWith('https://');
}

function buildPopupElement(
  item: MapFacilityItem,
  lang: 'ru' | 'kz',
  onOpenReviews?: (item: MapFacilityItem) => void,
  onBuildRoute?: (item: MapFacilityItem) => void,
  onBackToMap?: () => void
): HTMLElement {
  const isKz = lang === 'kz';
  const root = document.createElement('div');
  root.className = 'w-[225px] sm:w-[240px] space-y-2 text-slate-900 font-sans';

  if (isSafeImageUrl(item.photoUrl)) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'w-full h-24 rounded-lg overflow-hidden bg-slate-100';
    const img = document.createElement('img');
    img.src = item.photoUrl!;
    img.alt = item.name;
    img.className = 'w-full h-full object-cover';
    imgWrap.appendChild(img);
    root.appendChild(imgWrap);
  }

  const metaRow = document.createElement('div');
  metaRow.className = 'flex items-center justify-between gap-2 text-[11px] font-semibold';

  const typeSpan = document.createElement('span');
  typeSpan.className =
    item.kind === 'pharmacy' || item.osmSubKind === 'pharmacy'
      ? 'text-emerald-700'
      : item.kind === 'osm'
        ? 'text-indigo-700'
        : 'text-sky-700';
  typeSpan.textContent = item.subtitle;
  metaRow.appendChild(typeSpan);

  if (typeof item.distanceKm === 'number') {
    const distSpan = document.createElement('span');
    distSpan.className = 'text-slate-600 font-mono shrink-0';
    distSpan.textContent = `${item.distanceKm} км`;
    metaRow.appendChild(distSpan);
  }
  root.appendChild(metaRow);

  const titleEl = document.createElement('p');
  titleEl.className = 'text-xs font-bold text-slate-900 leading-snug m-0';
  titleEl.textContent = item.name;
  root.appendChild(titleEl);

  if (typeof item.rating === 'number') {
    const ratingEl = document.createElement('p');
    ratingEl.className = 'text-[11px] font-semibold text-amber-600 m-0';
    const revWord = isKz ? 'пікір' : 'отз.';
    ratingEl.textContent = `★ ${item.rating.toFixed(1)}${
      typeof item.reviewCount === 'number' ? ` (${item.reviewCount} ${revWord})` : ''
    }`;
    root.appendChild(ratingEl);
  }

  if (item.address) {
    const addrEl = document.createElement('p');
    addrEl.className = 'text-[11px] text-slate-600 m-0 leading-snug';
    addrEl.textContent = item.address;
    root.appendChild(addrEl);
  }

  const actions = document.createElement('div');
  actions.className = 'flex gap-1.5 pt-1';

  if (onBuildRoute) {
    const routeBtn = document.createElement('button');
    routeBtn.type = 'button';
    routeBtn.className =
      'flex-1 px-2 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold cursor-pointer border-0';
    routeBtn.textContent = isKz ? 'Бағыт' : 'Маршрут';
    routeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onBuildRoute(item);
    });
    actions.appendChild(routeBtn);
  }

  if (onOpenReviews && item.kind !== 'osm') {
    const revBtn = document.createElement('button');
    revBtn.type = 'button';
    revBtn.className =
      'flex-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer border-0';
    revBtn.textContent = isKz ? 'Фото/пікір' : 'Фото и отзывы';
    revBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenReviews(item);
    });
    actions.appendChild(revBtn);
  }

  if (onBackToMap) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className =
      'px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer border-0';
    backBtn.textContent = isKz ? '← Артқа' : '← Назад';
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onBackToMap();
    });
    actions.appendChild(backBtn);
  }

  if (actions.childNodes.length > 0) {
    root.appendChild(actions);
  }

  return root;
}

export const KazakhstanMedicalMap: React.FC<KazakhstanMedicalMapProps> = ({
  items,
  userLocation,
  selectedId,
  onSelectFacility,
  onOpenReviews,
  onRequestGps,
  onJumpToCity,
  gpsLoading = false,
  lang,
  theme,
  heightClass = 'h-[430px] sm:h-[480px] lg:h-[540px]',
}) => {
  const isKz = lang === 'kz';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayersRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const prevLocationKeyRef = useRef<string>('');
  const prevViewRef = useRef<{ center: L.LatLng; zoom: number } | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleMode>(() =>
    theme === 'dark' ? 'dark' : 'street'
  );
  const [activeRoute, setActiveRoute] = useState<ActiveRouteState | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Sync default street/dark when app theme toggles unless user explicitly picked satellite
  useEffect(() => {
    setMapStyle((prev) => {
      if (prev === 'satellite') return 'satellite';
      return theme === 'dark' ? 'dark' : 'street';
    });
  }, [theme]);

  const selectedItem = useMemo(
    () => (selectedId ? items.find((i) => i.id === selectedId) || null : null),
    [items, selectedId]
  );

  const onSelectRef = useRef(onSelectFacility);
  const onOpenReviewsRef = useRef(onOpenReviews);
  const handleBackToMapRef = useRef<() => void>(() => {});
  useEffect(() => {
    onSelectRef.current = onSelectFacility;
    onOpenReviewsRef.current = onOpenReviews;
  }, [onSelectFacility, onOpenReviews]);

  const handleBackToMap = useCallback(() => {
    const map = mapRef.current;
    map?.closePopup();
    setActiveRoute(null);
    onSelectRef.current(null);
    if (map && prevViewRef.current) {
      map.flyTo(prevViewRef.current.center, prevViewRef.current.zoom, { duration: 0.6 });
      prevViewRef.current = null;
    }
  }, []);

  useEffect(() => {
    handleBackToMapRef.current = handleBackToMap;
  }, [handleBackToMap]);

  const handleBuildRoute = useCallback(
    async (target: MapFacilityItem, mode: 'driving' | 'walking' = 'driving') => {
      setRouteLoading(true);
      try {
        const res = await fetch(
          `/api/route?fromLat=${userLocation.lat}&fromLng=${userLocation.lng}&toLat=${target.lat}&toLng=${target.lng}&mode=${mode}`
        );
        const data = (await res.json()) as {
          source?: 'osrm' | 'direct';
          distanceMeters?: number;
          durationSeconds?: number;
          coordinates?: Array<[number, number]>;
        };

        const coords =
          data.coordinates && data.coordinates.length >= 2
            ? data.coordinates
            : ([
                [userLocation.lat, userLocation.lng],
                [target.lat, target.lng],
              ] as Array<[number, number]>);

        const directKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          target.lat,
          target.lng
        );
        const distanceKm = data.distanceMeters
          ? Math.round((data.distanceMeters / 1000) * 10) / 10
          : directKm;
        const speedKmh = mode === 'walking' ? 4.8 : 34;
        const durationMinutes = data.durationSeconds
          ? Math.max(1, Math.round(data.durationSeconds / 60))
          : Math.max(1, Math.round((distanceKm / speedKmh) * 60));

        setActiveRoute({
          targetId: target.id,
          mode,
          coordinates: coords,
          distanceKm,
          durationMinutes,
          source: data.source === 'osrm' ? 'osrm' : 'direct',
        });

        const map = mapRef.current;
        if (map && coords.length >= 2) {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [48, 70], maxZoom: 15, animate: true });
        }
      } catch {
        const directKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          target.lat,
          target.lng
        );
        setActiveRoute({
          targetId: target.id,
          mode,
          coordinates: [
            [userLocation.lat, userLocation.lng],
            [target.lat, target.lng],
          ],
          distanceKm: directKm,
          durationMinutes: Math.max(1, Math.round((directKm / (mode === 'walking' ? 4.8 : 34)) * 60)),
          source: 'direct',
        });
      } finally {
        setRouteLoading(false);
      }
    },
    [userLocation.lat, userLocation.lng]
  );

  const handleBuildRouteRef = useRef(handleBuildRoute);
  useEffect(() => {
    handleBuildRouteRef.current = handleBuildRoute;
  }, [handleBuildRoute]);

  // Initialize Leaflet map once with smooth zoom/touch behavior
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: userLocation.source === 'gps' ? 13 : 12,
      zoomControl: false, // We provide crisp floating Google-Maps-style +/- controls
      scrollWheelZoom: true,
      tapTolerance: 20,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    const baseLayers = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    const userLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    baseLayersRef.current = baseLayers;
    routeLayerRef.current = routeLayer;
    markersLayerRef.current = markersLayer;
    userLayerRef.current = userLayer;
    prevLocationKeyRef.current = `${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)},${userLocation.source}`;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 180);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
      baseLayersRef.current = null;
      routeLayerRef.current = null;
      markersLayerRef.current = null;
      userLayerRef.current = null;
      markerMapRef.current.clear();
    };
  }, []);

  // Update Tile Layers (Street / Satellite / Dark) cleanly
  useEffect(() => {
    const baseLayers = baseLayersRef.current;
    if (!baseLayers) return;

    baseLayers.clearLayers();

    if (mapStyle === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery',
        }
      ).addTo(baseLayers);

      // Crisp city/road label overlay so Satellite stays readable like Google Maps Hybrid
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }
      ).addTo(baseLayers);
    } else if (mapStyle === 'dark') {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(baseLayers);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(baseLayers);
    }
  }, [mapStyle]);

  // Render User GPS / Reference Beacon + Radius ring
  useEffect(() => {
    const map = mapRef.current;
    const userLayer = userLayerRef.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();

    L.circle([userLocation.lat, userLocation.lng], {
      radius: userLocation.source === 'gps' ? 900 : 2000,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '5 5',
    }).addTo(userLayer);

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserLocationIcon(),
      zIndexOffset: 950,
    });

    const popupNode = document.createElement('div');
    popupNode.className = 'text-xs font-sans text-slate-900 space-y-0.5';
    const b = document.createElement('p');
    b.className = 'font-bold m-0 text-emerald-700';
    b.textContent =
      userLocation.source === 'gps'
        ? isKz
          ? 'Сіздің нақты GPS орныңыз'
          : 'Ваше местоположение (GPS)'
        : isKz
          ? 'Таңдалған қала орталығы'
          : 'Центр выбранного города';
    const sub = document.createElement('p');
    sub.className = 'm-0 text-slate-600';
    sub.textContent = userLocation.label;
    popupNode.appendChild(b);
    popupNode.appendChild(sub);

    userMarker.bindPopup(popupNode);
    userMarker.addTo(userLayer);

    const key = `${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)},${userLocation.source}`;
    if (prevLocationKeyRef.current !== key) {
      prevLocationKeyRef.current = key;
      map.flyTo([userLocation.lat, userLocation.lng], userLocation.source === 'gps' ? 14 : 12, {
        duration: 0.85,
      });
    }
  }, [userLocation, isKz]);

  // Render Active Route Polyline (Google Maps blue route with white border casing)
  useEffect(() => {
    const routeLayer = routeLayerRef.current;
    if (!routeLayer) return;

    routeLayer.clearLayers();
    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    L.polyline(activeRoute.coordinates, {
      color: '#ffffff',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeLayer);

    L.polyline(activeRoute.coordinates, {
      color: activeRoute.mode === 'walking' ? '#0f9d58' : '#1a73e8',
      weight: 5,
      opacity: 0.95,
      dashArray: activeRoute.mode === 'walking' ? '6 8' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeLayer);
  }, [activeRoute]);

  // Render Facility Markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    items.forEach((item) => {
      const isSelected = item.id === selectedId;
      const marker = L.marker([item.lat, item.lng], {
        icon: createFacilityPin(item, isSelected),
        zIndexOffset: isSelected ? 850 : item.kind === 'osm' ? 120 : 420,
      });

      const popupEl = buildPopupElement(
        item,
        lang,
        (clicked) => onOpenReviewsRef.current?.(clicked),
        (clicked) => handleBuildRouteRef.current(clicked, 'driving'),
        () => handleBackToMapRef.current()
      );
      marker.bindPopup(popupEl, { maxWidth: 265 });

      marker.on('click', () => {
        const map = mapRef.current;
        if (map && !prevViewRef.current) {
          prevViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
        }
        onSelectRef.current(item);
      });

      marker.addTo(layer);
      markerMapRef.current.set(item.id, marker);
    });
  }, [items, selectedId, lang]);

  // Center map smoothly when selectedId changes externally
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedId) {
      return;
    }
    const target = items.find((i) => i.id === selectedId);
    if (!target) return;

    if (!prevViewRef.current) {
      prevViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
    }

    if (!activeRoute || activeRoute.targetId !== selectedId) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 13), { duration: 0.65 });
    }
  }, [selectedId, items, activeRoute]);

  const handleShowAllKazakhstan = () => {
    setActiveRoute(null);
    mapRef.current?.flyTo(KZ_CENTER, 5, { duration: 0.9 });
  };

  const handleCycleStyle = () => {
    setMapStyle((prev) =>
      prev === 'street' ? 'satellite' : prev === 'satellite' ? 'dark' : 'street'
    );
  };

  const styleLabel =
    mapStyle === 'satellite'
      ? isKz
        ? 'Спутник'
        : 'Спутник'
      : mapStyle === 'dark'
        ? isKz
          ? 'Түн'
          : 'Тёмная'
        : isKz
          ? 'Схема'
          : 'Схема';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Quick City Jump Strip (like Google Maps top quick chips) */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={handleShowAllKazakhstan}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-sky-500 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
        >
          <Globe2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{isKz ? 'Бүкіл ҚР' : 'Весь РК'}</span>
        </button>

        {QUICK_CITIES.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => {
              setActiveRoute(null);
              mapRef.current?.flyTo([city.lat, city.lng], 12, { duration: 0.8 });
              onJumpToCity?.({
                id: city.id,
                lat: city.lat,
                lng: city.lng,
                label: isKz ? city.kz : city.ru,
              });
            }}
            className="px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-400 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 transition-colors"
          >
            {isKz ? city.kz : city.ru}
          </button>
        ))}
      </div>

      {/* Map Canvas + Google-Maps-Style Floating Controls & Bottom Card */}
      <div className="relative z-0 w-full">
        <div ref={containerRef} className={`w-full ${heightClass}`} />

        {/* Right Floating Controls Dock (Zoom, GPS, Satellite/Street Layer Switcher) */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCycleStyle}
            title={isKz ? 'Карта түрін ауыстыру' : 'Сменить слой карты (Схема / Спутник / Ночь)'}
            className="px-2.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{styleLabel}</span>
          </button>

          {onRequestGps && (
            <button
              type="button"
              onClick={onRequestGps}
              disabled={gpsLoading}
              aria-label={isKz ? 'Менің GPS орным' : 'Моё местоположение GPS'}
              className={`w-10 h-10 self-end rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border shadow-md flex items-center justify-center transition-colors ${
                userLocation.source === 'gps'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <LocateFixed className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <div className="self-end flex flex-col rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Zoom in"
              className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Zoom out"
              className="w-10 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top-Left Back Button when a Hospital/Pharmacy is Selected */}
        {selectedItem && !(activeRoute && activeRoute.targetId === selectedItem.id) && (
          <button
            type="button"
            onClick={handleBackToMap}
            className="absolute top-3 left-3 z-[400] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{isKz ? 'Картаға оралу' : 'Назад к карте'}</span>
          </button>
        )}

        {/* Active Route Banner (Driving / Walking ETA + Back) */}
        {activeRoute && selectedItem && activeRoute.targetId === selectedItem.id && (
          <div className="absolute top-3 left-3 z-[400] max-w-[calc(100%-6.5rem)] rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-300 dark:border-sky-700 shadow-lg px-2.5 py-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleBackToMap}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{isKz ? 'Артқа' : 'Назад'}</span>
            </button>

            <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400">
              <Route className="w-4 h-4 shrink-0" />
              <span>
                {activeRoute.distanceKm} км · ~{activeRoute.durationMinutes}{' '}
                {isKz ? 'мин' : 'мин'}
              </span>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => handleBuildRoute(selectedItem, 'driving')}
                aria-label="Driving route"
                className={`p-1 rounded-md ${
                  activeRoute.mode === 'driving'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleBuildRoute(selectedItem, 'walking')}
                aria-label="Walking route"
                className={`p-1 rounded-md ${
                  activeRoute.mode === 'walking'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveRoute(null)}
                aria-label="Close route"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Google-Maps-Style Bottom Preview Card for Selected Pin */}
        {selectedItem && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl p-3 sm:p-3.5">
            <div className="flex items-start gap-3">
              {isSafeImageUrl(selectedItem.photoUrl) && (
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 truncate">
                      {selectedItem.subtitle}
                      {typeof selectedItem.distanceKm === 'number'
                        ? ` · ${selectedItem.distanceKm} км`
                        : ''}
                    </p>
                    <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {selectedItem.name}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToMap}
                    aria-label={isKz ? 'Артқа қайту' : 'Назад к карте'}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold shrink-0 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isKz ? 'Артқа' : 'Назад'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {typeof selectedItem.rating === 'number' && (
                    <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {selectedItem.rating.toFixed(1)} ({selectedItem.reviewCount ?? 0})
                    </span>
                  )}
                  <span className="truncate">{selectedItem.address}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={routeLoading}
                    onClick={() => handleBuildRoute(selectedItem, 'driving')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>
                      {routeLoading
                        ? '...'
                        : isKz
                          ? 'Бағыт салу'
                          : 'Маршрут'}
                    </span>
                  </button>

                  {onOpenReviews && selectedItem.kind !== 'osm' && (
                    <button
                      type="button"
                      onClick={() => onOpenReviews(selectedItem)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-[11px] font-semibold"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{isKz ? 'Фото/пікір' : 'Фото и отзывы'}</span>
                    </button>
                  )}

                  {selectedItem.phone && (
                    <a
                      href={`tel:${selectedItem.phone.replace(/[^\d+]/g, '')}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-[11px] font-semibold"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{isKz ? 'Қоңырау' : 'Позвонить'}</span>
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 text-[11px] font-semibold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Legend Strip */}
      <div className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] inline-block" />
            {isKz ? 'Клиникалар' : 'Клиники'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0f9d58] inline-block" />
            {isKz ? 'Дәріханалар' : 'Аптеки'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            OpenStreetMap
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            {isKz ? 'Сіз' : 'Вы'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {isKz ? 'Қабат: Схема · Спутник · Бағыттар' : 'Режимы: Схема · Спутник · Маршруты'}
        </span>
      </div>
    </div>
  );
};
