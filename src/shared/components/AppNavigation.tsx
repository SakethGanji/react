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
    <nav className="app-navigation">
      {currentApp.routes.map((route) => {
        const fullPath = `${currentApp.basePath}/${route.path}`
        return (
          <Link
            key={fullPath}
            to={fullPath}
            className="app-nav-link"
            activeProps={{ className: 'app-nav-link active' }}
          >
            {route.label}
          </Link>
        )
      })}
    </nav>
  )
}
