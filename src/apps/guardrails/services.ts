import {
  Wallet,
  Globe,
  Cpu,
  ShieldCheck,
  ShieldX,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Clock,
  LucideIcon,
  HelpCircle,
} from 'lucide-react'
import { backends } from '@/config/backends'
import { ApiError } from './errors'
import type {
  Metric,
  Distribution,
  TableRow,
  ChartData,
  DashboardFilters,
  GeneralSettings,
  NotificationSettings,
  CardsApiResponse,
  GuardrailsApiResponse,
  GuardrailCategory,
  ChartsApiResponse,
  GuardrailTriggersDataPoint,
} from './types'

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Globe,
  Cpu,
  ShieldCheck,
  ShieldX,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Clock,
}

function getIcon(name: string): LucideIcon {
  return iconMap[name] || HelpCircle
}

// Convert date from YYYY-MM-DD to ISO format for API
// start dates get T00:00:00Z, end dates get T23:59:59Z
function toIsoDateTime(date: string, isEnd: boolean): string {
  const time = isEnd ? 'T23:59:59Z' : 'T00:00:00Z'
  return `${date}${time}`
}

// Build query string from filters (new format with start_date/end_date)
function buildQueryParams(filters: DashboardFilters): string {
  const params = new URLSearchParams()

  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)

  // Convert dates to ISO format for API
  if (filters.dateRange.start) {
    params.set('start_date', toIsoDateTime(filters.dateRange.start, false))
  }
  if (filters.dateRange.end) {
    params.set('end_date', toIsoDateTime(filters.dateRange.end, true))
  }

  return `?${params.toString()}`
}

// Transform cards API response to Metric[] for components
function transformCardsToMetrics(data: CardsApiResponse): Metric[] {
  return [
    {
      label: 'Total Conversations',
      value: data.total_conversations.toLocaleString(),
      growth: data.percentage_changes.total_conversations,
      icon: getIcon('MessageSquare'),
    },
    {
      label: 'Total Utterances',
      value: data.total_utterances.toLocaleString(),
      growth: 0,
      icon: getIcon('Activity'),
    },
    {
      label: 'Blocked Responses',
      value: data.blocked_responses.toLocaleString(),
      growth: data.percentage_changes.blocked_responses,
      icon: getIcon('ShieldX'),
    },
    {
      label: 'Delivered Responses',
      value: data.delivered_responses.toLocaleString(),
      growth: data.percentage_changes.delivered_responses,
      icon: getIcon('ShieldCheck'),
    },
  ]
}

// Format guardrail category name (e.g., "input_guardrails" -> "Input Guardrails")
function formatCategoryName(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Colors for each guardrail category
const guardrailColors: Record<string, string> = {
  input_guardrails: '#3b82f6',
  contextual_relevancy: '#8b5cf6',
  bias_fairness: '#06b6d4',
  hallucination: '#f43f5e',
  factual_accuracy: '#10b981',
  output_moderation: '#f59e0b',
}

// Transform guardrails API response to Distribution[] for pie charts
function transformGuardrailsToDistribution(data: GuardrailsApiResponse['data']): Distribution[] {
  const categories = Object.keys(data) as Array<keyof typeof data>

  return categories.map((key) => {
    const items = data[key]
    const delivered = items.find((item: GuardrailCategory) => item._id === 'Delivered')?.count || 0
    const blocked = items.find((item: GuardrailCategory) => item._id === 'Blocked')?.count || 0
    const total = delivered + blocked
    const percentage = total > 0 ? Math.round((delivered / total) * 100) : 0

    return {
      label: formatCategoryName(key),
      value: percentage,
      color: guardrailColors[key] || '#6b7280',
    }
  })
}

export async function fetchMetrics(filters: DashboardFilters): Promise<Metric[]> {
  const endpoint = '/api/metrics/cards'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}${buildQueryParams(filters)}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    const data: CardsApiResponse = await response.json()
    return transformCardsToMetrics(data)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

export async function fetchDistribution(filters: DashboardFilters): Promise<Distribution[]> {
  const endpoint = '/api/metrics/guardrails'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}${buildQueryParams(filters)}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    const data: GuardrailsApiResponse = await response.json()
    return transformGuardrailsToDistribution(data.data)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

export async function fetchTableData(filters: DashboardFilters): Promise<TableRow[]> {
  const endpoint = '/api/table'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}${buildQueryParams(filters)}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

// Build query params for charts endpoint (includes granularity)
function buildChartsQueryParams(filters: DashboardFilters): string {
  const params = new URLSearchParams()

  // Convert dates to ISO format for API
  if (filters.dateRange.start) {
    params.set('start_date', toIsoDateTime(filters.dateRange.start, false))
  }
  if (filters.dateRange.end) {
    params.set('end_date', toIsoDateTime(filters.dateRange.end, true))
  }
  params.set('granularity', 'hour')
  params.set('chart_type', 'all')

  return `?${params.toString()}`
}

// Format timestamp for chart x-axis (e.g., "2026-02-04T08:00:00" -> "08:00")
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Guardrail category keys for stacked bar chart
const guardrailKeys = [
  'input_guardrails',
  'contextual_relevancy',
  'bias_fairness',
  'hallucination',
  'factual_accuracy',
  'output_moderation',
] as const

// Transform charts API response to ChartData[] for components
function transformChartsApiResponse(data: ChartsApiResponse): ChartData[] {
  const { charts } = data

  // Request Volume - Bar Chart
  const requestVolumeChart: ChartData = {
    title: 'Request Volume',
    subtitle: 'Requests over time',
    icon: getIcon('BarChart3'),
    type: 'bar',
    data: charts.request_volume.data.map((d) => d.value),
    xAxisData: charts.request_volume.data.map((d) => formatTimestamp(d.timestamp)),
  }

  // Guardrail Triggers - Stacked Bar Chart
  const guardrailTriggersChart: ChartData = {
    title: 'Guardrail Triggers',
    subtitle: 'Triggers by category',
    icon: getIcon('ShieldX'),
    type: 'bar',
    data: [],
    xAxisData: charts.guardrail_triggers.data.map((d) => formatTimestamp(d.timestamp)),
    stackedSeries: guardrailKeys.map((key) => ({
      name: formatCategoryName(key),
      data: charts.guardrail_triggers.data.map((d: GuardrailTriggersDataPoint) => d[key]),
      color: guardrailColors[key],
    })),
  }

  // Response Latency - Line Chart (using avg values)
  const responseLatencyChart: ChartData = {
    title: 'Response Latency',
    subtitle: 'Average latency (ms)',
    icon: getIcon('Clock'),
    type: 'line',
    data: charts.response_latency.data.map((d) => d.avg),
    xAxisData: charts.response_latency.data.map((d) => formatTimestamp(d.timestamp)),
  }

  return [requestVolumeChart, guardrailTriggersChart, responseLatencyChart]
}

export async function fetchCharts(filters: DashboardFilters): Promise<ChartData[]> {
  const endpoint = '/api/metrics/charts'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}${buildChartsQueryParams(filters)}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    const data: ChartsApiResponse = await response.json()
    return transformChartsApiResponse(data)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  const endpoint = '/api/settings/general'
  try {
    const response = await fetch(`${backends.settings}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const endpoint = '/api/settings/notifications'
  try {
    const response = await fetch(`${backends.settings}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}
