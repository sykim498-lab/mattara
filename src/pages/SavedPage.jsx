import { Breadcrumbs } from '../components/Breadcrumbs';
import { FeedCard } from '../components/FeedCard';
import { CourseFeedCard } from '../components/CourseFeedCard';
import { ProfileSettings } from '../components/ProfileSettings';

export function SavedPage({
  posts,
  courses,
  user,
  profiles = new Map(),
  bookmarkedIds,
  bookmarkCounts = new Map(),
  savedCourseIds,
  savedCourseCounts = new Map(),
  onHome,
  onOpenPost,
  onOpenCourse,
  onToggleBookmark,
  onToggleCourseSave,
}) {
  const savedPosts = posts.filter((post) => bookmarkedIds.has(post.id));
  const savedCourses = courses.filter((course) => savedCourseIds.has(course.id));
  return (
    <section className="view">
      <div className="shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: '마이페이지' }]} />
        <div className="saved-heading">
          <div>
            <p className="eyebrow">MY MAT-TARA</p>
            <h1>나의 맛따라 보관함</h1>
          </div>
          <span>맛집 {savedPosts.length} · 코스 {savedCourses.length}</span>
        </div>
        {user && <ProfileSettings user={user} profile={profiles.get(user.uid)} />}
        <section className="saved-course-section">
          <h2>저장한 여행 코스</h2>
          {savedCourses.length ? (
            <div className="course-feed saved-course-feed">
              {savedCourses.map((course) => (
                <CourseFeedCard
                  course={course}
                  user={user}
                  saved
                  saveCount={savedCourseCounts.get(String(course.id)) ?? 0}
                  onOpen={onOpenCourse}
                  onToggleSave={onToggleCourseSave}
                  key={course.id}
                />
              ))}
            </div>
          ) : <div className="saved-empty">저장한 코스가 아직 없어요.</div>}
        </section>
        <h2 className="saved-post-title">저장한 맛집·명소</h2>
        <div className="grid">
          {savedPosts.length ? savedPosts.map((post) => (
            <FeedCard
              post={post}
              authorProfile={profiles.get(post.ownerId)}
              user={user}
              bookmarked
              bookmarkCount={bookmarkCounts.get(String(post.id)) ?? 0}
              onOpen={onOpenPost}
              onToggleBookmark={onToggleBookmark}
              key={post.id}
            />
          )) : (
            <div className="empty">
              <b aria-hidden="true">🔖</b>
              아직 저장한 맛집이 없어요. 마음에 드는 게시물을 북마크해 보세요.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
