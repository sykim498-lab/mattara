import { Breadcrumbs } from '../components/Breadcrumbs';
import { FeedCard } from '../components/FeedCard';

export function SavedPage({ posts, bookmarkedIds, onHome, onOpenPost, onToggleBookmark }) {
  const savedPosts = posts.filter((post) => bookmarkedIds.has(post.id));
  return (
    <section className="view">
      <div className="shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: '마이페이지' }]} />
        <div className="saved-heading">
          <div>
            <p className="eyebrow">MY MAT-TARA</p>
            <h1>저장한 맛집</h1>
          </div>
          <span>{savedPosts.length}곳</span>
        </div>
        <div className="grid">
          {savedPosts.length ? savedPosts.map((post) => (
            <FeedCard
              post={post}
              bookmarked
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
