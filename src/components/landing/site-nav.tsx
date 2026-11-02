'use client'

import { useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'

import { BrandMark } from '@/components/landing/brand-mark'
import { ArrowRight, CONTAINER, usePrefersReducedMotion } from '@/components/landing/motion'

import { PROFILE } from '@/lib/portfolio'

/**
 * The floating glass nav bar. Shared by the landing page and every page that
 * adopts its design, so the section links have to resolve from anywhere: on the
 * landing page they stay bare hashes and scroll, elsewhere they are rewritten
 * to `/#section` and navigate home first.
 */

// Services carries both: `href` is where the click goes (its own page) and
// `hash` is the landing section that lights it while being read. Blog has no
// landing section, so it only lights on /blog.
const NAV_LINKS = [
  { label: 'Home', hash: '#top' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'About', hash: '#about' },
  { label: 'Services', href: '/services', hash: '#services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', hash: '#contact' }
]

/**
 * Which nav link owns which section, in DOM order.
 *
 * Each section a link stands for owns it; the story is the hero's own
 * continuation, so Home stays lit through it. The rest map to `null`, which
 * clears the highlight: "Services" used to stay lit through How it works and
 * Platforms, and "Contact" through testimonials, pricing and the FAQ, which
 * read as the bar being stuck rather than as a choice. The full index lives
 * in the footer.
 *
 * `#top` is not listed as a section because it is the id of the page wrapper
 * — it contains every other section, so it can never be observed as a
 * distinct region. Home is also the fallback state: nothing has crossed the
 * line yet.
 */
const SECTION_OWNERS: readonly (readonly [id: string, owner: string | null])[] = [
  ['story', '#top'],
  ['portfolio', '#portfolio'],
  ['about', '#about'],
  ['services', '#services'],
  ['process', null],
  ['testimonials', null],
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

/**
 * How far the page scrolls before the bar tightens into the floating pill.
 * Far enough that a trackpad nudge on the hero does not toggle it, near enough
 * that it has settled before the first section arrives.
 */
const COMPACT_AFTER = 48

/** The active-link pill glides rather than snaps; tuned to settle without overshoot. */
const PILL_SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 } as const

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const reduced = usePrefersReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.4 })

  // React bails out of same-value updates, so this only re-renders on the
  // two crossings, not on every scroll frame.
  useMotionValueEvent(scrollY, 'change', y => setCompact(y > COMPACT_AFTER))

  const onLanding = pathname === '/'
  const active = useActiveHash(onLanding)

  // Off the landing page a hash alone points at nothing, so send the reader
  // home first. `href` lets a link prefer a real page over a section anchor.
  const resolve = (link: (typeof NAV_LINKS)[number]) => link.href ?? (onLanding ? link.hash : `/${link.hash}`)

  // A page link is "here" on its own page and the pages under it (Services on
  // /services and each /services/<slug>); on the landing page, any link with a
  // `hash` while the section it names is the one being read.
  const current = (link: (typeof NAV_LINKS)[number]) => {
    if (link.href && (pathname === link.href || pathname.startsWith(`${link.href}/`))) return 'page'

    return onLanding && link.hash !== undefined && link.hash === active ? 'location' : undefined
  }

  const contactHref = onLanding ? '#contact' : '/#contact'
  const close = () => setOpen(false)

  // The open menu is a disclosure, so it gets the usual ways out: Escape
  // (which hands focus back to the burger, or it would fall to <body> once
  // the panel goes inert) and a tap anywhere outside the bar and panel.
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      burgerRef.current?.focus()
    }

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  // Over the hero the bar shares the sections' container and gutters, so its
  // edges line up with the content under it. Once the page scrolls it lets go
  // of those edges and tightens into a centred pill (`data-compact`, styled in
  // globals.css), since by then there is no hero edge left to align with.
  return (
    <motion.div
      layoutRoot
      className='pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:px-12 lg:px-20'
    >
      <div ref={rootRef} className={`pointer-events-auto w-full ${CONTAINER}`}>
        {/* Main bar */}
        <nav
          data-compact={compact || undefined}
          className='site-nav site-nav-glass relative mx-auto flex items-center justify-between overflow-hidden rounded-full border'
        >
          <a
            href={onLanding ? '#top' : '/'}
            className='nav-brand text-ink inline-flex shrink-0 items-center rounded-lg text-[0.95rem] font-medium tracking-[-0.01em] transition-opacity hover:opacity-70'
            aria-label={`${PROFILE.name}, back to top`}
          >
            <span
              className='nav-brand-mark relative block shrink-0'
              style={{ width: '2rem', height: '2rem', color: 'var(--accent)' }}
              aria-hidden='true'
            >
              <BrandMark className='block h-full w-full overflow-visible' />
            </span>
            <span className='nav-brand-name'>{PROFILE.name}</span>
          </a>

          {/* Desktop links */}
          <div className='hidden items-center gap-0.5 md:flex lg:gap-1'>
            {NAV_LINKS.map(l => {
              const here = current(l)

              return (
                <a
                  key={l.label}
                  href={resolve(l)}
                  aria-current={here}
                  className='site-nav-link text-fine text-ink-2 hover:bg-ink/5 hover:text-ink relative isolate rounded-full px-3.5 py-2 transition-colors duration-200'
                >
                  {/* One shared layoutId, so the pill glides from the link
                      that lost "here" to the one that gained it. */}
                  {here && (
                    <motion.span
                      layoutId='site-nav-active'
                      className='site-nav-pill absolute inset-0 -z-10 rounded-full'
                      transition={reduced ? { duration: 0 } : PILL_SPRING}
                      aria-hidden='true'
                    />
                  )}
                  {l.label}
                </a>
              )
            })}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <a
              href={contactHref}
              className='group bg-ink text-fine text-ground hover:bg-ink/90 relative z-10 hidden items-center gap-2 rounded-full py-2 pr-4 pl-5 whitespace-nowrap transition-[background-color,transform] duration-300 active:scale-[0.97] motion-reduce:active:scale-100 md:inline-flex'
            >
              Book a free call
              <span className='transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0'>
                <ArrowRight size={14} />
              </span>
            </a>

            {/* Burger — mobile only */}
            <button
              ref={burgerRef}
              onClick={() => setOpen(v => !v)}
              className='hover:bg-ink/5 -mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors md:hidden'
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls='site-nav-menu'
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

          {/* Inset past the pill's rounded ends, where a full-width line would
              be clipped into two hooks by the curve. */}
          <motion.span
            className='bg-accent absolute inset-x-7 bottom-0 h-[2px] origin-left rounded-full'
            style={{ scaleX: progress }}
            aria-hidden='true'
          />
        </nav>

        {/* Mobile dropdown.
            The row animates 0fr → 1fr, so it opens to whatever the panel
            measures; a fixed max-height had drifted 15px short and sliced off
            the panel's bottom edge. `inert` takes the closed panel out of the
            tab order: opacity alone left six invisible links focusable. */}
        <div
          id='site-nav-menu'
          inert={!open}
          className='site-nav-menu grid transition-[grid-template-rows,opacity] duration-300 ease-in-out md:hidden'
          style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
        >
          {/* The gap is the panel's margin, not this wrapper's padding: padding
              cannot collapse inside a 0fr row and left an invisible 8px strip
              under the bar that swallowed taps. */}
          <div className='min-h-0 overflow-hidden'>
            <div className='site-nav-glass border-rule mt-2 flex flex-col rounded-3xl border p-2' style={NAV_STYLE}>
              {NAV_LINKS.map(l => (
                <a
                  key={l.label}
                  href={resolve(l)}
                  onClick={close}
                  aria-current={current(l)}
                  className='site-nav-link-mobile text-fine text-ink-2 hover:bg-ink/4 hover:text-ink rounded-2xl px-4 py-3 transition-colors'
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
                  Book a free call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
