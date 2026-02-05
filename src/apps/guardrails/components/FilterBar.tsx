import { useDraftFilters, useFilterActions, useIsDirty, useLastUpdated, useAlerts } from '../hooks'
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../types'

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`

  return date.toLocaleDateString()
}

export function FilterBar() {
  const filters = useDraftFilters()
  const { setCategory, setStatus, setDateRange, applyFilters, resetFilters } = useFilterActions()
  const isDirty = useIsDirty()
  const lastUpdated = useLastUpdated()
  const alerts = useAlerts()

  const hasActiveFilters = filters.category || filters.status || filters.dateRange.start || filters.dateRange.end

  const handleApply = () => {
    applyFilters()
    alerts.success('Filters applied, refreshing data...')
  }

  const handleReset = () => {
    resetFilters()
    alerts.info('Filters reset to defaults')
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        <h2 className="filter-bar-title">Dashboard Overview</h2>
        <span className="filter-bar-updated">Last updated: {formatLastUpdated(lastUpdated)}</span>
      </div>

      <div className="filter-bar-right">
        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">Category</label>
          <select
            id="category-filter"
            className="filter-select"
            value={filters.category ?? 'all'}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter" className="filter-label">Status</label>
          <select
            id="status-filter"
            className="filter-select"
            value={filters.status ?? 'all'}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date" className="filter-label">Date Range</label>
          <div className="date-range">
            <input
              id="start-date"
              type="date"
              className="filter-date"
              aria-label="Start date"
              value={filters.dateRange.start ?? ''}
              onChange={(e) => {
                const newStart = e.target.value || null
                setDateRange(newStart, filters.dateRange.end)
              }}
            />
            <span className="date-separator">to</span>
            <input
              id="end-date"
              type="date"
              className="filter-date"
              aria-label="End date"
              value={filters.dateRange.end ?? ''}
              onChange={(e) => {
                const newEnd = e.target.value || null
                setDateRange(filters.dateRange.start, newEnd)
              }}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            className={`filter-apply ${isDirty ? 'filter-apply-dirty' : ''}`}
            onClick={handleApply}
            disabled={!isDirty}
          >
            {isDirty ? 'Apply Filters' : 'Applied'}
          </button>

          {hasActiveFilters && (
            <button className="filter-reset" onClick={handleReset}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
