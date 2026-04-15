'use client'

import type { ChatMessage, AnswerContentBlock } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import AnswerRenderer from './answer-renderer'

// ─── User message bubble ──────────────────────────────────────────────────────

function UserMessage({ message }: { message: ChatMessage }) {
  const text = typeof message.content === 'string' ? message.content : ''

  return (
    <div className="message-animate flex items-end justify-end gap-2.5">
      <div className="flex max-w-[80%] flex-col items-end gap-1 sm:max-w-[70%]">
        <div
          className="rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-white shadow-sm"
          role="article"
          aria-label="Tu mensaje"
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {text}
          </p>
        </div>
        <time
          className="px-1 text-[11px] text-slate-400"
          dateTime={message.timestamp.toISOString()}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>

      {/* User avatar */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
        aria-hidden="true"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </div>
    </div>
  )
}

// ─── Assistant message bubble ─────────────────────────────────────────────────

function AssistantMessage({ message }: { message: ChatMessage }) {
  const content = message.content as AnswerContentBlock[]

  return (
    <div className="message-animate flex items-start gap-2.5">
      {/* AI avatar */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm"
        aria-hidden="true"
      >
        <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
          />
        </svg>
      </div>

      <div className="flex min-w-0 max-w-[90%] flex-col gap-1 sm:max-w-[80%]">
        <span className="px-1 text-[11px] font-medium text-slate-400">
          Asistente IA
        </span>
        <div
          className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-5 py-4 shadow-sm"
          role="article"
          aria-label="Respuesta del asistente"
        >
          <AnswerRenderer content={content} />
        </div>
        <time
          className="px-1 text-[11px] text-slate-400"
          dateTime={message.timestamp.toISOString()}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  )
}

// ─── Error message bubble ─────────────────────────────────────────────────────

function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="message-animate flex items-start gap-2.5">
      {/* Error avatar */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100"
        aria-hidden="true"
      >
        <svg className="size-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div className="flex min-w-0 max-w-[85%] flex-col gap-1">
        <span className="px-1 text-[11px] font-medium text-slate-400">
          Asistente IA
        </span>
        <div className="rounded-2xl rounded-tl-sm border border-red-100 bg-red-50 px-4 py-3 shadow-sm">
          <p className="text-sm text-red-700">{text}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="message-animate flex items-start gap-2.5" role="status" aria-label="El asistente está procesando tu consulta">
      {/* AI avatar */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm"
        aria-hidden="true"
      >
        <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <span className="px-1 text-[11px] font-medium text-slate-400">
          Asistente IA
        </span>
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="typing-dot size-2 rounded-full bg-indigo-400" />
            <span className="typing-dot size-2 rounded-full bg-indigo-400" />
            <span className="typing-dot size-2 rounded-full bg-indigo-400" />
          </div>
          <span className="sr-only">El asistente está procesando…</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ChatMessageProps {
  message: ChatMessage
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />
  }

  // Check if this is an error message (string content on assistant means error)
  if (typeof message.content === 'string') {
    return <ErrorMessage text={message.content} />
  }

  return <AssistantMessage message={message} />
}
