// Public exports for the Guardrails app
// Page components are lazy-loaded via APP_REGISTRY in src/apps/index.ts
// Navigation is driven by the routes array in the registry entry

// Re-export types that may be needed externally
export type {
  Metric,
  Distribution,
  TableRow,
  ChartData,
  DashboardFilters,
  GeneralSettings,
  NotificationSettings,
  // Messages table types
  MessageRow,
  MessagesTableApiResponse,
  MessagesTableParams,
  MessagesTablePagination,
  MessagesTableFilters,
  GuardrailResult,
  GuardrailResults,
  // Conversation detail types
  ConversationDetail,
  ConversationMessage,
} from './types'

// Re-export hooks
export { useMessagesTable, useFlattenedMessages, useConversation } from './hooks'
