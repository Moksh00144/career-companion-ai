import React, { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useChat } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import {
  Send,
  Sparkles,
  StopCircle,
  Bot,
  User,
  FileText,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
} from 'lucide-react'
import type { ConversationMode } from '@/types/chat'

const modeConfig: Record<ConversationMode, { label: string; icon: React.ReactNode; placeholder: string }> = {
  general: {
    label: 'General Chat',
    icon: <MessageSquare className="w-4 h-4" />,
    placeholder: 'Ask anything about your career...',
  },
  interview: {
    label: 'Mock Interview',
    icon: <Target className="w-4 h-4" />,
    placeholder: 'Type your interview answer...',
  },
  resume_analysis: {
    label: 'Resume Analysis',
    icon: <FileText className="w-4 h-4" />,
    placeholder: 'Paste your resume text or ask for analysis...',
  },
  skill_gap: {
    label: 'Skill Gap Analysis',
    icon: <BookOpen className="w-4 h-4" />,
    placeholder: 'Describe your target role...',
  },
  career_advice: {
    label: 'Career Advice',
    icon: <BarChart3 className="w-4 h-4" />,
    placeholder: 'Ask for career guidance...',
  },
}

export function ChatPage() {
  const { conversationId } = useParams()
  const [searchParams] = useSearchParams()
  const modeParam = (searchParams.get('mode') as ConversationMode) || 'general'
  const [mode, setMode] = useState<ConversationMode>(modeParam)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, isStreaming, sendMessage, loadConversation, cancelStream } = useChat()

  // Load conversation if ID is provided
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    }
  }, [conversationId, loadConversation])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    const content = input
    setInput('')
    await sendMessage(content, mode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Mode selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {(Object.entries(modeConfig) as [ConversationMode, typeof modeConfig['general']][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              mode === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {config.icon}
            {config.label}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {modeConfig[mode].label}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {mode === 'general' && 'Ask anything about career development, job searching, or professional growth.'}
              {mode === 'interview' && 'Practice your interview skills with AI-powered mock interviews tailored to your target role.'}
              {mode === 'resume_analysis' && 'Paste your resume text for ATS scoring and actionable improvement suggestions.'}
              {mode === 'skill_gap' && 'Identify missing skills between your current role and your dream job.'}
              {mode === 'career_advice' && 'Get personalized career path recommendations and strategic advice.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-fade-in',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {msg.content || (isStreaming ? <span className="typing-indicator">▊</span> : '')}
                </div>
                <p className={cn(
                  'text-xs mt-1',
                  msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 glass rounded-2xl border p-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={modeConfig[mode].placeholder}
            disabled={isStreaming}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={cancelStream}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <StopCircle className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={!input.trim()}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Send className="w-5 h-5" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI responses are generated by GPT-4o-mini. Verify important information.
        </p>
      </form>
    </div>
  )
}