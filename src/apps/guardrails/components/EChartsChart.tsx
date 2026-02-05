import type { ChartData } from '../types'
import { LineChart, BarChart, StackedBarChart, AreaChart } from '@/shared/charts'

export function EChartsChart({ title, subtitle, icon: Icon, type, data, xAxisData, stackedSeries }: ChartData) {
  // Use different chart styles based on title
  const isGrowthTrend = title.toLowerCase().includes('growth')

  const renderChart = () => {
    // Stacked bar chart (guardrail triggers)
    if (type === 'bar' && stackedSeries && stackedSeries.length > 0) {
      return <StackedBarChart series={stackedSeries} xAxisData={xAxisData} height="100%" />
    }
    // Simple bar chart (request volume)
    if (type === 'bar') {
      return <BarChart data={data} xAxisData={xAxisData} seriesName={title} height="100%" />
    }
    // Area chart for growth trends
    if (isGrowthTrend) {
      return <AreaChart data={data} xAxisData={xAxisData} seriesName="Growth" height="100%" />
    }
    // Line chart (response latency)
    return <LineChart data={data} xAxisData={xAxisData} smooth areaStyle height="100%" />
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
