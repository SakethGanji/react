import { LineChart, AreaChart, StackedBarChart, PieChart } from '@/shared/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

const sampleLineData = [30, 40, 35, 50, 49, 60, 70, 91, 85, 95]
const sampleAreaData = [20, 30, 45, 35, 55, 60, 65, 75, 70, 80]

const stackedSeries = [
  { name: 'Series A', data: [120, 132, 101, 134, 90, 230, 210] },
  { name: 'Series B', data: [220, 182, 191, 234, 290, 330, 310] },
  { name: 'Series C', data: [150, 232, 201, 154, 190, 330, 410] },
]

const pieData = [
  { name: 'Category A', value: 335, color: '#003B70' },
  { name: 'Category B', value: 310, color: '#0066B3' },
  { name: 'Category C', value: 234, color: '#73B5E8' },
  { name: 'Category D', value: 135, color: '#B3D4F0' },
]

export default function ChartExperiments() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chart Experiments</h1>
        <p className="mt-2 text-muted-foreground">Testing various chart configurations and styles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={sampleLineData} smooth height={300} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Area Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart data={sampleAreaData} seriesName="Revenue" height={300} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stacked Bar Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBarChart series={stackedSeries} height={300} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pie Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={pieData} height={300} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donut Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={pieData} innerRadius="50%" height={300} />
        </CardContent>
      </Card>
    </main>
  )
}
