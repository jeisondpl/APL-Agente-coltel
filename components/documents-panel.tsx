'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { SourceFile, TaskStatus } from '@/lib/types'
import ConfirmDialog from './confirm-dialog'

export interface DocumentsPanelProps {
  token: string
  isAdmin?: boolean
}

const T = {
  primary: '#001EB3',
  text:    '#666666',
  border:  '#d1d1d1',
} as const

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase()
  const isPdf = ext === 'pdf'

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        background: isPdf ? '#fff0f0' : '#e8ecff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        style={{ width: 18, height: 18, color: isPdf ? '#c0392b' : T.primary }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    </div>
  )
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPanel({ token, isAdmin = false }: DocumentsPanelProps) {
  const [files, setFiles] = useState<SourceFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [filesError, setFilesError] = useState<string | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<TaskStatus | null>(null)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<SourceFile | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFiles = useCallback(async () => {
    if (!token) return
    setLoadingFiles(true)
    setFilesError(null)
    try {
      const res = await fetch('/api/sources', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Error ${res.status}`)
      }
      const data = await res.json()
      // Backend may return array directly or { files: [...] }
      const list: SourceFile[] = Array.isArray(data) ? data : (data.files ?? data.folders ?? [])
      setFiles(list)
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : 'Error al cargar documentos.')
    } finally {
      setLoadingFiles(false)
    }
  }, [token])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  // Poll task status until terminal state
  const pollTask = useCallback(
    (taskId: string) => {
      if (pollingRef.current) clearInterval(pollingRef.current)

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/files?task_id=${encodeURIComponent(taskId)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return
          const status: TaskStatus = await res.json()
          setActiveTask(status)

          if (status.status === 'SUCCESS' || status.status === 'FAILURE') {
            if (pollingRef.current) clearInterval(pollingRef.current)
            pollingRef.current = null
            if (status.status === 'SUCCESS') {
              await fetchFiles()
            }
          }
        } catch {
          // Ignore transient poll errors
        }
      }, 3000)
    },
    [token, fetchFiles]
  )

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
    void uploadFile(file)
  }

  async function uploadFile(file: File) {
    setUploadError(null)

    // Validate extension
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`Solo se permiten archivos PDF o DOCX. Archivo recibido: ${file.name}`)
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`El archivo supera el límite de 20 MB (${formatBytes(file.size)}).`)
      return
    }

    setUploading(true)
    setActiveTask(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Error ${res.status}`)
      }

      const { task_id } = await res.json() as { task_id: string }
      setActiveTask({ task_id, status: 'PENDING' })
      pollTask(task_id)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/files?filename=${encodeURIComponent(deleteTarget.name)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, string>).error ?? `Error ${res.status}`)
      }
      await fetchFiles()
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : 'Error al eliminar el archivo.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Derive task status badge
  function TaskBadge({ status }: { status: TaskStatus }) {
    if (status.status === 'PENDING') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.75rem',
            color: '#b8860b',
            background: '#fffbea',
            border: '1px solid #f0d060',
            borderRadius: '20px',
            padding: '2px 10px',
          }}
        >
          <svg
            style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
            <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
          Procesando…
        </span>
      )
    }
    if (status.status === 'SUCCESS') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.75rem',
            color: '#27ae60',
            background: '#eafaf1',
            border: '1px solid #a9dfbf',
            borderRadius: '20px',
            padding: '2px 10px',
          }}
        >
          ✓ Procesado
        </span>
      )
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.75rem',
          color: '#c0392b',
          background: '#fdf2f2',
          border: '1px solid #f5c6c6',
          borderRadius: '20px',
          padding: '2px 10px',
        }}
      >
        ✗ Error al procesar
      </span>
    )
  }

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: '#E5E5E5',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            borderLeft: `5px solid ${T.primary}`,
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.07)',
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: T.primary, marginBottom: 2 }}
            >
              Documentos de conocimiento
            </h2>
            <p style={{ fontSize: '0.8125rem', color: T.text }}>
              Gestiona los archivos que utiliza el asistente IA (PDF, DOCX · máx. 20 MB)
            </p>
          </div>

          {/* Upload button — admin only */}
          {isAdmin && <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderRadius: '25px',
              border: 'none',
              background: uploading ? '#667ab3' : T.primary,
              color: '#FFFFFF',
              padding: '9px 20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!uploading) e.currentTarget.style.background = '#0D2A8A'
            }}
            onMouseLeave={(e) => {
              if (!uploading) e.currentTarget.style.background = T.primary
            }}
          >
            {uploading ? (
              <>
                <svg
                  style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                </svg>
                Subiendo…
              </>
            ) : (
              <>
                <svg
                  style={{ width: 14, height: 14 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Subir documento
              </>
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            aria-hidden="true"
          />}
        </div>

        {/* Upload error */}
        {uploadError && (
          <div
            role="alert"
            style={{
              background: '#fff0f0',
              border: '1px solid #ffcccc',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '0.875rem',
              color: '#c0392b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {uploadError}
            <button
              type="button"
              onClick={() => setUploadError(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '1rem', lineHeight: 1 }}
              aria-label="Cerrar error"
            >
              ×
            </button>
          </div>
        )}

        {/* Active task status card */}
        {activeTask && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              borderLeft: `5px solid ${activeTask.status === 'FAILURE' ? '#c0392b' : activeTask.status === 'SUCCESS' ? '#27ae60' : '#f0a500'}`,
              boxShadow: '0 0 10px 0 rgba(0,0,0,0.07)',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#333', marginBottom: 4 }}>
                Estado del procesamiento
              </p>
              <p style={{ fontSize: '0.75rem', color: T.text }}>
                ID de tarea: <code style={{ fontSize: '0.7rem' }}>{activeTask.task_id}</code>
              </p>
            </div>
            <TaskBadge status={activeTask} />
          </div>
        )}

        {/* Files list card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            borderLeft: `5px solid ${T.primary}`,
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#333' }}>
              Archivos disponibles
            </h3>
            <button
              type="button"
              onClick={fetchFiles}
              disabled={loadingFiles}
              title="Recargar lista"
              aria-label="Recargar lista de documentos"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: loadingFiles ? 'not-allowed' : 'pointer',
                color: T.text,
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                style={{
                  width: 15,
                  height: 15,
                  animation: loadingFiles ? 'spin 1s linear infinite' : 'none',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>

          {/* Files */}
          {loadingFiles ? (
            <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: '52px',
                    borderRadius: '6px',
                    background: '#f0f0f0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : filesError ? (
            <p
              style={{
                padding: '24px 20px',
                fontSize: '0.875rem',
                color: '#c0392b',
                textAlign: 'center',
              }}
            >
              {filesError}
            </p>
          ) : files.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <svg
                style={{ width: 36, height: 36, color: '#cccccc', margin: '0 auto 12px' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p style={{ fontSize: '0.875rem', color: T.text }}>
                No hay documentos cargados.
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#aaaaaa', marginTop: 4 }}>
                Sube un PDF o DOCX para comenzar.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }} role="list">
              {files.map((file, index) => (
                <li
                  key={file.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom:
                      index < files.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}
                >
                  <FileIcon name={file.name} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    {(file.size || file.created_at) && (
                      <p style={{ fontSize: '0.75rem', color: T.text, marginTop: 1 }}>
                        {formatBytes(file.size)}
                        {file.size && file.created_at ? ' · ' : ''}
                        {file.created_at
                          ? new Date(file.created_at).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : ''}
                      </p>
                    )}
                  </div>

                  {/* Delete button — admin only */}
                  {isAdmin && <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    title={`Eliminar ${file.name}`}
                    aria-label={`Eliminar archivo ${file.name}`}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ffcccc',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#c0392b',
                      padding: '5px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff0f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
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
                  </button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar documento"
        message={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.name}" de la base de conocimiento? Esta acción no se puede deshacer.`
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
