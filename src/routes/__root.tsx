import { Outlet } from '@tanstack/react-router'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

export function RootLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
