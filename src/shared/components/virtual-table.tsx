/**
 * VirtualTable — A reusable, server-driven virtualized infinite-scroll table.
 *
 * All filtering, sorting and pagination happen server-side.
 * The component only handles rendering, virtualization and the filter side-panel.
 *
 * Usage:
 *   <VirtualTable
 *     title="Messages"
 *     queryKey="messagesTable"
 *     columns={columns}
 *     fetchFn={fetchMessages}
 *     filterDefs={[
 *       { key: 'text_search', type: 'search', label: 'Search', placeholder: 'Search…' },
 *       { key: 'job', type: 'select', label: 'Job', options: [...] },
 *     ]}
 *     getRowId={(row) => row.id}
 *     onRowClick={(row) => console.log(row)}
 *   />
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import {
  IconFilter,
  IconFilterOff,
  IconLoader2,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from '@tabler/icons-react'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** The shape every fetch function must return. */
export interface VirtualTablePage<TData> {
  data: TData[]
  hasMore: boolean
  nextCursor: string | null
}

/** Parameters passed to the fetch function. */
export interface VirtualTableFetchParams {
  limit: number
  cursor: string | null
  sortDir: 'asc' | 'desc'
  filters: Record<string, string>
}

/** Declarative filter definitions — drives the side panel UI. */
export type FilterDef =
  | {
      key: string
      type: 'search'
      label: string
      placeholder?: string
    }
  | {
      key: string
      type: 'select'
      label: string
      placeholder?: string
      options: { value: string; label: string }[]
    }
  | {
      key: string
      type: 'text'
      label: string
      placeholder?: string
      mono?: boolean
    }

export interface VirtualTableProps<TData> {
  /** Card title shown in the header. */
  title: string
  /** Unique key used for the React Query cache. */
  queryKey: string
  /** TanStack Table column definitions. */
  columns: ColumnDef<TData, unknown>[]
  /** Async function that fetches one page of data. */
  fetchFn: (params: VirtualTableFetchParams) => Promise<VirtualTablePage<TData>>
  /** Declarative filter definitions for the side panel. Omit to hide filters. */
  filterDefs?: FilterDef[]
  /** Stable row ID extractor. Falls back to array index if omitted. */
  getRowId?: (row: TData, index: number) => string
  /** Called when a row is clicked. */
  onRowClick?: (row: TData) => void
  /** Rows fetched per page. @default 50 */
  fetchSize?: number
  /** Scroll container height. @default '600px' */
  height?: number | string
  /** Extra ReactNode rendered to the right of the title (e.g. action buttons). */
  headerActions?: ReactNode
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 48
const SCROLL_THRESHOLD = 500
const OVERSCAN = 10
const estimateSize = () => ROW_HEIGHT

// ---------------------------------------------------------------------------
// Internal filter state helpers
// ---------------------------------------------------------------------------

interface InternalFilters {
  sort_dir: 'asc' | 'desc'
  [key: string]: string
}

function emptyFilters(defs: FilterDef[]): InternalFilters {
  const f: InternalFilters = { sort_dir: 'desc' }
  for (const d of defs) f[d.key] = ''
  return f
}

function countActive(filters: InternalFilters): number {
  let n = 0
  for (const [k, v] of Object.entries(filters)) {
    if (k !== 'sort_dir' && v) n++
  }
  return n
}

function filtersToRecord(filters: InternalFilters): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(filters)) {
    if (k !== 'sort_dir' && v) out[k] = v
  }
  return out
}

// ---------------------------------------------------------------------------
// Filter Panel (internal)
// ---------------------------------------------------------------------------

interface FilterPanelProps {
  defs: FilterDef[]
  applied: InternalFilters
  onChange: (f: InternalFilters) => void
  onClose: () => void
}

