import { firebaseConfig } from './firebase';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const GOOGLE_SCRIPT_ID = 'mattara-google-maps';
const GOOGLE_MAPS_API_KEY = import.meta.env.MODE === 'test'
  ? ''
  : import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || firebaseConfig.apiKey;
let googleMapsPromise;
let lastLookupAt = 0;

function firstValue(tags, keys) {
  return keys.map((key) => tags[key]).find(Boolean) ?? '';
}

function loadGooglePlaces() {
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error('Google Maps API key not configured'));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    const callback = `__mattaraGoogleMaps${Date.now()}`;
    window[callback] = () => {
      delete window[callback];
      resolve(window.google.maps);
    };
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&libraries=places&language=ko&region=KR&callback=${callback}`;
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.append(script);
  });
  return googleMapsPromise;
}

async function lookupGooglePlace(name, address) {
  const maps = await loadGooglePlaces();
  const { Place } = await maps.importLibrary('places');
  const { places } = await Place.searchByText({
    textQuery: `${name.trim()} ${address.trim()}`,
    fields: [
      'id', 'location', 'nationalPhoneNumber', 'regularOpeningHours',
      'googleMapsURI', 'websiteURI',
    ],
    language: 'ko',
    region: 'kr',
    maxResultCount: 1,
  });
  const place = places[0];
  if (!place) throw new Error('Google Places에서 일치하는 장소를 찾지 못했습니다.');
  return {
    hours: place.regularOpeningHours?.weekdayDescriptions?.join(' / ') ?? '',
    phone: place.nationalPhoneNumber ?? '',
    website: place.websiteURI ?? '',
    lat: place.location?.lat() ?? null,
    lng: place.location?.lng() ?? null,
    placeId: place.id ?? '',
    googleMapsUri: place.googleMapsURI ?? '',
    source: 'Google Places',
  };
}

async function lookupOpenStreetMap(name, address) {
  const elapsed = Date.now() - lastLookupAt;
  if (elapsed < 1000) await new Promise((resolve) => window.setTimeout(resolve, 1000 - elapsed));
  lastLookupAt = Date.now();
  const url = new URL(NOMINATIM_URL);
  url.search = new URLSearchParams({
    q: `${name.trim()}, ${address.trim()}`,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'kr',
    addressdetails: '1',
    extratags: '1',
  }).toString();
  const response = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
  if (!response.ok) throw new Error('공개 장소 정보를 불러오지 못했습니다.');
  const [place] = await response.json();
  if (!place) throw new Error('일치하는 공개 장소 정보를 찾지 못했습니다.');
  const tags = place.extratags ?? {};
  return {
    hours: firstValue(tags, ['opening_hours']),
    phone: firstValue(tags, ['phone', 'contact:phone', 'telephone']),
    website: firstValue(tags, ['website', 'contact:website']),
    lat: Number(place.lat) || null,
    lng: Number(place.lon) || null,
    placeId: '',
    googleMapsUri: '',
    source: 'OpenStreetMap',
  };
}

export async function lookupPlaceDetails(name, address) {
  if (!name.trim() || !address.trim()) {
    throw new Error('맛집 이름과 주소를 먼저 입력해 주세요.');
  }
  if (GOOGLE_MAPS_API_KEY) {
    try {
      return await lookupGooglePlace(name, address);
    } catch {
      return lookupOpenStreetMap(name, address);
    }
  }
  return lookupOpenStreetMap(name, address);
}

function locationText(place) {
  if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
    return `${place.lat},${place.lng}`;
  }
  return [place.name, place.address].filter(Boolean).join(' ');
}

export function buildDirectionsUrl(place) {
  const params = new URLSearchParams({
    api: '1',
    destination: locationText(place),
    travelmode: 'driving',
  });
  if (place.placeId) params.set('destination_place_id', place.placeId);
  return `https://www.google.com/maps/dir/?${params}`;
}

export function buildCourseDirectionsUrl(steps) {
  const route = steps.filter(Boolean);
  if (!route.length) return buildDirectionsUrl({ name: '구례' });
  const params = new URLSearchParams({
    api: '1',
    destination: locationText(route.at(-1)),
    travelmode: 'driving',
  });
  const waypoints = route.slice(0, -1).map(locationText).filter(Boolean);
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params}`;
}
