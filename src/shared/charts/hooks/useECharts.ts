import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { useUIStore } from '@/shared/store/useUIStore'
import { getTheme } from '../themes/citiTheme'
import { useChartResize } from './useChartResize'

type EChartsInstance = ReturnType<typeof echarts.init>

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

interface UseEChartsOptions {
  options: EChartsOption
}

export function useECharts({ options }: UseEChartsOptions) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<EChartsInstance | null>(null)
  const theme = useUIStore((state) => state.theme)

  const resize = useChartResize(chart)

  const getChart = useCallback(() => chart, [chart])

  useEffect(() => {
    if (!chartRef.current) return

    const instance = echarts.init(chartRef.current)
    setChart(instance)

    return () => {
      instance.dispose()
    }
  }, [])

  useEffect(() => {
    if (!chart) return

    const themeOptions = getTheme(theme)
    const mergedOptions: EChartsOption = {
      ...themeOptions,
      ...options,
      textStyle: {
        ...themeOptions.textStyle,
        ...options.textStyle,
      },
      tooltip: {
        ...themeOptions.tooltip,
        ...(options.tooltip as object),
      },
    }

    chart.setOption(mergedOptions, true)
  }, [chart, options, theme])

  return { chartRef, resize, getChart }
}
