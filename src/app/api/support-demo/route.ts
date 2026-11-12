import { NextResponse } from 'next/server'

import { CHAT_TIMEOUT_MS, callN8n } from '@/lib/n8n'
import { consumeRateLimit, requestClientKey } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The live "try it" chat on the Fernhill case study: a visitor's message goes
 * to the real support agent on n8n.
 *
 * Every visitor runs in the build's test mode, so the agent answers, looks up
 * the sample orders and logs the case, but a refund or handover is never
 * posted to Slack and no email is sent. Each message costs a model call, so
 * visitors are capped per address and the whole demo is capped per hour.
 */
const PER_VISITOR = { limit: 10, windowMs: 10 * 60_000 }
const ALL_VISITORS = { limit: 150, windowMs: 60 * 60_000 }
const MAX_MESSAGE = 500

/** Ids the client makes: letters, digits and dashes, so n8n keys memory on something tame. */
const SESSION = /^[a-z0-9-]{6,40}$/

export async function POST(req: Request) {
  let payload: { message?: unknown; sessionId?: unknown }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, MAX_MESSAGE) : ''
  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : ''

  if (!message) return NextResponse.json({ ok: false, error: 'empty_message' }, { status: 400 })
  if (!SESSION.test(sessionId)) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })

  for (const [key, rule] of [
    [`support-demo:${requestClientKey(req)}`, PER_VISITOR],
    ['support-demo:all', ALL_VISITORS]
  ] as const) {
    const limit = consumeRateLimit(key, rule.limit, rule.windowMs)

    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'rate_limited', retryAfter: limit.retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }
  }

  try {
    const { status, body } = await callN8n('fernhill-support-chat', {
      method: 'POST',
      body: { sessionId: `site-${sessionId}`, message, channel: 'web', test: true },
      timeoutMs: CHAT_TIMEOUT_MS
    })

    const answer = body as { ok?: boolean; reply?: unknown; escalation?: unknown; tools?: unknown } | null

    if (status !== 200 || typeof answer?.reply !== 'string') {
      return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
    }

    // Only what the chat shows: the reply, whether a person would step in,
    // and which tools the agent used.
    return NextResponse.json({
      ok: true,
      reply: answer.reply,
      escalation: answer.escalation === 'approval' || answer.escalation === 'handover' ? answer.escalation : null,
      tools: Array.isArray(answer.tools) ? answer.tools.filter(tool => typeof tool === 'string').slice(0, 6) : []
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream_unavailable' }, { status: 503 })
  }
}
