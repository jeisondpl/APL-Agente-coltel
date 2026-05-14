import { NextRequest, NextResponse } from 'next/server'

const BASE_URL =
  (process.env.BACKEND_URL ?? 'https://lqbjk5bh-8081.use2.devtunnels.ms').replace(/\/query$/, '')

/**
 * GET /api/admin/files?task_id=...
 * Polls task status from the backend.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('task_id')

    if (!taskId) {
      return NextResponse.json(
        { error: 'task_id es requerido.' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${BASE_URL}/admin/files/async?task_id=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      }
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `Error del backend (${res.status}): ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/admin/files
 * Receives a multipart formData with a `file` field and proxies it to the backend.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization') ?? ''

    // Read the incoming form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Se requiere un archivo en el campo "file".' },
        { status: 400 }
      )
    }

    // Build a new FormData to forward
    const outForm = new FormData()
    outForm.append('file', file, (file as File).name ?? 'upload')

    const res = await fetch(`${BASE_URL}/admin/files/async`, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
        Authorization: authHeader,
      },
      body: outForm,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `Error del backend (${res.status}): ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/files?filename=...
 * Deletes a file from the knowledge base.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'filename es requerido.' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${BASE_URL}/admin/files?filename=${encodeURIComponent(filename)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      }
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `Error del backend (${res.status}): ${text}` },
        { status: res.status }
      )
    }

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
