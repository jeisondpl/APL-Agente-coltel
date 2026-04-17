import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.BACKEND_URL ?? 'https://lqbjk5bh-8081.use2.devtunnels.ms/query'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const question: string = body?.question ?? ''
    const thread_id: string | undefined = body?.thread_id

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La pregunta no puede estar vacía.' },
        { status: 400 }
      )
    }

    const payload: Record<string, unknown> = { question }
    if (thread_id) payload.thread_id = thread_id

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    let backendResponse: Response
    try {
      backendResponse = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text().catch(() => '')
      return NextResponse.json(
        { error: `Error del backend (${backendResponse.status}): ${errorText}` },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Método no permitido.' }, { status: 405 })
}
