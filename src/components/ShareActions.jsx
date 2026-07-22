import { useState } from 'react';
import {
  copyPostLink,
  getSocialShareUrl,
  sharePost,
} from '../services/shareService';

export function ShareActions({ post, compact = false, type = 'post' }) {
  const [message, setMessage] = useState('');

  const copy = async () => {
    try {
      await copyPostLink(post.id, type);
      setMessage('링크를 복사했어요.');
    } catch {
      setMessage('링크를 복사하지 못했어요.');
    }
  };

  const share = async () => {
    try {
      const shared = await sharePost(post, type);
      if (!shared) await copy();
    } catch (error) {
      if (error.name !== 'AbortError') setMessage('공유하지 못했어요.');
    }
  };

  const actions = (
    <div className={`share-panel${compact ? ' share-popover' : ''}`}>
      <span className="share-title">공유하기</span>
      <button type="button" onClick={copy}>🔗 링크 복사</button>
      <button type="button" onClick={share}>↗ 기기로 공유</button>
      <a href={getSocialShareUrl('x', post, type)} target="_blank" rel="noreferrer">X</a>
      <a href={getSocialShareUrl('facebook', post, type)} target="_blank" rel="noreferrer">Facebook</a>
      {message && <small role="status">{message}</small>}
    </div>
  );

  if (!compact) return actions;
  return (
    <details className="share-menu">
      <summary aria-label={`${post.name} 공유 메뉴 열기`}>↗ 공유</summary>
      {actions}
    </details>
  );
}
