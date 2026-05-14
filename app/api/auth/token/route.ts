import { NextRequest, NextResponse } from 'next/server'

const BASE_URL =
  (process.env.BACKEND_URL ?? 'https://lqbjk5bh-8081.use2.devtunnels.ms').replace(/\/query$/, '')

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { username, role } = body as { username?: string; role?: string }

    if (!username || !role) {
      return NextResponse.json(
        { error: 'username y role son requeridos.' },
        { status: 400 }
      )
    }

    const res = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role }),
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
