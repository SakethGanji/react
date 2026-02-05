import type { Metric } from '../types'

export function MetricCard({ label, value, growth, icon: Icon }: Metric) {
  const isPositive = growth >= 0
  const arrow = isPositive ? '↑' : '↓'
  const growthClass = isPositive ? 'metric-card-growth-positive' : 'metric-card-growth-negative'

  return (
    <div className="metric-card">
      <div className="metric-card-content">
        <p className="metric-card-label">{label}</p>
        <h3 className="metric-card-value">{value}</h3>
        <span className={`metric-card-growth ${growthClass}`}>
          {arrow} {Math.abs(growth)}%
        </span>
      </div>
      <div className="metric-card-icon">
        <Icon size={20} />
      </div>
    </div>
  )
}
