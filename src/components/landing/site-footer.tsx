'use client'

import { useRef } from 'react'

import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'motion/react'

import { CONTAINER, READABLE, usePrefersReducedMotion } from '@/components/landing/motion'
import { PROFILE } from '@/lib/portfolio'

/**
 * Site footer. Like `SiteNav`, its section links have to resolve from any page,
 * so bare hashes are rewritten to `/#section` away from the landing page.
 */

const FOOTER_LINKS = [
  { label: 'About', hash: '#about' },
  { label: 'Services', hash: '#services' },
  { label: 'Platforms', hash: '#platforms' },
  { label: 'Portfolio', hash: '#portfolio' },
  { label: 'Experience', hash: '#experience' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
]

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const onLanding = pathname === '/'
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ['start end', 'end end'] })
  const wordY = useTransform(scrollYProgress, [0, 1], [90, -12])
  const wordScale = useTransform(scrollYProgress, [0, 1], [0.9, 1])

  return (
    <footer ref={footerRef} className='footer-scene border-rule relative overflow-hidden border-t px-6 pt-28 pb-10 md:px-12 lg:px-20'>
      <motion.div
        className='footer-word pointer-events-none absolute inset-x-0 top-0 text-center text-[clamp(7rem,22vw,24rem)] leading-none font-black tracking-[-0.09em] select-none'
        style={reduced ? undefined : { y: wordY, scale: wordScale }}
        aria-hidden='true'
      >
        RAMON
      </motion.div>

      <div className={`${CONTAINER} ${READABLE} relative z-10 flex min-h-[44vh] flex-col justify-end`}>
        <div className='mb-20 max-w-2xl'>
          <span className='eyebrow'>END OF THE MANUAL LOOP</span>
          <p className='text-ink mt-5 text-[clamp(2rem,4vw,4.25rem)] leading-[1.02] font-light tracking-tight'>
            Better systems.<br />More human work.
          </p>
        </div>

        <div className='flex flex-col justify-between gap-8 md:flex-row md:items-center'>
          <div>
            <p className='font-pixel text-ink-2 text-xs tracking-[0.25em]'>{PROFILE.shortName.toUpperCase()}</p>
            <p className='text-ink-2 mt-2 text-[14px]'>
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>

          <nav className='flex flex-wrap gap-x-3 gap-y-1'>
            {FOOTER_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href ?? (onLanding ? l.hash : `/${l.hash}`)}
                className='text-ink-2 hover:bg-ink/4 hover:text-ink rounded-md px-2 py-1.5 text-[13px] transition-colors'
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className='flex gap-2'>
            {PROFILE.socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target='_blank'
                rel='noopener noreferrer'
                className='border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink rounded-full border px-3.5 py-2 text-[12px] transition-all'
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* TODO: privacy + terms links belong here — the routes do not exist
            yet, and linking them before they do would only ship two 404s. */}
        <div className='border-rule text-meta text-ink-3 mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6'>
          <p>© {new Date().getFullYear()} {PROFILE.name}. Built and maintained in-house.</p>
          <a href={onLanding ? '#top' : '/#top'} className='text-ink-2 hover:text-ink group inline-flex items-center gap-2 transition-colors'>
            Back to top
            <span className='transition-transform duration-300 group-hover:-translate-y-1' aria-hidden='true'>↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
