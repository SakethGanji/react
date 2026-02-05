import type { Distribution } from '../types'

export function PieChart({ label, value, color }: Distribution) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="pie-chart">
      <div className="pie-chart-svg-container">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="pie-chart-track"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
        <span className="pie-chart-value">{value}%</span>
      </div>
      <span className="pie-chart-label">{label}</span>
    </div>
  )
}
