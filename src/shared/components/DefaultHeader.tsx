import { Sun, Moon, User } from 'lucide-react'
import { useUIStore } from '@/shared/store'
import { AppNavigation } from '@/shared/components/AppNavigation'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu'

interface DefaultHeaderProps {
  currentPath: string
}

export function DefaultHeader({ currentPath }: DefaultHeaderProps) {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  return (
    <header className="flex items-center justify-between rounded-2xl bg-primary px-6 py-3 shadow-lg">
      <div className="flex flex-1 justify-center">
        <AppNavigation currentPath={currentPath} />
      </div>
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/50">
              <Avatar size="sm">
                <AvatarFallback className="bg-white/15 text-white/80">
                  <User className="size-3.5" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
