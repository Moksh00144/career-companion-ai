import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useChat } from '@/hooks/use-chat'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatInput } from '@/components/chat/chat-input'
import { EmptyState } from '@/components/chat/empty-state'
import { ResumeAnalysisForm } from '@/components/chat/resume-analysis-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  MessageSquare,
  FileText,
  Target,
  BookOpen,
  BarChart3,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react'
import type { ConversationMode } from '@/types/chat'

const modeConfig: Record<ConversationMode, { label: string; icon: React.ReactNode }> = {
  general: { label: 'General', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  interview: { label: 'Interview', icon: <Target className="w-3.5 h-3.5" /> },
  resume_analysis: { label: 'Resume', icon: <FileText className="w-3.5 h-3.5" /> },
  skill_gap: { label: 'Skills', icon: <BookOpen className="w-3.5 h-3.5" /> },
  career_advice: { label: 'Advice', icon: <BarChart3 className="w-3.5 h-3.5" /> },
}

const modePlaceholders: Record<ConversationMode, string> = {
  general: 'Ask anything about your career...',
  interview: 'Type your interview answer...',
  resume_analysis: 'Paste your resume text or ask for analysis...',
  skill_gap: 'Describe your target role...',
  career_advice: 'Ask for career guidance...',
}

const modeAliases: Record<string, ConversationMode> = {
  resume: 'resume_analysis',
  skills: 'skill_gap',
}

function resolveMode(mode: string | null): ConversationMode {
  if (mode && mode in modeConfig) {
    return mode as ConversationMode
  }

  return modeAliases[mode ?? ''] ?? 'general'
}

export function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const mode = resolveMode(modeParam)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isStreaming,
    currentConversation,
    sendMessage,
    loadConversation,
    loadConversations,
    cancelStream,
    newConversation,
  } = useChat()
  const visibleMessages = currentConversation?.mode === mode ? messages : []
  const showResumeAnalysisForm = mode === 'resume_analysis' && visibleMessages.length === 0 && !isStreaming

  useEffect(() => {
    let isCurrentMode = true
    cancelStream()
    newConversation()

    void loadConversations(mode).then((conversations) => {
      if (!isCurrentMode || conversationId || conversations.length === 0) return
      void loadConversation(conversations[0].id, mode)
    })

    return () => {
      isCurrentMode = false
    }
  }, [cancelStream, conversationId, loadConversation, loadConversations, mode, newConversation])

  // Load conversation if ID is provided
  useEffect(() => {
    if (!conversationId) return

    if (!modeParam) {
      void loadConversation(conversationId).then((conversation) => {
        if (conversation) navigate(`/chat/${conversation.id}?mode=${conversation.mode}`, { replace: true })
      })
      return
    }

    void loadConversation(conversationId, mode)
  }, [conversationId, loadConversation, mode, modeParam, navigate])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      // Auto-scroll if user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  const handleSend = (content: string) => {
    sendMessage(content, mode)
  }

  const handleSuggestionClick = (text: string) => {
    sendMessage(text, mode)
  }

  const handleModeChange = (nextMode: ConversationMode) => {
    if (nextMode !== mode) navigate(`/chat?mode=${nextMode}`)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] relative">
      {/* Chat sidebar */}
      <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode={mode} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-8 w-8"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex h-8 w-8"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mode selector */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {(Object.entries(modeConfig) as [ConversationMode, typeof modeConfig['general']][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  mode === key
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>

          {/* Spacer for alignment */}
          <div className="w-8" />
        </div>

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin"
        >
          {showResumeAnalysisForm ? (
            <ResumeAnalysisForm isAnalyzing={isStreaming} onAnalyze={handleSend} />
          ) : visibleMessages.length === 0 && !isStreaming ? (
            <EmptyState mode={mode} onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 py-4">
              {visibleMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming && msg === visibleMessages[visibleMessages.length - 1] && msg.role === 'assistant'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        {!showResumeAnalysisForm && (
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              onSend={handleSend}
              onCancel={cancelStream}
              isStreaming={isStreaming}
              placeholder={modePlaceholders[mode]}
              mode={mode}
            />
          </div>
        )}
      </div>
    </div>
  )
}
