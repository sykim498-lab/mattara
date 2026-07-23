import { useMemo, useState } from 'react';
import { FeedCard } from '../components/FeedCard';
import { CourseFeedCard } from '../components/CourseFeedCard';
import { filterPosts } from '../features/feed/filterPosts';

export function HomePage({
  posts,
  courses = [],
  user,
  categories,
  bookmarkedIds = new Set(),
  onOpenCourses = () => {},
  onOpenCourse = onOpenCourses,
  onOpenPost,
  onSelectTags = () => {},
  onToggleBookmark = () => {},
  onToggleCourseSave = () => {},
  savedCourseIds = new Set(),
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => sessionStorage.getItem('mattara.gurye.selected-category') ?? 'all',
  );
  const [query, setQuery] = useState('');
  const selectedCategory =
    categories.find(({ id }) => id === selectedCategoryId) ?? categories[0];
  const visiblePosts = useMemo(() => {
    const filtered = filterPosts(posts, selectedCategory);
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    if (!normalizedQuery) return filtered;
    return filtered.filter((post) =>
      [post.name, post.address, post.menu, ...post.tags]
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(normalizedQuery)),
    );
  }, [posts, query, selectedCategory]);

  const selectCategory = (category) => {
    setSelectedCategoryId(category.id);
    sessionStorage.setItem('mattara.gurye.selected-category', category.id);
    if (category.matchTags.length) onSelectTags(category.matchTags);
  };

  return (
    <section className="view">
      <div className="shell">
        <div className="hero">
          <div>
            <p className="eyebrow">TASTE · WALK · GURYE</p>
            <h1>구례의 한 끼에서<br /><span>느긋한 여행</span>이 시작돼요.</h1>
          </div>
          <p>
            산수유, 섬진강, 지리산과 로컬푸드를 한 번에 만나고
            취향에 맞는 구례 하루 코스를 따라가 보세요.
          </p>
        </div>

        <section className="course-feed-section" aria-labelledby="course-feed-title">
          <div className="course-feed-heading">
            <p className="eyebrow">8 LOCAL ROUTES · ZERO SEARCH</p>
            <h2 id="course-feed-title">스크롤로 바로 만나는 구례 여행 코스</h2>
            <p>사진을 넘기며 장소별 설명을 보고, 마음에 드는 동선을 바로 저장하세요.</p>
          </div>
          <div className="course-feed">
            {courses.map((course) => (
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

        <div className="filters" aria-label="맛집 카테고리">
          {categories.map((category) => (
            <button
              className={`filter${category.id === selectedCategory?.id ? ' active' : ''}`}
              type="button"
              key={category.id}
              onClick={() => selectCategory(category)}
            >
              {category.icon && <span aria-hidden="true">{category.icon} </span>}
              {category.label}
            </button>
          ))}
        </div>

        <label className="feed-search">
          <span>구례 장소 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="산수유, 한옥카페, 자연..."
          />
        </label>

        <div className="feed-meta">
          <strong>구례 맛집·명소 {visiblePosts.length}곳</strong>
          <span>구례군 한정 데이터</span>
        </div>
        <div className="grid">
          {visiblePosts.length ? (
            visiblePosts.map((post) => (
              <FeedCard
                post={post}
                user={user}
                bookmarked={bookmarkedIds.has(post.id)}
                onOpen={onOpenPost}
                onToggleBookmark={onToggleBookmark}
                key={post.id}
              />
            ))
          ) : (
            <div className="empty">
              <b aria-hidden="true">🍽️</b>
              이 카테고리의 새로운 맛집을 준비 중이에요.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
