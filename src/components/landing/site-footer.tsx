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
    <footer className='border-t border-rule px-6 py-12 md:px-12 lg:px-20'>
      <div className={`${CONTAINER} ${READABLE}`}>
        <div className='flex flex-col justify-between gap-8 md:flex-row md:items-center'>
          <div>
            <p className='font-pixel text-xs tracking-[0.25em] text-ink-2'>{PROFILE.shortName.toUpperCase()}</p>
            <p className='mt-2 text-[14px] text-ink-2'>
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>

          <nav className='flex flex-wrap gap-x-3 gap-y-1'>
            {FOOTER_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href ?? (onLanding ? l.hash : `/${l.hash}`)}
                className='rounded-md px-2 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink'
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
                className='rounded-full border border-rule px-3.5 py-2 text-[12px] text-ink-2 transition-all hover:border-rule-strong hover:bg-ink/[0.03] hover:text-ink'
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* TODO: privacy + terms links belong here — the routes do not exist
            yet, and linking them before they do would only ship two 404s. */}
        <p className='mt-10 border-t border-rule pt-6 text-meta text-ink-3'>
          © {new Date().getFullYear()} {PROFILE.name}. Built and maintained in-house.
        </p>
      </div>
    </footer>
  )
}
