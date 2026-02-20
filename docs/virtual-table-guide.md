# VirtualTable Implementation Guide

Server-driven virtualized infinite-scroll table with a collapsible filter side panel.
Zero client-side filtering/sorting/pagination. Everything is delegated to the API.

---

## Table of Contents

1. [Dependencies](#dependencies)
2. [Architecture](#architecture)
3. [API Contract](#api-contract)
4. [Generic Component: `VirtualTable`](#generic-component-virtualtable)
5. [Building a Table: Step-by-Step](#building-a-table-step-by-step)
6. [Full Example: `MessagesTable`](#full-example-messagestable)
7. [Full Example: `OrdersTable` (Minimal)](#full-example-orderstable-minimal)
8. [Backend Stub (FastAPI)](#backend-stub-fastapi)
9. [Props Reference](#props-reference)
10. [Filter Definition Reference](#filter-definition-reference)
11. [Column Resizing](#column-resizing)
12. [Performance Notes](#performance-notes)
13. [Troubleshooting](#troubleshooting)

---

## Dependencies

```bash
npm install @tanstack/react-table @tanstack/react-virtual @tanstack/react-query @tabler/icons-react
```

### shadcn/ui primitives

The component uses these shadcn/ui components. If you don't have them, add
them with the shadcn CLI:

```bash
npx shadcn@latest add card button input label select separator
```

### Utility function: `cn`

The component uses a `cn()` helper (standard in shadcn/ui projects) for
conditional class merging. If you don't have it:

```bash
npm install clsx tailwind-merge
```

```ts
// src/shared/lib/utils.ts (or wherever you keep utilities)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Import alias

The code uses `@/` as an import alias pointing to your `src/` directory. Make
sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And your bundler (Vite, webpack, etc.) resolves it accordingly.

### React Query provider

`VirtualTable` uses `useInfiniteQuery` from React Query. Your app must be
wrapped in a `QueryClientProvider`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* your routes / pages */}
    </QueryClientProvider>
  )
}
```

---

## Architecture

```
+------------------------------------------------------------------+
|  Your App Component (e.g. MessagesTable)                         |
|                                                                  |
|  - Defines columns (ColumnDef[])                                 |
|  - Defines filterDefs (FilterDef[])                              |
|  - Defines fetchFn (params => VirtualTablePage)                  |
|  - Defines getRowId                                              |
|  - Passes everything to <VirtualTable />                         |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  VirtualTable<TData>  (shared/components/virtual-table.tsx)      |
|                                                                  |
|  - useInfiniteQuery (React Query) for data fetching              |
|  - useReactTable (TanStack Table) for column rendering           |
|  - useVirtualizer (TanStack Virtual) for row virtualization      |
|  - FilterPanel for the collapsible side panel                    |
|  - All manual*: true — zero client-side processing               |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  Your API                                                        |
|                                                                  |
|  GET /api/your-endpoint                                          |
|    ?limit=50&sort_dir=desc&cursor=...&your_filter=...            |
|                                                                  |
|  Returns: { data: T[], pagination: { has_more, next_cursor } }   |
+------------------------------------------------------------------+
```

**Key principle:** `VirtualTable` has no domain knowledge. It doesn't know about
messages, orders, users, or any specific API. Your app component provides three
things — `columns`, `fetchFn`, and `filterDefs` — and the generic component
handles the rest.

### File structure

```
src/
├── shared/
│   ├── components/
│   │   ├── virtual-table.tsx          ← Generic component (copy this file as-is)
│   │   └── ui/                        ← shadcn/ui primitives
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── separator.tsx
│   └── lib/
│       └── utils.ts                   ← cn() helper
├── apps/
│   └── your-app/
│       ├── components/
│       │   └── YourTable.tsx           ← Your domain table (columns + fetchFn + filterDefs)
│       ├── pages/
│       │   └── YourPage.tsx            ← Renders <YourTable />
│       └── types.ts                   ← Your row type definitions
└── config/
    └── backends.ts                    ← API base URLs per environment (optional)
```

The `virtual-table.tsx` file is **completely self-contained**. Copy it into your
`shared/components/` directory and it works. No other shared code is needed
beyond the standard shadcn/ui primitives listed above.

---

## API Contract

Your API must return this shape (field names can differ — your `fetchFn` adapter maps them):

```json
{
  "data": [ ... ],
  "pagination": {
    "has_more": true,
    "next_cursor": "100"
  }
}
```

Your `fetchFn` must normalize this into `VirtualTablePage<TData>`:

```ts
interface VirtualTablePage<TData> {
  data: TData[]
  hasMore: boolean
  nextCursor: string | null
}
```

The `fetchFn` receives standardized params:

```ts
interface VirtualTableFetchParams {
  limit: number
  cursor: string | null
  sortDir: 'asc' | 'desc'
  filters: Record<string, string>  // only non-empty filters
}
```

---

## Generic Component: `VirtualTable`

File: `src/shared/components/virtual-table.tsx`

```tsx
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
 *       { key: 'text_search', type: 'search', label: 'Search', placeholder: 'Search...' },
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
          disabled={activeCount === 0 && draft.sort_dir === defaults.sort_dir}
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
```

---

## Building a Table: Step-by-Step

### Step 1 — Define your data type

```ts
interface Order {
  id: string
  customer_name: string
  status: 'pending' | 'shipped' | 'delivered'
  total: number
  created_at: string
}
```

### Step 2 — Write a fetch adapter

Map the generic `VirtualTableFetchParams` to your API, then map the response
back to `VirtualTablePage<T>`:

```ts
import type { VirtualTableFetchParams, VirtualTablePage } from '@/shared/components/virtual-table'

async function fetchOrders(params: VirtualTableFetchParams): Promise<VirtualTablePage<Order>> {
  const qs = new URLSearchParams()
  qs.set('limit', String(params.limit))
  qs.set('sort_dir', params.sortDir)
  if (params.cursor) qs.set('cursor', params.cursor)

  // Forward all active filters as query params
  for (const [k, v] of Object.entries(params.filters)) {
    if (v) qs.set(k, v)
  }

  const res = await fetch(`/api/orders?${qs}`)
  const json = await res.json()

  // Map your API response shape to the standardized shape
  return {
    data: json.data,
    hasMore: json.pagination.has_more,
    nextCursor: json.pagination.next_cursor,
  }
}
```

### Step 3 — Define columns

Standard TanStack Table `ColumnDef[]`. Set `size` on each column — this is the
**initial width** and also serves as the reset target when double-clicking the
resize handle. Columns are resizable by default within `minSize: 60` /
`maxSize: 800`:

```ts
const orderColumns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'id',            header: 'Order ID',  size: 120 },
  { accessorKey: 'customer_name', header: 'Customer',  size: 200 },
  { accessorKey: 'status',        header: 'Status',    size: 120 },
  { accessorKey: 'total',         header: 'Total',     size: 100,
    cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}` },
  { accessorKey: 'created_at',    header: 'Created',   size: 170 },
]
```

### Step 4 — Define filters (optional)

```ts
const orderFilterDefs: FilterDef[] = [
  { key: 'search',  type: 'search', label: 'Search', placeholder: 'Search orders...' },
  { key: 'status',  type: 'select', label: 'Status', placeholder: 'All statuses',
    options: [
      { value: 'pending',   label: 'Pending' },
      { value: 'shipped',   label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
    ],
  },
  { key: 'customer_id', type: 'text', label: 'Customer ID', placeholder: 'Filter by ID...', mono: true },
]
```

### Step 5 — Compose

```tsx
export function OrdersTable() {
  return (
    <VirtualTable<Order>
      title="Orders"
      queryKey="orders"
      columns={orderColumns}
      fetchFn={fetchOrders}
      filterDefs={orderFilterDefs}
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log('clicked', row.id)}
    />
  )
}
```

That's it. No hooks to wire up, no state to manage, no scroll handlers to write.

---

## Full Example: `MessagesTable`

File: `src/apps/guardrails/components/MessagesTable.tsx`

```tsx
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/components/ui/badge'
import { backends } from '@/config/backends'
import {
  VirtualTable,
  type VirtualTableFetchParams,
  type VirtualTablePage,
  type FilterDef,
} from '@/shared/components/virtual-table'
import type { MessageRow, GuardrailResults } from '../types'

// ---------------------------------------------------------------------------
// Fetch adapter
// ---------------------------------------------------------------------------

async function fetchMessages(
  params: VirtualTableFetchParams,
): Promise<VirtualTablePage<MessageRow>> {
  const qs = new URLSearchParams()
  qs.set('limit', String(params.limit))
  qs.set('sort_dir', params.sortDir)
  if (params.cursor) qs.set('cursor', params.cursor)
  for (const [k, v] of Object.entries(params.filters)) {
    if (v) qs.set(k, v)
  }

  const res = await fetch(`${backends.dashboard}/api/messages/table?${qs}`)
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`)
  const json = await res.json()

  return {
    data: json.data,
    hasMore: json.pagination.has_more,
    nextCursor: json.pagination.next_cursor,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const timestampFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function guardrailSummary(results: GuardrailResults) {
  let blocked = 0
  let delivered = 0
  for (const r of Object.values(results)) {
    if (r?.Result === 'Blocked') blocked++
    else if (r?.Result === 'Delivered') delivered++
  }
  return { blocked, delivered, total: blocked + delivered }
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const messageColumns: ColumnDef<MessageRow, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    size: 170,
    cell: ({ getValue }) => (
      <span className="tabular-nums text-foreground/90">
        {timestampFmt.format(new Date(getValue<string>()))}
      </span>
    ),
  },
  {
    accessorKey: 'conversation_id',
    header: 'Conversation',
    size: 140,
    cell: ({ getValue }) => {
      const id = getValue<string>()
      return (
        <span
          className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          title={id}
        >
          {id.length > 12 ? `${id.slice(0, 12)}\u2026` : id}
        </span>
      )
    },
  },
  {
    accessorKey: 'job',
    header: 'Job',
    size: 140,
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="border-border/60 bg-muted/50 font-normal capitalize text-muted-foreground"
      >
        {getValue<string>().replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'intent',
    header: 'Intent',
    size: 110,
    cell: ({ getValue }) => (
      <span className="capitalize text-foreground/80">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'user_utterance',
    header: 'User Message',
    size: 240,
    cell: ({ getValue }) => {
      const text = getValue<string>()
      return (
        <span className="block max-w-full truncate text-foreground" title={text}>
          {text}
        </span>
      )
    },
  },
  {
    accessorKey: 'model_response_text',
    header: 'Response',
    size: 240,
    cell: ({ getValue }) => {
      const text = getValue<string>()
      return (
        <span className="block max-w-full truncate text-foreground/70" title={text}>
          {text}
        </span>
      )
    },
  },
  {
    accessorKey: 'topic',
    header: 'Topic',
    size: 120,
    cell: ({ getValue }) => {
      const topics = getValue<string[]>()
      if (topics.length === 0)
        return <span className="text-muted-foreground/50">&mdash;</span>
      return (
        <span className="capitalize text-foreground/80">{topics.join(', ')}</span>
      )
    },
  },
  {
    accessorKey: 'guardrail_results',
    header: 'Guardrails',
    size: 130,
    cell: ({ getValue }) => {
      const { blocked, delivered, total } = guardrailSummary(
        getValue<GuardrailResults>(),
      )
      if (total === 0)
        return <span className="text-muted-foreground/50">&mdash;</span>
      return (
        <div className="flex items-center gap-1.5">
          {delivered > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20">
              {delivered} pass
            </span>
          )}
          {blocked > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20 dark:text-red-400 dark:ring-red-400/20">
              {blocked} fail
            </span>
          )}
        </div>
      )
    },
  },
]

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------

const messageFilterDefs: FilterDef[] = [
  {
    key: 'text_search',
    type: 'search',
    label: 'Text Search',
    placeholder: 'Search messages\u2026',
  },
  {
    key: 'job',
    type: 'select',
    label: 'Job',
    placeholder: 'All jobs',
    options: [
      { value: 'customer_support', label: 'Customer Support' },
      { value: 'sales_inquiry', label: 'Sales Inquiry' },
      { value: 'tech_support', label: 'Tech Support' },
      { value: 'billing', label: 'Billing' },
      { value: 'general', label: 'General' },
    ],
  },
  {
    key: 'intent',
    type: 'select',
    label: 'Intent',
    placeholder: 'All intents',
    options: [
      { value: 'greeting', label: 'Greeting' },
      { value: 'complaint', label: 'Complaint' },
      { value: 'question', label: 'Question' },
      { value: 'request', label: 'Request' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'escalation', label: 'Escalation' },
    ],
  },
  {
    key: 'conversation_id',
    type: 'text',
    label: 'Conversation ID',
    placeholder: 'Filter by ID\u2026',
    mono: true,
  },
]

// ---------------------------------------------------------------------------
// Row ID
// ---------------------------------------------------------------------------

function getRowId(row: MessageRow, index: number) {
  return `${row.conversation_id}-${row.timestamp}-${index}`
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

interface MessagesTableProps {
  onRowClick?: (row: MessageRow) => void
}

export function MessagesTable({ onRowClick }: MessagesTableProps) {
  const fetchFn = useMemo(() => fetchMessages, [])

  return (
    <VirtualTable<MessageRow>
      title="Messages"
      queryKey="messagesTable"
      columns={messageColumns}
      fetchFn={fetchFn}
      filterDefs={messageFilterDefs}
      getRowId={getRowId}
      onRowClick={onRowClick}
    />
  )
}
```

---

## Full Example: `OrdersTable` (Minimal)

Minimal example showing how little code a new table needs — just the
domain-specific parts:

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import {
  VirtualTable,
  type VirtualTableFetchParams,
  type VirtualTablePage,
  type FilterDef,
} from '@/shared/components/virtual-table'

// 1. Data type
interface Order {
  id: string
  customer: string
  status: string
  total: number
  created_at: string
}

// 2. Fetch adapter
async function fetchOrders(
  params: VirtualTableFetchParams,
): Promise<VirtualTablePage<Order>> {
  const qs = new URLSearchParams()
  qs.set('limit', String(params.limit))
  qs.set('sort_dir', params.sortDir)
  if (params.cursor) qs.set('cursor', params.cursor)
  for (const [k, v] of Object.entries(params.filters)) {
    if (v) qs.set(k, v)
  }

  const res = await fetch(`/api/orders?${qs}`)
  const json = await res.json()
  return {
    data: json.data,
    hasMore: json.pagination.has_more,
    nextCursor: json.pagination.next_cursor,
  }
}

// 3. Columns
const columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'id',         header: 'Order ID',  size: 120 },
  { accessorKey: 'customer',   header: 'Customer',  size: 200 },
  { accessorKey: 'status',     header: 'Status',    size: 120 },
  { accessorKey: 'total',      header: 'Total',     size: 100,
    cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}` },
  { accessorKey: 'created_at', header: 'Created',   size: 180 },
]

// 4. Filters
const filterDefs: FilterDef[] = [
  { key: 'search', type: 'search', label: 'Search', placeholder: 'Search orders...' },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All statuses',
    options: [
      { value: 'pending',   label: 'Pending' },
      { value: 'shipped',   label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
    ],
  },
]

// 5. Component
export function OrdersTable() {
  return (
    <VirtualTable<Order>
      title="Orders"
      queryKey="ordersTable"
      columns={columns}
      fetchFn={fetchOrders}
      filterDefs={filterDefs}
      getRowId={(row) => row.id}
      height={500}
    />
  )
}
```

---

## Backend Stub (FastAPI)

Drop-in test endpoint. Generates 1000 dummy rows with filtering + cursor
pagination:

```python
@app.get("/api/messages/table")
def get_messages_table(
    limit: int = Query(50, ge=1, le=200),
    sort_dir: str = Query("desc"),
    cursor: Optional[str] = Query(None),
    job: Optional[str] = Query(None),
    intent: Optional[str] = Query(None),
    text_search: Optional[str] = Query(None),
    conversation_id: Optional[str] = Query(None),
):
    rows = list(MESSAGES_DB)

    # Server-side filtering
    if job:
        rows = [r for r in rows if r["job"] == job]
    if intent:
        rows = [r for r in rows if r["intent"] == intent]
    if conversation_id:
        rows = [r for r in rows if conversation_id in r["conversation_id"]]
    if text_search:
        q = text_search.lower()
        rows = [r for r in rows if q in r["user_utterance"].lower()
                or q in r["model_response_text"].lower()]

    # Server-side sorting
    rows.sort(key=lambda r: r["timestamp"], reverse=(sort_dir == "desc"))

    # Cursor-based pagination
    start = int(cursor) if cursor else 0
    end = start + limit
    page = rows[start:end]

    return {
        "pagination": {
            "limit": limit,
            "has_more": end < len(rows),
            "next_cursor": str(end) if end < len(rows) else None,
            "total": len(rows),
        },
        "data": page,
    }
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Card header title |
| `queryKey` | `string` | required | React Query cache key (must be unique per table instance) |
| `columns` | `ColumnDef<TData>[]` | required | TanStack Table column definitions. **Must include `size`** (initial width, resizable by default) |
| `fetchFn` | `(params) => Promise<VirtualTablePage>` | required | Fetches one page. Receives `{ limit, cursor, sortDir, filters }` |
| `filterDefs` | `FilterDef[]` | `[]` | Declarative filter config. Omit to hide the filter panel entirely |
| `getRowId` | `(row, index) => string` | array index | Stable row ID for virtualization |
| `onRowClick` | `(row) => void` | — | Row click handler. Adds hover/cursor styles when provided |
| `fetchSize` | `number` | `50` | Rows per page |
| `height` | `number \| string` | `'600px'` | Scroll container height |
| `headerActions` | `ReactNode` | — | Extra buttons rendered in the card header toolbar |

---

## Filter Definition Reference

Three filter types, each renders a different UI control:

### `search` — Text input with search icon

```ts
{ key: 'text_search', type: 'search', label: 'Search', placeholder: 'Search...' }
```

### `select` — Dropdown with predefined options

```ts
{
  key: 'status',
  type: 'select',
  label: 'Status',
  placeholder: 'All statuses',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
}
```

### `text` — Plain text input (with optional monospace)

```ts
{ key: 'order_id', type: 'text', label: 'Order ID', placeholder: 'Filter...', mono: true }
```

All filter values are passed to `fetchFn` as `params.filters` — a
`Record<string, string>` containing only non-empty values. The filter `key`
becomes the query param name.

---

## Column Resizing

Columns are resizable by default. Drag the right edge of any column header to
adjust its width. The resize handle uses a two-layer design: a **wide invisible
hit area** (12px / `w-3`) for easy grabbing, with a **thin 2px visual indicator
line** centered inside it.

### How it works

1. `columnResizeMode: 'onChange'` — live resize, columns update every frame as
   you drag (not just on mouse-up)
2. `defaultColumn: { minSize: 60, maxSize: 800 }` — resize bounds for all
   columns (override per-column if needed)
3. Each column's `size` in its `ColumnDef` sets the **initial width**. Users can
   drag to resize within the min/max range

### Resize handle — visual states

The handle has four progressive visibility states so it's always discoverable:

| State | Visual | CSS |
|-------|--------|-----|
| **Default** | Subtle separator line always visible between columns | `bg-border/40` |
| **Header hover** | Line becomes more prominent when hovering the column header | `group-hover/header:bg-border` |
| **Handle hover** | Line turns primary color when hovering the resize edge directly | `group-hover/resizer:bg-primary` |
| **Active drag** | Solid primary color while dragging | `bg-primary` |

The handle uses Tailwind's **nested group** pattern — `group/header` on the
`<th>` and `group/resizer` on the handle wrapper — so you get distinct hover
states for the header cell vs. the resize edge itself.

```tsx
{/* Two-layer structure: wide hit area wrapping thin visual line */}
<div className="group/resizer absolute right-0 top-0 z-10 flex h-full w-3
                cursor-col-resize touch-none select-none justify-center">
  <div className={cn(
    'h-full w-[2px] transition-colors duration-150',
    header.column.getIsResizing()
      ? 'bg-primary'
      : 'bg-border/40 group-hover/header:bg-border group-hover/resizer:bg-primary',
  )} />
</div>
```

Additional interactions:
- **Double-click** the resize handle to reset the column to its original `size`
- **Touch** supported via `onTouchStart` for mobile/tablet

### CSS variable performance trick

Instead of calling `column.getSize()` on every header and every data cell on
every resize frame (extremely expensive with 1000+ virtualized rows), all
column sizes are computed **once** in a `useMemo` and set as CSS custom
properties on the `<table>` element:

```tsx
const columnSizeVars = useMemo(() => {
  const headers = table.getFlatHeaders()
  const colSizes: Record<string, number> = {}
  for (const header of headers) {
    colSizes[`--header-${header.id}-size`] = header.getSize()
    colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
  }
  return colSizes
}, [table.getState().columnSizingInfo, table.getState().columnSizing])
```

The `<table>` element spreads these as inline styles:

```tsx
<table style={{ display: 'grid', ...columnSizeVars }}>
```

Then each header and cell references its size via CSS `calc()`:

```tsx
{/* Header */}
<th style={{ width: `calc(var(--header-${header.id}-size) * 1px)` }}>

{/* Cell */}
<td style={{ width: `calc(var(--col-${cell.column.id}-size) * 1px)` }}>
```

This means the browser updates widths through CSS variable changes rather than
per-cell React re-renders. The `useMemo` only recomputes when
`columnSizingInfo` or `columnSizing` state changes (i.e., during a drag).

### Customizing per-column

Override `minSize`, `maxSize`, or disable resizing on specific columns:

```ts
{
  accessorKey: 'id',
  header: 'ID',
  size: 80,       // initial width
  minSize: 60,    // override the default 60
  maxSize: 120,   // override the default 800
  enableResizing: false,  // disable resizing for this column
}
```

---

## Performance Notes

- **Zero client-side processing** — `manualSorting`, `manualFiltering`,
  `manualPagination`, `manualGrouping` are all `true`. TanStack Table is used
  purely as a rendering engine.
- **CSS variable column sizing** — Column widths are computed once per resize
  frame in a single `useMemo` and set as CSS custom properties on the `<table>`.
  Each cell reads its width via `calc(var(--col-X-size) * 1px)` instead of
  calling `getSize()` per cell. This makes drag-to-resize smooth even with
  thousands of virtualized rows.
- **Stable callbacks** — `estimateSize`, `getScrollElement`, and `handleScroll`
  are memoized or use refs to avoid re-renders.
- **Ref-based scroll trigger** — `isFetching` and `hasMore` are read from a ref
  inside `handleScroll` so the callback doesn't recreate when fetch state toggles.
- **Draft filter state** — Typing in the filter panel updates local draft state
  only. The API is not called until "Apply Filters" is clicked.
- **`placeholderData: keepPreviousData`** — Old data stays visible while new
  filters/sort are loading. No flash of empty state.
- **`scrollToIndex(0)`** — Viewport resets to the top when filters change.
- **Overscan = 10** — Pre-renders 10 rows above and below the viewport for
  smooth scrolling.
- **`Intl.DateTimeFormat` instance reuse** — Create the formatter once at module
  scope, call `.format()` per cell. Avoids creating a new formatter per row.

---

## Troubleshooting

### Table renders but has no height / is collapsed

Make sure the scroll container has a height. Pass `height` prop (default
`'600px'`). If using a dynamic height, ensure the parent container has a
defined height too.

### Columns are all the same width

Every column definition **must** include a `size` property. Without it, TanStack
Table defaults to `150` for all columns:

```ts
{ accessorKey: 'name', header: 'Name', size: 200 }  // good
{ accessorKey: 'name', header: 'Name' }              // all 150px
```

### Infinite scroll doesn't trigger

Check these in order:
1. Your API must return `has_more: true` and a valid `next_cursor` when there
   are more pages
2. Your `fetchFn` must map these to `{ hasMore: true, nextCursor: '...' }`
3. The scroll container must actually be scrollable (content taller than
   `height`)
4. The `SCROLL_THRESHOLD` is 500px — fetching starts when you're within 500px
   of the bottom

### Filters don't trigger API calls

Filter changes only hit the API when the user clicks **"Apply Filters"**. This
is intentional (draft state pattern). If you need immediate filtering, you'd
need to modify the `FilterPanel` to call `onChange` on every field change
instead of only on apply — but this is not recommended for performance.

### TypeScript error: `.at(-1)` not available

If your `tsconfig.json` targets below `es2022`, array `.at()` is not available.
Use `array[array.length - 1]` instead. The `VirtualTable` component already
does this.

### Rows flash/jump when changing filters

This is handled by `placeholderData: keepPreviousData` in the query config,
which keeps old data visible during refetch. If you're still seeing flashes,
make sure you're not unmounting/remounting the component on filter change.

### Column resize feels laggy

Make sure you're using the CSS variable approach (already built in). If you've
customized the table and are calling `column.getSize()` directly in cell
renders instead of using CSS variables, that's the bottleneck — every cell
re-renders on every drag frame.
