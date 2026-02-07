import { create } from 'zustand'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  message: string
  duration?: number // ms, undefined = sticky
}

interface AlertStore {
  alerts: Alert[]
  addAlert: (type: AlertType, message: string, duration?: number) => string
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

let alertId = 0

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  addAlert: (type, message, duration = 5000) => {
    const id = `alert-${++alertId}`
    const alert: Alert = { id, type, message, duration }

    set((state) => ({
      alerts: [...state.alerts, alert],
    }))

    // Auto-remove after duration (if not sticky)
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }))
      }, duration)
    }

    return id
  },

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  clearAlerts: () => set({ alerts: [] }),
}))

// Convenience hook for components
export function useAlerts() {
  const addAlert = useAlertStore((state) => state.addAlert)
  const removeAlert = useAlertStore((state) => state.removeAlert)
  const clearAlerts = useAlertStore((state) => state.clearAlerts)

  return {
    success: (message: string, duration?: number) => addAlert('success', message, duration),
    error: (message: string, duration?: number) => addAlert('error', message, duration),
    warning: (message: string, duration?: number) => addAlert('warning', message, duration),
    info: (message: string, duration?: number) => addAlert('info', message, duration),
    remove: removeAlert,
    clear: clearAlerts,
  }
}
