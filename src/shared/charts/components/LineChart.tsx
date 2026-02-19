import { memo, useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { LineChartProps } from '../types'
import { BaseChart } from './BaseChart'
import { getPastelPalette } from '../themes/citiTheme'

export const LineChart = memo(function LineChart({
  data,
  xAxisData,
  smooth = true,
  areaStyle = false,
  seriesName = 'Value',
  className,
  loading,
  height,
  options: customOptions,
}: LineChartProps) {
  const options = useMemo<EChartsOption>(() => {
    const xAxis = xAxisData || data.map((_, i) => String(i + 1))
    const palette = getPastelPalette()
    const color = palette[0]

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
          smooth,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color,
          },
          ...(areaStyle && {
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: `${color}80` },
                  { offset: 1, color: `${color}10` },
                ],
              },
            },
          }),
        },
      ],
    }
  }, [data, xAxisData, smooth, areaStyle, seriesName, customOptions])

  return (
    <BaseChart
      options={options}
      className={className}
      loading={loading}
      height={height}
    />
  )
})
