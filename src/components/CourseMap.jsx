import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { addTileLayer, createNumberIcon } from '../features/maps/leaflet';

export function CourseMap({ course, activeStep, onSelectStep = () => {} }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const activeCourseRef = useRef(null);

  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: false });
    const points = course.steps.map(({ lat, lng }) => [lat, lng]);
    addTileLayer(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersRef.current = course.steps.map((step, index) =>
      L.marker([step.lat, step.lng], {
        icon: createNumberIcon(index + 1, index === 0),
      })
        .addTo(map)
        .bindTooltip(step.name, { direction: 'top', offset: [0, -36] })
        .on('click', () => onSelectStep(index)),
    );
    L.polyline(points, {
      color: '#ea580c',
      weight: 5,
      opacity: 0.82,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    map.fitBounds(L.latLngBounds(points).pad(0.25));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [course, onSelectStep]);

  useEffect(() => {
    const map = mapRef.current;
    const step = course.steps[activeStep];
    markersRef.current.forEach((marker, index) => {
      marker.setIcon(createNumberIcon(index + 1, index === activeStep));
      marker.setZIndexOffset(index === activeStep ? 1000 : 0);
    });
    const courseChanged = activeCourseRef.current !== course.id;
    activeCourseRef.current = course.id;
    if (!map) return;
    if (courseChanged) {
      const points = course.steps.map(({ lat, lng }) => [lat, lng]);
      map.fitBounds(L.latLngBounds(points).pad(0.25));
    } else {
      map.flyTo([step.lat, step.lng], 15, { duration: 0.75 });
    }
  }, [activeStep, course]);

  return <div ref={containerRef} className="course-map" aria-label="추천 코스 지도" />;
}
