import { create } from 'zustand'
import { DashboardFilters, DEFAULT_FILTERS } from './types'

interface DashboardStore {
  // Applied filters (used for API calls)
  appliedFilters: DashboardFilters
  // Draft filters (user is editing)
  draftFilters: DashboardFilters
  // Whether draft differs from applied
  isDirty: boolean
  // Last time data was fetched
  lastUpdated: Date | null

  // Draft setters
  setCategory: (category: string | null) => void
  setStatus: (status: string | null) => void
  setDateRange: (start: string | null, end: string | null) => void

  // Apply draft to trigger refetch
  applyFilters: () => void
  // Reset to defaults
  resetFilters: () => void
  // Update last fetched time
  setLastUpdated: (date: Date) => void
}

function filtersEqual(a: DashboardFilters, b: DashboardFilters): boolean {
  return (
    a.category === b.category &&
    a.status === b.status &&
    a.dateRange.start === b.dateRange.start &&
    a.dateRange.end === b.dateRange.end
  )
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  appliedFilters: DEFAULT_FILTERS,
  draftFilters: DEFAULT_FILTERS,
  isDirty: false,
  lastUpdated: null,

  setCategory: (category) =>
    set((state) => {
      const newDraft = {
        ...state.draftFilters,
        category: category === 'all' ? null : category,
      }
      return {
        draftFilters: newDraft,
        isDirty: !filtersEqual(newDraft, state.appliedFilters),
      }
    }),

  setStatus: (status) =>
    set((state) => {
      const newDraft = {
        ...state.draftFilters,
        status: status === 'all' ? null : status,
      }
      return {
        draftFilters: newDraft,
        isDirty: !filtersEqual(newDraft, state.appliedFilters),
      }
    }),

  setDateRange: (start, end) =>
    set((state) => {
      const newDraft = {
        ...state.draftFilters,
        dateRange: { start, end },
      }
      return {
        draftFilters: newDraft,
        isDirty: !filtersEqual(newDraft, state.appliedFilters),
      }
    }),

  applyFilters: () =>
    set((state) => ({
      appliedFilters: { ...state.draftFilters },
      isDirty: false,
      lastUpdated: new Date(),
    })),

  resetFilters: () =>
    set({
      draftFilters: DEFAULT_FILTERS,
      appliedFilters: DEFAULT_FILTERS,
      isDirty: false,
      lastUpdated: new Date(),
    }),

  setLastUpdated: (date) => set({ lastUpdated: date }),
}))
