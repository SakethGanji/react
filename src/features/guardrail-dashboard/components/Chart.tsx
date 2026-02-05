import type { ChartData } from '../types'

export function Chart({ title, subtitle, icon: Icon, type, data }: ChartData) {
  const maxValue = Math.max(...data)

  return (
    <div className="chart">
      <div className="chart-header">
        <div className="chart-icon">
          <Icon size={20} />
        </div>
        <div className="chart-titles">
          <h4 className="chart-title">{title}</h4>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="chart-content">
        {type === 'bar' ? (
          <div className="chart-bars">
            {data.map((value, i) => (
              <div key={i} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <svg className="chart-line" viewBox="0 0 200 80" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={data
                .map((value, i) => {
                  const x = (i / (data.length - 1)) * 200
                  const y = 80 - (value / maxValue) * 70
                  return `${x},${y}`
                })
                .join(' ')}
            />
          </svg>
        )}
      </div>
    </div>
  )
}
