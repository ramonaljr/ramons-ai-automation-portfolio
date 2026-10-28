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
const EXPLORE: { label: string; hash?: string; href?: string }[] = [
  { label: 'About', hash: '#about' },
  { label: 'Career history', hash: '#experience' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'How it works', hash: '#process' },

  // These two moved to /services with their sections.
  { label: 'Working together', href: '/services#engagement' },
  { label: 'FAQ', href: '/services#faq' }
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
  const wordY = useTransform(scrollYProgress, [0, 1], [60, 0])

  // The wordmark fills with terracotta from the bottom as the page ends,
  // like a signature being drawn.
  const wordFill = useTransform(scrollYProgress, [0.4, 1], ['100% 30%', '100% 100%'])
  const manilaTime = useManilaTime()

  return (
    <footer
      ref={footerRef}
      className='footer-scene saas-footer border-rule relative overflow-hidden border-t px-6 pt-20 md:px-12 lg:px-20'
    >
      <div className={`${CONTAINER} ${READABLE} relative z-10`}>
        <div className='footer-close'>
          {/* The story opens at 9:14 PM with the work still waiting; the page
              closes on the real time where Ramon is. Doubles as the time-zone
              answer for international clients. */}
          {manilaTime && (
            <p className='footer-clock'>
              <i aria-hidden='true' />
              It&rsquo;s {manilaTime} in Manila
            </p>
          )}
          <p className='footer-ask' style={{ fontFamily: DISPLAY_FONT }}>
            Have a process that
            <br />
            eats your week?
          </p>
          <div className='footer-actions'>
            <a href={onLanding ? '#contact' : '/contact'} className='footer-cta'>
              Book a free call <span aria-hidden='true'>→</span>
            </a>
            <a href={`mailto:${PROFILE.email}`} className='footer-mail'>
              {PROFILE.email}
            </a>
          </div>
        </div>

        <div className='footer-columns'>
          <nav aria-label='Explore the page'>
            <p className='label-quiet'>Explore</p>
            <ul>
              {EXPLORE.map(link => (
                <li key={link.label}>
                  <a href={link.href ?? (onLanding ? link.hash : `/${link.hash}`)}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Services'>
            <p className='label-quiet'>Services</p>
            <ul>
              <li>
                <a href='/services'>All services &amp; pricing</a>
              </li>
              {SERVICES.map(service => (
                <li key={service.slug}>
                  <a href={`/services/${service.slug}`}>{service.short}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label='Connect'>
            <p className='label-quiet'>Connect</p>
            <ul>
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
            <p className='text-ink text-[0.95rem] font-medium tracking-[-0.01em]'>{PROFILE.name}</p>
            <p className='text-ink-2 mt-2 text-[14px]'>
              {PROFILE.title} · {PROFILE.location}
            </p>
            <p className='text-ink-2 mt-4 text-[14px]'>Better systems. More human work.</p>
          </div>
        </div>

        {/* TODO: privacy + terms links belong here — the routes do not exist
            yet, and linking them before they do would only ship two 404s. */}
        {/* ink-2, not ink-3: the lighter tone was unreadable on the footer's
            darkened ground. The name already ends in a full stop ("Jr."), so
            one is only added when it does not. */}
        {/* Right padding keeps "Back to top" clear of the fixed chat button. */}
        <div className='border-rule text-meta text-ink-2 mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 pr-16 sm:pr-20'>
          <p>
            © {new Date().getFullYear()} {PROFILE.name.endsWith('.') ? PROFILE.name : `${PROFILE.name}.`} Designed and
            built by me, running on Next.js and n8n.
          </p>
          <a
            href={onLanding ? '#top' : '/#top'}
            className='text-ink-2 hover:text-ink group inline-flex items-center gap-2 transition-colors'
          >
            Back to top
            <span className='transition-transform duration-300 group-hover:-translate-y-1' aria-hidden='true'>
              ↑
            </span>
          </a>
        </div>
      </div>

      {/* The wordmark signs off the page: solid, cropped along the bottom
          edge, filling with terracotta from the bottom as the page ends.
          It sits below the links rather than behind the headline, where the
          two used to muddy each other. */}
      <div className='footer-signature' aria-hidden='true'>
        <motion.div
          className='footer-word'
          style={reduced ? { backgroundSize: '100% 100%' } : { y: wordY, backgroundSize: wordFill }}
        >
          RAMON
        </motion.div>
      </div>
    </footer>
  )
}
