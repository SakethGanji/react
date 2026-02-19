import { Outlet } from '@tanstack/react-router'
import { useUIStore } from '@/shared/store'
import { Badge } from '@/shared/components/ui/badge'

// In production builds, POC routes redirect to main app
const IS_DEV = import.meta.env.DEV

export function PocLayout() {
  const theme = useUIStore((state) => state.theme)

  return (
    <div className={`min-h-svh bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex items-center justify-end border-b bg-card px-6 py-4">
        <Badge variant="secondary">POC</Badge>
      </header>
      <Outlet />
    </div>
  )
}

export async function pocBeforeLoad() {
  // In production, redirect POC routes to main app
  if (!IS_DEV) {
    throw new Response(null, {
      status: 302,
      headers: { Location: '/' },
    })
  }
}
