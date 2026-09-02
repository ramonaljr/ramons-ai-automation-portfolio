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
    <footer className='border-rule border-t px-6 py-12 md:px-12 lg:px-20'>
      <div className={`${CONTAINER} ${READABLE}`}>
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
        <p className='border-rule text-meta text-ink-3 mt-10 border-t pt-6'>
          © {new Date().getFullYear()} {PROFILE.name}. Built and maintained in-house.
        </p>
      </div>
    </footer>
  )
}
