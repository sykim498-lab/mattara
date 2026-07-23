export function TagList({ tags }) {
  const visibleTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (!visibleTags.length) return null;

  return (
    <div className="tags" aria-label="태그">
      {visibleTags.map((tag) => (
        <span className="tag" key={tag}>#{tag}</span>
      ))}
    </div>
  );
}
