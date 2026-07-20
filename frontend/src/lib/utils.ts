import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15)
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return ''
  try {
    const now = new Date()
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    const diffMs = now.getTime() - d.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

export function truncate(str: string | null | undefined, length: number): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('careerforge_session_id')
  if (!sessionId) {
    sessionId = generateId()
    localStorage.setItem('careerforge_session_id', sessionId)
  }
  return sessionId
}
