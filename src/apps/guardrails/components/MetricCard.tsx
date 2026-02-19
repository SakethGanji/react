import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Metric } from '../types'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/shared/components/ui/card'

export function MetricCard({ label, value, growth, icon: Icon }: Metric) {
  const isPositive = growth >= 0
  const DiffIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {label}
        </CardTitle>
        <CardAction>
          <Icon className="size-5 text-primary" strokeWidth={1.5} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold leading-none tracking-tight">{value}</span>
          <span className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{growth}%
            <DiffIcon className="size-4" strokeWidth={1.5} />
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Compared to previous month
        </span>
      </CardContent>
    </Card>
  )
}
