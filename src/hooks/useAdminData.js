import { useEffect, useState } from 'react';
import { subscribeAdminCollection } from '../services/adminService';

const EMPTY_DATA = { posts: [], courses: [], users: [], submissions: [] };

export function useAdminData(enabled) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const unsubscribes = [];
    if (!enabled) return undefined;
    const collections = ['posts', 'courses', 'users', 'restaurant_submissions'];
    Promise.all(collections.map((name) => subscribeAdminCollection(name, (items) => {
      if (!active) return;
      const key = name === 'restaurant_submissions' ? 'submissions' : name;
      setData((current) => ({ ...current, [key]: items }));
    }, () => {
      if (active) setError('관리 데이터를 불러오지 못했습니다.');
    }))).then((listeners) => {
      listeners.forEach((listener) => unsubscribes.push(listener));
      if (active) setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('관리 데이터를 불러오지 못했습니다.');
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [enabled]);

  if (!enabled) return { ...EMPTY_DATA, loading: false, error: '' };
  return { ...data, loading, error };
}
