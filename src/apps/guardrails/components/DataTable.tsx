import type { TableRow } from '../types'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow as TRow,
  TableHead,
  TableCell,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'

interface DataTableProps {
  title: string
  data: TableRow[]
  onRowClick?: (row: TableRow) => void
}

const statusStyles: Record<string, string> = {
  active: 'bg-chart-3/20 text-emerald-600 dark:text-chart-3',
  scaling: 'bg-chart-2/20 text-yellow-600 dark:text-chart-2',
  review: 'bg-chart-9/20 text-chart-9',
}

export function DataTable({ title, data, onRowClick }: DataTableProps) {
  const isClickable = !!onRowClick

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>No data available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TRow>
                  <TableHead>Module ID</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Load Stat</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Status</TableHead>
                </TRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TRow
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={isClickable ? 'cursor-pointer' : ''}
                  >
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground px-1.5">
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.load}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-1 transition-all"
                            style={{ width: `${row.efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{row.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 px-1.5", statusStyles[row.status] ?? 'bg-slate-100 text-slate-600')}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
