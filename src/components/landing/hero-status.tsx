'use client'

import { useEffect, useState } from 'react'

/**
 * The quiet line under the hero's actions: how fast a message gets answered,
 * and what time it is where Ramon works. Most visitors are overseas, so the
 * clock answers "will our hours overlap?" before they have to ask.
 *
 * Responsiveness, not capacity, on purpose: a "taking projects" or start-date
 * claim goes stale the week it stops being true. Change the promise here.
 */
const PROMISE = 'Replies within 24 hours'

/** The Philippines has one time zone and no daylight saving, so GMT+8 holds all year. */
const TIME_ZONE = 'Asia/Manila'
const ZONE_LABEL = 'in the Philippines (GMT+8)'

const formatTime = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit'
}).format

/**
 * The time is read on the client only. Rendering it on the server would bake
 * in the build's (or the request's) minute and fail hydration a minute later,
 * so the slot stays empty for the first frame and fills on mount.
 */
function useManilaTime() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    // Tick on the minute boundary rather than every 60s from mount, so the
    // shown minute never lags the real one by up to a minute.
    const tick = () => {
      const now = new Date()

      setTime(formatTime(now))
      timer = setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()))
    }

    tick()

    return () => clearTimeout(timer)
  }, [])

  return time
}

/**
 * The same status, folded into the floating nav pill once the hero (and its
 * full line) has scrolled away: the dot and the time, with the promise kept
 * for screen readers and the hover title. globals.css (`.nav-status`) shows
 * it only in the compact pill from lg up; below that the links and the CTA
 * fill the bar, and the mobile menu carries the full HeroStatus instead.
 */
export function NavStatus() {
  const time = useManilaTime()

  return (
    <span className='nav-status text-fine text-ink-2 items-center gap-2' title={`${PROMISE}. Local time ${ZONE_LABEL}.`}>
      <span className='hero-status-dot' aria-hidden='true' />
      <span className='sr-only'>{PROMISE}. Local time {ZONE_LABEL}:</span>
      {time && (
        <span className='whitespace-nowrap'>
          <time className='tabular-nums'>{time}</time>
          <span aria-hidden='true'> GMT+8</span>
        </span>
      )}
    </span>
  )
}

export function HeroStatus({ className = '' }: { className?: string }) {
  const time = useManilaTime()

  return (
    <p className={`hero-status text-fine text-ink-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className='hero-status-dot' aria-hidden='true' />
      <span className='text-ink'>{PROMISE}</span>
      {time && (
        <>
          {/* Phones wrap the time onto its own row, where a trailing
              separator would dangle at the end of the first. */}
          <span className='hidden sm:inline' aria-hidden='true'>
            ·
          </span>
          <span>
            <time className='tabular-nums'>{time}</time> {ZONE_LABEL}
          </span>
        </>
      )}
    </p>
  )
}
