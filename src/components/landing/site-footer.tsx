'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { usePathname } from 'next/navigation'
import { motion, type Variants } from 'motion/react'

import { BrandMark } from '@/components/landing/brand-mark'
import { CONTAINER, DISPLAY_FONT, READABLE, useInView, usePrefersReducedMotion } from '@/components/landing/motion'
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
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'About', hash: '#about' },
  { label: 'Career history', hash: '#experience' },
  { label: 'How it works', hash: '#process' },
  { label: 'Working together', hash: '#engagement' },

  // The homepage keeps four of the questions; all of them are on /services.
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

const EASE = [0.16, 1, 0.3, 1] as const

/** Sections of the footer rise in as they arrive, their children a beat apart. */
const GROUP: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } }
}

const ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, staggerChildren: 0.04 } }
}

/** A headline line, rising from behind its own edge. */
const LINE: Variants = {
  hidden: { y: '110%' },
  shown: { y: '0%', transition: { duration: 0.9, ease: EASE } }
}

/**
 * The signature's letters, in a box where the type is 100 units tall.
 * Each x is where Satoshi Black (900) puts the letter with the word's
 * -0.07em tracking, measured from the loaded font on 2026-11-09, so the SVG
 * sits where the old HTML wordmark did. The box is cropped at 58 units, so
 * the bottom of each letter runs off the page's edge; the baseline is 78.5.
 */
const SIGNATURE = [
  { letter: 'R', x: 0 },
  { letter: 'A', x: 61.8 },
  { letter: 'M', x: 125.1 },
  { letter: 'O', x: 209.2 },
  { letter: 'N', x: 281.9 }
]

/** Ink runs from 7.7 to 352.8, so the box starts at 3.5 to centre it. */
const SIGNATURE_BOX = '3.5 0 353.5 58'
const SIGNATURE_BASELINE = 78.5

/** The footer is on every page once, so its gradient's id is fixed (useId
 * differs between server and client above the footer). */
