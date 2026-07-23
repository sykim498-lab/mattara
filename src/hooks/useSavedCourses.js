import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  saveCourse,
  subscribeToBookmarkCounts,
  subscribeToSavedCourses,
} from '../services/firestoreService';

const GUEST_KEY = 'mattara.gurye.saved-courses.v2';

function guestCourses() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function useSavedCourses(user) {
  const [ids, setIds] = useState(guestCourses);
  const [savedCourseCounts, setSavedCourseCounts] = useState(new Map());

  useEffect(() => {
    if (!user?.uid) return undefined;
    let unsubscribe = () => {};
    subscribeToSavedCourses(user.uid, setIds, () => setIds([]))
      .then((listener) => { unsubscribe = listener; });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let unsubscribe = () => {};
    subscribeToBookmarkCounts('course', setSavedCourseCounts, () => {})
      .then((listener) => { unsubscribe = listener; })
      .catch(() => {});
    return () => unsubscribe();
  }, []);

  const toggle = useCallback((courseId) => {
    const saved = ids.includes(courseId);
    const next = saved ? ids.filter((id) => id !== courseId) : [...ids, courseId];
    const delta = saved ? -1 : 1;
    setIds(next);
    setSavedCourseCounts((counts) => {
      const updated = new Map(counts);
      updated.set(String(courseId), Math.max(0, (counts.get(String(courseId)) ?? 0) + delta));
      return updated;
    });
    if (user?.uid) {
      saveCourse(user.uid, courseId, !saved).then(({ count }) => {
        setSavedCourseCounts((counts) => new Map(counts).set(String(courseId), count));
      }).catch(() => {
        setIds(ids);
        setSavedCourseCounts((counts) => {
          const updated = new Map(counts);
          updated.set(String(courseId), Math.max(0, (counts.get(String(courseId)) ?? 0) - delta));
          return updated;
        });
      });
    } else {
      localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    }
  }, [ids, user]);

  return {
    savedCourseIds: useMemo(() => new Set(ids), [ids]),
    savedCourseCounts,
    toggle,
  };
}
