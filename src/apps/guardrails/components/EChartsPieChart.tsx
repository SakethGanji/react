import type { Distribution } from '../types'
import { PieChart, CITI_COLORS } from '@/shared/charts'
import { useUIStore } from '@/shared/store/useUIStore'

// Interpolate between light blue and dark Citi blue based on percentage
function getBlueGradient(percentage: number): string {
  // Light blue (low %) to Ateneo Blue (high %)
  const lightBlue = { r: 0x73, g: 0xB5, b: 0xE8 }  // #73B5E8
  const darkBlue = { r: 0x00, g: 0x3B, b: 0x70 }   // #003B70 (Ateneo Blue)

  const ratio = Math.min(Math.max(percentage / 100, 0), 1)

  const r = Math.round(lightBlue.r + (darkBlue.r - lightBlue.r) * ratio)
  const g = Math.round(lightBlue.g + (darkBlue.g - lightBlue.g) * ratio)
  const b = Math.round(lightBlue.b + (darkBlue.b - lightBlue.b) * ratio)

  return `rgb(${r}, ${g}, ${b})`
}

export function EChartsPieChart({ label, value }: Distribution) {
  const theme = useUIStore((state) => state.theme)
  const trackColor = theme === 'dark' ? '#2D3748' : CITI_COLORS.gray200

  // Blue gradient: lighter for low %, darker for high %
  const fillColor = getBlueGradient(value)

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
