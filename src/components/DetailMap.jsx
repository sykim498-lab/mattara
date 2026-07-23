import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { addTileLayer, createPlaceIcon } from '../features/maps/leaflet';

export function DetailMap({ post, imageIndex }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeRef = useRef(null);

  useEffect(() => {
    const points = post.images
      .filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng))
      .map(({ lat, lng }) => [lat, lng]);
    if (!points.length) return undefined;
    const center = points[0];
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      center,
      16,
    );
    addTileLayer(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const marker = L.marker(center, {
      icon: createPlaceIcon(),
    }).addTo(map);
    if (points.length > 1) {
      routeRef.current = L.polyline(points, {
        color: '#ea580c',
        weight: 5,
        opacity: 0.78,
      }).addTo(map);
      map.fitBounds(L.latLngBounds(points).pad(0.2));
    }
    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      routeRef.current = null;
      mapRef.current = null;
    };
  }, [post]);

  useEffect(() => {
    const image = post.images[imageIndex];
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !Number.isFinite(image.lat) || !Number.isFinite(image.lng)) return;
    const popup = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = image.title || image.name || post.name;
    popup.appendChild(heading);
    const address = image.address || post.address;
    if (address) {
      const addressNode = document.createElement('div');
      addressNode.textContent = address;
      popup.appendChild(addressNode);
    }
    const description = image.description || image.comment;
    if (description) {
      const descriptionNode = document.createElement('div');
      descriptionNode.textContent = description;
      popup.appendChild(descriptionNode);
    }
    marker
      .setLatLng([image.lat, image.lng])
      .bindPopup(popup)
      .openPopup();
    map.flyTo([image.lat, image.lng], 16, { duration: 0.65 });
  }, [imageIndex, post]);

  return <div ref={containerRef} className="map" aria-label={`${post.name} 지도`} />;
}
