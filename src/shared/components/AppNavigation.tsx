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
    <nav className="flex gap-1">
      {currentApp.routes.map((route) => {
        const fullPath = `${currentApp.basePath}/${route.path}`
        return (
          <Link
            key={fullPath}
            to={fullPath}
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: 'rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground' }}
          >
            {route.label}
          </Link>
        )
      })}
    </nav>
  )
}
