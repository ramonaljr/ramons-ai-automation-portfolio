'use client'

import { useEffect, useRef, useState } from 'react'

import { Clock, Mail } from 'lucide-react'

import { PROFILE } from '@/lib/portfolio'
import { SectionIntro } from '@/components/landing/section-intro'
import { CalendlyEmbed } from '@/components/contact/calendly-embed'

import { ArrowRight, DISPLAY_FONT, ICON_STROKE } from '@/components/landing/motion'

const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

/**
 * The homepage's booking section, where the nav's "Contact" and every "Book a
 * free call" lead. Booking runs on Calendly (2026-11-01), the same embed as
 * /contact; the hand-built calendar on /api/availability that sat here before
 * is in git history. Calendly owns the hours, the time zones and the intake
 * questions now, so nothing here states them.
 */
export function ContactSection() {
  const { ref, inView } = useInView(0.06)

  return (
    <section id='contact' className='contact-scene saas-section relative px-6 py-16 md:px-12 md:py-24 lg:px-20'>
      <div className={CONTAINER}>
        {/* One panel, booking first: the pitch, what happens next and the
            other ways to reach me on the left, the calendar on the right and
            always open. */}
        <div ref={ref} className='contact-panel'>
          <div className='contact-pitch'>
            <SectionIntro
              title={<>Book a free 30‑minute call.</>}
              blurb='No charge, no deck. Bring one task your team repeats every week, and I will tell you whether it is worth automating, and on which platform.'
              margin=''
            />

            {/* What happens after the click, so the booking is not a leap. */}
            <ol className='contact-steps'>
              {[
                ['Pick a time', 'Any open slot, shown in your own time zone.'],
                ['30-minute call', 'Show me how the work gets done today, step by step.'],
                [
                  'Summary and quote in 48 hours',
                  'Whether it is worth automating, on which platform, and a fixed quote, or the audit first if it needs mapping.'
                ]
              ].map(([title, copy]) => (
                <li key={title}>
                  <span aria-hidden='true' />
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>

            <div className='contact-reach'>
              <p className='contact-next'>
                <i aria-hidden='true' />
                Rather write first?{' '}
                <a href={`mailto:${PROFILE.email}`} className='contact-next-link tap-area'>
                  Email me instead
                  <ArrowRight />
                </a>
              </p>

              <ul className='contact-links'>
                <li>
                  <a href={`mailto:${PROFILE.email}`}>
                    <Mail size={14} strokeWidth={ICON_STROKE} aria-hidden='true' />
                    {PROFILE.email}
                  </a>
                </li>
                {PROFILE.socials.map(s => (
                  <li key={s.label}>
                    <a href={s.href} target='_blank' rel='noopener noreferrer'>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className='contact-response'>Replies usually within one business day.</p>
            </div>
          </div>

          {/* ── Booking panel ───────────────────────────────────────────── */}
          <div
            className='contact-booking'
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition:
                'opacity 0.7s cubic-bezier(0.16,1,0.3,1) 120ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 120ms'
            }}
          >
            {/* Who the call is with, like a booking page: the face, the
                name and the terms in one line, before any dates. */}
            <div className='contact-host'>
              <span className='contact-host-avatar'>
                <img src='/images/landing/ramon-avatar.webp' alt='' width={96} height={96} />
                <i aria-hidden='true' />
              </span>
              <div className='min-w-0'>
                <p className='text-ink-3 text-[13px]'>{PROFILE.name}</p>
                <h3 className='text-ink text-2xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                  Book a slot
                </h3>
              </div>
              <ul className='contact-host-terms'>
                <li>
                  <Clock size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                  30 min
                </li>
                <li>Free</li>
              </ul>
            </div>

            <div className='contact-calendar'>
              <CalendlyEmbed />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
