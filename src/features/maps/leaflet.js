import L from 'leaflet';

export function addTileLayer(map) {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);
}

export function createNumberIcon(number, active = false) {
  const size = active ? 42 : 34;
  return L.divIcon({
    className: '',
    html: `<div class="number-marker${active ? ' active' : ''}"><span>${number}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

export function createPlaceIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="place-marker">●</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 32],
  });
}
