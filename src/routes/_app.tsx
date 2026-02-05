import { Outlet, useRouterState } from '@tanstack/react-router'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/shared/store'
import { AppSwitcher } from '@/shared/components/AppSwitcher'
import { AppNavigation } from '@/shared/components/AppNavigation'
import { isAuthenticated, redirectToLogin } from '@/shared/auth'

// Toggle this to enable/disable auth checking
const ENABLE_AUTH = false

export function AppLayout() {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <div className={`dashboard theme-${theme}`} data-theme={theme}>
      <header className="dashboard-header">
        <div className="header-left">
          <AppSwitcher currentPath={currentPath} />
        </div>
        <div className="header-center">
          <AppNavigation currentPath={currentPath} />
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export async function appBeforeLoad() {
  if (ENABLE_AUTH && !isAuthenticated()) {
    redirectToLogin()
    // Throw to prevent rendering while redirecting
    throw new Error('Redirecting to login')
  }
}
