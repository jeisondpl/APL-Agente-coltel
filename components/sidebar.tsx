'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Thread } from '@/lib/types'
import ConfirmDialog from './confirm-dialog'

export interface SidebarProps {
  currentThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewChat: () => void
  token: string
}

const T = {
  primary: '#001EB3',
  text:    '#666666',
  border:  '#d1d1d1',
} as const

// Format a date string as a relative label (today, yesterday, or locale date)
function relativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`

    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

// Skeleton placeholder shown while threads are loading
function ThreadSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: '56px',
            borderRadius: '6px',
            background: '#f0f0f0',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default function Sidebar({
  currentThreadId,
  onSelectThread,
  onNewChat,
  token,
}: SidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Confirm-delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Thread | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchThreads = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/threads', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Error ${res.status}`)
      }
      const data = await res.json()
      // Backend may return an array directly or { threads: [...] }
      const list: Thread[] = Array.isArray(data) ? data : (data.threads ?? [])
      // Sort newest first
      list.sort((a, b) => {
        const ta = new Date(a.updated_at ?? a.created_at).getTime()
        const tb = new Date(b.updated_at ?? b.created_at).getTime()
        return tb - ta
      })
      setThreads(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones.')
    } finally {
      setLoading(false)
    }
  }, [token])

  // Initial load
  useEffect(() => {
    void fetchThreads()
  }, [fetchThreads])

  // Reload whenever the active thread changes (e.g. new thread created after a query)
  useEffect(() => {
    if (currentThreadId) {
      void fetchThreads()
    }
  }, [currentThreadId, fetchThreads])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/threads/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Error ${res.status}`)
      }
      // If the deleted thread was active, start a new chat
      if (deleteTarget.id === currentThreadId) {
        onNewChat()
      }
      await fetchThreads()
    } catch (err) {
      // Non-fatal: show nothing; threads will still display
      console.error('Error al eliminar hilo:', err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Derive a display title: use first user message, thread title, or fallback
  function threadTitle(t: Thread): string {
    if (t.title?.trim()) return t.title.trim()
    const firstMsg = t.messages?.find((m) => m.role === 'user')
    if (firstMsg?.content) {
      const text = firstMsg.content.trim()
      return text.length > 55 ? text.slice(0, 55) + '…' : text
    }
    return 'Conversación'
  }

  return (
    <>
      <aside
        aria-label="Historial de conversaciones"
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#FFFFFF',
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{ color: T.primary, marginBottom: '10px' }}
          >
            Conversaciones
          </h2>

          {/* New conversation button */}
          <button
            type="button"
            onClick={onNewChat}
            style={{
              width: '100%',
              borderRadius: '25px',
              border: `1px solid ${T.primary}`,
              background: 'transparent',
              color: T.primary,
              padding: '7px 0',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primary
              e.currentTarget.style.color = '#FFFFFF'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = T.primary
            }}
          >
            <svg
              style={{ width: 14, height: 14 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva conversación
          </button>
        </div>

        {/* Thread list */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}
          role="list"
          aria-label="Lista de conversaciones anteriores"
        >
          {loading ? (
            <div style={{ paddingTop: '8px' }}>
              <ThreadSkeleton />
            </div>
          ) : error ? (
            <p
              style={{
                padding: '16px',
                fontSize: '0.8125rem',
                color: '#c0392b',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          ) : threads.length === 0 ? (
            <p
              style={{
                padding: '24px 16px',
                fontSize: '0.8125rem',
                color: T.text,
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              No hay conversaciones anteriores.
              <br />
              Inicia una nueva consulta.
            </p>
          ) : (
            threads.map((thread) => {
              const isActive = thread.id === currentThreadId
              return (
                <div
                  key={thread.id}
                  role="listitem"
                  style={{
                    position: 'relative',
                    margin: '1px 8px',
                    borderRadius: '6px',
                    background: isActive ? '#e8ecff' : 'transparent',
                    borderLeft: isActive ? `3px solid ${T.primary}` : '3px solid transparent',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f5f5f5'
                    }
                    // Show trash icon
                    const trash = e.currentTarget.querySelector<HTMLElement>('[data-trash]')
                    if (trash) trash.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                    const trash = e.currentTarget.querySelector<HTMLElement>('[data-trash]')
                    if (trash) trash.style.opacity = '0'
                  }}
                >
                  {/* Thread button */}
                  <button
                    type="button"
                    onClick={() => onSelectThread(thread.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '10px 36px 10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? '600' : '500',
                        color: isActive ? T.primary : '#333333',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.35',
                      }}
                    >
                      {threadTitle(thread)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: T.text,
                      }}
                    >
                      {relativeDate(thread.updated_at ?? thread.created_at)}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    data-trash="true"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(thread)
                    }}
                    title="Eliminar conversación"
                    aria-label={`Eliminar conversación: ${threadTitle(thread)}`}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: isActive ? '0.6' : '0',
                      transition: 'opacity 0.15s, color 0.15s',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: T.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#c0392b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = T.text
                    }}
                  >
                    <svg
                      style={{ width: 14, height: 14 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar conversación"
        message={
          deleteTarget
            ? `¿Eliminar "${threadTitle(deleteTarget)}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel={deleting ? 'Eliminando…' : 'Eliminar'}
        cancelLabel="Cancelar"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />
    </>
  )
}
