import { useEffect, useRef, useCallback } from 'react'
import * as echarts from 'echarts/core'

type EChartsInstance = ReturnType<typeof echarts.init>

export function useChartResize(chart: EChartsInstance | null) {
  const rafId = useRef<number | null>(null)

  const resize = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }
    rafId.current = requestAnimationFrame(() => {
      chart?.resize()
    })
  }, [chart])

  useEffect(() => {
    if (!chart) return

    const container = chart.getDom()
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      resize()
    })

    resizeObserver.observe(container)

    const handleWindowResize = () => {
      resize()
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [chart, resize])

  return resize
}
