import type { EChartsOption } from 'echarts'

// Official Citi Brand Colors
export const CITI_COLORS = {
  // Primary brand colors
  ateneoBlue: '#003B70',      // Primary Citi blue
  maximumRed: '#D9261C',      // Accent red

  // Extended palette
  primary: '#003B70',         // Ateneo Blue
  secondary: '#00508C',       // Lighter blue
  accent: '#0073CF',          // Bright blue for highlights
  light: '#E8F4FC',           // Very light blue for backgrounds

  // Semantic colors
  success: '#00805A',         // Citi green
  warning: '#C75B12',         // Orange
  danger: '#D9261C',          // Maximum Red

  // Neutrals
  gray100: '#F7F7F7',
  gray200: '#E5E5E5',
  gray300: '#CCCCCC',
  gray500: '#666666',
  gray700: '#333333',
  gray900: '#1A1A1A',
}

// Professional Citi chart palette
const CHART_PALETTE = [
  CITI_COLORS.ateneoBlue,     // Primary blue
  CITI_COLORS.accent,          // Bright blue
  CITI_COLORS.secondary,       // Mid blue
  CITI_COLORS.success,         // Green
  CITI_COLORS.warning,         // Orange
  CITI_COLORS.maximumRed,      // Red (used sparingly)
  '#5B8FA8',                   // Muted teal
  '#8B9DC3',                   // Muted purple-blue
]

export const citiLightTheme: EChartsOption = {
  color: CHART_PALETTE,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Interstate", "Helvetica Neue", Arial, sans-serif',
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
    extraCssText: 'box-shadow: 0 2px 8px rgba(0, 59, 112, 0.12); border-radius: 4px;',
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
    axisLine: {
      lineStyle: {
        color: CITI_COLORS.gray200,
      },
    },
    axisTick: {
      lineStyle: {
        color: CITI_COLORS.gray300,
      },
    },
    axisLabel: {
      color: CITI_COLORS.gray500,
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: CITI_COLORS.gray100,
      },
    },
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: CITI_COLORS.gray200,
      },
    },
    axisTick: {
      lineStyle: {
        color: CITI_COLORS.gray300,
      },
    },
    axisLabel: {
      color: CITI_COLORS.gray500,
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: CITI_COLORS.gray100,
      },
    },
  },
}

export const citiDarkTheme: EChartsOption = {
  color: CHART_PALETTE,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Interstate", "Helvetica Neue", Arial, sans-serif',
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
    extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); border-radius: 4px;',
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
    axisLine: {
      lineStyle: {
        color: '#2D3748',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#3D4A5C',
      },
    },
    axisLabel: {
      color: '#AAAAAA',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#232D3B',
      },
    },
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#2D3748',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#3D4A5C',
      },
    },
    axisLabel: {
      color: '#AAAAAA',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#232D3B',
      },
    },
  },
}

export function getTheme(mode: 'light' | 'dark'): EChartsOption {
  return mode === 'dark' ? citiDarkTheme : citiLightTheme
}
