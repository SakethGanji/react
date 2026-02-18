import { useState, useEffect } from 'react'
import { useAlertStore, type Alert } from '@/shared/store'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const variantBorder: Record<Alert['type'], string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-destructive',
  warning: 'border-l-amber-500',
  info: 'border-l-primary',
}

const variantIcon: Record<Alert['type'], string> = {
  success: 'text-emerald-500',
  error: 'text-destructive',
  warning: 'text-amber-500',
  info: 'text-primary',
}

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const Icon = icons[alert.type]
  const [isExiting, setIsExiting] = useState(false)
  const [isEntering, setIsEntering] = useState(true)

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => setIsEntering(false))
    return () => cancelAnimationFrame(enterTimer)
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300)
  }

  const isHidden = isEntering || isExiting

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border border-l-[3px] bg-card px-4 py-3 shadow-lg transition-all duration-300 ${variantBorder[alert.type]} ${
        isHidden
          ? 'translate-x-[120%] scale-90 opacity-0'
          : 'translate-x-0 scale-100 opacity-100'
      }`}
      role="alert"
    >
      <Icon className={`shrink-0 size-4 ${variantIcon[alert.type]}`} />
      <span className="flex-1 text-sm text-foreground">{alert.message}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

export function AlertContainer() {
  const alerts = useAlertStore((state) => state.alerts)
  const removeAlert = useAlertStore((state) => state.removeAlert)

  if (alerts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[1000] flex max-w-[400px] flex-col gap-2"
      aria-live="polite"
    >
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDismiss={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  )
}
