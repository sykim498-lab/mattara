import { useRef, useState } from 'react';
import { CommentsSection } from './CommentsSection';
import { ShareActions } from './ShareActions';
import { TagList } from './TagList';

export function CourseFeedCard({ course, user, saved, onOpen, onToggleSave }) {
  const [stepIndex, setStepIndex] = useState(0);
  const touchStartX = useRef(null);
  const suppressOpen = useRef(false);
  const step = course.steps[stepIndex];
  const move = (offset) => setStepIndex((current) =>
    (current + offset + course.steps.length) % course.steps.length,
  );
  const touchEnd = (event) => {
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
  const sharePost = {
    id: course.id,
    name: course.theme,
    caption: course.description,
  };

  return (
    <article className="course-feed-card panel">
      <header className="course-feed-author">
        <span className="course-avatar">맛</span>
        <div><b>맛따라 로컬 큐레이터</b><small>전라남도 구례군 · 코스 {course.number}</small></div>
      </header>
      <div
        className="course-feed-photo"
        role="link"
        tabIndex="0"
        aria-label={`${course.theme} 코스 상세 보기`}
        onClick={openCourse}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') openCourse();
        }}
        onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
        onTouchEnd={touchEnd}
      >
        <img src={step.image} alt={`${course.theme} - ${step.name}`} loading="lazy" />
        <strong>{step.name}</strong>
        <span>{stepIndex + 1} / {course.steps.length}</span>
        <button className="feed-carousel-button prev" type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="이전 장소">‹</button>
        <button className="feed-carousel-button next" type="button" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="다음 장소">›</button>
        <div className="feed-carousel-dots" aria-hidden="true">
          {course.steps.map((item, index) => <i className={index === stepIndex ? 'active' : ''} key={item.name} />)}
        </div>
      </div>
      <div className="course-feed-actions">
        <button className={saved ? 'active' : ''} type="button" onClick={() => onToggleSave(course.id)}>
          {saved ? '🔖 저장됨' : '♡ 코스 저장'}
        </button>
        <ShareActions post={sharePost} type="course" compact />
      </div>
      <div className="course-feed-copy">
        <h2>{course.theme}</h2>
        <p className="step-caption"><b>{step.label}</b> {step.description}</p>
        <p>{course.description}</p>
        <TagList tags={course.tags} />
      </div>
      <CommentsSection feedId={`course-${course.id}`} user={user} />
    </article>
  );
}
