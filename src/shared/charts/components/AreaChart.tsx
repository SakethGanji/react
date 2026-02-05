import { memo, useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { BaseChartProps } from '../types'
import { BaseChart } from './BaseChart'
import { CITI_COLORS } from '../themes/citiTheme'

export interface AreaChartProps extends BaseChartProps {
  data: number[]
  xAxisData?: string[]
  seriesName?: string
  color?: string
}

export const AreaChart = memo(function AreaChart({
  data,
  xAxisData,
  seriesName = 'Value',
  color = CITI_COLORS.accent,  // Bright Citi blue
  className,
  loading,
  height,
  options: customOptions,
}: AreaChartProps) {
  const options = useMemo<EChartsOption>(() => {
    const xAxis = xAxisData || data.map((_, i) => String(i + 1))

    return {
      ...customOptions,
      grid: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 30,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        show: false,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
      },
      legend: {
        show: true,
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 11,
        },
      },
      series: [
        {
          name: seriesName,
          type: 'line',
          data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: true,
          lineStyle: {
            width: 0,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}` },
                { offset: 1, color: `${color}20` },
              ],
            },
          },
          itemStyle: {
            color: color,
          },
        },
      ],
    }
  }, [data, xAxisData, seriesName, color, customOptions])

  return (
    <BaseChart
      options={options}
      className={className}
      loading={loading}
      height={height}
    />
  )
})
