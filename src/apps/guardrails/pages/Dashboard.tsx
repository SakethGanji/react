import { useState } from 'react'
import {
  MetricCard,
  DataTable,
  FilterBar,
  EChartsChart,
  EChartsPieChart,
  AlertContainer,
  ConversationModal,
  MetricCardsSkeleton,
  PieChartsSkeleton,
  ChartsSkeleton,
  TableSkeleton,
} from '../components'
import { useMetrics, useDistribution, useTableData, useCharts } from '../hooks'
import { getErrorMessage } from '../errors'
import type { TableRow } from '../types'

function SectionError({ error }: { error: unknown }) {
  return <div className="section-error">{getErrorMessage(error)}</div>
}

export function Dashboard() {
  const metrics = useMetrics()
  const distribution = useDistribution()
  const tableData = useTableData()
  const charts = useCharts()

  // Modal state - stores the conversation ID to show in modal
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const handleRowClick = (row: TableRow) => {
    // Use row.id as the conversation ID to fetch details
    setSelectedConversationId(row.id)
  }

  const handleCloseModal = () => {
    setSelectedConversationId(null)
  }

  return (
    <main className="dashboard-content">
      <AlertContainer />
      <FilterBar />

      <section className="metrics-row">
        {metrics.isLoading ? (
          <MetricCardsSkeleton count={4} />
        ) : metrics.error ? (
          <SectionError error={metrics.error} />
        ) : (
          metrics.data?.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))
        )}
      </section>

      <section className="distribution-row">
        <h2>Guardrail Performance</h2>
        <div className="distribution-charts">
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
      </section>

      <section className="table-section">
        {tableData.isLoading ? (
          <TableSkeleton rows={4} />
        ) : tableData.error ? (
          <SectionError error={tableData.error} />
        ) : (
          <DataTable
            title="Operational Log"
            data={tableData.data ?? []}
            onRowClick={handleRowClick}
          />
        )}
      </section>

      <section className="charts-row">
        {charts.isLoading ? (
          <ChartsSkeleton count={3} />
        ) : charts.error ? (
          <SectionError error={charts.error} />
        ) : (
          charts.data?.map((chart) => (
            <EChartsChart key={chart.title} {...chart} />
          ))
        )}
      </section>

      {/* Conversation Detail Modal */}
      {selectedConversationId && (
        <ConversationModal
          conversationId={selectedConversationId}
          onClose={handleCloseModal}
        />
      )}
    </main>
  )
}
