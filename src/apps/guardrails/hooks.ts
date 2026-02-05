import { useQuery } from '@tanstack/react-query'
import {
  fetchMetrics,
  fetchDistribution,
  fetchTableData,
  fetchCharts,
  fetchGeneralSettings,
  fetchNotificationSettings,
} from './services'
import { useDashboardStore } from './store'
import { DashboardFilters } from './types'

// Helper to convert filters to query key
function filtersToKey(filters: DashboardFilters) {
  return {
    category: filters.category,
    status: filters.status,
    startDate: filters.dateRange.start,
    endDate: filters.dateRange.end,
  }
}

// Draft filters (for UI display)
export function useDraftFilters() {
  return useDashboardStore((state) => state.draftFilters)
}

// Applied filters (for queries)
export function useAppliedFilters() {
  return useDashboardStore((state) => state.appliedFilters)
}

// Is dirty (draft differs from applied)
export function useIsDirty() {
  return useDashboardStore((state) => state.isDirty)
}

// Last updated time
export function useLastUpdated() {
  return useDashboardStore((state) => state.lastUpdated)
}

// Filter actions
export function useFilterActions() {
  const setCategory = useDashboardStore((state) => state.setCategory)
  const setStatus = useDashboardStore((state) => state.setStatus)
  const setDateRange = useDashboardStore((state) => state.setDateRange)
  const applyFilters = useDashboardStore((state) => state.applyFilters)
  const resetFilters = useDashboardStore((state) => state.resetFilters)
  return { setCategory, setStatus, setDateRange, applyFilters, resetFilters }
}

export function useMetrics() {
  const filters = useAppliedFilters()

  return useQuery({
    queryKey: ['metrics', filtersToKey(filters)],
    queryFn: () => fetchMetrics(filters),
  })
}

export function useDistribution() {
  const filters = useAppliedFilters()

  return useQuery({
    queryKey: ['distribution', filtersToKey(filters)],
    queryFn: () => fetchDistribution(filters),
  })
}

export function useTableData() {
  const filters = useAppliedFilters()

  return useQuery({
    queryKey: ['tableData', filtersToKey(filters)],
    queryFn: () => fetchTableData(filters),
  })
}

export function useCharts() {
  const filters = useAppliedFilters()

  return useQuery({
    queryKey: ['charts', filtersToKey(filters)],
    queryFn: () => fetchCharts(filters),
  })
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ['settings', 'general'],
    queryFn: fetchGeneralSettings,
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: fetchNotificationSettings,
  })
}
