export function PostAuthor({ post, profile, showRegion = false }) {
  const avatar = profile?.avatar || post.avatar;
  const author = profile?.displayName || post.author;
  const handle = profile?.handle || post.handle;
  const rating = Number(post.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <div className="author">
      <img className="avatar" src={avatar} alt={`${author} 프로필`} />
      <div className="author-info">
        <strong>{author}</strong>
        <small>
          {handle}
          {showRegion && post.region && ` · ${post.region}`}
        </small>
      </div>
      {hasRating && (
        <span className="rating" aria-label={`평점 ${rating}점`}>
          ★ {rating}
        </span>
      )}
    </div>
  );
}
