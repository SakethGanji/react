import { Outlet, useRouterState } from '@tanstack/react-router'
import { Toaster } from '@/shared/components/ui/sonner'
import { DefaultHeader } from '@/shared/components/DefaultHeader'
import { getAppByPath } from '@/apps'

// Toggle this to enable/disable auth checking
const ENABLE_AUTH = false

export function AppLayout() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const currentApp = getAppByPath(currentPath)
  const Header = currentApp?.header

  return (
    <div className="mx-auto flex min-h-svh max-w-[1400px] flex-col gap-6 bg-background p-6 md:p-8">
      {Header ? <Header /> : <DefaultHeader currentPath={currentPath} />}
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
