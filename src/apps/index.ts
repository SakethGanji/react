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
  header?: ComponentType
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
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analytics dashboards and reports',
    basePath: '/analytics',
    defaultRoute: '/analytics/overview',
    routes: [
      {
        path: 'overview',
        label: 'Overview',
        component: lazy(() => import('./analytics/pages/Overview').then(m => ({ default: m.Overview }))),
      },
      {
        path: 'reports',
        label: 'Reports',
        component: lazy(() => import('./analytics/pages/Reports').then(m => ({ default: m.Reports }))),
      },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management and settings',
    basePath: '/users',
    defaultRoute: '/users/list',
    routes: [
      {
        path: 'list',
        label: 'Users',
        component: lazy(() => import('./users/pages/List').then(m => ({ default: m.List }))),
      },
      {
        path: 'settings',
        label: 'Settings',
        component: lazy(() => import('./users/pages/Settings').then(m => ({ default: m.Settings }))),
      },
    ],
  },
]

export function getAppByPath(path: string): AppEntry | undefined {
  return APP_REGISTRY.find((app) => path.startsWith(app.basePath))
}
