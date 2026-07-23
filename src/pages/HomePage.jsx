import { CourseFeedCard } from '../components/CourseFeedCard';
import { FeedCard } from '../components/FeedCard';

export function HomePage({
  courses = [],
  posts = [],
  profiles = new Map(),
  user,
  bookmarkedIds = new Set(),
  bookmarkCounts = new Map(),
  onOpenCourse = () => {},
  onOpenPost = () => {},
  onToggleBookmark = () => {},
  onToggleCourseSave = () => {},
  savedCourseIds = new Set(),
  savedCourseCounts = new Map(),
  isLiked = () => false,
  getLikeCount = (_type, _id, base = 0) => base,
  onTogglePostLike = () => {},
  onToggleCourseLike = () => {},
}) {
  const memberPosts = posts
    .filter(({ ownerId }) => Boolean(ownerId))
    .sort((a, b) => b.id - a.id);

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
            <p className="eyebrow">MEMBER POSTS · 8 LOCAL ROUTES</p>
            <h2 id="course-feed-title">구례 여행자 추천 피드</h2>
            <p>회원이 방금 등록한 맛집과 여덟 작성자의 여행 코스를 함께 둘러보세요.</p>
          </div>
          <div className="course-feed">
            {memberPosts.map((post) => (
              <FeedCard
                post={post}
                authorProfile={profiles.get(post.ownerId)}
                user={user}
                bookmarked={bookmarkedIds.has(post.id)}
                bookmarkCount={bookmarkCounts.get(String(post.id)) ?? 0}
                liked={isLiked('post', post.id)}
                likeCount={getLikeCount('post', post.id, post.likes ?? 0)}
                onOpen={onOpenPost}
                onToggleBookmark={onToggleBookmark}
                onToggleLike={onTogglePostLike}
                key={`member-${post.id}`}
              />
            ))}
            {courses.slice(0, 8).map((course) => (
              <CourseFeedCard
                course={course}
                user={user}
                saved={savedCourseIds.has(course.id)}
                saveCount={savedCourseCounts.get(String(course.id)) ?? 0}
                liked={isLiked('course', course.id)}
                likeCount={getLikeCount('course', course.id, course.likes ?? 0)}
                onOpen={onOpenCourse}
                onToggleSave={onToggleCourseSave}
                onToggleLike={onToggleCourseLike}
                key={course.id}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
