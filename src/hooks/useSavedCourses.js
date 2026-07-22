import { useCallback, useEffect, useMemo, useState } from 'react';
import { saveCourse, subscribeToSavedCourses } from '../services/firestoreService';

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

  useEffect(() => {
    if (!user?.uid) return undefined;
    let unsubscribe = () => {};
    subscribeToSavedCourses(user.uid, setIds, () => setIds([]))
      .then((listener) => { unsubscribe = listener; });
    return () => unsubscribe();
  }, [user]);

  const toggle = useCallback((courseId) => {
    setIds((current) => {
      const saved = current.includes(courseId);
      const next = saved ? current.filter((id) => id !== courseId) : [...current, courseId];
      if (user?.uid) saveCourse(user.uid, courseId, !saved).catch(() => setIds(current));
      else localStorage.setItem(GUEST_KEY, JSON.stringify(next));
      return next;
    });
  }, [user]);

  return { savedCourseIds: useMemo(() => new Set(ids), [ids]), toggle };
}
