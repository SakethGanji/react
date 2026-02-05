import { memo, useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { BarChartProps } from '../types'
import { BaseChart } from './BaseChart'
import { CITI_COLORS } from '../themes/citiTheme'

export const BarChart = memo(function BarChart({
  data,
  xAxisData,
  horizontal = false,
  seriesName = 'Value',
  className,
  loading,
  height,
  options: customOptions,
}: BarChartProps) {
  const options = useMemo<EChartsOption>(() => {
    const axisData = xAxisData || data.map((_, i) => String(i + 1))

    const categoryAxis = {
      type: 'category' as const,
      data: axisData,
      show: false,
    }

    const valueAxis = {
      type: 'value' as const,
      show: false,
    }

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
        textStyle: {
          fontSize: 11,
        },
      },
      series: [
        {
          name: seriesName,
          type: 'bar',
          data,
          itemStyle: {
            color: CITI_COLORS.ateneoBlue,
            borderRadius: [2, 2, 0, 0],
          },
          barMaxWidth: 40,
        },
      ],
    }
  }, [data, xAxisData, horizontal, seriesName, customOptions])

  return (
    <BaseChart
      options={options}
      className={className}
      loading={loading}
      height={height}
    />
  )
})
