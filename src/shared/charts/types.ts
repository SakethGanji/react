import type { EChartsOption } from 'echarts'

export interface BaseChartProps {
  className?: string
  loading?: boolean
  height?: number | string
  options?: Partial<EChartsOption>
}

export interface LineChartProps extends BaseChartProps {
  data: number[]
  xAxisData?: string[]
  smooth?: boolean
  areaStyle?: boolean
  seriesName?: string
}

export interface BarChartProps extends BaseChartProps {
  data: number[]
  xAxisData?: string[]
  horizontal?: boolean
  seriesName?: string
}

export interface PieChartDataItem {
  name: string
  value: number
  color?: string
}

export interface PieChartProps extends BaseChartProps {
  data: PieChartDataItem[]
  innerRadius?: number | string
  showLabel?: boolean
}
