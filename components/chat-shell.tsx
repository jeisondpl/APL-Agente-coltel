'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ChatMessage, AnswerContentBlock, ApiQueryResponse } from '@/lib/types'
import { generateId } from '@/lib/utils'
import ChatMessageComponent, { TypingIndicator } from './chat-message'
import ChatInput from './chat-input'

const SUGGESTED_QUESTION =
  '¿cómo se resuelven los incidentes de negociaciones fallidas?'

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Logo / icon cluster */}
      <div className="relative mb-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
          <svg
            className="size-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
            />
          </svg>
        </div>
        {/* Decorative pulse ring */}
        <div className="absolute inset-0 -m-2 animate-ping rounded-2xl bg-indigo-400/20" style={{ animationDuration: '3s' }} aria-hidden="true" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-slate-800">
        ¿En qué te puedo ayudar?
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm text-slate-500">
        Consulta procedimientos, resuelve incidentes o pregunta sobre los sistemas internos de Coltel.
      </p>

      {/* Quick-start cards */}
      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
        {[
          {
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            ),
            label: 'Incidentes de negociaciones fallidas',
            question: '¿cómo se resuelven los incidentes de negociaciones fallidas?',
          },
          {
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            ),
            label: 'Consultar tablas NAB',
            question: '¿cómo consulto las tablas NAB de la base de datos?',
          },
          {
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            ),
            label: 'Proceso de escalamiento',
            question: '¿cuál es el proceso de escalamiento de incidentes?',
          },
          {
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M16.5 6v.75a3.75 3.75 0 0 1-7.5 0V6a3.75 3.75 0 0 1 7.5 0ZM5.25 9h13.5m-12 4.5h10.5"
              />
            ),
            label: 'Requerimiento ID_PRICING',
            question: '¿cómo identifico el número de requerimiento ID_PRICING?',
          },
        ].map(({ icon, label, question }) => (
          <button
            key={question}
            type="button"
            onClick={() => onSuggest(question)}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md focus-ring"
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="size-4 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {icon}
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
        {/* Logo */}
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
          <svg
            className="size-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight text-slate-900">
            Asistente IA
          </h1>
          <p className="truncate text-xs text-slate-500">
            Coltel — Procedimientos operativos y soporte técnico
          </p>
        </div>

        {/* Online status badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-[11px] font-medium text-emerald-700">En línea</span>
        </div>
      </div>
    </header>
  )
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to the bottom whenever messages change or loading state toggles
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return

    // Build the user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorText =
          errorData?.error ??
          `Error del servidor (${response.status}). Por favor intenta de nuevo.`
        throw new Error(errorText)
      }

      const data: ApiQueryResponse = await response.json()
      const assistantContent: AnswerContentBlock[] = data.answer.content

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorText =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el asistente. Verifica tu conexión y vuelve a intentarlo.'

      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        // String content on assistant = error display (see chat-message.tsx)
        content: errorText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 60%), #f1f5f9',
        }}
      />

      <Header />

      {/* Message area */}
      <main
        className="flex-1 overflow-y-auto"
        role="main"
        aria-label="Conversación con el asistente"
      >
        <div className="mx-auto max-w-3xl px-4">
          {!hasMessages && !isLoading ? (
            <EmptyState onSuggest={handleSubmit} />
          ) : (
            <div className="space-y-6 py-6">
              {messages.map((msg) => (
                <ChatMessageComponent key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        suggestedQuestion={!hasMessages ? SUGGESTED_QUESTION : undefined}
      />
    </div>
  )
}
