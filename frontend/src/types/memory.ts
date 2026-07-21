export interface MemoryEntry {
  id: string
  userId: string
  key: string
  value: string
  category: 'skill' | 'preference' | 'goal' | 'fact' | 'experience' | 'achievement'
  source: 'manual' | 'userInput' | 'aiExtracted'
  confidence: number
  importance: number
  createdAt: string
  updatedAt: string
}

export interface MemoryCreateRequest {
  key: string
  value: string
  category?: string
  importance?: number
}

export interface MemoryUpdateRequest {
  value?: string
  category?: string
  importance?: number
}