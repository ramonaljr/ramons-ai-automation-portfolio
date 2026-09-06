import { NextResponse } from 'next/server'

import { validateBookingSlot } from '@/lib/booking-policy'
import { callN8n } from '@/lib/n8n'
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const clientKey = requestClientKey(req)
  const rateLimit = consumeRateLimit(`booking:${clientKey}`, 5, 10 * 60_000)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

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

  const slot = validateBookingSlot(body.date, body.time)

  if (!slot.valid) {
    return NextResponse.json({ ok: false, error: 'invalid', errors: slot.errors }, { status: 400 })
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
