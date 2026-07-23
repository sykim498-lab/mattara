import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseMap } from '../components/CourseMap';
import { RelatedCourses } from '../components/RelatedCourses';
import { createCourses } from '../data/createCourses';
import { courseAuthor } from '../data/courseAuthors';
import { buildCourseDirectionsUrl, buildDirectionsUrl } from '../services/placeService';

export function CoursePage({
  post,
  sourceCourses,
  initialCourseId,
  isCourseSaved = () => false,
  onToggleCourseSave = () => {},
  isCourseLiked = () => false,
  getCourseLikeCount = () => 0,
  onToggleCourseLike = () => {},
  relatedCourses = [],
  hasRecommendationHistory = false,
  onOpenRelatedCourse = () => {},
  onResetRecommendations = () => {},
  onHome,
  onPost,
}) {
  const courses = useMemo(
    () => createCourses({}, sourceCourses),
    [sourceCourses],
  );
  const [courseId, setCourseId] = useState(initialCourseId ?? null);
  const [stepIndex, setStepIndex] = useState(0);
  const course = courses.find(({ id }) => id === courseId) ?? courses[0];
  const step = course.steps[stepIndex];
  const isSaved = isCourseSaved(course.id);
  const isLiked = isCourseLiked(course.id);
  const likeCount = getCourseLikeCount(course.id, course.likes ?? 0);
  const author = courseAuthor(course);
  const stepDirectionsUrl = buildDirectionsUrl(step);
  const routeDirectionsUrl = buildCourseDirectionsUrl(course.steps);
  const breadcrumbItems = [
    { label: '홈 피드', onClick: onHome },
    ...(post ? [{ label: post.name, onClick: onPost }] : []),
    { label: course.theme },
  ];

  const changeCourse = (id) => {
    setCourseId(id);
    setStepIndex(0);
  };
  const moveStep = (offset) => {
    setStepIndex((current) =>
      (current + offset + course.steps.length) % course.steps.length,
    );
  };
  const toggleCourseSave = () => {
    onToggleCourseSave(course.id);
  };

  return (
    <section className="view">
      <div className="shell">
        <Breadcrumbs
          items={breadcrumbItems}
        />
        <div className="course-head">
          <p className="eyebrow">{author.handle} · COURSE POST</p>
          <h1>
            {author.name}님의<br />
            <span>{course.theme}</span>
          </h1>
          <p>{course.description}</p>
        </div>
        {!initialCourseId && <div className="course-tabs" role="tablist" aria-label="추천 코스 선택">
          {courses.map((item) => (
            <button
              className={`course-tab${item.id === course.id ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={item.id === course.id}
              onClick={() => changeCourse(item.id)}
              key={item.id}
            >
              <span>코스 {item.number}</span>
              <b>{item.theme}</b>
              <small>
                {item.matchedTags.length ? item.matchedTags.join(' · ') : '구례 로컬 추천'}
              </small>
            </button>
          ))}
        </div>}
        <div className="theme-strip">
          <div>
            <b>코스 {course.number} · {course.theme}</b>
            <span>{course.description}</span>
          </div>
          <div className="course-head-actions">
            <button
              className={`like-button${isLiked ? ' active' : ''}`}
              type="button"
              onClick={() => onToggleCourseLike(course.id)}
              aria-pressed={isLiked}
            >
              {isLiked ? '♥' : '♡'} 좋아요 {likeCount}
            </button>
            <button className={`course-save${isSaved ? ' active' : ''}`} type="button" onClick={toggleCourseSave}>
              {isSaved ? '✓ 코스 저장됨' : '＋ 코스 저장'}
            </button>
          </div>
        </div>
        <div className="course-layout">
          <article className="panel step-panel">
            <div className="step-photo">
              <img src={step.image} alt={step.name} />
              <span className="step-no">STEP {String(stepIndex + 1).padStart(2, '0')}</span>
            </div>
            <div className="step-copy">
              <p className="eyebrow">{step.label}</p>
              <h2>{step.name}</h2>
              <p>{step.description}</p>
              <a className="nav-btn course-step-directions" href={stepDirectionsUrl} target="_blank" rel="noreferrer">
                현재 장소로 길찾기
              </a>
              <div className="step-nav">
                <button type="button" onClick={() => moveStep(-1)}>← 이전</button>
                <span className="step-progress">{stepIndex + 1} / {course.steps.length}</span>
                <button type="button" onClick={() => moveStep(1)}>다음 →</button>
              </div>
            </div>
          </article>
          <aside className="panel map-panel">
            <CourseMap
              course={course}
              activeStep={stepIndex}
              onSelectStep={setStepIndex}
            />
            <div className="route-note">
              <b>총 예상 동선 · <span>{course.distance}</span></b>
              <span>{course.mode}</span>
              <a href={routeDirectionsUrl} target="_blank" rel="noreferrer">전체 코스 길찾기</a>
            </div>
          </aside>
        </div>
        <div className="route-itinerary" aria-label="구례 추천 이동 순서">
          <div>
            <p className="eyebrow">FOLLOW THIS ROUTE</p>
            <b>계획 없이도 이 순서대로 따라가 보세요.</b>
          </div>
          <ol>
            {course.steps.map((item, index) => (
              <li key={item.name}>
                <button
                  className={index === stepIndex ? 'active' : ''}
                  type="button"
                  onClick={() => setStepIndex(index)}
                >
                  <span>{index + 1}</span>{item.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <RelatedCourses
          source={course}
          courses={relatedCourses}
          hasPreferenceHistory={hasRecommendationHistory}
          description={`${author.name}님의 코스 태그와 저장된 취향을 바탕으로 골랐어요.`}
          onOpenCourse={onOpenRelatedCourse}
          onResetPreferences={onResetRecommendations}
        />
      </div>
    </section>
  );
}