function FilterPanel({ defs, applied, onChange, onClose }: FilterPanelProps) {
  const [draft, setDraft] = useState<InternalFilters>(applied)

  useEffect(() => {
    setDraft(applied)
  }, [applied])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied)
  const activeCount = countActive(draft)
  const defaults = emptyFilters(defs)

  const setField = (key: string, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleApply = () => onChange(draft)
  const handleReset = () => {
    const empty = emptyFilters(defs)
    setDraft(empty)
    onChange(empty)
  }

  return (
    <div className="flex w-[280px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-muted px-3">
        <div className="flex items-center gap-2">
          <IconFilter className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <IconX className="size-3.5" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Sort order (always shown) */}
        <div className="px-3 pt-4 pb-3">
          <Label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Sort Order
          </Label>
          <div className="flex gap-1">
            <Button
              variant={draft.sort_dir === 'desc' ? 'default' : 'outline'}
              size="sm"
              className="h-8 flex-1 gap-1.5 text-xs"
              onClick={() => setField('sort_dir', 'desc')}
            >
              <IconSortDescending className="size-3.5" />
              Newest
            </Button>
            <Button
              variant={draft.sort_dir === 'asc' ? 'default' : 'outline'}
              size="sm"
              className="h-8 flex-1 gap-1.5 text-xs"
              onClick={() => setField('sort_dir', 'asc')}
            >
              <IconSortAscending className="size-3.5" />
              Oldest
            </Button>
          </div>
        </div>

        {/* Dynamic filter fields */}
        {defs.map((def) => (
          <div key={def.key}>
            <Separator />
            <div className="px-3 pt-3 pb-3">
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {def.label}
                </Label>
                {draft[def.key] && (
                  <button
                    onClick={() => setField(def.key, '')}
                    className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {def.type === 'search' && (
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={draft[def.key]}
                    onChange={(e) => setField(def.key, e.target.value)}
                    placeholder={def.placeholder ?? 'Search\u2026'}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              )}

              {def.type === 'text' && (
                <Input
                  value={draft[def.key]}
                  onChange={(e) => setField(def.key, e.target.value)}
                  placeholder={def.placeholder ?? ''}
                  className={cn('h-8 text-xs', def.mono && 'font-mono')}
                />
              )}

              {def.type === 'select' && (
                <Select
                  value={draft[def.key] || '__all__'}
                  onValueChange={(v) =>
                    setField(def.key, v === '__all__' ? '' : v)
                  }
                >
                  <SelectTrigger size="sm" className="h-8 text-xs">
                    <SelectValue placeholder={def.placeholder ?? `All`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">
                      {def.placeholder ?? 'All'}
                    </SelectItem>
                    {def.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-border bg-muted/30 p-3">
        <Button
          size="sm"
          className="h-8 w-full text-xs"
          onClick={handleApply}
          disabled={!hasChanges}
        >
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full gap-1.5 text-xs text-muted-foreground"
          onClick={handleReset}
          disabled={
            activeCount === 0 && draft.sort_dir === defaults.sort_dir
          }
        >
          <IconFilterOff className="size-3.5" />
          Reset All
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active filter chips (internal)
// ---------------------------------------------------------------------------

function FilterChips({
  defs,
  filters,
}: {
  defs: FilterDef[]
  filters: InternalFilters
}) {
  const chips: ReactNode[] = []

  for (const def of defs) {
    const val = filters[def.key]
    if (!val) continue

    if (def.type === 'search') {
      chips.push(
        <span
          key={def.key}
          className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
        >
          <IconSearch className="size-3" />
          &ldquo;{val}&rdquo;
        </span>,
      )
    } else if (def.type === 'select') {
      const option = def.options.find((o) => o.value === val)
      chips.push(
        <span
          key={def.key}
          className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
        >
          {option?.label ?? val}
        </span>,
      )
    } else {
      chips.push(
        <span
          key={def.key}
          className={cn(
            'inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground',
            def.mono && 'font-mono',
          )}
        >
          {def.label}: {val.length > 12 ? `${val.slice(0, 12)}\u2026` : val}
        </span>,
      )
    }
  }

  if (chips.length === 0) return null
  return <div className="flex items-center gap-1.5">{chips}</div>
}

// ---------------------------------------------------------------------------
// VirtualTable
// ---------------------------------------------------------------------------

export function VirtualTable<TData>({
  title,
  queryKey,
  columns,
  fetchFn,
  filterDefs = [],
  getRowId: getRowIdProp,
  onRowClick,
  fetchSize = 50,
  height = '600px',
  headerActions,
}: VirtualTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const hasFilters = filterDefs.length > 0
  const [panelOpen, setPanelOpen] = useState(false)

  const defaults = useMemo(() => emptyFilters(filterDefs), [filterDefs])
  const [applied, setApplied] = useState<InternalFilters>(defaults)
  const activeCount = countActive(applied)

  // ---- Infinite query ----

  const {
    data,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [queryKey, applied],
    queryFn: ({ pageParam }) =>
      fetchFn({
        limit: fetchSize,
        cursor: pageParam as string | null,
        sortDir: applied.sort_dir as 'asc' | 'desc',
        filters: filtersToRecord(applied),
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: VirtualTablePage<TData>) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  const flatData = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )

  const hasMore = useMemo(() => {
    const pages = data?.pages
    if (!pages || pages.length === 0) return false
    return pages[pages.length - 1].hasMore
  }, [data])

  const totalFetched = flatData.length

  // ---- Scroll trigger ----

  const fetchStateRef = useRef({ isFetching, hasMore })
  fetchStateRef.current = { isFetching, hasMore }

  const handleScroll = useCallback(
    (container?: HTMLDivElement | null) => {
      if (!container) return
      const { scrollHeight, scrollTop, clientHeight } = container
      const { isFetching: f, hasMore: m } = fetchStateRef.current
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD && !f && m) {
        fetchNextPage()
      }
    },
    [fetchNextPage],
  )

  useEffect(() => {
    handleScroll(tableContainerRef.current)
  }, [handleScroll, flatData.length])

  // ---- Table ----

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowIdProp,
    enableSorting: false,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    manualGrouping: true,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
  })

  // Compute all column sizes once as CSS variables — avoids calling
  // column.getSize() per-cell on every resize frame.
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: Record<string, number> = {}
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  const { rows } = table.getRowModel()

  // ---- Virtualizer ----

  const getScrollElement = useCallback(() => tableContainerRef.current, [])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize,
    getScrollElement,
    measureElement:
      typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? (el) => el?.getBoundingClientRect().height
        : undefined,
    overscan: OVERSCAN,
  })

  useEffect(() => {
    rowVirtualizer.scrollToIndex(0)
  }, [applied]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Handlers ----

  const handleApplyFilters = useCallback((f: InternalFilters) => setApplied(f), [])

  // ---- Render ----

  const heightStyle = typeof height === 'number' ? `${height}px` : height

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <IconLoader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading&hellip;</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <CardTitle>{title}</CardTitle>
          {hasFilters && (
            <FilterChips defs={filterDefs} filters={applied} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {isFetching && !isFetchingNextPage && (
            <IconLoader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {totalFetched.toLocaleString()} rows
            {hasMore ? '' : ' (all)'}
          </span>
          {hasFilters && (
            <Button
              variant={panelOpen ? 'default' : 'outline'}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setPanelOpen((p) => !p)}
            >
              <IconFilter className="size-3.5" />
              Filters
              {activeCount > 0 && (
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full text-[10px] font-bold',
                    panelOpen
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  {activeCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex">
          {/* Table area */}
          <div className="relative min-w-0 flex-1">
            {/* Blur overlay when panel is open */}
            {panelOpen && (
              <div className="pointer-events-none absolute inset-0 z-[2] bg-background/40 backdrop-blur-[2px] transition-opacity" />
            )}

            <div
              ref={tableContainerRef}
              onScroll={(e) => handleScroll(e.currentTarget)}
              className="relative overflow-auto"
              style={{ height: heightStyle }}
            >
              <table className="w-full text-sm" style={{ display: 'grid', ...columnSizeVars }}>
                <thead
                  style={{
                    display: 'grid',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {table.getHeaderGroups().map((hg) => (
                    <tr
                      key={hg.id}
                      className="border-b border-border bg-muted"
                      style={{ display: 'flex', width: '100%' }}
                    >
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="group/header relative flex h-11 items-center px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none"
                          style={{
                            width: `calc(var(--header-${header.id}-size) * 1px)`,
                          }}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          {/* Resize handle — wide hit area with thin visual indicator */}
                          <div
                            onDoubleClick={() => header.column.resetSize()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className="group/resizer absolute right-0 top-0 z-10 flex h-full w-3 cursor-col-resize touch-none select-none justify-center"
                          >
                            <div
                              className={cn(
                                'h-full w-[2px] transition-colors duration-150',
                                header.column.getIsResizing()
                                  ? 'bg-primary'
                                  : 'bg-border/40 group-hover/header:bg-border group-hover/resizer:bg-primary',
                              )}
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody
                  style={{
                    display: 'grid',
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((vr) => {
                    const row = rows[vr.index] as Row<TData>
                    const isEven = vr.index % 2 === 0
                    return (
                      <tr
                        key={row.id}
                        data-index={vr.index}
                        ref={(node) => rowVirtualizer.measureElement(node)}
                        className={cn(
                          'border-b border-border/40 transition-colors',
                          isEven ? 'bg-card' : 'bg-muted/30',
                          onRowClick &&
                            'cursor-pointer hover:bg-accent/50 active:bg-accent/70',
                        )}
                        style={{
                          display: 'flex',
                          position: 'absolute',
                          transform: `translateY(${vr.start}px)`,
                          width: '100%',
                        }}
                        onClick={() => onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="flex h-12 items-center overflow-hidden px-4 text-[13px]"
                            style={{
                              width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {hasMore
                  ? 'Scroll to load more rows'
                  : `All ${totalFetched.toLocaleString()} rows loaded`}
              </span>
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IconLoader2 className="size-3 animate-spin" />
                  Fetching more&hellip;
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          {panelOpen && hasFilters && (
            <FilterPanel
              defs={filterDefs}
              applied={applied}
              onChange={handleApplyFilters}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
