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

function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      result[camelKey] = toCamelCase(value)
    }
    return result
  }
  return obj
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

  const data = await response.json()
  return toCamelCase(data) as T
}

interface DashboardData {
  overall: number
  resumeScore: number
  interviewScore: number
  skillGapScore: number
  careerReadiness: number
  lastUpdated: string | null
  activities: import('@/types/user').Activity[]
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

  // Streaming
  streamChat: (
    conversationId: string,
    content: string,
    mode: string,
    onChunk: (token: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): AbortController => {
    const controller = new AbortController()
    const params = new URLSearchParams({ content, mode })

    fetch(`${API_BASE}/conversations/${conversationId}/stream?${params.toString()}`, {
      headers: { 'X-Session-Id': getSessionId() },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          onError(`HTTP ${response.status}`)
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          onError('No response body')
          return
        }
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'chunk') {
                  onChunk(data.token)
                } else if (data.type === 'done') {
                  onDone()
                } else if (data.type === 'error') {
                  onError(data.error || 'Stream error')
                }
              } catch { /* ignore */ }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message || 'Connection error')
        }
      })
    return controller
  },

  // Memory
  getMemories: (params?: { category?: string; minImportance?: number; limit?: number }) =>
    request<{ memories: import('@/types/memory').MemoryEntry[]; total: number }>(
      '/memory',
      { params: params as unknown as Record<string, string> }
    ),
  createMemory: (data: { key: string; value: string; category?: string; importance?: number }) =>
    request<import('@/types/memory').MemoryEntry>('/memory', { method: 'POST', body: JSON.stringify(data) }),
  getMemory: (id: string) => request<import('@/types/memory').MemoryEntry>(`/memory/${id}`),
  updateMemory: (id: string, data: { value?: string; category?: string; importance?: number }) =>
    request<import('@/types/memory').MemoryEntry>(`/memory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMemory: (id: string) => request<void>(`/memory/${id}`, { method: 'DELETE' }),
  clearMemories: () => request<{ status: string; count: number }>('/memory', { method: 'DELETE' }),
  getMemoryCount: () => request<{ count: number }>('/memory/count'),
  extractMemories: (text: string) =>
    request<{ extracted: number; memories: import('@/types/memory').MemoryEntry[] }>(
      `/memory/extract?text=${encodeURIComponent(text)}`, { method: 'POST' }
    ),

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
    const data = await response.json()
    return toCamelCase(data) as { id: string; filename: string; createdAt: string }
  },
  getDocuments: () =>
    request<{ documents: Array<{ id: string; filename: string; createdAt: string }> }>('/documents'),

  // Career
  getCareerHealth: () =>
    request<import('@/types/user').CareerHealth>('/career/health'),
  getActivities: () =>
    request<{ activities: import('@/types/user').Activity[] }>('/career/activities'),
  updateProfile: (data: Partial<import('@/types/user').UserProfile>) =>
    request<import('@/types/user').UserProfile>('/career/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getProfile: () =>
    request<import('@/types/user').UserProfile>('/career/profile'),
  getDashboard: () =>
    request<DashboardData>('/career/dashboard'),
}

export { ApiError }