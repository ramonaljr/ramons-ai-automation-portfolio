import { NextResponse } from 'next/server'

import { callN8n } from '@/lib/n8n'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') ?? ''

  // Checked here as well as upstream so a malformed date costs a local 400
  // rather than a network round trip to n8n and Google.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
