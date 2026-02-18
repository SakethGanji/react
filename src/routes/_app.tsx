import { Outlet, useRouterState } from '@tanstack/react-router'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/shared/store'
import { AppSwitcher } from '@/shared/components/AppSwitcher'
import { AppNavigation } from '@/shared/components/AppNavigation'
import { Button } from '@/shared/components/ui/button'
import { Toaster } from '@/shared/components/ui/sonner'

// Toggle this to enable/disable auth checking
const ENABLE_AUTH = false

export function AppLayout() {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <div className={`mx-auto flex min-h-svh max-w-[1400px] flex-col gap-6 p-6 md:p-8 ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex items-center justify-between">
        <div className="shrink-0">
          <AppSwitcher currentPath={currentPath} />
        </div>
        <div className="flex flex-1 justify-center">
          <AppNavigation currentPath={currentPath} />
        </div>
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </div>
      </header>
      <Outlet />
      <Toaster richColors position="top-right" />
    </div>
  )
}

export async function appBeforeLoad() {
  if (ENABLE_AUTH) {
    const { isAuthenticated, redirectToLogin } = await import('@/shared/auth')
    if (!isAuthenticated()) {
      redirectToLogin()
      throw new Error('Redirecting to login')
    }
  }
}
