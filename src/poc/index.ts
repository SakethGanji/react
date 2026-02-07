import { ComponentType, lazy } from 'react'

export interface POCEntry {
  id: string
  name: string
  description: string
  path: string  // Custom path for this POC (e.g., '/chart-experiments')
  tags: string[]
  component: ComponentType
}

export const POC_REGISTRY: POCEntry[] = import.meta.env.DEV
  ? [
      {
        id: 'chart-experiments',
        name: 'Chart Experiments',
        description: 'Experimental chart components and visualizations',
        path: '/chart-experiments',
        tags: ['charts', 'visualization', 'echarts'],
        component: lazy(() => import('./chart-experiments')),
      },
    ]
  : []

export function getPocByPath(path: string): POCEntry | undefined {
  return POC_REGISTRY.find((poc) => poc.path === path)
}
