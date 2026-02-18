import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-28" />
        <CardAction>
          <Skeleton className="size-5 rounded" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  )
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </>
  )
}

export function PieChartSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Skeleton className="size-[72px] rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function PieChartsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PieChartSkeleton key={i} />
      ))}
    </>
  )
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-40" />
        <CardAction>
          <Skeleton className="size-5 rounded" />
        </CardAction>
      </CardHeader>
      <CardContent className="h-[250px]">
        <Skeleton className="h-full w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

export function ChartsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ChartSkeleton key={i} />
      ))}
    </>
  )
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <div className="flex items-center gap-4 bg-muted px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t px-4 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
