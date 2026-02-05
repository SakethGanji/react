import { memo, useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { PieChartProps } from '../types'
import { BaseChart } from './BaseChart'

export const PieChart = memo(function PieChart({
  data,
  innerRadius = '50%',
  showLabel = false,
  className,
  loading,
  height = 100,
  options: customOptions,
}: PieChartProps) {
  const options = useMemo<EChartsOption>(() => {
    const seriesData = data.map((item) => ({
      name: item.name,
      value: item.value,
      itemStyle: item.color ? { color: item.color } : undefined,
    }))

    return {
      ...customOptions,
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const p = params as { name: string; value: number; percent: number }
          if (p.name === 'Remaining') return ''
          return `${p.name}: ${p.value}%`
        },
        confine: true,
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: 'pie',
          radius: [innerRadius, '90%'],
          center: ['50%', '50%'],
          data: seriesData,
          label: {
            show: showLabel,
            position: 'outside',
          },
          labelLine: {
            show: showLabel,
          },
          emphasis: {
            disabled: true,
          },
          silent: data.some(d => d.name === 'Remaining'),
        },
      ],
    }
  }, [data, innerRadius, showLabel, customOptions])

  return (
    <BaseChart
      options={options}
      className={className}
      loading={loading}
      height={height}
    />
  )
})
