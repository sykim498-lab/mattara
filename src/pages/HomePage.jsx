import { CourseFeedCard } from '../components/CourseFeedCard';

export function HomePage({
  courses = [],
  user,
  onOpenCourse = () => {},
  onToggleCourseSave = () => {},
  savedCourseIds = new Set(),
}) {
  return (
    <section className="view">
      <div className="shell">
        <div className="hero">
          <div>
            <p className="eyebrow">LOCAL COURSE STORIES · GURYE</p>
            <h1>구례 여행자들의<br /><span>진짜 하루 코스</span>를 만나보세요.</h1>
          </div>
          <p>
            서로 다른 작성자가 직접 기록한 여덟 개의 구례 여행 게시물이에요.
            사진을 눌러 장소별 이야기와 전체 동선을 확인해 보세요.
          </p>
        </div>

        <section className="course-feed-section" aria-labelledby="course-feed-title">
          <div className="course-feed-heading">
            <p className="eyebrow">8 AUTHORS · 8 LOCAL ROUTES</p>
            <h2 id="course-feed-title">작성자별 구례 코스 피드</h2>
            <p>맛집과 자연, 문화 공간을 엮은 각자의 여행 기록을 한눈에 둘러보세요.</p>
          </div>
          <div className="course-feed">
            {courses.slice(0, 8).map((course) => (
              <CourseFeedCard
                course={course}
                user={user}
                saved={savedCourseIds.has(course.id)}
                onOpen={onOpenCourse}
                onToggleSave={onToggleCourseSave}
                key={course.id}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
