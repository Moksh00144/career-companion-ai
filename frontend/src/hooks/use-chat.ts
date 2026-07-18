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
    setMessages,
    addMessage,
    updateLastMessage,
    setIsStreaming,
    setCurrentConversation,
    clearStreamContent,
  } = useChatStore()

  const eventSourceRef = useRef<EventSource | null>(null)

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

      // Connect to SSE stream
      const streamUrl = api.createStreamUrl(conversationId, content, mode)

      // Close previous connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource(streamUrl)
      eventSourceRef.current = eventSource

      eventSource.addEventListener('chunk', (e: MessageEvent) => {
        try {
          const { token } = JSON.parse(e.data)
          useChatStore.getState().appendStreamContent(token)
          useChatStore.getState().updateLastMessage(
            useChatStore.getState().streamContent
          )
        } catch {
          // ignore parse errors
        }
      })

      eventSource.addEventListener('done', () => {
        setIsStreaming(false)
        clearStreamContent()
        eventSource.close()
      })

      eventSource.addEventListener('error', () => {
        setIsStreaming(false)
        clearStreamContent()
        eventSource.close()
      })
    },
    [
      currentConversation,
      isStreaming,
      setMessages,
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

  const cancelStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
    clearStreamContent()
  }, [setIsStreaming, clearStreamContent])

  return {
    messages,
    isStreaming,
    currentConversation,
    sendMessage,
    loadConversation,
    cancelStream,
  }
}