import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, StopCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversationMode } from '@/types/chat'

interface ChatInputProps {
  onSend: (content: string) => void
  onCancel: () => void
  isStreaming: boolean
  placeholder?: string
  mode: ConversationMode
}

export function ChatInput({ onSend, onCancel, isStreaming, placeholder, mode }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [input])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return
    onSend(input.trim())
    setInput('')
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-end gap-2 glass rounded-2xl border p-2 transition-all duration-200',
          isStreaming ? 'border-primary/30' : 'border-border/50',
          'focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5'
        )}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type your message...'}
          disabled={isStreaming}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent border-0 outline-none px-3 py-2 text-sm',
            'placeholder:text-muted-foreground/50',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'scrollbar-thin'
          )}
          aria-label="Chat input"
        />

        {isStreaming ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            aria-label="Stop generating"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={cn(
              'h-9 w-9 flex-shrink-0 rounded-xl transition-all',
              input.trim()
                ? 'text-primary hover:text-primary hover:bg-primary/10'
                : 'text-muted-foreground/30'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mode indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <Sparkles className="w-3 h-3 text-primary/60" />
        <p className="text-[10px] text-muted-foreground/50">
          {mode === 'general' && 'Career AI Coach'}
          {mode === 'interview' && 'Mock Interview Mode'}
          {mode === 'resume_analysis' && 'Resume Analysis Mode'}
          {mode === 'skill_gap' && 'Skill Gap Analysis'}
          {mode === 'career_advice' && 'Career Strategy'}
          {' · Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
