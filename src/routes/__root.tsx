import { Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import '@/App.css'

export function RootLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
