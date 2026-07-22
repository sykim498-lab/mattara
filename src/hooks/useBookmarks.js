import { useCallback, useEffect, useMemo, useState } from 'react';
import { saveBookmark, subscribeToBookmarks } from '../services/firestoreService';

function storageKey(userId) {
  return `mattara.bookmarks.v1.${userId ?? 'guest'}`;
}

function readBookmarks(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function useBookmarks(user) {
  const userId = user?.uid;
  const key = storageKey(userId);
  const [store, setStore] = useState(() => ({ key, ids: readBookmarks(key) }));
  const bookmarkIds = store.key === key ? store.ids : readBookmarks(key);

  useEffect(() => {
    if (!userId) {
      const sync = (event) => {
        if (event.key === key) setStore({ key, ids: readBookmarks(key) });
      };
      window.addEventListener('storage', sync);
      return () => window.removeEventListener('storage', sync);
    }

    let active = true;
    let unsubscribe = () => {};
    subscribeToBookmarks(userId, (ids) => {
      if (active) setStore({ key, ids });
    }, () => {}).then((nextUnsubscribe) => {
      if (active) unsubscribe = nextUnsubscribe;
      else nextUnsubscribe();
    }).catch(() => {});
    return () => {
      active = false;
      unsubscribe();
    };
  }, [key, userId]);

  const toggleBookmark = useCallback((postId) => {
    const saved = bookmarkIds.includes(postId);
    const next = saved
      ? bookmarkIds.filter((id) => id !== postId)
      : [...bookmarkIds, postId];
    setStore({ key, ids: next });
    if (userId) {
      saveBookmark(userId, postId, !saved).catch(() => setStore({ key, ids: bookmarkIds }));
    } else {
      localStorage.setItem(key, JSON.stringify(next));
    }
  }, [bookmarkIds, key, userId]);

  const bookmarkedIds = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  return { bookmarkIds, bookmarkedIds, toggleBookmark };
}
