import { useCallback, useEffect, useMemo, useState } from 'react';

function storageKey(user) {
  return `mattara.bookmarks.v1.${user?.id ?? 'guest'}`;
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
  const key = storageKey(user);
  const [store, setStore] = useState(() => ({ key, ids: readBookmarks(key) }));
  const bookmarkIds = store.key === key ? store.ids : readBookmarks(key);

  useEffect(() => {
    const sync = (event) => {
      if (event.key === key) setStore({ key, ids: readBookmarks(key) });
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);

  const toggleBookmark = useCallback((postId) => {
    setStore((currentStore) => {
      const current = currentStore.key === key ? currentStore.ids : readBookmarks(key);
      const next = current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId];
      localStorage.setItem(key, JSON.stringify(next));
      return { key, ids: next };
    });
  }, [key]);

  const bookmarkedIds = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  return { bookmarkIds, bookmarkedIds, toggleBookmark };
}
