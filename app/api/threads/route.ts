import { NextRequest, NextResponse } from 'next/server'

const BASE_URL =
  (process.env.BACKEND_URL ?? 'https://lqbjk5bh-8081.use2.devtunnels.ms').replace(/\/query$/, '')

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization') ?? ''

    const res = await fetch(`${BASE_URL}/me/threads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
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
