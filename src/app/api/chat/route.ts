import { NextResponse } from 'next/server'

import { CHAT_TIMEOUT_MS, callN8n } from '@/lib/n8n'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let payload: { message?: unknown; sessionId?: unknown }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 2000) : ''
  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 100) : ''

  if (!message) return NextResponse.json({ ok: false, error: 'empty_message' }, { status: 400 })

  try {
    const { status, body } = await callN8n('portfolio-chat', {
      method: 'POST',
      body: { message, sessionId },
      timeoutMs: CHAT_TIMEOUT_MS
    })

    return NextResponse.json(body, { status })
  } catch {
    // An unreachable n8n is an operational fact, not a fault in what the
    // visitor typed. 503 lets the widget say "unavailable" rather than
    // rejecting a message that was perfectly valid.
    return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
  }
}
