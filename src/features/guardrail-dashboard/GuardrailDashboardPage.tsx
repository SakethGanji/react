import { MetricCard, DataTable, FilterBar, EChartsChart, EChartsPieChart } from './components'
import { useMetrics, useDistribution, useTableData, useCharts } from './hooks'

export function GuardrailDashboardPage() {
  const metrics = useMetrics()
  const distribution = useDistribution()
  const tableData = useTableData()
  const charts = useCharts()

  const isLoading = metrics.isLoading || distribution.isLoading || tableData.isLoading || charts.isLoading
  const error = metrics.error || distribution.error || tableData.error || charts.error

  return (
    <main className="dashboard-content">
      <FilterBar />

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">Error: {error.message}</div>
      ) : (
        <>
          <section className="metrics-row">
            {metrics.data?.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="distribution-row">
            <h2>Distribution</h2>
            <div className="distribution-charts">
              {distribution.data?.map((item) => (
                <EChartsPieChart key={item.label} {...item} />
              ))}
            </div>
          </section>

          <section className="table-section">
            <DataTable title="Operational Log" data={tableData.data ?? []} />
          </section>

          <section className="charts-row">
            {charts.data?.map((chart) => (
              <EChartsChart key={chart.title} {...chart} />
            ))}
          </section>
        </>
      )}
    </main>
  )
}
