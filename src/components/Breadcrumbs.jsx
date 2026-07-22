export function Breadcrumbs({ items }) {
  return (
    <nav className="crumb" aria-label="현재 위치">
      {items.map((item, index) => (
        <span className="crumb-item" key={`${item.label}-${index}`}>
          {index > 0 && <span aria-hidden="true">›</span>}
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.label}
            </button>
          ) : (
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
