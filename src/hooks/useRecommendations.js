import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearPreferences,
  PREFERENCE_EVENT,
  rankRelatedCourses,
  readPreferences,
  recordPostInteraction,
  recordTagSelection,
} from '../services/preferenceCookie';

export function useRecommendations(courses, activePost) {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    const refresh = () => setPreferences(readPreferences());
    window.addEventListener(PREFERENCE_EVENT, refresh);
    return () => window.removeEventListener(PREFERENCE_EVENT, refresh);
  }, []);

  const relatedCourses = useMemo(
    () => activePost
      ? rankRelatedCourses(courses, activePost, preferences).slice(0, 3)
      : [],
    [activePost, courses, preferences],
  );
  const hasHistory = preferences.recentViews.length > 0
    || Object.keys(preferences.tagScores).length > 0;
  const record = useCallback((post, type) => {
    recordPostInteraction(post, type);
  }, []);
  const reset = useCallback(() => clearPreferences(), []);
  const recordTags = useCallback((tags) => recordTagSelection(tags), []);

  return {
    relatedCourses,
    hasHistory,
    record,
    recordTags,
    reset,
  };
}
