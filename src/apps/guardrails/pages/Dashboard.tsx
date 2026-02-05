import { MetricCard, DataTable, FilterBar, EChartsChart, EChartsPieChart } from '../components'
import { useMetrics, useDistribution, useTableData, useCharts } from '../hooks'

function SectionLoading() {
  return <div className="section-loading">Loading...</div>
}

function SectionError({ message }: { message: string }) {
  return <div className="section-error">Error: {message}</div>
}

export function Dashboard() {
  const metrics = useMetrics()
  const distribution = useDistribution()
  const tableData = useTableData()
  const charts = useCharts()

  return (
    <main className="dashboard-content">
      <FilterBar />

      <section className="metrics-row">
        {metrics.isLoading ? (
          <SectionLoading />
        ) : metrics.error ? (
          <SectionError message={metrics.error.message} />
        ) : (
          metrics.data?.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))
        )}
      </section>

      <section className="distribution-row">
        <h2>Distribution</h2>
        <div className="distribution-charts">
          {distribution.isLoading ? (
            <SectionLoading />
          ) : distribution.error ? (
            <SectionError message={distribution.error.message} />
          ) : (
            distribution.data?.map((item) => (
              <EChartsPieChart key={item.label} {...item} />
            ))
          )}
        </div>
      </section>

      <section className="table-section">
        {tableData.isLoading ? (
          <SectionLoading />
        ) : tableData.error ? (
          <SectionError message={tableData.error.message} />
        ) : (
          <DataTable title="Operational Log" data={tableData.data ?? []} />
        )}
      </section>

      <section className="charts-row">
        {charts.isLoading ? (
          <SectionLoading />
        ) : charts.error ? (
          <SectionError message={charts.error.message} />
        ) : (
          charts.data?.map((chart) => (
            <EChartsChart key={chart.title} {...chart} />
          ))
        )}
      </section>
    </main>
  )
}
