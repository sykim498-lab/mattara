import { useRef, useState } from 'react';
import { courseAuthor } from '../data/courseAuthors';
import { CommentsSection } from './CommentsSection';
import { PostAuthor } from './PostAuthor';
import { ShareActions } from './ShareActions';
import { TagList } from './TagList';

const numberFormatter = new Intl.NumberFormat('ko-KR');

export function CourseFeedCard({ course, user, saved, onOpen, onToggleSave }) {
  const [stepIndex, setStepIndex] = useState(0);
  const touchStartX = useRef(null);
  const suppressOpen = useRef(false);
  const step = course.steps[stepIndex];
  const author = courseAuthor(course);
  const authorPost = {
    author: author.name,
    avatar: author.avatar,
    handle: author.handle,
    rating: course.rating,
  };
  const sharePost = {
    id: course.id,
    name: course.theme,
    caption: course.description,
  };
  const move = (offset) => setStepIndex((current) =>
    (current + offset + course.steps.length) % course.steps.length,
  );
  const touchEnd = (event) => {
    if (touchStartX.current == null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 42) {
      suppressOpen.current = true;
      move(distance < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };
  const openCourse = () => {
    if (suppressOpen.current) {
      suppressOpen.current = false;
      return;
    }
    onOpen(course.id);
  };

  return (
    <article className="feed-card">
      <div
        className="card-open"
        role="link"
        tabIndex="0"
        aria-label={`${course.theme} 코스 상세 보기`}
        onClick={openCourse}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') openCourse();
        }}
      >
        <PostAuthor post={authorPost} />
        <div
          className="photo-wrap"
          onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
          onTouchEnd={touchEnd}
        >
          <img src={step.image} alt={`${course.theme} - ${step.name}`} loading="lazy" />
          <span className="place-badge">{step.name}</span>
          <span className="photo-count">{stepIndex + 1} / {course.steps.length}</span>
          {course.steps.length > 1 && (
            <>
              <button
                className="feed-carousel-button prev"
                type="button"
                onClick={(event) => { event.stopPropagation(); move(-1); }}
                aria-label="이전 장소"
              >‹</button>
              <button
                className="feed-carousel-button next"
                type="button"
                onClick={(event) => { event.stopPropagation(); move(1); }}
                aria-label="다음 장소"
              >›</button>
              <div className="feed-carousel-dots" aria-hidden="true">
                {course.steps.map((item, index) => (
                  <i className={index === stepIndex ? 'active' : ''} key={item.name} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="card-body">
          <div className="card-title">
            <h2>{course.theme}</h2>
          </div>
          <p aria-live="polite">
            <b>{step.label}</b>{' '}{step.description || course.description}
          </p>
          <TagList tags={course.tags} />
        </div>
      </div>
      <div className="social card-actions">
        <span>♥ {numberFormatter.format(course.likes ?? 0)}</span>
        <button
          className={`bookmark-button${saved ? ' active' : ''}`}
          type="button"
          onClick={() => onToggleSave(course.id)}
          aria-pressed={saved}
          aria-label={`${course.theme} ${saved ? '저장 해제' : '저장'}`}
        >
          {saved ? '✓ 저장됨' : '♡ 저장'}
        </button>
        <ShareActions post={sharePost} type="course" compact />
      </div>
      <CommentsSection feedId={`course-${course.id}`} user={user} />
    </article>
  );
}
