import { isGuryeCourse } from '../features/region/gurye';
import { guryeCourses } from './guryeCourses';

const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return value * (Math.PI / 180);
}

function distanceBetween(a, b) {
  const lat = toRadians(b.lat - a.lat);
  const lng = toRadians(b.lng - a.lng);
  const value = Math.sin(lat / 2) ** 2
    + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat))
    * Math.sin(lng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function routeDistance(steps) {
  const straightDistance = steps.slice(1).reduce(
    (total, step, index) => total + distanceBetween(steps[index], step),
    0,
  );
  return Math.max(1, Math.round(straightDistance * 1.28));
}

export function courseScore(course, tagScores = {}) {
  return course.tags.reduce((score, tag) => score + (tagScores[tag] ?? 0), 0);
}

export function createCourses(tagScores = {}, sourceCourses = guryeCourses) {
  return sourceCourses
    .filter(isGuryeCourse)
    .map((course) => ({
      ...course,
      distance: `차량 약 ${routeDistance(course.steps)}km`,
      recommendationScore: courseScore(course, tagScores),
      matchedTags: course.tags.filter((tag) => (tagScores[tag] ?? 0) > 0),
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore || a.number - b.number);
}
