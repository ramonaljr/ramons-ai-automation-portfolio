'use client'

import { useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'motion/react'

import { CONTAINER, DISPLAY_FONT, READABLE, usePrefersReducedMotion } from '@/components/landing/motion'
import { PROFILE, SERVICES } from '@/lib/portfolio'

/**
 * Site footer. Like `SiteNav`, its section links have to resolve from any page,
 * so bare hashes are rewritten to `/#section` away from the landing page.
 */

/**
 * The section index, in three short columns rather than one long row: eleven
 * links in a line read as leftovers, grouped they read as a table of
 * contents. Hashes are rewritten to `/#section` away from the landing page.
 */
const EXPLORE = [
  { label: 'About', hash: '#about' },
  { label: 'Career history', hash: '#experience' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'How it works', hash: '#process' },
  { label: 'Working together', hash: '#engagement' },
  { label: 'FAQ', hash: '#faq' }
]

/** Live Manila time, updated each minute. Client-only, so it never mismatches the server render. */
function useManilaTime() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }).format(
        new Date()
      )

    const tick = () => setTime(format())

    tick()
    const id = window.setInterval(tick, 30_000)

    return () => window.clearInterval(id)
  }, [])

  return time
}

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const onLanding = pathname === '/'
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ['start end', 'end end'] })
  const wordY = useTransform(scrollYProgress, [0, 1], [90, -12])
  const wordScale = useTransform(scrollYProgress, [0, 1], [0.9, 1])

  // The wordmark fills with rust from the bottom as the page ends, like a
  // signature being drawn.
  const wordFill = useTransform(scrollYProgress, [0.2, 1], ['100% 0%', '100% 100%'])
  const manilaTime = useManilaTime()

  return (
    <footer ref={footerRef} className='footer-scene saas-footer border-rule relative overflow-hidden border-t px-6 pt-28 pb-10 md:px-12 lg:px-20'>
      <motion.div
        className='footer-word pointer-events-none absolute inset-x-0 top-0 text-center text-[clamp(7rem,22vw,24rem)] leading-none font-black tracking-[-0.09em] select-none'
        style={reduced ? { backgroundSize: '100% 100%' } : { y: wordY, scale: wordScale, backgroundSize: wordFill }}
        aria-hidden='true'
      >
        RAMON
      </motion.div>

      <div className={`${CONTAINER} ${READABLE} relative z-10 flex min-h-[44vh] flex-col justify-end`}>
        <div className='mb-20 max-w-2xl'>
          <span className='eyebrow'>END OF THE MANUAL LOOP</span>
          {/* The story opens at 9:14 PM with the work still waiting; the page
              closes on the real time where Ramon is. Doubles as the time-zone
              answer for international clients. */}
          {manilaTime && (
            <p className='footer-clock'>
              <i aria-hidden='true' />
              It&rsquo;s {manilaTime} in Manila
            </p>
          )}
          <p
            className='text-ink mt-5 text-[clamp(2rem,4vw,4.25rem)] leading-[1.02] font-light tracking-tight'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Better systems.<br />More human work.
          </p>
        </div>

        <div className='footer-columns'>
          <nav aria-label='Explore the page'>
            <p className='eyebrow'>Explore</p>
            <ul>
              {EXPLORE.map(link => (
                <li key={link.label}>
                  <a href={onLanding ? link.hash : `/${link.hash}`}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Services'>
            <p className='eyebrow'>Services</p>
            <ul>
              {SERVICES.map(service => (
                <li key={service.slug}>
                  <a href={`/services/${service.slug}`}>{service.short}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Connect'>
            <p className='eyebrow'>Connect</p>
            <ul>
              <li>
                <a href={`mailto:${PROFILE.email}`}>Email</a>
              </li>
              <li>
                <a href='/contact'>Contact form</a>
              </li>
              <li>
                <a href='/blog'>Blog</a>
              </li>
              {PROFILE.socials.map(social => (
                <li key={social.label}>
                  <a href={social.href} target='_blank' rel='noopener noreferrer'>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className='footer-identity'>
            <p className='font-pixel text-ink-2 text-xs tracking-[0.25em]'>{PROFILE.shortName.toUpperCase()}</p>
            <p className='text-ink-2 mt-2 text-[14px]'>
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>
        </div>

        {/* TODO: privacy + terms links belong here — the routes do not exist
            yet, and linking them before they do would only ship two 404s. */}
        {/* ink-2, not ink-3: the lighter tone was unreadable on the footer's
            darkened ground. The name already ends in a full stop ("Jr."), so
            one is only added when it does not. */}
        <div className='border-rule text-meta text-ink-2 mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6'>
          <p>
            © {new Date().getFullYear()} {PROFILE.name.endsWith('.') ? PROFILE.name : `${PROFILE.name}.`} Built and
            maintained in-house.
          </p>
          <a href={onLanding ? '#top' : '/#top'} className='text-ink-2 hover:text-ink group inline-flex items-center gap-2 transition-colors'>
            Back to top
            <span className='transition-transform duration-300 group-hover:-translate-y-1' aria-hidden='true'>↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
