import { useEffect, useState } from 'react';
import { resolveMemberRole } from '../features/admin/roles';
import { getFirebaseAuth, getFirestoreDatabase } from '../services/firebase';

const EMPTY_ACCESS = { isAdmin: false, role: 'member', profile: null };

export function useAdminAccess(user) {
  const [access, setAccess] = useState(EMPTY_ACCESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    if (!user) return undefined;
    Promise.all([
      getFirebaseAuth(),
      getFirestoreDatabase(),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(async ([auth, db, { getIdTokenResult }, { doc, onSnapshot }]) => {
      const token = await getIdTokenResult(auth.currentUser ?? user);
      unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (!active) return;
        const profile = snapshot.exists() ? snapshot.data() : null;
        const role = resolveMemberRole(profile, user, token.claims);
        setAccess({ isAdmin: role === 'admin', role, profile });
        setError('');
        setLoading(false);
      }, () => {
        if (!active) return;
        setError('관리자 권한을 확인하지 못했습니다.');
        setLoading(false);
      });
    }).catch(() => {
      if (!active) return;
      setError('관리자 권한을 확인하지 못했습니다.');
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  if (!user) return { ...EMPTY_ACCESS, loading: false, error: '' };
  return { ...access, loading, error };
}
