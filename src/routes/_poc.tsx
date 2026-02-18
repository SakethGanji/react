import { Outlet, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useUIStore } from '@/shared/store'
import { Badge } from '@/shared/components/ui/badge'

// In production builds, POC routes redirect to main app
const IS_DEV = import.meta.env.DEV

export function PocLayout() {
  const theme = useUIStore((state) => state.theme)

  return (
    <div className={`min-h-svh bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <Link to="/gallery" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={18} />
          <span>Back to Gallery</span>
        </Link>
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
