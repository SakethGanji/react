import type { Distribution } from '../types'
import { PieChart } from '@/shared/charts'
import { useUIStore } from '@/shared/store/useUIStore'

export function EChartsPieChart({ label, value }: Distribution) {
  const theme = useUIStore((state) => state.theme)
  const trackColor = theme === 'dark' ? '#2D3748' : '#E5E5E5'
  const fillColor = theme === 'dark' ? '#a5b4fc' : '#818cf8' // chart-1 (indigo)

  const data = [
    { name: label, value, color: fillColor },
    { name: 'Remaining', value: 100 - value, color: trackColor },
  ]

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center">
        <PieChart
          data={data}
          innerRadius="72%"
          height={72}
        />
        <span className="absolute text-xs font-semibold pointer-events-none">{value}%</span>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  )
}
