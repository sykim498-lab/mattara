import { useEffect, useMemo, useState } from 'react';
import { subscribePublicProfiles } from '../services/profileService';

export function usePublicProfiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    subscribePublicProfiles((items) => {
      if (active) setProfiles(items);
    }, () => {
      if (active) setProfiles([]);
    }).then((listener) => {
      if (active) unsubscribe = listener;
      else listener();
    }).catch(() => {
      if (active) setProfiles([]);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  );
}
