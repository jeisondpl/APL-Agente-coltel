export type TextContentBlock = {
  type: 'text'
  data: string
}

export type PictureContentBlock = {
  type: 'image'
  url: string
}

export type AnswerContentBlock = TextContentBlock | PictureContentBlock

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: AnswerContentBlock[] | string
  timestamp: Date
}

export type ApiQueryRequest = {
  question: string
  thread_id?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export type ApiQueryResponse = {
  answer: {
    content: AnswerContentBlock[]
  }
  thread_id?: string | null
}

// ─── Thread / history types ───────────────────────────────────────────────────

export type ThreadMessage = {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export type Thread = {
  id: string
  title?: string
  created_at: string
  updated_at?: string
  messages?: ThreadMessage[]
}

// ─── Sources / files ──────────────────────────────────────────────────────────

export type SourceFile = {
  name: string
  size?: number
  created_at?: string
}

export type TaskStatus = {
  task_id: string
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  filename?: string
}

// ─── User session ─────────────────────────────────────────────────────────────

export type UserSession = {
  username: string
  name: string
  role: 'admin' | 'user'
  backendUsername: string
}
