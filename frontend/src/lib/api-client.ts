import { getSessionId } from './utils'

const API_BASE = '/api/v1'

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
    ...(fetchOptions.headers as Record<string, string>),
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(response.status, error.detail || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),

  // Conversations
  getConversations: (params?: { limit?: string; offset?: string }) =>
    request<{ conversations: import('@/types/chat').Conversation[]; total: number }>(
      '/conversations',
      { params: params as Record<string, string> }
    ),

  createConversation: (data: { title?: string; mode?: string }) =>
    request<import('@/types/chat').Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getConversation: (id: string) =>
    request<import('@/types/chat').Conversation>(`/conversations/${id}`),

  deleteConversation: (id: string) =>
    request<void>(`/conversations/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: (conversationId: string) =>
    request<import('@/types/chat').Message[]>(`/conversations/${conversationId}/messages`),

  // Streaming - returns EventSource
  createStreamUrl: (conversationId: string, content: string, mode?: string): string => {
    const params = new URLSearchParams({ content })
    if (mode) params.set('mode', mode)
    return `${API_BASE}/conversations/${conversationId}/stream?${params.toString()}`
  },

  // Documents
  uploadDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { 'X-Session-Id': getSessionId() },
      body: formData,
    })
    if (!response.ok) throw new ApiError(response.status, 'Upload failed')
    return response.json()
  },

  getDocuments: () =>
    request<{ documents: Array<{ id: string; filename: string; createdAt: string }> }>(
      '/documents'
    ),

  // Career
  getCareerHealth: () =>
    request<import('@/types/user').CareerHealth>('/career/health'),

  getActivities: () =>
    request<{ activities: import('@/types/user').Activity[] }>('/career/activities'),

  updateProfile: (data: Partial<import('@/types/user').UserProfile>) =>
    request<import('@/types/user').UserProfile>('/career/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    request<import('@/types/user').UserProfile>('/career/profile'),
}

export { ApiError }