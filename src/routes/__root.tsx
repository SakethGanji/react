import { Outlet } from '@tanstack/react-router'
import { NavigationBar } from '../shared/components'
import { AuthGuard } from '../shared/auth'
import { useUIStore } from '../shared/store'
import '../App.css'

export function RootLayout() {
  const theme = useUIStore((state) => state.theme)

  return (
    <AuthGuard>
      <div className={`dashboard theme-${theme}`} data-theme={theme}>
        <NavigationBar />
        <Outlet />
      </div>
    </AuthGuard>
  )
}
