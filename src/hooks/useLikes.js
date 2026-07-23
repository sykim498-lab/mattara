import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  saveLike,
  subscribeToLikeCounts,
  subscribeToLikes,
} from '../services/firestoreService';

function storageKey(userId) {
  return `mattara.likes.v1.${userId ?? 'guest'}`;
}

function readLikes(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function itemKey(itemType, itemId) {
  return `${itemType}_${itemId}`;
}

export function useLikes(user) {
  const userId = user?.uid;
  const key = storageKey(userId);
  const [store, setStore] = useState(() => ({ key, ids: readLikes(key) }));
  const [likeCounts, setLikeCounts] = useState(new Map());
  const likeIds = store.key === key ? store.ids : readLikes(key);

  useEffect(() => {
    if (!userId) return undefined;
    let unsubscribe = () => {};
    subscribeToLikes(userId, (ids) => setStore({ key, ids }), () => {})
      .then((listener) => { unsubscribe = listener; })
      .catch(() => {});
    return () => unsubscribe();
  }, [key, userId]);

  useEffect(() => {
    let unsubscribe = () => {};
    subscribeToLikeCounts(setLikeCounts, () => {})
      .then((listener) => { unsubscribe = listener; })
      .catch(() => {});
    return () => unsubscribe();
  }, []);

  const toggleLike = useCallback((itemType, itemId) => {
    const id = itemKey(itemType, itemId);
    const liked = likeIds.includes(id);
    const next = liked ? likeIds.filter((value) => value !== id) : [...likeIds, id];
    const delta = liked ? -1 : 1;
    setStore({ key, ids: next });
    setLikeCounts((counts) => {
      const updated = new Map(counts);
      updated.set(id, Math.max(0, (counts.get(id) ?? 0) + delta));
      return updated;
    });
    if (!userId) {
      localStorage.setItem(key, JSON.stringify(next));
      return;
    }
    saveLike(userId, itemType, itemId, !liked).then(({ count }) => {
      setLikeCounts((counts) => new Map(counts).set(id, count));
    }).catch(() => {
      setStore({ key, ids: likeIds });
      setLikeCounts((counts) => {
        const updated = new Map(counts);
        updated.set(id, Math.max(0, (counts.get(id) ?? 0) - delta));
        return updated;
      });
    });
  }, [key, likeIds, userId]);

  const likedKeys = useMemo(() => new Set(likeIds), [likeIds]);
  const isLiked = useCallback(
    (itemType, itemId) => likedKeys.has(itemKey(itemType, itemId)),
    [likedKeys],
  );
  const getLikeCount = useCallback(
    (itemType, itemId, base = 0) => base + (likeCounts.get(itemKey(itemType, itemId)) ?? 0),
    [likeCounts],
  );

  return { getLikeCount, isLiked, toggleLike };
}
