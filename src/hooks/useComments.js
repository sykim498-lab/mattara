import { useEffect, useState } from 'react';
import { addComment, deleteComment, subscribeToComments } from '../services/commentService';

export function useComments(feedId, user) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    subscribeToComments(feedId, (items) => {
      if (active) setComments(items);
    }, () => {
      if (active) setError('댓글을 불러오지 못했습니다.');
    }).then((listener) => {
      if (active) unsubscribe = listener;
      else listener();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [feedId]);

  return {
    comments,
    error,
    add: (text) => addComment(feedId, user, text),
    remove: (commentId) => deleteComment(feedId, commentId),
  };
}
