import { NextResponse } from 'next/server'

import { validateBookingDate } from '@/lib/booking-policy'
import { callN8n } from '@/lib/n8n'
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') ?? ''
  const clientKey = requestClientKey(req)
  const rateLimit = consumeRateLimit(`availability:${clientKey}`, 60, 60_000)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', slots: [] },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  // Reject impossible, past, and unreasonably distant dates locally so they
  // never consume an n8n execution or a Google Calendar request.
  if (!validateBookingDate(date).valid) {
    return NextResponse.json({ ok: false, error: 'invalid_date', slots: [] }, { status: 400 })
  }

  try {
    const { status, body } = await callN8n('portfolio-availability', {
      method: 'GET',
      query: { date }
    })

    return NextResponse.json(body, { status })
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream_unavailable', slots: [] }, { status: 503 })
  }
}
