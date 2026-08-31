import { NextResponse } from 'next/server'

import { callN8n } from '@/lib/n8n'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let payload: Record<string, unknown>

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

  // n8n validates again on its side. This pass exists to bound payload size
  // before it crosses the network, not to be the authority on validity.
  const body = {
    name: str(payload.name, 120),
    email: str(payload.email, 200),
    service: str(payload.service, 200),
    message: str(payload.message, 5000)
  }

  try {
    const { status, body: out } = await callN8n('portfolio-contact', { method: 'POST', body })

    return NextResponse.json(out, { status })
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
  }
}
