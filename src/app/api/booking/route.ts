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

  const body = {
    name: str(payload.name, 120),
    email: str(payload.email, 200),
    date: str(payload.date, 10),
    time: str(payload.time, 5),
    topic: str(payload.topic, 200),
    notes: str(payload.notes, 2000),
    timezone: 'Asia/Manila'
  }

  try {
    // 409 (slot taken / outside hours) is a real answer, not an error, so the
    // upstream status is passed through untouched for the form to branch on.
    const { status, body: out } = await callN8n('portfolio-booking', { method: 'POST', body })

    return NextResponse.json(out, { status })
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
  }
}
