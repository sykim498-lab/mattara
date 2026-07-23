export function PostAuthor({ post, profile, showRegion = false }) {
  const avatar = profile?.avatar || post.avatar;
  const author = profile?.displayName || post.author;
  const handle = profile?.handle || post.handle;
  return (
    <div className="author">
      <img className="avatar" src={avatar} alt={`${author} 프로필`} />
      <div className="author-info">
        <strong>{author}</strong>
        <small>
          {handle}
          {showRegion && ` · ${post.region}`}
        </small>
      </div>
      <span className="rating" aria-label={`평점 ${post.rating}점`}>
        ★ {post.rating}
      </span>
    </div>
  );
}
