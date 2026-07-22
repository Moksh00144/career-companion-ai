import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '@/stores/ui-store'

interface ThemeProviderProps {
  children: ReactNode
}

// Apply theme class before React renders to prevent flash
const storedTheme = (() => {
  try {
    const stored = localStorage.getItem('careerforge-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return 'dark'
  } catch {
    return 'dark'
  }
})()

document.documentElement.classList.remove('dark', 'light')
document.documentElement.classList.add(storedTheme)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  useEffect(() => {
    // Sync store with localStorage on first render
    setTheme(storedTheme)
  }, [setTheme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    // Add transition class after a frame to avoid flash
    requestAnimationFrame(() => {
      root.style.setProperty('--theme-transition', 'all 0.3s ease')
      setTimeout(() => root.style.removeProperty('--theme-transition'), 300)
    })
    try {
      localStorage.setItem('careerforge-theme', theme)
    } catch { /* ignore */ }
  }, [theme])

  return <>{children}</>
}