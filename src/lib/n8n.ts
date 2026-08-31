/**
 * Server-side gateway to the n8n instance that backs the site's forms.
 *
 * The browser never talks to n8n directly. It calls this app's own route
 * handlers, which forward from the server. Two things fall out of that:
 * the instance URL never reaches the client bundle, and the n8n webhooks
 * need no CORS configuration at all, because every request to them is
 * same-process rather than cross-origin.
 *
 * Deliberately not `NEXT_PUBLIC_` — that prefix is what would ship the URL
 * to the browser and undo both properties.
 */

const BASE = (process.env.N8N_BASE_URL ?? 'http://localhost:5678').replace(/\/$/, '')

/** The chat workflow calls an LLM, so it needs materially more headroom. */
export const CHAT_TIMEOUT_MS = 45_000
export const DEFAULT_TIMEOUT_MS = 15_000

export type N8nResult = { status: number; body: unknown }

export async function callN8n(
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown; query?: Record<string, string>; timeoutMs?: number }
): Promise<N8nResult> {
  const url = new URL(`${BASE}/webhook/${path}`)

  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v)

  // `fetch` has no timeout of its own, so a hung n8n would hold the route
  // handler open until the platform killed it. AbortController bounds it.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: init.method,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
      cache: 'no-store'
    })

    // Every documented n8n path answers JSON, but an inactive workflow or a
    // crashed instance answers HTML. Parsing defensively keeps that from
    // surfacing as an unhandled SyntaxError two frames away from the cause.
    const text = await res.text()

    try {
      return { status: res.status, body: JSON.parse(text) }
    } catch {
      return {
        status: 502,
        body: { ok: false, error: 'bad_upstream_response', detail: text.slice(0, 200) }
      }
    }
  } finally {
    clearTimeout(timer)
  }
}
