import { TagList } from './TagList';

export function RelatedCourses({
  source,
  courses = [],
  hasPreferenceHistory = false,
  title = '작성자 맞춤 추천 코스',
  description = '이 게시물의 장소와 태그를 기준으로 골랐어요.',
  onOpenCourse = () => {},
  onResetPreferences = () => {},
}) {
  if (!courses.length) return null;
  const sourceTags = new Set(source.tags);

  return (
    <section className="related-courses" aria-labelledby="related-course-title">
      <div className="recommendation-heading">
        <div>
          <p className="eyebrow">RELATED LOCAL ROUTES</p>
          <h2 id="related-course-title">{title}</h2>
          <p>
            {description}
            {hasPreferenceHistory && ' 저장된 취향은 이 영역의 순위에만 반영돼요.'}
          </p>
        </div>
        {hasPreferenceHistory && (
          <button type="button" onClick={onResetPreferences}>추천 기록 초기화</button>
        )}
      </div>
      <div className="related-course-grid">
        {courses.map((course) => {
          const relatedTags = course.tags.filter((tag) => sourceTags.has(tag));
          return (
            <article className="related-course-card" key={course.id}>
              <button
                className="related-course-photo"
                type="button"
                onClick={() => onOpenCourse(course.id)}
                aria-label={`${course.theme} 코스 상세 보기`}
              >
                <img src={course.steps[0].image} alt={`${course.theme} 대표 사진`} loading="lazy" />
                <span>코스 {course.number}</span>
              </button>
              <div className="related-course-copy">
                <h3>{course.theme}</h3>
                <p>{course.description}</p>
                <TagList tags={relatedTags.length ? relatedTags : course.tags.slice(0, 2)} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
