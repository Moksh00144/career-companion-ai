import { type LucideIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const ActionButton = actionHref ? (
    <Link to={actionHref}>
      <Button variant="outline" size="sm" className="mt-4">
        {actionLabel}
      </Button>
    </Link>
  ) : actionLabel && onAction ? (
    <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
      {actionLabel}
    </Button>
  ) : null

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {ActionButton}
    </div>
  )
}