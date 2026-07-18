import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  mobileMenuOpen: boolean

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('careerforge_theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,
  mobileMenuOpen: false,

  setTheme: (theme) => {
    localStorage.setItem('careerforge_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('careerforge_theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      document.documentElement.classList.toggle('light', newTheme === 'light')
      return { theme: newTheme }
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))