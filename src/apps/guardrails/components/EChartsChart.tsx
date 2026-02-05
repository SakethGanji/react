import type { ChartData } from '../types'
import { LineChart, StackedBarChart, AreaChart } from '@/shared/charts'

export function EChartsChart({ title, subtitle, icon: Icon, type, data }: ChartData) {
  // For bar charts, create 6 stacked series from the data
  const stackedSeries = type === 'bar' ? [
    { name: 'Active', data: data.map(v => Math.round(v * 0.30)) },
    { name: 'Pending', data: data.map(v => Math.round(v * 0.20)) },
    { name: 'Queued', data: data.map(v => Math.round(v * 0.15)) },
    { name: 'Processing', data: data.map(v => Math.round(v * 0.15)) },
    { name: 'Completed', data: data.map(v => Math.round(v * 0.12)) },
    { name: 'Archived', data: data.map(v => Math.round(v * 0.08)) },
  ] : []

  // Use different chart styles based on title
  const isGrowthTrend = title.toLowerCase().includes('growth')

  const renderChart = () => {
    if (type === 'bar') {
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
