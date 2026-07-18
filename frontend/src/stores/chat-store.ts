import { create } from 'zustand'
import type { Message, Conversation, ConversationMode } from '@/types/chat'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  streamContent: string

  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  addConversation: (conversation: Conversation) => void
  removeConversation: (id: string) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setIsStreaming: (isStreaming: boolean) => void
  appendStreamContent: (token: string) => void
  clearStreamContent: () => void
  reset: () => void
}

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  streamContent: '',
}

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation:
        state.currentConversation?.id === id ? null : state.currentConversation,
    })),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIndex = messages.length - 1
      if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
        messages[lastIndex] = { ...messages[lastIndex], content }
      }
      return { messages }
    }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  appendStreamContent: (token) =>
    set((state) => ({
      streamContent: state.streamContent + token,
    })),

  clearStreamContent: () => set({ streamContent: '' }),

  reset: () => set(initialState),
}))