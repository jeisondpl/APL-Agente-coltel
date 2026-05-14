import { NextRequest, NextResponse } from 'next/server'

const BASE_URL =
  (process.env.BACKEND_URL ?? 'https://lqbjk5bh-8081.use2.devtunnels.ms').replace(/\/query$/, '')

export const maxDuration = 60

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { question, thread_id } = body as { question?: string; thread_id?: string }
    const authHeader = request.headers.get('authorization') ?? ''

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'La pregunta no puede estar vacía.' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    let res: Response
    try {
      res = await fetch(`${BASE_URL}/queries/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          question,
          ...(thread_id ? { thread_id } : {}),
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

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
    const message =
      err instanceof Error ? err.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Método no permitido.' }, { status: 405 })
}
