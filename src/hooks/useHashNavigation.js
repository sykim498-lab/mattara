import { useCallback, useEffect, useRef, useState } from 'react';

function parseHash(hash) {
  const value = hash.replace(/^#\/?/, '');
  if (!value || value === 'home') return { view: 'home', postId: null, courseId: null };
  if (['admin', 'login', 'signup', 'new', 'saved'].includes(value)) {
    return { view: value, postId: null, courseId: null };
  }

  const [view, rawId] = value.split('/');
  if (view === 'course' && rawId == null) {
    return { view: 'course', postId: null, courseId: null };
  }
  if (view === 'course' && rawId) {
    return { view: 'course', postId: null, courseId: decodeURIComponent(rawId) };
  }
  const postId = Number(rawId);
  if (view === 'post' && Number.isInteger(postId)) {
    return { view, postId, courseId: null };
  }
  return { view: 'home', postId: null, courseId: null };
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

  const navigate = useCallback((view, resourceId) => {
    const nextHash = `#/${resourceId == null ? view : `${view}/${encodeURIComponent(resourceId)}`}`;
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
