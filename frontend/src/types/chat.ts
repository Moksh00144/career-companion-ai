export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export type ConversationMode =
  | 'general'
  | 'interview'
  | 'resume_analysis'
  | 'career_advice'
  | 'skill_gap'

export interface Conversation {
  id: string
  title: string
  mode: ConversationMode
  metadata?: Record<string, unknown>
  isArchived: boolean
  createdAt: string
  updatedAt: string
  messageCount?: number
  lastMessage?: string
}

export interface StreamingMessage {
  token: string
  finishReason?: 'stop' | 'length' | 'error'
}

export interface ChatRequest {
  content: string
  mode?: ConversationMode
  context?: Record<string, unknown>
}

export interface ScoreCard {
  label: string
  score: number
  maxScore: number
  trend?: 'up' | 'down' | 'stable'
  color?: 'primary' | 'accent' | 'destructive' | 'warning'
}