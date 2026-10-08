import { NextResponse } from 'next/server'

import { CHAT_TIMEOUT_MS, callN8n } from '@/lib/n8n'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Whether the assistant can answer at all, so the page can hide it instead of
 * offering a chat that only says it is unavailable.
 *
 * Sends the workflow an empty message: a healthy instance takes its
 * no-message branch and answers 400 `empty_message` without calling the
 * model, so the probe costs one cheap execution and no tokens. Anything else
 * (a rejected webhook key, an inactive workflow, n8n down) reads as down.
 * Cached at the edge for a minute so a busy page does not multiply it.
 */
export async function GET() {
  let ok = false

  try {
    const { status, body } = await callN8n('portfolio-chat', {
      method: 'POST',
      body: { message: '', sessionId: 'health' }
    })

    ok = status === 400 && (body as { error?: string } | null)?.error === 'empty_message'
  } catch {
    ok = false
  }

  return NextResponse.json(
    { ok },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  )
}

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
