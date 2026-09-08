'use client'

import { useState } from 'react'

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
  { label: 'Services', hash: '#services' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'Blog', hash: '#articles', away: '/blog' },
  { label: 'Contact', hash: '#contact' }
]

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

  // Off the landing page a hash alone points at nothing, so send the reader
  // home first. `away` lets a link prefer a real page over a section anchor.
  const resolve = (link: (typeof NAV_LINKS)[number]) =>
    onLanding ? (link.away ?? link.hash) : (link.away ?? `/${link.hash}`)

  const contactHref = onLanding ? '#contact' : '/#contact'
  const close = () => setOpen(false)

  return (
    <div className='pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4'>
      <div className='pointer-events-auto w-full max-w-7xl'>
        {/* Main bar */}
        <nav className='site-nav-glass koisei-nav border-rule relative flex items-center justify-between overflow-hidden rounded-2xl border px-5 py-3' style={NAV_STYLE}>
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
                className='text-fine text-ink-2 hover:bg-ink/5 hover:text-ink rounded-md px-2.5 py-2 transition-colors duration-200'
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
              className='hover:bg-ink/5 flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors md:hidden'
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
                className='text-fine text-ink-2 hover:bg-ink/4 hover:text-ink rounded-xl px-4 py-3 transition-colors'
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
