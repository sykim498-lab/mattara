import { useEffect, useState } from 'react';
import { subscribeToCourses } from '../services/firestoreService';

export function useFirestoreCourses(fallbackCourses) {
  const [courses, setCourses] = useState(fallbackCourses);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    subscribeToCourses((nextCourses) => {
      if (active && nextCourses.length) setCourses(nextCourses);
    }, () => {
      if (active) setCourses(fallbackCourses);
    }).then((listener) => {
      if (active) unsubscribe = listener;
      else listener();
    }).catch(() => {
      if (active) setCourses(fallbackCourses);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [fallbackCourses]);

  return courses;
}
