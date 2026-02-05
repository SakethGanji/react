import { createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { RootLayout } from './routes/__root'
import { GuardrailDashboardPage } from './features/guardrail-dashboard/GuardrailDashboardPage'
import { SettingsPage } from './features/settings/SettingsPage'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

// Redirect root to /guardrail-dashboard
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/guardrail-dashboard' })
  },
})

export const guardrailDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guardrail-dashboard',
  component: GuardrailDashboardPage,
})

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  guardrailDashboardRoute,
  settingsRoute,
])
