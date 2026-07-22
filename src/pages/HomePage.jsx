import { useMemo, useState } from 'react';
import { FeedCard } from '../components/FeedCard';
import { filterPosts } from '../features/feed/filterPosts';

export function HomePage({
  posts,
  categories,
  recommendedPosts = [],
  hasRecommendationHistory = false,
  bookmarkedIds = new Set(),
  onOpenCourses = () => {},
  onOpenPost,
  onResetRecommendations = () => {},
  onSelectTags = () => {},
  onToggleBookmark = () => {},
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

        {hasRecommendationHistory && (
          <section className="recommendation-section" aria-labelledby="recommendation-title">
            <div className="recommendation-heading">
              <div>
                <p className="eyebrow">FOR YOUR TASTE</p>
                <h2 id="recommendation-title">취향에 맞는 구례 숨은 명소</h2>
                <p>선택한 태그와 조회·북마크 행동을 합산해 추천했어요.</p>
              </div>
              <button type="button" onClick={onResetRecommendations}>추천 기록 초기화</button>
            </div>
            <div className="grid recommendation-grid">
              {recommendedPosts.slice(0, 3).map((post) => (
                <FeedCard
                  post={post}
                  bookmarked={bookmarkedIds.has(post.id)}
                  onOpen={onOpenPost}
                  onToggleBookmark={onToggleBookmark}
                  key={`recommended-${post.id}`}
                />
              ))}
            </div>
          </section>
        )}

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
        <div className="course-banner home-course-banner">
          <div>
            <p className="eyebrow">8 LOCAL ROUTES · GURYE ONLY</p>
            <h2>계획 없이 떠나는 구례 맞춤 코스</h2>
            <p>취향 태그를 바탕으로 프랜차이즈 없는 구례 로컬 코스를 먼저 보여드려요.</p>
          </div>
          <button type="button" onClick={onOpenCourses}>8개 맞춤 코스 보기 →</button>
        </div>
      </div>
    </section>
  );
}
