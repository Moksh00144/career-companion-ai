import { cn, formatRelativeTime } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/chat/markdown-renderer'
import { Bot, User } from 'lucide-react'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isEmpty = !message.content && isStreaming

  return (
    <div
      className={cn(
        'flex gap-3 w-full animate-fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-primary/20">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-secondary/80 text-secondary-foreground rounded-tl-sm border border-border/30'
        )}
      >
        {isEmpty ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className={cn(isUser ? 'prose-sm' : '')}>
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1.5',
            isUser ? 'text-primary-foreground/50' : 'text-muted-foreground/50'
          )}
        >
          {formatRelativeTime(message.createdAt)}
          {isStreaming && !isEmpty && (
            <span className="ml-2 inline-block w-1.5 h-3 bg-primary/60 animate-pulse rounded-sm" />
          )}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-1 border border-border/50">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
