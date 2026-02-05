import { Link } from '@tanstack/react-router'
import { GUARDRAILS_NAV } from '@/apps/guardrails'
import { getAppByPath } from '@/apps'

interface AppNavigationProps {
  currentPath: string
}

export function AppNavigation({ currentPath }: AppNavigationProps) {
  const currentApp = getAppByPath(currentPath)

  // Get navigation items based on current app
  const navItems = currentApp?.id === 'guardrails' ? GUARDRAILS_NAV : []

  if (navItems.length === 0) {
    return null
  }

  return (
    <nav className="app-navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="app-nav-link"
          activeProps={{ className: 'app-nav-link active' }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
