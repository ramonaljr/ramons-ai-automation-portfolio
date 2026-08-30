'use client'

import { usePathname } from 'next/navigation'

import { CONTAINER, READABLE } from '@/components/landing/motion'
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
  const pathname = usePathname()
  const onLanding = pathname === '/'

  return (
    <footer className='border-t border-black/[0.06] px-6 py-12 md:px-12 lg:px-20'>
      <div className={`${CONTAINER} ${READABLE}`}>
        <div className='flex flex-col justify-between gap-8 md:flex-row md:items-center'>
          <div>
            <p className='font-pixel text-xs tracking-[0.25em] text-black/70'>{PROFILE.shortName.toUpperCase()}</p>
            <p className='mt-2 text-[14px] text-black/70'>
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>

          <nav className='flex flex-wrap gap-x-3 gap-y-1'>
            {FOOTER_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href ?? (onLanding ? l.hash : `/${l.hash}`)}
                className='rounded-md px-2 py-1.5 text-[13px] text-black/72 transition-colors hover:bg-black/[0.04] hover:text-black'
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
                className='rounded-full border border-black/10 px-3.5 py-2 text-[12px] text-black/68 transition-all hover:border-black/25 hover:bg-black/[0.03] hover:text-black'
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <p className='mt-10 border-t border-black/[0.06] pt-6 text-[12px] text-black/72'>
          © {new Date().getFullYear()} {PROFILE.name}. Built with n8n, Zapier and Make in mind.
        </p>
      </div>
    </footer>
  )
}
