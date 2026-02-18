import type { ChartData } from '../types'
import { LineChart, BarChart, StackedBarChart, AreaChart } from '@/shared/charts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/shared/components/ui/card'

export function EChartsChart({ title, subtitle, icon: Icon, type, data, xAxisData, stackedSeries }: ChartData) {
  const isGrowthTrend = title.toLowerCase().includes('growth')

  const renderChart = () => {
    if (type === 'bar' && stackedSeries && stackedSeries.length > 0) {
      return <StackedBarChart series={stackedSeries} xAxisData={xAxisData} height="100%" />
    }
    if (type === 'bar') {
      return <BarChart data={data} xAxisData={xAxisData} seriesName={title} height="100%" />
    }
    if (isGrowthTrend) {
      return <AreaChart data={data} xAxisData={xAxisData} seriesName="Growth" height="100%" />
    }
    return <LineChart data={data} xAxisData={xAxisData} smooth areaStyle height="100%" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
        <CardAction>
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </CardAction>
      </CardHeader>
      <CardContent className="h-[250px]">
        {renderChart()}
      </CardContent>
    </Card>
  )
}
