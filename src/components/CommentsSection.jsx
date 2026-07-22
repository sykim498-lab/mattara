import { useState } from 'react';
import { useComments } from '../hooks/useComments';

export function CommentsSection({ feedId, user }) {
  const { comments, error, add, remove } = useComments(feedId, user);
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const visible = expanded ? comments : comments.slice(-3);

  const submit = async (event) => {
    event.preventDefault();
    if (!user || !text.trim()) return;
    setSaving(true);
    try {
      await add(text);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="comments-section" aria-label="댓글">
      <div className="comments-heading">
        <b>댓글 {comments.length}</b>
        {comments.length > 3 && (
          <button type="button" onClick={() => setExpanded((current) => !current)}>
            {expanded ? '접기' : '모두 보기'}
          </button>
        )}
      </div>
      <div className="comment-list">
        {visible.map((comment) => (
          <article className="comment-row" key={comment.id}>
            <p><b>{comment.author}</b> {comment.text}</p>
            {user?.uid === comment.userId && (
              <button type="button" onClick={() => remove(comment.id)} aria-label="댓글 삭제">삭제</button>
            )}
          </article>
        ))}
      </div>
      <form className="comment-form" onSubmit={submit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={user ? '댓글을 입력하세요…' : '로그인 후 댓글을 남길 수 있어요'}
          maxLength="500"
          disabled={!user || saving}
          aria-label="댓글 내용"
        />
        <button type="submit" disabled={!user || saving || !text.trim()}>게시</button>
      </form>
      {error && <small className="comment-error">{error}</small>}
    </section>
  );
}
