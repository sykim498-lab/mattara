import { useEffect, useState } from 'react';
import { getLocalUser, subscribeToLocalAuth } from '../services/localAuthService';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState(() => (supabase ? null : getLocalUser()));
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return subscribeToLocalAuth(setUser);
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setUser(error ? null : data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, configured: isSupabaseConfigured };
}
