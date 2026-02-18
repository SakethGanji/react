import { memo } from 'react'
import type { BaseChartProps } from '../types'
import { useECharts } from '../hooks/useECharts'
import type { EChartsOption } from 'echarts'

interface Props extends BaseChartProps {
  options: EChartsOption
}

export const BaseChart = memo(function BaseChart({
  options,
  className = '',
  loading = false,
  height = 200,
}: Props) {
  const { chartRef } = useECharts({ options })

  return (
    <div
      className={`h-full w-full min-h-[100px] ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {loading ? (
        <div className="flex h-full w-full min-h-[100px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-[3px] border-border border-t-primary" />
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  )
})
