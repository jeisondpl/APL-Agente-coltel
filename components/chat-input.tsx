'use client'

import {
  useRef,
  useEffect,
  type KeyboardEvent,
  type FormEvent,
} from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isLoading: boolean
  suggestedQuestion?: string
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  suggestedQuestion,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    // Clamp between 1 row (44px) and 6 rows (~168px)
    const newHeight = Math.min(el.scrollHeight, 168)
    el.style.height = `${newHeight}px`
  }, [value])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends the message; Shift+Enter inserts a newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
  }

  function handleSuggestedQuestion() {
    if (!suggestedQuestion || isLoading) return
    onSubmit(suggestedQuestion)
  }

  const charCount = value.length
  const charLimit = 2000
  const isOverLimit = charCount > charLimit
  const canSend = value.trim().length > 0 && !isLoading && !isOverLimit

  return (
    <div style={{ borderTop: '1px solid #d1d1d1', background: '#FFFFFF' }}>
      <div className="mx-auto max-w-3xl px-4 py-3">
        {/* Suggested question pill — only shown when input is empty and not loading */}
        {suggestedQuestion && value.length === 0 && !isLoading && (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSuggestedQuestion}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 focus-ring"
              style={{ border: '1px solid #c5ccf7', background: '#e8ecff', color: '#001EB3' }}
              aria-label={`Usar pregunta sugerida: ${suggestedQuestion}`}
            >
              <svg
                className="size-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
              <span className="line-clamp-1">{suggestedQuestion}</span>
            </button>
          </div>
        )}

        {/* Composer form */}
        <form onSubmit={handleSubmit} noValidate>
          <div
            className="flex items-end gap-2 px-4 py-3 shadow-sm transition-colors duration-150"
            style={{
              borderRadius: '25px',
              border: isOverLimit
                ? '1px solid #e74c3c'
                : '1px solid #d1d1d1',
              background: isLoading ? '#f9f9f9' : '#FFFFFF',
            }}
            onFocusCapture={(e) => {
              if (!isOverLimit) {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#001EB3'
              }
            }}
            onBlurCapture={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor =
                isOverLimit ? '#e74c3c' : '#d1d1d1'
            }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder={
                isLoading
                  ? 'El asistente está procesando tu consulta…'
                  : 'Escribe tu consulta… (Enter para enviar, Shift+Enter para nueva línea)'
              }
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-60 max-h-[168px] min-h-[28px]"
              style={{ color: '#333333', overflowY: 'auto' }}
              aria-label="Campo de consulta al asistente"
              aria-describedby="char-counter"
              maxLength={charLimit + 50}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!canSend}
              className="flex size-9 shrink-0 items-center justify-center transition-all duration-150 active:scale-95"
              style={{
                borderRadius: '25px',
                background: canSend ? '#001EB3' : '#e5e5e5',
                color: canSend ? '#ffffff' : '#999999',
                cursor: canSend ? 'pointer' : 'not-allowed',
                border: 'none',
              }}
              aria-label={isLoading ? 'Procesando…' : 'Enviar consulta'}
              onMouseEnter={(e) => {
                if (canSend) e.currentTarget.style.background = '#0D2A8A'
              }}
              onMouseLeave={(e) => {
                if (canSend) e.currentTarget.style.background = '#001EB3'
              }}
            >
              {isLoading ? (
                /* Spinner */
                <svg
                  className="size-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                  />
                </svg>
              ) : (
                /* Send arrow */
                <svg
                  className="size-4 translate-x-px"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.25}
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Footer row: char counter + hint */}
          <div className="mt-1.5 flex items-center justify-between px-1">
            <p className="text-[11px]" style={{ color: '#aaaaaa' }}>
              <kbd className="rounded px-1 py-px font-mono text-[10px]" style={{ border: '1px solid #d1d1d1', background: '#f5f5f5' }}>Enter</kbd>
              {' '}para enviar &nbsp;·&nbsp;{' '}
              <kbd className="rounded px-1 py-px font-mono text-[10px]" style={{ border: '1px solid #d1d1d1', background: '#f5f5f5' }}>Shift+Enter</kbd>
              {' '}para nueva línea
            </p>
            <span
              id="char-counter"
              className="text-[11px] tabular-nums"
              style={{ color: isOverLimit ? '#e74c3c' : '#aaaaaa', fontWeight: isOverLimit ? '600' : '400' }}
              aria-live="polite"
            >
              {charCount > 0 ? `${charCount} / ${charLimit}` : ''}
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
