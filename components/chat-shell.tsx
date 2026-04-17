'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ChatMessage, AnswerContentBlock, ApiQueryResponse } from '@/lib/types'
import { generateId } from '@/lib/utils'
import ChatMessageComponent, { TypingIndicator } from './chat-message'
import ChatInput from './chat-input'

const SUGGESTED_QUESTION =
  '¿cómo se resuelven los incidentes de negociaciones fallidas?'

// ─── Tigo design tokens (used inline for non-Tailwind values) ────────────────
const T = {
  primary:   '#001EB3',
  secondary: '#0D2A8A',
  bg:        '#E5E5E5',
  cardBg:    '#FFFFFF',
  text:      '#666666',
  border:    '#d1d1d1',
} as const

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  const cards = [
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
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Icon cluster */}
      <div className="relative mb-6">
        <div
          className="flex size-16 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: T.primary }}
        >
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
        <div
          className="absolute inset-0 -m-2 animate-ping rounded-2xl"
          style={{ background: 'rgba(0, 30, 179, 0.15)', animationDuration: '3s' }}
          aria-hidden="true"
        />
      </div>

      <h2 className="mb-2 text-xl font-semibold" style={{ color: '#222222' }}>
        ¿En qué te puedo ayudar?
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm" style={{ color: T.text }}>
        Consulta procedimientos, resuelve incidentes o pregunta sobre los sistemas internos de Coltel.
      </p>

      {/* Quick-start cards */}
      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
        {cards.map(({ icon, label, question }) => (
          <button
            key={question}
            type="button"
            onClick={() => onSuggest(question)}
            className="flex items-start gap-3 p-4 text-left transition-all duration-150 focus-ring"
            style={{
              background: T.cardBg,
              borderRadius: '10px',
              borderLeft: `5px solid ${T.primary}`,
              border: `1px solid ${T.border}`,
              borderLeftWidth: '5px',
              borderLeftColor: T.primary,
              boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderLeftColor = '#3355ff'
              el.style.boxShadow = '0 4px 16px 0 rgba(0, 30, 179, 0.14)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderLeftColor = T.primary
              el.style.boxShadow = '0 0 10px 0 rgba(0,0,0,0.1)'
              el.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: '#e8ecff' }}
            >
              <svg
                className="size-4"
                style={{ color: T.primary }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {icon}
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({
  onNewChat,
  hasMessages,
  userName,
  onLogout,
}: {
  onNewChat: () => void
  hasMessages: boolean
  userName: string
  onLogout: () => void
}) {
  return (
    <header
      style={{
        background: T.primary,
        height: '64px',
        boxShadow: '0px 0px 5px 0px #000000',
        flexShrink: 0,
      }}
      className="flex items-center"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4">
        {/* Logo */}
        <div className="flex shrink-0 items-center justify-center" style={{ width: 40, height: 40 }}>
          <Image
            src="/img-pruebas/millicom/LogoNavbar.png"
            alt="Tigo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight text-white">
            Asistente IA
          </h1>
          <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Coltel — Soporte técnico
          </p>
        </div>

        {/* Online badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: 'rgba(255,255,255,0.20)' }}
        >
          <span
            className="size-1.5 animate-pulse rounded-full bg-white"
            aria-hidden="true"
          />
          <span className="text-[11px] font-medium text-white">En línea</span>
        </div>

        {/* New chat button */}
        <button
          type="button"
          onClick={onNewChat}
          disabled={!hasMessages}
          title="Nueva conversación"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            border: '1px solid rgba(255,255,255,0.30)',
          }}
          onMouseEnter={(e) => {
            if (hasMessages) e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nueva
        </button>

        {/* Divider */}
        <div
          className="hidden sm:block h-6 w-px"
          style={{ background: 'rgba(255,255,255,0.25)' }}
          aria-hidden="true"
        />

        {/* User name */}
        {userName && (
          <span
            className="hidden sm:block text-xs font-medium text-white truncate max-w-[120px]"
            title={userName}
          >
            {userName}
          </span>
        )}

        {/* Logout button */}
        <button
          type="button"
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all duration-150"
          style={{ border: '1px solid rgba(255,255,255,0.30)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function ChatShell() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Read user from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tigo_user')
      if (raw) {
        const parsed = JSON.parse(raw) as { username: string; name: string }
        setUserName(parsed.name ?? parsed.username)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Scroll to the bottom whenever messages change or loading state toggles
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('tigo_user')
    router.replace('/login')
  }, [router])

  const handleSubmit = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return

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
          (errorData as Record<string, string>)?.error ??
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
        content: errorText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setInputValue('')
    setIsLoading(false)
  }, [])

  const hasMessages = messages.length > 0

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      style={{ background: T.bg }}
    >
      <Header
        onNewChat={handleNewChat}
        hasMessages={hasMessages}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Message area */}
      <main
        className="flex-1 overflow-y-auto"
        role="main"
        aria-label="Conversación con el asistente"
        style={{ background: T.bg }}
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
