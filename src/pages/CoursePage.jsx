import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseMap } from '../components/CourseMap';
import { createCourses } from '../data/createCourses';

export function CoursePage({
  post,
  sourceCourses,
  initialCourseId,
  isCourseSaved = () => false,
  onToggleCourseSave = () => {},
  tagScores = {},
  onHome,
  onPost,
}) {
  const courses = useMemo(
    () => createCourses(tagScores, sourceCourses),
    [tagScores, sourceCourses],
  );
  const [courseId, setCourseId] = useState(initialCourseId ?? null);
  const [stepIndex, setStepIndex] = useState(0);
  const course = courses.find(({ id }) => id === courseId) ?? courses[0];
  const step = course.steps[stepIndex];
  const isSaved = isCourseSaved(course.id);
  const breadcrumbItems = [
    { label: '홈 피드', onClick: onHome },
    ...(post ? [{ label: post.name, onClick: onPost }] : []),
    { label: '추천 코스' },
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
          <p className="eyebrow">YOUR PERFECT DAY</p>
          <h1>
            구례에서 즐기는<br />
            <span>맛있는 하루 코스</span>
          </h1>
          <p>저장된 관심사 태그와 구례 로컬 동선을 조합했어요.</p>
        </div>
        <div className="course-tabs" role="tablist" aria-label="추천 코스 선택">
          {courses.map((item, index) => (
            <button
              className={`course-tab${item.id === course.id ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={item.id === course.id}
              onClick={() => changeCourse(item.id)}
              key={item.id}
            >
              <span>{index === 0 ? '맞춤 1순위' : `코스 ${item.number}`}</span>
              <b>{item.theme}</b>
              <small>
                {item.matchedTags.length ? item.matchedTags.join(' · ') : '구례 로컬 추천'}
              </small>
            </button>
          ))}
        </div>
        <div className="theme-strip">
          <div>
            <b>코스 {course.number} · {course.theme}</b>
            <span>{course.description}</span>
          </div>
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
            <CourseMap
              course={course}
              activeStep={stepIndex}
              onSelectStep={setStepIndex}
            />
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
