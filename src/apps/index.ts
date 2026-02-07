import { ComponentType, lazy } from 'react'

export interface AppRoute {
  /** Subpath relative to basePath, e.g. 'dashboard', 'settings' */
  path: string
  /** Navigation label shown in the app nav bar */
  label: string
  /** Lazy-loaded page component */
  component: ComponentType
}

export interface AppEntry {
  id: string
  name: string
  description: string
  basePath: string
  defaultRoute: string
  routes: AppRoute[]
}

export const APP_REGISTRY: AppEntry[] = [
  {
    id: 'guardrails',
    name: 'Guardrails',
    description: 'Guardrail monitoring and configuration dashboard',
    basePath: '/guardrails',
    defaultRoute: '/guardrails/dashboard',
    routes: [
      {
        path: 'dashboard',
        label: 'Dashboard',
        component: lazy(() => import('./guardrails/pages/Dashboard').then(m => ({ default: m.Dashboard }))),
      },
      {
        path: 'settings',
        label: 'Settings',
        component: lazy(() => import('./guardrails/pages/Settings').then(m => ({ default: m.Settings }))),
      },
    ],
  },
]

export function getAppByPath(path: string): AppEntry | undefined {
  return APP_REGISTRY.find((app) => path.startsWith(app.basePath))
}
