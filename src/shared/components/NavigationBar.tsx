import { Link } from '@tanstack/react-router'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '../store'

interface NavItem {
  to: '/guardrail-dashboard' | '/settings'
  label: string
}

const navItems: NavItem[] = [
  { to: '/guardrail-dashboard', label: 'Guardrail Dashboard' },
  { to: '/settings', label: 'Settings' },
]

export function NavigationBar() {
  const { theme, toggleTheme } = useUIStore()

  return (
    <header className="dashboard-header">
      <h1>Dashboard</h1>
      <nav className="dashboard-nav">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="nav-link"
            activeProps={{ className: 'nav-link active' }}
          >
            {item.label}
          </Link>
        ))}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>
    </header>
  )
}
