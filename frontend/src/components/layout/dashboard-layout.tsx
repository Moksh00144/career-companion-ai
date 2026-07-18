import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, theme, toggleTheme, mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-16',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 border-b border-sidebar-border px-4', !sidebarOpen && 'justify-center')}>
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg whitespace-nowrap">CareerForge</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/chat' && location.pathname.startsWith('/chat'))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className={cn('border-t border-sidebar-border p-4', !sidebarOpen && 'px-2')}>
          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/10 transition-all duration-200',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Toggle theme' : undefined}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* Collapse button (desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border items-center justify-center hover:bg-sidebar-accent/10 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 glass border-b h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-secondary rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">CareerForge</span>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-secondary rounded-lg">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 pt-16 md:pt-0',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16'
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}