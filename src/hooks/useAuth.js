import { useEffect, useState } from 'react';
import { getFirebaseAuth } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    Promise.all([getFirebaseAuth(), import('firebase/auth')])
      .then(([auth, { onAuthStateChanged }]) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        });
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, loading, configured: true };
}
