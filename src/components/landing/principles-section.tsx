'use client'

import { useEffect, useRef, useState } from 'react'

import {
  CONTAINER,
  DISPLAY_FONT,
  SECTION,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { PRINCIPLES } from '@/lib/portfolio'

/**
 * How I build.
 *
 * The three rules are read in sequence, so the motion tracks reading position
 * rather than firing once on entry. A focal band sits about two fifths down the
 * viewport; whichever rule crosses it becomes the active one, and the section
 * re-weights around it — the accent rail travels down the list, the numeral
 * lifts and takes the accent, the active claim goes to full ink while the
 * others recede. It reads as a camera settling on each rule in turn, and it
 * doubles as a reading guide: at any scroll position exactly one rule is lit.
 *
 * The sticky heading carries the counter, so the left column stops being a
 * static block and starts reporting where you are in the sequence.
 */

/**
 * Where the focal line sits, as a slice of the viewport.
 *
 * Centred rather than high: at 40% the last rule lit while the section was
 * still arriving, and then held for the rest of the scroll. A band across the
 * middle spreads the three activations over the section's actual travel.
 */
const FOCAL_BAND = '-46% 0px -49% 0px'

/**
 * Index of the row currently crossing the focal band.
 *
 * Between rows nothing intersects, so the last active index is held rather than
 * cleared — otherwise the section would flicker back to a neutral state in the
 * gaps, which is exactly where the eye is travelling.
 */
function useActiveRow(count: number) {
  const [active, setActive] = useState(0)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[]

    if (!rows.length) return

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          const i = rows.indexOf(e.target as HTMLDivElement)

          if (i >= 0) setActive(i)
        })
      },
      { rootMargin: FOCAL_BAND, threshold: 0 }
    )

    rows.forEach(r => obs.observe(r))

    return () => obs.disconnect()
  }, [count])

  return { active, rowsRef }
}

export function PrinciplesSection() {
  const { ref, inView } = useInView(0.08)
  const reduced = usePrefersReducedMotion()
  const { active, rowsRef } = useActiveRow(PRINCIPLES.length)

  /**
   * Entrance: a downward wipe rather than a fade.
   *
   * `inset(0 0 100% 0)` hides the row by clipping it to nothing at the top edge
   * and opens downward, so each rule is uncovered like a line of type being set
   * rather than appearing all at once. Paired with a short lift so the movement
   * has a direction.
   */
  const enter = (i: number) => {
    if (reduced) {
      return { opacity: inView ? 1 : 0, transition: `opacity 0.3s linear ${i * 90}ms` }
    }

    const delay = 140 + i * 190

    return {
      opacity: inView ? 1 : 0,
      clipPath: inView ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition:
        `clip-path 1.05s cubic-bezier(0.16,1,0.3,1) ${delay}ms, ` +
        `transform 1.05s cubic-bezier(0.16,1,0.3,1) ${delay}ms, ` +
        `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
    }
  }

  return (
    <section id='principles' className={SECTION}>
      <div className={`${CONTAINER} grid gap-x-20 gap-y-14 lg:grid-cols-[minmax(0,22rem)_1fr] 2xl:gap-x-28`}>
        {/* Sticky rail: the claim, and where you are inside it. */}
        <div className='lg:sticky lg:top-32 lg:self-start'>
          <SectionIntro
            tag='HOW I BUILD'
            margin='mb-10'
            title={
              <>
                Reliability is
                <br />
                the feature.
              </>
            }
            blurb='An automation that silently does the wrong thing is worse than no automation. Three rules I do not bend.'
          />

          {/* Counter and progress. The rail was a static block; this makes it
              report the sequence the reader is moving through. */}
          <div className='hidden lg:block' style={{ opacity: inView ? 1 : 0, transition: 'opacity .6s ease .5s' }}>
            <div className='text-meta text-ink-3 flex items-baseline gap-2 font-mono'>
              <span
                className='text-accent text-[1.75rem] leading-none font-light tabular-nums transition-[color,opacity] duration-500'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {PRINCIPLES[active]?.n}
              </span>
              <span aria-hidden='true'>/ {String(PRINCIPLES.length).padStart(2, '0')}</span>
            </div>

            <div className='bg-rule mt-4 h-px w-full overflow-hidden'>
              <div
                className='bg-accent h-full origin-left'
                style={{
                  transform: `scaleX(${(active + 1) / PRINCIPLES.length})`,
                  transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)'
                }}
              />
            </div>
          </div>
        </div>

        <div ref={ref} className='border-rule border-t'>
          {PRINCIPLES.map((p, i) => {
            const on = i === active

            return (
              <div
                key={p.n}
                ref={el => {
                  rowsRef.current[i] = el
                }}
                data-active={on ? 'true' : 'false'}
                aria-current={on ? 'true' : undefined}
                className='border-rule grid gap-x-10 gap-y-4 border-b border-l-2 py-12 pl-6 transition-[border-color,background-color] duration-700 md:grid-cols-[3.5rem_minmax(0,17rem)_1fr] md:py-20 md:pl-8'
                style={{
                  ...enter(i),

                  // The accent rail travels down the list as you read.
                  borderLeftColor: on ? 'var(--accent)' : 'transparent',
                  backgroundColor: on
                    ? 'color-mix(in oklch, var(--ink) 1.5%, transparent)'
                    : 'transparent'
                }}
              >
                {/* The numeral is the focal object: it lifts and takes the
                    accent as its rule becomes current, and settles back when
                    the next one does. */}
                <span
                  className='text-[2.5rem] leading-none font-light tabular-nums md:text-[3rem]'
                  style={{
                    fontFamily: DISPLAY_FONT,
                    color: on ? 'var(--accent)' : 'var(--ink-4)',
                    transform: reduced ? undefined : `translateY(${on ? '-2px' : '0'}) scale(${on ? 1.06 : 1})`,
                    transformOrigin: 'left top',
                    transition: 'color .55s cubic-bezier(0.4,0,0.2,1), transform .55s cubic-bezier(0.16,1,0.3,1)'
                  }}
                >
                  {p.n}
                </span>

                <div>
                  <h3
                    className='display-md text-xl leading-snug font-light md:text-[1.55rem]'
                    style={{
                      fontFamily: DISPLAY_FONT,
                      color: on ? 'var(--ink)' : 'var(--ink-3)',
                      transition: 'color .55s cubic-bezier(0.4,0,0.2,1)'
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className='text-meta mt-2.5 border-t pt-2.5 tracking-[0.02em]'
                    style={{
                      color: 'var(--ink-3)',
                      borderColor: on ? 'color-mix(in oklch, var(--accent) 35%, transparent)' : 'var(--rule)',
                      transition: 'border-color .55s cubic-bezier(0.4,0,0.2,1)'
                    }}
                  >
                    {p.sub}
                  </p>
                </div>

                <p
                  className='text-body max-w-[60ch] md:pt-1'
                  style={{
                    color: on ? 'var(--ink-2)' : 'var(--ink-3)',
                    transition: 'color .55s cubic-bezier(0.4,0,0.2,1)'
                  }}
                >
                  {p.body}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
