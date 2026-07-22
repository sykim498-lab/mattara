import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseMap } from '../components/CourseMap';
import { createCourses } from '../data/createCourses';

const SAVED_COURSES_KEY = 'mattara.gurye.saved-courses.v1';

export function CoursePage({ post, tagScores = {}, onHome, onPost }) {
  const courses = useMemo(() => createCourses(post, tagScores), [post, tagScores]);
  const [courseIndex, setCourseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const course = courses[courseIndex];
  const step = course.steps[stepIndex];
  const courseId = `${post.id}:${course.theme}`;
  const [savedCourseIds, setSavedCourseIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_COURSES_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  const isSaved = savedCourseIds.includes(courseId);

  const changeCourse = (index) => {
    setCourseIndex(index);
    setStepIndex(0);
  };
  const moveStep = (offset) => {
    setStepIndex((current) =>
      (current + offset + course.steps.length) % course.steps.length,
    );
  };
  const toggleCourseSave = () => {
    const next = isSaved
      ? savedCourseIds.filter((id) => id !== courseId)
      : [...savedCourseIds, courseId];
    localStorage.setItem(SAVED_COURSES_KEY, JSON.stringify(next));
    setSavedCourseIds(next);
  };

  return (
    <section className="view">
      <div className="shell">
        <Breadcrumbs
          items={[
            { label: '홈 피드', onClick: onHome },
            { label: post.name, onClick: onPost },
            { label: '추천 코스' },
          ]}
        />
        <div className="course-head">
          <p className="eyebrow">YOUR PERFECT DAY</p>
          <h1>
            구례에서 즐기는<br />
            <span>맛있는 하루 코스</span>
          </h1>
          <p>{post.name} 피드를 바탕으로 취향과 동선을 조합했어요.</p>
        </div>
        <div className="course-tabs" role="tablist" aria-label="추천 코스 선택">
          {courses.map((item, index) => (
            <button
              className={`course-tab${index === courseIndex ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={index === courseIndex}
              onClick={() => changeCourse(index)}
              key={item.theme}
            >
              코스 {String.fromCharCode(65 + index)}
            </button>
          ))}
        </div>
        <div className="theme-strip">
          <div><b>{course.theme}</b><span>{course.description}</span></div>
          <button className={`course-save${isSaved ? ' active' : ''}`} type="button" onClick={toggleCourseSave}>
            {isSaved ? '✓ 코스 저장됨' : '＋ 코스 저장'}
          </button>
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
              <div className="step-nav">
                <button type="button" onClick={() => moveStep(-1)}>← 이전</button>
                <span className="step-progress">{stepIndex + 1} / {course.steps.length}</span>
                <button type="button" onClick={() => moveStep(1)}>다음 →</button>
              </div>
            </div>
          </article>
          <aside className="panel map-panel">
            <CourseMap course={course} activeStep={stepIndex} />
            <div className="route-note">
              <b>총 예상 동선 · <span>{course.distance}</span></b>
              <span>{course.mode}</span>
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
      </div>
    </section>
  );
}
