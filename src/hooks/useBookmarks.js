import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  saveBookmark,
  subscribeToBookmarkCounts,
  subscribeToBookmarks,
} from '../services/firestoreService';

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
  const [bookmarkCounts, setBookmarkCounts] = useState(new Map());
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

  useEffect(() => {
    let unsubscribe = () => {};
    subscribeToBookmarkCounts('post', setBookmarkCounts, () => {})
      .then((listener) => { unsubscribe = listener; })
      .catch(() => {});
    return () => unsubscribe();
  }, []);

  const toggleBookmark = useCallback((postId) => {
    const saved = bookmarkIds.includes(postId);
    const next = saved
      ? bookmarkIds.filter((id) => id !== postId)
      : [...bookmarkIds, postId];
    const delta = saved ? -1 : 1;
    setStore({ key, ids: next });
    setBookmarkCounts((current) => {
      const updated = new Map(current);
      const count = current.get(String(postId)) ?? 0;
      updated.set(String(postId), Math.max(0, count + delta));
      return updated;
    });
    if (userId) {
      saveBookmark(userId, postId, !saved).then(({ count }) => {
        setBookmarkCounts((current) => new Map(current).set(String(postId), count));
      }).catch(() => {
        setStore({ key, ids: bookmarkIds });
        setBookmarkCounts((current) => {
          const updated = new Map(current);
          const count = current.get(String(postId)) ?? 0;
          updated.set(String(postId), Math.max(0, count - delta));
          return updated;
        });
      });
    } else {
      localStorage.setItem(key, JSON.stringify(next));
    }
  }, [bookmarkIds, key, userId]);

  const bookmarkedIds = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  return { bookmarkIds, bookmarkedIds, bookmarkCounts, toggleBookmark };
}
