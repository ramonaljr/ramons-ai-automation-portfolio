'use client'

import { useState } from 'react'

import { usePathname } from 'next/navigation'

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
  WebkitBackdropFilter: 'blur(20px) saturate(1.7)',
  background: 'oklch(0.9623 0.0045 84.5 / 0.62)',
  boxShadow:
    'inset 0 1px 0 oklch(1 0 0 / 0.6), inset 0 -1px 0 oklch(0.28 0.014 70 / 0.05),' +
    '0 8px 32px oklch(0.28 0.014 70 / 0.08), 0 2px 8px oklch(0.28 0.014 70 / 0.05)'
} as const

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const onLanding = pathname === '/'

  // Off the landing page a hash alone points at nothing, so send the reader
  // home first. `away` lets a link prefer a real page over a section anchor.
  const resolve = (link: (typeof NAV_LINKS)[number]) => (onLanding ? link.hash : (link.away ?? `/${link.hash}`))

  const contactHref = onLanding ? '#contact' : '/#contact'
  const close = () => setOpen(false)

  return (
    <div className='pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4'>
      <div className='pointer-events-auto w-full max-w-5xl'>
        {/* Main bar */}
        <nav
          className='flex items-center justify-between rounded-2xl border border-rule px-5 py-3'
          style={NAV_STYLE}
        >
          <a href={onLanding ? '#top' : '/'} className='font-pixel text-xs tracking-[0.25em] text-ink transition-opacity hover:opacity-70'>
            RAMON
          </a>

          {/* Desktop links */}
          <div className='hidden items-center gap-2 md:flex lg:gap-3'>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={resolve(l)}
                className='rounded-md px-2.5 py-2 text-fine text-ink-2 transition-colors duration-200 hover:bg-ink/5 hover:text-ink'
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <a
              href={contactHref}
              className='hidden rounded-full bg-ink px-5 py-2 text-fine text-ground transition-[background-color,transform] duration-300 hover:bg-ink/90 active:scale-[0.97] motion-reduce:active:scale-100 md:block'
            >
              Start a project
            </a>

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className='flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors hover:bg-ink/5 md:hidden'
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span
                className='block h-px origin-center bg-ink/60 transition-all duration-300'
                style={{ width: '18px', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
              />
              <span
                className='block h-px bg-ink/60 transition-all duration-300'
                style={{ width: '18px', opacity: open ? 0 : 1, transform: open ? 'scaleX(0)' : 'none' }}
              />
              <span
                className='block h-px origin-center bg-ink/60 transition-all duration-300'
                style={{ width: '18px', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className='mt-2 overflow-hidden transition-all duration-300 ease-in-out md:hidden'
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className='flex flex-col rounded-2xl border border-rule px-2 py-2' style={NAV_STYLE}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={resolve(l)}
                onClick={close}
                className='rounded-xl px-4 py-3 text-fine text-ink-2 transition-colors hover:bg-ink/4 hover:text-ink'
              >
                {l.label}
              </a>
            ))}
            <div className='mt-1 px-2 pb-1'>
              <a
                href={contactHref}
                onClick={close}
                className='block w-full rounded-full bg-ink px-4 py-3 text-center text-fine text-ground transition-colors duration-300 hover:bg-ink/90'
              >
                Start a project
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
