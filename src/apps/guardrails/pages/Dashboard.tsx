import { useState } from 'react'
import {
  MetricCard,
  MessagesTable,
  FilterBar,
  EChartsChart,
  EChartsPieChart,
  ConversationModal,
  MetricCardsSkeleton,
  PieChartsSkeleton,
  ChartsSkeleton,
} from '../components'
import { useMetrics, useDistribution, useCharts } from '../hooks'
import { getErrorMessage } from '../errors'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import type { MessageRow } from '../types'

function SectionError({ error }: { error: unknown }) {
  return (
    <div className="col-span-full flex items-center justify-center py-8 text-destructive">
      {getErrorMessage(error)}
    </div>
  )
}

export function Dashboard() {
  const metrics = useMetrics()
  const distribution = useDistribution()
  const charts = useCharts()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const handleRowClick = (row: MessageRow) => {
    setSelectedConversationId(row.conversation_id)
  }

  const handleCloseModal = () => {
    setSelectedConversationId(null)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
        <div className="px-4 lg:px-6">
          <FilterBar />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {metrics.isLoading ? (
            <MetricCardsSkeleton count={4} />
          ) : metrics.error ? (
            <SectionError error={metrics.error} />
          ) : (
            metrics.data?.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))
          )}
        </div>

        {/* Guardrail Performance */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Guardrail Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {distribution.isLoading ? (
                  <PieChartsSkeleton count={6} />
                ) : distribution.error ? (
                  <SectionError error={distribution.error} />
                ) : (
                  distribution.data?.map((item) => (
                    <EChartsPieChart key={item.label} {...item} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Table */}
        <div className="px-4 lg:px-6">
          <MessagesTable onRowClick={handleRowClick} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
          {charts.isLoading ? (
            <ChartsSkeleton count={3} />
          ) : charts.error ? (
            <SectionError error={charts.error} />
          ) : (
            charts.data?.map((chart) => (
              <EChartsChart key={chart.title} {...chart} />
            ))
          )}
        </div>
      </div>

      {selectedConversationId && (
        <ConversationModal
          conversationId={selectedConversationId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
