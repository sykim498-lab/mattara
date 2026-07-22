import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { addTileLayer, createPlaceIcon } from '../features/maps/leaflet';

export function DetailMap({ post, imageIndex }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const center = post.images[0];
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [center.lat, center.lng],
      16,
    );
    addTileLayer(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const marker = L.marker([center.lat, center.lng], {
      icon: createPlaceIcon(),
    }).addTo(map);
    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [post]);

  useEffect(() => {
    const image = post.images[imageIndex];
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker
      .setLatLng([image.lat, image.lng])
      .bindPopup(`<b>${post.name}</b><br>사진 ${imageIndex + 1}의 위치`)
      .openPopup();
    map.flyTo([image.lat, image.lng], 16, { duration: 0.65 });
  }, [imageIndex, post]);

  return <div ref={containerRef} className="map" aria-label={`${post.name} 지도`} />;
}
