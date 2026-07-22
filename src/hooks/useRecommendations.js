import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearPreferences,
  PREFERENCE_EVENT,
  rankPostsForUser,
  readPreferences,
  recordPostInteraction,
  recordTagSelection,
} from '../services/preferenceCookie';

export function useRecommendations(posts) {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    const refresh = () => setPreferences(readPreferences());
    window.addEventListener(PREFERENCE_EVENT, refresh);
    return () => window.removeEventListener(PREFERENCE_EVENT, refresh);
  }, []);

  const recommendedPosts = useMemo(
    () => rankPostsForUser(posts, preferences),
    [posts, preferences],
  );
  const hasHistory = preferences.recentViews.length > 0
    || Object.keys(preferences.tagScores).length > 0;
  const record = useCallback((post, type) => {
    recordPostInteraction(post, type);
  }, []);
  const reset = useCallback(() => clearPreferences(), []);
  const recordTags = useCallback((tags) => recordTagSelection(tags), []);

  return {
    recommendedPosts,
    hasHistory,
    tagScores: preferences.tagScores,
    record,
    recordTags,
    reset,
  };
}
