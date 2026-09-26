export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', className = '' }) {
  return (
    <div
      className={`skeleton-box ${className}`.trim()}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({ count = 3, className = '' }) {
  return (
    <div className={`skeleton-lines ${className}`.trim()}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          width={idx === count - 1 ? '60%' : '100%'}
          height="14px"
          borderRadius="var(--radius-sm)"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ count = 1 }) {
  return (
    <div className="skeleton-cards-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-card-header">
            <Skeleton width="45%" height="16px" />
            <Skeleton width="36px" height="36px" borderRadius="var(--radius-md)" />
          </div>
          <Skeleton width="60%" height="32px" />
          <Skeleton width="80%" height="14px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width="70%" height="16px" />
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="skeleton-table-row">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} width={c === 0 ? '90%' : '65%'} height="14px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
