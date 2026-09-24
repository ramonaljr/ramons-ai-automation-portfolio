'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'
import { motion, useScroll, useSpring } from 'motion/react'

import { BrandMark } from '@/components/landing/brand-mark'

/**
 * The floating glass nav bar. Shared by the landing page and every page that
 * adopts its design, so the section links have to resolve from anywhere: on the
 * landing page they stay bare hashes and scroll, elsewhere they are rewritten
 * to `/#section` and navigate home first.
 */

const NAV_LINKS = [
  { label: 'Home', hash: '#top' },
  { label: 'About', hash: '#about' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'Services', hash: '#services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', hash: '#contact' }
]

/**
 * Which nav link owns which section, in DOM order.
 *
 * Only sections a link actually names own it. The rest map to `null`, which
 * clears the highlight: "Services" used to stay lit through How it works and
 * Platforms, and "Contact" through testimonials, pricing and the FAQ, which
 * read as the bar being stuck rather than as a choice. The full index lives
 * in the footer.
 *
 * `#top` is not listed because it is the id of the page wrapper — it contains
 * every other section, so it can never be observed as a distinct region. Home
 * is the fallback state instead: nothing has crossed the line yet.
 */
const SECTION_OWNERS: readonly (readonly [id: string, owner: string | null])[] = [
  ['story', null],
  ['about', '#about'],
  ['portfolio', '#portfolio'],
  ['services', '#services'],
  ['process', null],
  ['testimonials', null],
  ['engagement', null],
  ['faq', null],
  ['contact', '#contact']
]

/** Where the reading line sits, as a fraction of viewport height. */
const LINE = 0.45

/**
 * A 5%-tall band around the reading line. Observing a band rather than the
 * whole viewport means only a section actually crossing the line reports in, so
 * the active link cannot flicker between three simultaneous candidates.
 */
const BAND = `-${LINE * 100}% 0px -${100 - LINE * 100 - 5}% 0px`

/**
 * Tracks which nav link owns the section under the reading line.
 *
 * The observer is used as a trigger, not as the answer: the set of sections
 * sitting above the line can only change when one of them crosses it, so the
 * callback re-reads live geometry and takes the last section to have passed.
 * That avoids a scroll listener without losing accuracy on fast flicks.
 */
function useActiveHash(enabled: boolean) {
  const [active, setActive] = useState('#top')

  useEffect(() => {
    if (!enabled) return

    const targets = SECTION_OWNERS.flatMap(([id, owner]) => {
      const element = document.getElementById(id)

      return element ? [{ element, owner }] : []
    })

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight * LINE

        // `undefined` until a section passes the line (Home); a passed section
        // with no link of its own leaves nothing highlighted.
        let owner: string | null | undefined

        for (const target of targets) {
          if (target.element.getBoundingClientRect().top <= line) owner = target.owner
        }

        setActive(owner === undefined ? '#top' : (owner ?? ''))
      },
      { rootMargin: BAND, threshold: 0 }
    )

    targets.forEach(target => observer.observe(target.element))

    return () => observer.disconnect()
  }, [enabled])

  return active
}

/**
 * Glass, with an edge.
 *
 * A backdrop blur alone reads as a translucent rectangle. What sells real glass
 * is the edge: a bright inset hairline along the top where light catches the
 * bevel, a darker one along the bottom, and a saturation boost so colour passing
 * through the panel intensifies rather than washing out. The outer shadow is
 * warm-tinted to match the cream ground instead of neutral black.
 */
const NAV_STYLE = {
  backdropFilter: 'blur(20px) saturate(1.7)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.7)'
} as const

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.4 })

  const onLanding = pathname === '/'
  const active = useActiveHash(onLanding)

  // Off the landing page a hash alone points at nothing, so send the reader
  // home first. `href` lets a link prefer a real page over a section anchor.
  const resolve = (link: (typeof NAV_LINKS)[number]) => link.href ?? (onLanding ? link.hash : `/${link.hash}`)

  // Only in-page links can be "here", and only while the page they point into
  // is the one being read.
  const isHere = (link: (typeof NAV_LINKS)[number]) => onLanding && !link.href && link.hash === active

  const contactHref = onLanding ? '#contact' : '/#contact'
  const close = () => setOpen(false)

  return (
    <div className='pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4'>
      <div className='pointer-events-auto w-full max-w-7xl'>
        {/* Main bar */}
        <nav
          className='site-nav-glass koisei-nav border-rule relative flex items-center justify-between overflow-hidden rounded-2xl border px-5 py-3'
          style={NAV_STYLE}
        >
          <a
            href={onLanding ? '#top' : '/'}
            className='nav-brand font-pixel text-ink inline-flex items-center gap-2.5 text-xs tracking-[0.25em] transition-opacity hover:opacity-70'
            aria-label='Ramon — back to top'
          >
            <span
              className='nav-brand-mark relative block shrink-0'
              style={{ width: '2rem', height: '2rem', color: 'var(--accent)' }}
              aria-hidden='true'
            >
              <BrandMark className='block h-full w-full overflow-visible' />
            </span>
            <span>RAMON</span>
          </a>

          {/* Desktop links */}
          <div className='hidden items-center gap-2 md:flex lg:gap-3'>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={resolve(l)}
                aria-current={isHere(l) ? 'location' : undefined}
                className='site-nav-link text-fine text-ink-2 hover:bg-ink/5 hover:text-ink relative rounded-md px-2.5 py-2 transition-colors duration-200'
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <a
              href={contactHref}
              className='bg-ink text-fine text-ground hover:bg-ink/90 relative z-10 hidden min-w-[9.75rem] rounded-full px-5 py-2 text-center whitespace-nowrap transition-[background-color,transform] duration-300 active:scale-[0.97] motion-reduce:active:scale-100 md:block'
            >
              Book an audit
            </a>

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className='hover:bg-ink/5 -mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors md:hidden'
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span
                className='bg-ink/60 block h-px origin-center transition-all duration-300'
                style={{ width: '18px', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
              />
              <span
                className='bg-ink/60 block h-px transition-all duration-300'
                style={{ width: '18px', opacity: open ? 0 : 1, transform: open ? 'scaleX(0)' : 'none' }}
              />
              <span
                className='bg-ink/60 block h-px origin-center transition-all duration-300'
                style={{ width: '18px', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
              />
            </button>
          </div>

          <motion.span
            className='bg-accent absolute inset-x-0 bottom-0 h-[2px] origin-left'
            style={{ scaleX: progress }}
            aria-hidden='true'
          />
        </nav>

        {/* Mobile dropdown */}
        <div
          className='mt-2 overflow-hidden transition-all duration-300 ease-in-out md:hidden'
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className='site-nav-glass border-rule flex flex-col rounded-2xl border px-2 py-2' style={NAV_STYLE}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={resolve(l)}
                onClick={close}
                aria-current={isHere(l) ? 'location' : undefined}
                className='site-nav-link-mobile text-fine text-ink-2 hover:bg-ink/4 hover:text-ink rounded-xl px-4 py-3 transition-colors'
              >
                {l.label}
              </a>
            ))}
            <div className='mt-1 px-2 pb-1'>
              <a
                href={contactHref}
                onClick={close}
                className='bg-ink text-fine text-ground hover:bg-ink/90 block w-full rounded-full px-4 py-3 text-center transition-colors duration-300'
              >
                Book an audit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
