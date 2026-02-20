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
// Fetch adapter — translates generic params into the messages API call
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
// Column definitions
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
  // Stable fetchFn reference (module-level function, no closure)
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
