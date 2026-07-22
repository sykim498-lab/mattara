import { useEffect, useState } from 'react';
import { subscribeToPosts } from '../services/firestoreService';

export function useFirestorePosts(fallbackPosts) {
  const [posts, setPosts] = useState(fallbackPosts);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    subscribeToPosts((nextPosts) => {
      if (active && nextPosts.length) setPosts(nextPosts);
    }, () => {
      if (active) setPosts(fallbackPosts);
    }).then((nextUnsubscribe) => {
      if (active) unsubscribe = nextUnsubscribe;
      else nextUnsubscribe();
    }).catch(() => {
      if (active) setPosts(fallbackPosts);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [fallbackPosts]);

  return posts;
}
