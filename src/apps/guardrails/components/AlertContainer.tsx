import { useState, useEffect } from 'react'
import { useAlertStore, type Alert } from '../alerts'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const Icon = icons[alert.type]
  const [isExiting, setIsExiting] = useState(false)
  const [isEntering, setIsEntering] = useState(true)

  useEffect(() => {
    // Trigger enter animation on next frame
    const enterTimer = requestAnimationFrame(() => setIsEntering(false))
    return () => cancelAnimationFrame(enterTimer)
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    // Wait for exit animation to complete before removing
    setTimeout(onDismiss, 300)
  }

  const animationClass = isEntering ? 'alert-enter' : isExiting ? 'alert-exit' : 'alert-visible'

  return (
    <div className={`alert alert-${alert.type} ${animationClass}`} role="alert">
      <Icon className="alert-icon" size={18} />
      <span className="alert-message">{alert.message}</span>
      <button className="alert-dismiss" onClick={handleDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}

export function AlertContainer() {
  const alerts = useAlertStore((state) => state.alerts)
  const removeAlert = useAlertStore((state) => state.removeAlert)

  if (alerts.length === 0) return null

  return (
    <div className="alert-container" aria-live="polite">
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
