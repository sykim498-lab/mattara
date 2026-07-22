export function PostAuthor({ post, showRegion = false }) {
  return (
    <div className="author">
      <img className="avatar" src={post.avatar} alt="" />
      <div className="author-info">
        <strong>{post.author}</strong>
        <small>
          {post.handle}
          {showRegion && ` · ${post.region}`}
        </small>
      </div>
      <span className="rating" aria-label={`평점 ${post.rating}점`}>
        ★ {post.rating}
      </span>
    </div>
  );
}
