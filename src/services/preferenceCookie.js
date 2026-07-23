import { isGuryeCourse } from '../features/region/gurye';

const COOKIE_NAME = 'mattara_preferences_v1';
const TAG_SCORES_KEY = 'mattara.gurye.tag-scores.v1';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
export const PREFERENCE_EVENT = 'mattara-preferences-change';

const EMPTY_PREFERENCES = { tagScores: {}, regionScores: {}, recentViews: [] };

function readCookiePreferences() {
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return EMPTY_PREFERENCES;
  try {
    const saved = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)));
    return {
      tagScores: saved.tagScores ?? {},
      regionScores: saved.regionScores ?? {},
      recentViews: saved.recentViews ?? [],
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
}

export function readLocalTagScores() {
  try {
    return JSON.parse(localStorage.getItem(TAG_SCORES_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function readPreferences() {
  const cookiePreferences = readCookiePreferences();
  const localScores = readLocalTagScores();
  const tags = new Set([...Object.keys(cookiePreferences.tagScores), ...Object.keys(localScores)]);
  const tagScores = Object.fromEntries(
    [...tags].map((tag) => [
      tag,
      (cookiePreferences.tagScores[tag] ?? 0) + (localScores[tag] ?? 0),
    ]),
  );
  return { ...cookiePreferences, tagScores };
}

function writePreferences(preferences) {
  const value = encodeURIComponent(JSON.stringify(preferences));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export function recordPostInteraction(post, type = 'view') {
  const preferences = readCookiePreferences();
  const weight = type === 'bookmark' ? 3 : 1;
  const tagScores = { ...preferences.tagScores };
  post.tags.forEach((tag) => {
    tagScores[tag] = Math.min((tagScores[tag] ?? 0) + weight, 30);
  });
  const regionScores = { ...preferences.regionScores };
  const region = post.region ?? '전라남도 구례군';
  regionScores[region] = Math.min((regionScores[region] ?? 0) + weight, 30);
  const recentViews = [post.id, ...preferences.recentViews.filter((id) => id !== post.id)]
    .slice(0, 12);
  writePreferences({ tagScores, regionScores, recentViews });
}

export function recordTagSelection(tags) {
  if (!tags.length) return;
  const scores = { ...readLocalTagScores() };
  tags.forEach((tag) => {
    scores[tag] = Math.min((scores[tag] ?? 0) + 2, 40);
  });
  localStorage.setItem(TAG_SCORES_KEY, JSON.stringify(scores));
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export function rankRelatedCourses(courses, source, preferences = readPreferences()) {
  const sourceTags = new Set(source?.tags ?? []);
  return courses
    .filter((course) => isGuryeCourse(course) && course.id !== source?.id)
    .map((course) => {
      const relatedTagCount = course.tags.filter((tag) => sourceTags.has(tag)).length;
      const preferenceScore = course.tags.reduce(
        (score, tag) => score + Math.min(preferences.tagScores[tag] ?? 0, 6),
        0,
      );
      return { course, score: relatedTagCount * 12 + Math.min(preferenceScore, 18) };
    })
    .sort((a, b) => b.score - a.score || a.course.number - b.course.number)
    .map(({ course }) => course);
}

export function clearPreferences() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
  localStorage.removeItem(TAG_SCORES_KEY);
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}
