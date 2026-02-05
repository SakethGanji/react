export interface NavItem {
  path: string
  label: string
}

export const GUARDRAILS_NAV: NavItem[] = [
  { path: '/guardrails/dashboard', label: 'Dashboard' },
  { path: '/guardrails/settings', label: 'Settings' },
]
