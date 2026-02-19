import type { EChartsOption } from 'echarts'

/** Read a CSS custom property value at runtime */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Return the 10-color pastel palette from CSS vars (theme-aware) */
export function getPastelPalette(): string[] {
  return Array.from({ length: 10 }, (_, i) => cssVar(`--chart-${i + 1}`))
}

// Light-mode fallbacks (used where a static value is needed)
export const CHART_COLORS = {
  indigo:  '#818cf8',
  gold:    '#facc15',
  emerald: '#34d399',
  red:     '#f87171',
  cyan:    '#22d3ee',
  purple:  '#c084fc',
  orange:  '#fb923c',
  teal:    '#2dd4bf',
  slate:   '#94a3b8',
  violet:  '#a78bfa',
}

// Keep CITI_COLORS export for any remaining neutral usages
export const CITI_COLORS = {
  gray100: '#F7F7F7',
  gray200: '#E5E5E5',
  gray300: '#CCCCCC',
  gray500: '#666666',
  gray700: '#333333',
  gray900: '#1A1A1A',
}

export const citiLightTheme: EChartsOption = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"DM Sans", ui-sans-serif, sans-serif, system-ui',
    color: CITI_COLORS.gray700,
  },
  title: {
    textStyle: {
      color: CITI_COLORS.gray900,
      fontWeight: 600,
    },
    subtextStyle: {
      color: CITI_COLORS.gray500,
    },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: CITI_COLORS.gray200,
    borderWidth: 1,
    textStyle: {
      color: CITI_COLORS.gray700,
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 8px;',
  },
  legend: {
    textStyle: {
      color: CITI_COLORS.gray500,
      fontSize: 11,
    },
  },
  grid: {
    borderColor: CITI_COLORS.gray200,
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: CITI_COLORS.gray200 } },
    axisTick: { lineStyle: { color: CITI_COLORS.gray300 } },
    axisLabel: { color: CITI_COLORS.gray500, fontSize: 11 },
    splitLine: { lineStyle: { color: CITI_COLORS.gray100 } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: CITI_COLORS.gray200 } },
    axisTick: { lineStyle: { color: CITI_COLORS.gray300 } },
    axisLabel: { color: CITI_COLORS.gray500, fontSize: 11 },
    splitLine: { lineStyle: { color: CITI_COLORS.gray100 } },
  },
}

export const citiDarkTheme: EChartsOption = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"DM Sans", ui-sans-serif, sans-serif, system-ui',
    color: '#E5E5E5',
  },
  title: {
    textStyle: {
      color: '#FFFFFF',
      fontWeight: 600,
    },
    subtextStyle: {
      color: '#AAAAAA',
    },
  },
  tooltip: {
    backgroundColor: '#1A2332',
    borderColor: '#2D3748',
    borderWidth: 1,
    textStyle: {
      color: '#E5E5E5',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); border-radius: 8px;',
  },
  legend: {
    textStyle: {
      color: '#AAAAAA',
      fontSize: 11,
    },
  },
  grid: {
    borderColor: '#2D3748',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#2D3748' } },
    axisTick: { lineStyle: { color: '#3D4A5C' } },
    axisLabel: { color: '#AAAAAA', fontSize: 11 },
    splitLine: { lineStyle: { color: '#232D3B' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#2D3748' } },
    axisTick: { lineStyle: { color: '#3D4A5C' } },
    axisLabel: { color: '#AAAAAA', fontSize: 11 },
    splitLine: { lineStyle: { color: '#232D3B' } },
  },
}

export function getTheme(mode: 'light' | 'dark'): EChartsOption {
  const palette = getPastelPalette()
  const base = mode === 'dark' ? citiDarkTheme : citiLightTheme
  return { ...base, color: palette }
}