const SIGNATURE_FILL = 'footer-sig-fill-gradient'

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const onLanding = pathname === '/'
  const reduced = usePrefersReducedMotion()

  // The signature plays once, when most of it is on screen.
  const { ref: signatureRef, inView: signed } = useInView<HTMLDivElement>(0.6)
  const manilaTime = useManilaTime()

  return (
    <footer
      ref={footerRef}
      className='footer-scene saas-footer border-rule relative overflow-hidden border-t px-6 pt-20 md:px-12 lg:px-20'
    >
      {/* Without JavaScript nothing runs the entrances, so show their end state. */}
      <noscript>
        <style>
          {
            '.footer-ask-line>span,.footer-actions,.footer-columns nav,.footer-columns li,.footer-identity{opacity:1!important;transform:none!important}.footer-sig-line{stroke-dashoffset:0!important}.footer-sig-fill{clip-path:none!important}'
          }
        </style>
      </noscript>

      <div className={`${CONTAINER} ${READABLE} relative z-10`}>
        <motion.div
          className='footer-close'
          variants={GROUP}
          initial={reduced ? false : 'hidden'}
          whileInView='shown'
          viewport={{ once: true, amount: 0.5 }}
        >
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
            <span className='footer-ask-line'>
              <motion.span variants={LINE}>Have a process that</motion.span>
            </span>
            <span className='footer-ask-line'>
              <motion.span variants={LINE}>eats your week?</motion.span>
            </span>
          </p>
          <motion.div className='footer-actions' variants={ITEM}>
            <a href={onLanding ? '#contact' : '/contact'} className='footer-cta'>
              Book a free call <span aria-hidden='true'>→</span>
            </a>
            <a href={`mailto:${PROFILE.email}`} className='footer-mail'>
              {PROFILE.email}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className='footer-columns'
          variants={GROUP}
          initial={reduced ? false : 'hidden'}
          whileInView='shown'
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.nav variants={ITEM} aria-label='Explore the page'>
            <p className='label-quiet'>Explore</p>
            <ul>
              {EXPLORE.map(link => (
                <motion.li key={link.label} variants={ITEM}>
                  <a href={link.href ?? (onLanding ? link.hash : `/${link.hash}`)}>{link.label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav variants={ITEM} aria-label='Services'>
            <p className='label-quiet'>Services</p>
            <ul>
              <motion.li variants={ITEM}>
                <a href='/services'>All services &amp; pricing</a>
              </motion.li>
              {SERVICES.map(service => (
                <motion.li key={service.slug} variants={ITEM}>
                  <a href={`/services/${service.slug}`}>{service.short}</a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav variants={ITEM} aria-label='Connect'>
            <p className='label-quiet'>Connect</p>
            <ul>
              <motion.li variants={ITEM}>
                <a href='/contact'>Contact form</a>
              </motion.li>
              <motion.li variants={ITEM}>
                <a href='/blog'>Blog</a>
              </motion.li>
              {PROFILE.socials.map(social => (
                <motion.li key={social.label} variants={ITEM}>
                  <a href={social.href} target='_blank' rel='noopener noreferrer'>
                    {social.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.div className='footer-identity' variants={ITEM}>
            <span className='nav-brand-mark footer-brand-mark relative block' aria-hidden='true'>
              <BrandMark />
            </span>
            <p className='text-ink text-[0.95rem] font-medium tracking-[-0.01em]'>{PROFILE.name}</p>
            <p className='text-ink-2 mt-2 text-[14px]'>
              {PROFILE.title} · {PROFILE.location}
            </p>
            <p className='text-ink-2 mt-4 text-[14px]'>Better systems. More human work.</p>
          </motion.div>
        </motion.div>

        {/* ink-2, not ink-3: the lighter tone was unreadable on the footer's
            darkened ground. The name already ends in a full stop ("Jr."), so
            one is only added when it does not. */}
        {/* Right padding keeps "Back to top" clear of the fixed chat button. */}
        <div className='border-rule text-meta text-ink-2 mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 pr-16 sm:pr-20'>
          <p>
            © {new Date().getFullYear()} {PROFILE.name.endsWith('.') ? PROFILE.name : `${PROFILE.name}.`} Designed and
            built by me, running on Next.js and n8n.
          </p>
          <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
            {/* Google's OAuth consent screen links to both, so they stay at these paths. */}
            <a href='/privacy' className='tap-area text-ink-2 hover:text-ink transition-colors'>
              Privacy
            </a>
            <a href='/terms' className='tap-area text-ink-2 hover:text-ink transition-colors'>
              Terms
            </a>
            <a
              href={onLanding ? '#top' : '/#top'}
              className='tap-area text-ink-2 hover:text-ink group inline-flex items-center gap-2 transition-colors'
            >
              Back to top
              <span className='transition-transform duration-300 group-hover:-translate-y-1' aria-hidden='true'>
                ↑
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* The wordmark signs off the page, cropped along the bottom edge.
          When it comes into view each letter is written in, its outline
          drawn like a pen stroke, then filled with terracotta from the
          bottom, one letter after the next (see .footer-sig in globals.css).
          It plays once in time rather than with the scroll, so it is always
          seen finished, however fast the reader arrives. */}
      <div ref={signatureRef} className='footer-signature' aria-hidden='true'>
        <svg className='footer-sig' viewBox={SIGNATURE_BOX} data-on={signed || undefined}>
          <defs>
            <linearGradient
              id={SIGNATURE_FILL}
              gradientUnits='userSpaceOnUse'
              x1='0'
              y1={SIGNATURE_BASELINE}
              x2='0'
              y2='4'
            >
              <stop offset='0' className='footer-sig-stop-low' />
              <stop offset='1' className='footer-sig-stop-high' />
            </linearGradient>
          </defs>
          {SIGNATURE.map(({ letter, x }, index) => (
            <g key={letter} style={{ '--i': index } as CSSProperties}>
              <text x={x} y={SIGNATURE_BASELINE} className='footer-sig-ghost'>
                {letter}
              </text>
              <text x={x} y={SIGNATURE_BASELINE} className='footer-sig-fill' fill={`url(#${SIGNATURE_FILL})`}>
                {letter}
              </text>
              <text x={x} y={SIGNATURE_BASELINE} className='footer-sig-line'>
                {letter}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </footer>
  )
}
