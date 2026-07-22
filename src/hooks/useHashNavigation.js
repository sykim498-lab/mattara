import { useCallback, useEffect, useRef, useState } from 'react';

function parseHash(hash) {
  const value = hash.replace(/^#\/?/, '');
  if (!value || value === 'home') return { view: 'home', postId: null };
  if (['admin', 'login', 'signup', 'new', 'saved'].includes(value)) {
    return { view: value, postId: null };
  }

  const [view, rawId] = value.split('/');
  const postId = Number(rawId);
  if (['post', 'course'].includes(view) && Number.isInteger(postId)) {
    return { view, postId };
  }
  return { view: 'home', postId: null };
}

export function useHashNavigation() {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  const routeHistory = useRef([]);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route]);

  const navigate = useCallback((view, postId) => {
    const nextHash = `#/${postId == null ? view : `${view}/${postId}`}`;
    const currentHash = location.hash || '#/home';
    if (currentHash === nextHash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    routeHistory.current.push(currentHash);
    location.hash = nextHash;
  }, []);

  const goBack = useCallback(() => {
    location.hash = routeHistory.current.pop() ?? '#/home';
  }, []);

  return { route, navigate, goBack };
}
