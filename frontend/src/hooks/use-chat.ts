import { useCallback, useRef } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { api } from '@/lib/api-client'
import { generateId } from '@/lib/utils'
import type { Message, ConversationMode } from '@/types/chat'

export function useChat() {
  const {
    messages,
    isStreaming,
    currentConversation,
    conversations,
    setMessages,
    addMessage,
    updateLastMessage,
    setIsStreaming,
    setCurrentConversation,
    setConversations,
    addConversation,
    removeConversation,
    clearStreamContent,
  } = useChatStore()

  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string, mode: ConversationMode = 'general') => {
      if (!content.trim() || isStreaming) return

      let conversationId = currentConversation?.id

      // Create conversation if none exists
      if (!conversationId) {
        try {
          const conversation = await api.createConversation({
            title: content.slice(0, 60) + (content.length > 60 ? '...' : ''),
            mode,
          })
          conversationId = conversation.id
          setCurrentConversation(conversation)
          useChatStore.getState().addConversation(conversation)
        } catch {
          return
        }
      }

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        conversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }
      addMessage(userMessage)

      // Start streaming
      setIsStreaming(true)
      clearStreamContent()

      // Create placeholder AI message
      const aiMessage: Message = {
        id: generateId(),
        conversationId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }
      addMessage(aiMessage)

      // Cancel previous stream
      if (abortRef.current) {
        abortRef.current.abort()
      }

      // Connect to SSE stream via fetch
      abortRef.current = api.streamChat(
        conversationId,
        content,
        mode,
        // onChunk
        (token: string) => {
          useChatStore.getState().appendStreamContent(token)
          useChatStore.getState().updateLastMessage(
            useChatStore.getState().streamContent
          )
        },
        // onDone
        () => {
          setIsStreaming(false)
          clearStreamContent()
          abortRef.current = null
        },
        // onError
        () => {
          setIsStreaming(false)
          clearStreamContent()
          abortRef.current = null
        }
      )
    },
    [
      currentConversation,
      isStreaming,
      addMessage,
      updateLastMessage,
      setIsStreaming,
      setCurrentConversation,
      clearStreamContent,
    ]
  )

  const loadConversation = useCallback(async (id: string) => {
    try {
      const [conversation, loadedMessages] = await Promise.all([
        api.getConversation(id),
        api.getMessages(id),
      ])
      setCurrentConversation(conversation)
      setMessages(loadedMessages)
    } catch {
      // handle error
    }
  }, [setCurrentConversation, setMessages])

  const loadConversations = useCallback(async () => {
    try {
      const result = await api.getConversations({ limit: '50', offset: '0' })
      setConversations(result.conversations)
    } catch {
      // handle error
    }
  }, [setConversations])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await api.deleteConversation(id)
      removeConversation(id)
      if (currentConversation?.id === id) {
        setCurrentConversation(null)
        setMessages([])
      }
    } catch {
      // handle error
    }
  }, [removeConversation, currentConversation, setCurrentConversation, setMessages])

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsStreaming(false)
    clearStreamContent()
  }, [setIsStreaming, clearStreamContent])

  const newConversation = useCallback(() => {
    setCurrentConversation(null)
    setMessages([])
  }, [setCurrentConversation, setMessages])

  return {
    messages,
    isStreaming,
    currentConversation,
    conversations,
    sendMessage,
    loadConversation,
    loadConversations,
    deleteConversation,
    cancelStream,
    newConversation,
  }
}
