'use client'

import { useEffect, useRef } from 'react'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
}

const T = {
  primary: '#001EB3',
  text:    '#666666',
  border:  '#d1d1d1',
} as const

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus the confirm button when dialog opens for keyboard accessibility
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        confirmRef.current?.focus()
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    // Overlay
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      {/* Card */}
      <div
        className="mx-4 w-full max-w-sm"
        style={{
          background: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '28px 24px 24px',
        }}
      >
        {/* Title */}
        <h2
          id="confirm-title"
          className="mb-2 text-base font-semibold"
          style={{ color: T.primary }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-message"
          className="mb-6 text-sm leading-relaxed"
          style={{ color: T.text }}
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            style={{
              borderRadius: '25px',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.text,
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.borderColor = '#aaaaaa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = T.border
            }}
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            style={{
              borderRadius: '25px',
              border: 'none',
              background: isDestructive ? '#c0392b' : T.primary,
              color: '#FFFFFF',
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDestructive ? '#a93226' : '#0D2A8A'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDestructive ? '#c0392b' : T.primary
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
