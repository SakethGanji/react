import { LucideIcon } from 'lucide-react'

export interface MetricResponse {
  label: string
  value: string
  growth: string
  icon: string
}

export interface Metric {
  label: string
  value: string
  growth: string
  icon: LucideIcon
}

export interface Distribution {
  label: string
  value: number
  color: string
}

export interface TableRow {
  id: string
  name: string
  type: string
  load: string
  efficiency: number
  status: 'active' | 'scaling' | 'review'
}

export interface ChartResponse {
  title: string
  subtitle: string
  icon: string
  type: 'line' | 'bar'
  data: number[]
}

export interface ChartData {
  title: string
  subtitle: string
  icon: LucideIcon
  type: 'line' | 'bar'
  data: number[]
}

// Filter types
export interface DashboardFilters {
  category: string | null
  status: string | null
  dateRange: {
    start: string | null  // ISO date string
    end: string | null
  }
}

export const DEFAULT_FILTERS: DashboardFilters = {
  category: null,
  status: null,
  dateRange: {
    start: null,
    end: null,
  },
}

// Filter options - customize these
export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'quantum', label: 'Quantum' },
  { value: 'relay', label: 'Relay' },
  { value: 'base', label: 'Base' },
  { value: 'edge', label: 'Edge' },
]

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'review', label: 'Review' },
]

// Settings types
export interface GeneralSettings {
  siteName: string
  language: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  frequency: string
}
