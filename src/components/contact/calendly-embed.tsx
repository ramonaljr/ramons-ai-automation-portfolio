'use client'

// Third-party Imports
import { useEffect, useState } from 'react'

// Component Imports
import { ArrowIcon } from '@/components/landing/motion'

// Data Imports
import { PROFILE } from '@/lib/portfolio'

const CALENDLY_ORIGIN = 'https://calendly.com'

/** Calendly's first paint, before it reports its real height. */
const INITIAL_HEIGHT = 700

/**
 * While it loads, Calendly reports its spinner page (26px, then 2px) before
 * the real height (880px for the calendar). Shrinking to those left the frame
 * too short for Calendly to finish drawing, so it never sent the real one.
 * Anything under this is the loader, not a step.
 */
const MIN_STEP_HEIGHT = 400

/**
 * Calendly's own iframe, without its widget.js. The script only builds this
 * same URL and listens for the same messages, and a hand-built iframe keeps a
 * third-party script off the page and survives client-side navigation, which
 * widget.js (it scans the DOM once, on load) does not.
 *
 * Colours are the site's terracotta and ink on the white card (the site is
 * light-only). Calendly applies them only on a paid plan and ignores them on
 * Free, so they are ready for an upgrade rather than live today. Calendly's
 * own avatar is hidden because the card header already shows it.
 */
const embedUrl = (host: string) => {
  const url = new URL(PROFILE.calendly)

  url.search = new URLSearchParams({
    embed_domain: host,
    embed_type: 'Inline',
    hide_gdpr_banner: '1',
    hide_landing_page_details: '1',
    background_color: 'ffffff',
    text_color: '161c24',
    primary_color: 'af3622'
  }).toString()

  return url.toString()
}

export function CalendlyEmbed() {
  // Needs the page's own host, so it is built after mount, not on the server.
  const [src, setSrc] = useState<string | null>(null)

  /**
   * The frame follows the height Calendly reports at every step (calendar,
   * then the intake form, then the confirmation), so the page has one
   * scrollbar instead of a short window scrolling inside it.
   */
  const [height, setHeight] = useState(INITIAL_HEIGHT)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(embedUrl(window.location.host))

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== CALENDLY_ORIGIN || e.data?.event !== 'calendly.page_height') return

      const px = Number.parseInt(e.data.payload?.height, 10)

      if (px >= MIN_STEP_HEIGHT) setHeight(px)
    }

    window.addEventListener('message', onMessage)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div>
      <div className='calendly-frame' style={{ height }}>
        {src && <iframe src={src} title={`Book a call with ${PROFILE.shortName} on Calendly`} loading='lazy' />}
      </div>

      {/* Always there, not only on failure: an ad blocker or a strict privacy
          setting can blank the frame without telling the page. */}
      <p className='calendly-fallback'>
        Calendar not showing?{' '}
        <a href={PROFILE.calendly} target='_blank' rel='noopener noreferrer'>
          Open it on Calendly
          <ArrowIcon />
        </a>
      </p>
    </div>
  )
}
