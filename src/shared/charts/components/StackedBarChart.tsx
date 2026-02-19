import { memo, useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { BaseChartProps } from '../types'
import { BaseChart } from './BaseChart'
import { getPastelPalette } from '../themes/citiTheme'

export interface StackedBarChartSeries {
  name: string
  data: number[]
  color?: string
}

export interface StackedBarChartProps extends BaseChartProps {
  series: StackedBarChartSeries[]
  xAxisData?: string[]
  horizontal?: boolean
}

export const StackedBarChart = memo(function StackedBarChart({
  series,
  xAxisData,
  horizontal = false,
  className,
  loading,
  height,
  options: customOptions,
}: StackedBarChartProps) {
  const options = useMemo<EChartsOption>(() => {
    const axisData = xAxisData || series[0]?.data.map((_, i) => String(i + 1)) || []
    const palette = getPastelPalette()

    const categoryAxis = {
      type: 'category' as const,
      data: axisData,
      show: false,
    }

    const valueAxis = {
      type: 'value' as const,
      show: false,
    }

    const seriesConfig = series.map((s, index) => ({
      name: s.name,
      type: 'bar' as const,
      stack: 'total',
      data: s.data,
      itemStyle: {
        color: s.color || palette[index % palette.length],
        borderRadius: index === series.length - 1 ? [2, 2, 0, 0] : 0,
      },
      barMaxWidth: 40,
    }))

    return {
      ...customOptions,
      grid: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 30,
        containLabel: false,
      },
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        confine: true,
      },
      legend: {
        show: true,
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        textStyle: {
          fontSize: 11,
        },
      },
      series: seriesConfig,
    }
  }, [series, xAxisData, horizontal, customOptions])

  return (
    <BaseChart
      options={options}
      className={className}
      loading={loading}
      height={height}
    />
  )
})
