import type { ChartData } from '../types'
import { LineChart, StackedBarChart, AreaChart } from '@/shared/charts'

export function EChartsChart({ title, subtitle, icon: Icon, type, data, stackedSeries }: ChartData) {
  // Use different chart styles based on title
  const isGrowthTrend = title.toLowerCase().includes('growth')

  const renderChart = () => {
    if (type === 'bar' && stackedSeries && stackedSeries.length > 0) {
      return <StackedBarChart series={stackedSeries} height="100%" />
    }
    if (isGrowthTrend) {
      return <AreaChart data={data} seriesName="Growth" height="100%" />
    }
    return <LineChart data={data} smooth areaStyle height="100%" />
  }

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
        {renderChart()}
      </div>
    </div>
  )
}
