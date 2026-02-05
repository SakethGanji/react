// Public exports for the Guardrails app
export { Dashboard, Settings } from './pages'
export { GUARDRAILS_NAV } from './navigation'
export type { NavItem } from './navigation'

// Re-export types that may be needed externally
export type {
  Metric,
  Distribution,
  TableRow,
  ChartData,
  DashboardFilters,
  GeneralSettings,
  NotificationSettings,
} from './types'
