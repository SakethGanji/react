import { LucideIcon } from 'lucide-react'

export interface MetricResponse {
  label: string
  value: string
  growth: number
  icon: string
}

export interface Metric {
  label: string
  value: string
  growth: number
  icon: LucideIcon
}

export interface Distribution {
  label: string
  value: number
  color: string
}

// New API response types matching real backend format
export interface CardsApiResponse {
  total_conversations: number
  total_utterances: number
  avg_turns_per_call: number
  avg_response_time: number
  avg_guardrail_time: number
  blocked_responses: number
  delivered_responses: number
  percentage_changes: {
    total_conversations: number
    blocked_responses: number
    delivered_responses: number
  }
  filters: {
    start: string | null
    end: string | null
    lob: string | null
    topic: string | null
  }
}

export interface GuardrailCategory {
  _id: string
  count: number
}

export interface GuardrailsApiResponse {
  data: {
    input_guardrails: GuardrailCategory[]
    contextual_relevancy: GuardrailCategory[]
    bias_fairness: GuardrailCategory[]
    hallucination: GuardrailCategory[]
    factual_accuracy: GuardrailCategory[]
    output_moderation: GuardrailCategory[]
  }
  filters: {
    start: string | null
    end: string | null
    lob: string | null
    topic: string | null
  }
}

// Charts API response types
export interface RequestVolumeDataPoint {
  timestamp: string
  value: number
}

export interface GuardrailTriggersDataPoint {
  timestamp: string
  input_guardrails: number
  contextual_relevancy: number
  bias_fairness: number
  hallucination: number
  factual_accuracy: number
  output_moderation: number
}

export interface ResponseLatencyDataPoint {
  timestamp: string
  avg: number
  p95: number
  p99: number
}

export interface ChartsApiResponse {
  charts: {
    request_volume: {
      chart_type: 'bar'
      data: RequestVolumeDataPoint[]
    }
    guardrail_triggers: {
      chart_type: 'segmented_bar'
      data: GuardrailTriggersDataPoint[]
    }
    response_latency: {
      chart_type: 'line'
      data: ResponseLatencyDataPoint[]
    }
  }
  filters: {
    start: string | null
    end: string | null
    granularity: string
    chart_type: string
    lob: string | null
    topic: string | null
  }
}

export interface TableRow {
  id: string
  name: string
  type: string
  load: string
  efficiency: number
  status: 'active' | 'scaling' | 'review'
}

export interface StackedSeries {
  name: string
  data: number[]
  color?: string
}

export interface ChartResponse {
  title: string
  subtitle: string
  icon: string
  type: 'line' | 'bar'
  data: number[]
  stackedSeries?: StackedSeries[]
}

export interface ChartData {
  title: string
  subtitle: string
  icon: LucideIcon
  type: 'line' | 'bar'
  data: number[]
  xAxisData?: string[]
  stackedSeries?: StackedSeries[]
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

// Get default date range (last 24 hours) in YYYY-MM-DD format for date inputs
function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  return {
    start: formatDate(yesterday),
    end: formatDate(now),
  }
}

const defaultDates = getDefaultDateRange()

export const DEFAULT_FILTERS: DashboardFilters = {
  category: null,
  status: null,
  dateRange: {
    start: defaultDates.start,
    end: defaultDates.end,
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

// ============================================
// Messages Table Types (Infinite Scroll)
// ============================================

export interface LlmMetadata {
  response_id: string
  r2d2_request_id: string
}

export interface GuardrailResult {
  Result: string
  Score: number
  Reason: string
  Time_Token?: string
  llm_metadata?: LlmMetadata
}

export interface GuardrailResults {
  'Input Guardrails'?: GuardrailResult
  'Contextual Relevancy'?: GuardrailResult
  'Bias and Fairness'?: GuardrailResult
  'Hallucination'?: GuardrailResult
  'Factual Accuracy'?: GuardrailResult
  'Output Moderation'?: GuardrailResult
}

export interface MessageRow {
  conversation_id: string
  timestamp: string
  job: string
  intent: string
  user_utterance: string
  model_response_text: string
  total_model_time: number[]
  topic: string[]
  guardrail_results: GuardrailResults
}

export interface MessagesTablePagination {
  limit: number
  has_more: boolean
  next_cursor: string | null
}

export interface MessagesTableFilters {
  start_date: string
  end_date: string
  job: string | null
  intent: string | null
  text_search: string | null
  conversation_id: string | null
  sort_dir: 'asc' | 'desc'
}

export interface MessagesTableApiResponse {
  llm_metadata: LlmMetadata
  Hallucination?: GuardrailResult
  'Factual Accuracy'?: GuardrailResult
  'Output Moderation'?: GuardrailResult
  external_guardrail_payload?: {
    Result: string
    Reason: string
  }
  pagination: MessagesTablePagination
  filters: MessagesTableFilters
  data: MessageRow[]
}

export interface MessagesTableParams {
  start_date: string
  end_date: string
  limit?: number
  sort_dir?: 'asc' | 'desc'
  cursor?: string | null
  job?: string | null
  intent?: string | null
  text_search?: string | null
  conversation_id?: string | null
}

// ============================================
// Conversation Detail Types (Modal)
// ============================================

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  guardrail_results?: GuardrailResults
}

export interface ConversationDetail {
  conversation_id: string
  job: string
  intent: string
  topic: string[]
  created_at: string
  updated_at: string
  messages: ConversationMessage[]
  metadata?: Record<string, unknown>
  summary?: {
    total_messages: number
    total_guardrail_triggers: number
    blocked_count: number
    delivered_count: number
    avg_response_time?: number
  }
}
