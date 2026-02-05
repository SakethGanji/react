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
      className={`echarts-container ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {loading ? (
        <div className="echarts-loading">
          <div className="echarts-loading-spinner" />
        </div>
      ) : (
        <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  )
})
