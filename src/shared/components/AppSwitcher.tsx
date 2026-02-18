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
      <span className="text-lg font-semibold text-foreground">
        {currentApp?.name ?? 'Dashboard'}
      </span>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-lg font-semibold text-foreground transition-colors hover:border-border hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentApp?.name ?? 'Select App'}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[280px] rounded-md border bg-popover shadow-lg" role="listbox">
          {APP_REGISTRY.map((app) => (
            <li key={app.id} role="option" aria-selected={app.id === currentApp?.id}>
              <Link
                to={app.defaultRoute}
                className={`flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted ${
                  app.id === currentApp?.id ? 'border-l-[3px] border-l-primary bg-muted' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-sm font-semibold text-foreground">{app.name}</span>
                <span className="text-xs text-muted-foreground">{app.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
