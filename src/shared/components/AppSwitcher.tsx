import { Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { APP_REGISTRY, getAppByPath } from '@/apps'

interface AppSwitcherProps {
  currentPath: string
}

export function AppSwitcher({ currentPath }: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentApp = getAppByPath(currentPath)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (APP_REGISTRY.length <= 1) {
    return (
      <span className="app-switcher-single">
        {currentApp?.name ?? 'Dashboard'}
      </span>
    )
  }

  return (
    <div className="app-switcher" ref={dropdownRef}>
      <button
        className="app-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentApp?.name ?? 'Select App'}</span>
        <ChevronDown size={16} className={`app-switcher-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <ul className="app-switcher-dropdown" role="listbox">
          {APP_REGISTRY.map((app) => (
            <li key={app.id} role="option" aria-selected={app.id === currentApp?.id}>
              <Link
                to={app.defaultRoute}
                className={`app-switcher-option ${app.id === currentApp?.id ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="app-switcher-option-name">{app.name}</span>
                <span className="app-switcher-option-desc">{app.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
