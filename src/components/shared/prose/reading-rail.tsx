'use client'

import { useEffect, useState } from 'react'

export type Heading = { slug: string; text: string; depth: number }

/**
 * Table of contents plus reading progress for long-form pages.
 *
 * Replaces the old top-centre progress pill, which occupied the same strip of
 * viewport as the landing page's fixed nav bar. Progress moved to a hairline
 * across the very top; the headings became a sticky rail beside the text on
 * wide screens and a scrollable chip row above it on narrow ones.
 */

const ACTIVE_OFFSET = 160

export function ReadingRail({ headings, contentId }: { headings: Heading[]; contentId: string }) {
  const [percent, setPercent] = useState(0)
  const [activeSlug, setActiveSlug] = useState('')

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const content = document.getElementById(contentId)

      if (content) {
        const top = content.getBoundingClientRect().top + scrollY
        const scrollable = content.offsetHeight - window.innerHeight

        setPercent(
          scrollable > 0
            ? Math.min(100, Math.max(0, Math.round(((scrollY - top) / scrollable) * 100)))
            : scrollY >= top
              ? 100
              : 0
        )
      }

      // Last heading whose top has passed the offset wins, so the rail tracks
      // the section being read rather than the one about to appear.
      let current = ''

      for (const heading of headings) {
        const el = document.getElementById(heading.slug)

        if (!el) continue
        if (el.getBoundingClientRect().top + scrollY - ACTIVE_OFFSET <= scrollY) current = heading.slug
      }

      setActiveSlug(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings, contentId])

  return (
    <>
      {/* Progress hairline, above the nav bar's glass */}
      <div className='pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5' aria-hidden='true'>
        <div
          className='h-full origin-left bg-[#111] transition-transform duration-150 ease-out'
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>

      {headings.length > 0 && (
        <>
          {/* Narrow screens: a scrollable chip row, matching the filter chips
              on the landing page's Selected Work section. */}
          <nav
            aria-label='On this page'
            className='-mx-6 mb-10 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden'
          >
            {headings.map(h => (
              <a
                key={h.slug}
                href={`#${h.slug}`}
                className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide whitespace-nowrap transition-all ${
                  h.slug === activeSlug
                    ? 'border-black/25 bg-[#111] text-white'
                    : 'border-black/10 text-black/62 hover:border-black/25 hover:text-black'
                }`}
              >
                {h.text}
              </a>
            ))}
          </nav>

          {/* Wide screens: a sticky rail beside the column */}
          <nav aria-label='On this page' className='hidden lg:sticky lg:top-28 lg:block lg:self-start'>
            <p className='font-mono text-[11px] tracking-[0.28em] text-black/45'>ON THIS PAGE</p>

            <ul className='mt-5 border-l border-black/[0.09]'>
              {headings.map(h => (
                <li key={h.slug}>
                  <a
                    href={`#${h.slug}`}
                    className={`-ml-px block border-l py-1.5 text-[12.5px] leading-snug transition-colors ${
                      h.slug === activeSlug
                        ? 'border-[#111] text-[#111]'
                        : 'border-transparent text-black/50 hover:border-black/25 hover:text-black'
                    }`}
                    style={{ paddingLeft: 16 + h.depth * 12 }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>

            <p className='mt-6 border-t border-black/[0.07] pt-4 font-mono text-[11px] tracking-wide text-black/40'>
              {percent}% READ
            </p>
          </nav>
        </>
      )}
    </>
  )
}
