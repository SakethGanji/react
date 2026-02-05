import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchMetrics,
  fetchDistribution,
  fetchTableData,
  fetchCharts,
  fetchGeneralSettings,
  fetchNotificationSettings,
  fetchMessagesTable,
  fetchConversation,
} from './services'
import { useDashboardStore } from './store'
import type { DashboardFilters, MessagesTableParams, MessagesTableApiResponse } from './types'

// Re-export alerts hook for convenience
export { useAlerts } from './alerts'

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

// ============================================
// Messages Table (Infinite Scroll)
// ============================================

interface UseMessagesTableOptions {
  /** Start date in ISO format (e.g., "2026-02-04T00:00:00Z") */
  startDate: string
  /** End date in ISO format (e.g., "2026-02-05T23:59:59Z") */
  endDate: string
  /** Number of rows per page (default: 100) */
  limit?: number
  /** Sort direction (default: "desc") */
  sortDir?: 'asc' | 'desc'
  /** Filter by job */
  job?: string | null
  /** Filter by intent */
  intent?: string | null
  /** Full-text search */
  textSearch?: string | null
  /** Filter by conversation ID */
  conversationId?: string | null
  /** Enable/disable the query */
  enabled?: boolean
}

export function useMessagesTable(options: UseMessagesTableOptions) {
  const {
    startDate,
    endDate,
    limit = 100,
    sortDir = 'desc',
    job = null,
    intent = null,
    textSearch = null,
    conversationId = null,
    enabled = true,
  } = options

  // Build base params (without cursor)
  const baseParams: MessagesTableParams = {
    start_date: startDate,
    end_date: endDate,
    limit,
    sort_dir: sortDir,
    job,
    intent,
    text_search: textSearch,
    conversation_id: conversationId,
  }

  return useInfiniteQuery<MessagesTableApiResponse, Error>({
    queryKey: [
      'messagesTable',
      {
        startDate,
        endDate,
        limit,
        sortDir,
        job,
        intent,
        textSearch,
        conversationId,
      },
    ],
    queryFn: async ({ pageParam }) => {
      const params: MessagesTableParams = {
        ...baseParams,
        cursor: pageParam as string | null,
      }
      return fetchMessagesTable(params)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      // Return the next cursor if there are more pages, otherwise undefined
      if (lastPage.pagination.has_more && lastPage.pagination.next_cursor) {
        return lastPage.pagination.next_cursor
      }
      return undefined
    },
    enabled,
  })
}

// Helper hook to get flattened messages data from infinite query
export function useFlattenedMessages(options: UseMessagesTableOptions) {
  const query = useMessagesTable(options)

  // Flatten all pages into a single array of messages
  const messages = query.data?.pages.flatMap((page) => page.data) ?? []

  // Get total count hint from pagination
  const hasMore = query.data?.pages.at(-1)?.pagination.has_more ?? false

  return {
    ...query,
    messages,
    hasMore,
    // Convenience method to load more
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage()
      }
    },
  }
}

// ============================================
// Conversation Detail (Modal)
// ============================================

/**
 * Hook to fetch conversation details for the modal.
 * Only fetches when conversationId is provided (non-null).
 *
 * @param conversationId - The conversation ID to fetch, or null if modal is closed
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId!),
    // Only fetch when we have a conversation ID (modal is open)
    enabled: !!conversationId,
    // Keep previous data while fetching new conversation
    placeholderData: (prev) => prev,
    // Conversation data is unlikely to change, cache longer
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
