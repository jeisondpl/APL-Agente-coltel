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
