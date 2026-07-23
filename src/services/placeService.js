const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
let lastLookupAt = 0;

function firstValue(tags, keys) {
  return keys.map((key) => tags[key]).find(Boolean) ?? '';
}

export async function lookupPlaceDetails(name, address) {
  if (!name.trim() || !address.trim()) {
    throw new Error('맛집 이름과 주소를 먼저 입력해 주세요.');
  }
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
    source: 'OpenStreetMap',
  };
}
