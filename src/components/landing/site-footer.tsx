'use client'

import { useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform, type MotionValue, type Variants } from 'motion/react'

import { BrandMark } from '@/components/landing/brand-mark'
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
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'About', hash: '#about' },
  { label: 'Career history', hash: '#experience' },
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

const LETTERS = ['R', 'A', 'M', 'O', 'N']

/**
 * One letter of the signature. It rises out of the bottom edge as the reader
 * reaches the end of the page, each letter a beat after the last, and fills
 * with terracotta on the same scroll.
 */
function SignatureLetter({
  letter,
  index,
  progress,
  fill,
  reduced
}: {
  letter: string
  index: number
  progress: MotionValue<number>
  fill: MotionValue<string>
  reduced: boolean
}) {
  // `progress` runs from the signature entering the screen to the end of
  // the page, so the whole rise happens where it can be seen.
  const start = index * 0.1
  const y = useTransform(progress, [0, start, start + 0.55, 1], ['105%', '105%', '0%', '0%'])

  return (
    <motion.span style={reduced ? { backgroundSize: '100% 100%' } : { y, backgroundSize: fill }}>{letter}</motion.span>
  )
}

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const onLanding = pathname === '/'
  const reduced = usePrefersReducedMotion()
  const signatureRef = useRef<HTMLDivElement>(null)

  // From the signature's top reaching the bottom of the screen to the end of
  // the page: it is only on screen for the last stretch of the scroll, so its
  // motion keys off its own position rather than the whole footer's.
  const { scrollYProgress } = useScroll({ target: signatureRef, offset: ['start end', 'end end'] })

  // The wordmark fills with terracotta from the bottom as the page ends,
  // like a signature being drawn.
  const wordFill = useTransform(scrollYProgress, [0.2, 1], ['100% 30%', '100% 100%'])
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
            '.footer-ask-line>span,.footer-actions,.footer-columns nav,.footer-columns li,.footer-identity,.footer-word span{opacity:1!important;transform:none!important}'
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
            className='tap-area text-ink-2 hover:text-ink group inline-flex items-center gap-2 transition-colors'
          >
            Back to top
            <span className='transition-transform duration-300 group-hover:-translate-y-1' aria-hidden='true'>
              ↑
            </span>
          </a>
        </div>
      </div>

      {/* The wordmark signs off the page: solid, cropped along the bottom
          edge, its letters rising one by one and filling with terracotta
          from the bottom as the page ends.
          It sits below the links rather than behind the headline, where the
          two used to muddy each other. */}
      <div ref={signatureRef} className='footer-signature' aria-hidden='true'>
        <div className='footer-word'>
          {LETTERS.map((letter, index) => (
            <SignatureLetter
              key={letter}
              letter={letter}
              index={index}
              progress={scrollYProgress}
              fill={wordFill}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </footer>
  )
}
