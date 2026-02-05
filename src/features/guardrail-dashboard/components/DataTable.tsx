import type { TableRow } from '../types'

interface DataTableProps {
  title: string
  data: TableRow[]
}

export function DataTable({ title, data }: DataTableProps) {
  return (
    <div className="data-table">
      <div className="data-table-header">
        <h3 className="data-table-title">{title}</h3>
      </div>
      <table className="data-table-content">
        <thead>
          <tr>
            <th>Module ID</th>
            <th>Classification</th>
            <th>Load Stat</th>
            <th>Efficiency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.type}</td>
              <td>{row.load}</td>
              <td>
                <div className="efficiency-bar">
                  <div
                    className="efficiency-bar-fill"
                    style={{ width: `${row.efficiency}%` }}
                  />
                </div>
                <span>{row.efficiency}%</span>
              </td>
              <td>
                <span className={`status-badge status-${row.status}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
