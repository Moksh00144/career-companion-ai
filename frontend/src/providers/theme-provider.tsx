'use client'

import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '@/stores/ui-store'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }, [theme])

  return <>{children}</>
}