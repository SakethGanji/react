import { Link } from '@tanstack/react-router'
import { getAppByPath } from '@/apps'

interface AppNavigationProps {
  currentPath: string
}

export function AppNavigation({ currentPath }: AppNavigationProps) {
  const currentApp = getAppByPath(currentPath)

  if (!currentApp || currentApp.routes.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center gap-1 rounded-full bg-white/15 p-1">
      {currentApp.routes.map((route) => {
        const fullPath = `${currentApp.basePath}/${route.path}`
        return (
          <Link
            key={fullPath}
            to={fullPath}
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            inactiveProps={{ className: 'text-white/70 hover:text-white' }}
            activeProps={{ className: 'bg-white text-primary shadow-sm' }}
          >
            {route.label}
          </Link>
        )
      })}
    </nav>
  )
}
