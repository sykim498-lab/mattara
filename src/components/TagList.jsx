export function TagList({ tags }) {
  return (
    <div className="tags" aria-label="태그">
      {tags.map((tag) => (
        <span className="tag" key={tag}>#{tag}</span>
      ))}
    </div>
  );
}
