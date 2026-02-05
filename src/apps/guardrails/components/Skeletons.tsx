// Skeleton components for loading states
// Uses CSS animation for pulse effect

export function MetricCardSkeleton() {
  return (
    <div className="metric-card skeleton">
      <div className="metric-card-content">
        <div className="skeleton-text skeleton-text-sm" />
        <div className="skeleton-text skeleton-text-lg" />
        <div className="skeleton-text skeleton-text-sm" />
      </div>
      <div className="skeleton-icon" />
    </div>
  )
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </>
  )
}

export function PieChartSkeleton() {
  return (
    <div className="pie-chart skeleton">
      <div className="skeleton-circle" />
      <div className="skeleton-text skeleton-text-sm" />
    </div>
  )
}

export function PieChartsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PieChartSkeleton key={i} />
      ))}
    </>
  )
}

export function ChartSkeleton() {
  return (
    <div className="chart skeleton">
      <div className="chart-header">
        <div className="skeleton-icon-sm" />
        <div className="chart-titles">
          <div className="skeleton-text skeleton-text-md" />
          <div className="skeleton-text skeleton-text-sm" />
        </div>
      </div>
      <div className="chart-content">
        <div className="skeleton-chart-area" />
      </div>
    </div>
  )
}

export function ChartsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ChartSkeleton key={i} />
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="data-table skeleton">
      <div className="data-table-header">
        <div className="skeleton-text skeleton-text-md" />
      </div>
      <div className="skeleton-table-rows">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-text skeleton-text-sm" />
            <div className="skeleton-text skeleton-text-md" />
            <div className="skeleton-text skeleton-text-sm" />
            <div className="skeleton-text skeleton-text-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
