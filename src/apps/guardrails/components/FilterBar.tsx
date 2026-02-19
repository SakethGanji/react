import * as React from 'react'
import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useDraftFilters, useFilterActions, useIsDirty, useLastUpdated } from '../hooks'
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../types'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Calendar } from '@/shared/components/ui/calendar'

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`

  return date.toLocaleDateString()
}

function toDateString(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function DatePicker({ value, onChange, label }: {
  value: string | null
  onChange: (date: string | null) => void
  label: string
}) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? new Date(value + 'T00:00:00') : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-[140px] items-center justify-between gap-1 rounded-md border bg-background px-3 text-sm font-normal shadow-xs hover:bg-accent hover:text-accent-foreground"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value ? format(selected!, 'MMM d, yyyy') : label}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toDateString(date))
            } else {
              onChange(null)
            }
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function FilterBar() {
  const filters = useDraftFilters()
  const { setCategory, setStatus, setDateRange, applyFilters, resetFilters } = useFilterActions()
  const isDirty = useIsDirty()
  const lastUpdated = useLastUpdated()

  const hasActiveFilters = filters.category || filters.status || filters.dateRange.start || filters.dateRange.end

  const handleApply = () => {
    applyFilters()
    toast.success('Filters applied, refreshing data...')
  }

  const handleReset = () => {
    resetFilters()
    toast.info('Filters reset to defaults')
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-normal tracking-tight">Dashboard Overview</h1>
          <span className="text-sm text-muted-foreground">
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={filters.category ?? 'all'}
              onValueChange={(val) => setCategory(val)}
            >
              <SelectTrigger className="w-[140px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(val) => setStatus(val)}
            >
              <SelectTrigger className="w-[140px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Start</Label>
            <DatePicker
              value={filters.dateRange.start}
              onChange={(date) => setDateRange(date, filters.dateRange.end)}
              label="Pick date"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">End</Label>
            <DatePicker
              value={filters.dateRange.end}
              onChange={(date) => setDateRange(filters.dateRange.start, date)}
              label="Pick date"
            />
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!isDirty}
            >
              {isDirty ? 'Apply Filters' : 'Applied'}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleReset}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
