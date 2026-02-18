import type { TableRow } from '../types'
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

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  scaling: 'secondary',
  review: 'outline',
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
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
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
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${row.efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{row.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[row.status] ?? 'outline'} className="text-muted-foreground px-1.5">
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
