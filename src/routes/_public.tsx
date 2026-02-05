import { Outlet } from '@tanstack/react-router'
import { useUIStore } from '@/shared/store'

export function PublicLayout() {
  const theme = useUIStore((state) => state.theme)

  return (
    <div className={`public-layout theme-${theme}`} data-theme={theme}>
      <Outlet />
    </div>
  )
}
