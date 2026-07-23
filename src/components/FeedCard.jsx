import { useEffect, useRef, useState } from 'react';
import { PostAuthor } from './PostAuthor';
import { CommentsSection } from './CommentsSection';
import { ShareActions } from './ShareActions';
import { TagList } from './TagList';

const numberFormatter = new Intl.NumberFormat('ko-KR');

export function FeedCard({
  post,
  authorProfile,
  bookmarked = false,
  user,
  onOpen,
  onToggleBookmark = () => {},
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const suppressOpen = useRef(false);
  const currentImage = post.images[imageIndex];

  useEffect(() => {
    if (post.images.length < 2 || paused) return undefined;
    const timer = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % post.images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, post.images.length]);

  const moveImage = (offset) => {
    setImageIndex((current) =>
      (current + offset + post.images.length) % post.images.length,
    );
  };
  const handleTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 42) {
      suppressOpen.current = true;
      moveImage(distance < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };
  const openPost = () => {
    if (suppressOpen.current) {
      suppressOpen.current = false;
      return;
    }
    onOpen(post.id);
  };

  return (
    <article
      className="feed-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="card-open"
        role="link"
        tabIndex="0"
        onClick={openPost}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') openPost();
        }}
        aria-label={`${post.name} 상세 보기`}
      >
        <PostAuthor post={post} profile={authorProfile} />
        <div
          className="photo-wrap"
          onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentImage.url}
            alt={`${post.name}의 ${post.menu}`}
            loading="lazy"
          />
          <span className="place-badge">⌖ {post.region}</span>
          <span className="photo-count">{imageIndex + 1} / {post.images.length}</span>
          {post.images.length > 1 && (
            <>
              <button
                className="feed-carousel-button prev"
                type="button"
                onClick={(event) => { event.stopPropagation(); moveImage(-1); }}
                aria-label={`${post.name} 이전 사진`}
              >‹</button>
              <button
                className="feed-carousel-button next"
                type="button"
                onClick={(event) => { event.stopPropagation(); moveImage(1); }}
                aria-label={`${post.name} 다음 사진`}
              >›</button>
              <div className="feed-carousel-dots" aria-hidden="true">
                {post.images.map((item, index) => (
                  <i className={index === imageIndex ? 'active' : ''} key={item.url} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="card-body">
          <div className="card-title">
            <h2>{post.name}</h2>
          </div>
          <p aria-live="polite">{currentImage.comment ?? post.caption}</p>
          <TagList tags={post.tags} />
        </div>
      </div>
      <div className="social card-actions">
        <span>♥ {numberFormatter.format(post.likes ?? 0)}</span>
        <button
          className={`bookmark-button${bookmarked ? ' active' : ''}`}
          type="button"
          onClick={() => onToggleBookmark(post)}
          aria-pressed={bookmarked}
          aria-label={`${post.name} ${bookmarked ? '북마크 해제' : '북마크 저장'}`}
        >
          {bookmarked ? '🔖 저장됨' : '♡ 저장'}
        </button>
        <ShareActions post={post} compact />
      </div>
      <CommentsSection feedId={`post-${post.id}`} user={user} />
    </article>
  );
}
