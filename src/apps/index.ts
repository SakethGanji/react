export interface AppEntry {
  id: string
  name: string
  description: string
  basePath: string
  defaultRoute: string
}

export const APP_REGISTRY: AppEntry[] = [
  {
    id: 'guardrails',
    name: 'Guardrails',
    description: 'Guardrail monitoring and configuration dashboard',
    basePath: '/guardrails',
    defaultRoute: '/guardrails/dashboard',
  },
]

export function getAppByPath(path: string): AppEntry | undefined {
  return APP_REGISTRY.find((app) => path.startsWith(app.basePath))
}
