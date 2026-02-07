import { Outlet, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useUIStore } from '@/shared/store'

// In production builds, POC routes redirect to main app
const IS_DEV = import.meta.env.DEV

export function PocLayout() {
  const theme = useUIStore((state) => state.theme)

  return (
    <div className={`poc-layout theme-${theme}`} data-theme={theme}>
      <header className="poc-header">
        <Link to="/gallery" className="poc-back-link">
          <ArrowLeft size={18} />
          <span>Back to Gallery</span>
        </Link>
        <span className="poc-badge">POC</span>
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
