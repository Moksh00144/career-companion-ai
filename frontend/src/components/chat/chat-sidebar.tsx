import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import {
  Plus,
  MessageSquare,
  Trash2,
  FileText,
  Target,
  BookOpen,
  BarChart3,
  Sparkles,
  History,
} from 'lucide-react'
import type { ConversationMode } from '@/types/chat'

const modeIcons: Record<string, typeof Sparkles> = {
  general: MessageSquare,
  interview: Target,
  resume_analysis: FileText,
  skill_gap: BookOpen,
  career_advice: BarChart3,
}

interface ChatSidebarProps {
  open: boolean
  onClose: () => void
  mode: ConversationMode
}

export function ChatSidebar({ open, onClose, mode }: ChatSidebarProps) {
  const navigate = useNavigate()
  const { conversations, currentConversation, loadConversations, deleteConversation, newConversation } = useChat()

  useEffect(() => {
    void loadConversations(mode)
  }, [loadConversations, mode])

  const handleNewChat = () => {
    newConversation()
    navigate(`/chat?mode=${mode}`)
    onClose()
  }

  const handleSelectConversation = (id: string) => {
    navigate(`/chat/${id}?mode=${mode}`)
    onClose()
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteConversation(id)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative top-0 left-0 z-40 h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
          // Mobile: slide in/out
          'md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">Conversations</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 w-8 p-0"
            aria-label="New conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 h-9 text-sm"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <History className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const Icon = modeIcons[conv.mode] || MessageSquare
              const isActive = conv.id === currentConversation?.id
              const timeAgo = conv.updatedAt ? formatRelativeTime(conv.updatedAt) : ''
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-sidebar-accent/10 text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/5'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={cn(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">
                        {conv.title || 'New Conversation'}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {truncate(conv.lastMessage, 60)}
                        </p>
                      )}
                      {timeAgo && (
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                          {timeAgo}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded mt-0.5"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive/60 hover:text-destructive" />
                    </button>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
