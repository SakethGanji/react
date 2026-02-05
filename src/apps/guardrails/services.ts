import {
  Wallet,
  Globe,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  LucideIcon,
  HelpCircle,
} from 'lucide-react'
import { backends } from '@/config/backends'
import type {
  Metric,
  MetricResponse,
  Distribution,
  TableRow,
  ChartData,
  ChartResponse,
  DashboardFilters,
  GeneralSettings,
  NotificationSettings,
} from './types'

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Globe,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
}

function getIcon(name: string): LucideIcon {
  return iconMap[name] || HelpCircle
}

// Build query string from filters
function buildQueryParams(filters: DashboardFilters): string {
  const params = new URLSearchParams()

  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateRange.start) params.set('startDate', filters.dateRange.start)
  if (filters.dateRange.end) params.set('endDate', filters.dateRange.end)

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export async function fetchMetrics(filters: DashboardFilters): Promise<Metric[]> {
  const response = await fetch(`${backends.dashboard}/api/metrics${buildQueryParams(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch metrics')
  const data: MetricResponse[] = await response.json()
  return data.map((m) => ({ ...m, icon: getIcon(m.icon) }))
}

export async function fetchDistribution(filters: DashboardFilters): Promise<Distribution[]> {
  const response = await fetch(`${backends.dashboard}/api/distribution${buildQueryParams(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch distribution')
  return response.json()
}

export async function fetchTableData(filters: DashboardFilters): Promise<TableRow[]> {
  const response = await fetch(`${backends.dashboard}/api/table${buildQueryParams(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch table data')
  return response.json()
}

export async function fetchCharts(filters: DashboardFilters): Promise<ChartData[]> {
  const response = await fetch(`${backends.dashboard}/api/charts${buildQueryParams(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch charts')
  const data: ChartResponse[] = await response.json()
  return data.map((c) => ({
    ...c,
    icon: getIcon(c.icon),
    stackedSeries: c.stackedSeries,
  }))
}

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  const response = await fetch(`${backends.settings}/api/settings/general`)
  if (!response.ok) throw new Error('Failed to fetch general settings')
  return response.json()
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const response = await fetch(`${backends.settings}/api/settings/notifications`)
  if (!response.ok) throw new Error('Failed to fetch notification settings')
  return response.json()
}
