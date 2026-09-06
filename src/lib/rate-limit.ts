type Bucket = { count: number; resetAt: number }

const state = globalThis as typeof globalThis & {
  portfolioRateLimits?: Map<string, Bucket>
}

const buckets = state.portfolioRateLimits ?? new Map<string, Bucket>()

state.portfolioRateLimits = buckets

export function requestClientKey(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  return (forwarded || req.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

export function consumeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    pruneExpired(now)

    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    }
  }

  current.count += 1

  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 }
}

function pruneExpired(now: number) {
  if (buckets.size <= 1_000) return

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }

  // A client can vary spoofable forwarding headers on a directly exposed
  // deployment. Keep the fallback limiter bounded even in that case.
  while (buckets.size > 1_000) {
    const oldest = buckets.keys().next().value

    if (!oldest) break
    buckets.delete(oldest)
  }
}
