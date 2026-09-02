'use client'

import type { CSSProperties, ReactNode } from 'react'

import { DISPLAY_FONT, READABLE, useInView, usePrefersReducedMotion } from '@/components/landing/motion'

/**
 * The entrance every section heading shares.
 *
 * `rise` is 22px over 0.7s, which is right for a card in a grid of twelve but
 * disappears on a single heading — by the time the eye reaches it the movement
 * is over. This is deliberately slower and travels further, and it staggers
 * three parts rather than moving one block, so the cascade is legible:
 *
 *   tag      0ms    fade + 16px
 *   heading  200ms  blur 14px to sharp + 40px
 *   blurb    420ms  fade + 20px
 *
 * Total is about 1.5s. That is long for UI and correct for a section opener,
 * which the reader arrives at rather than clicks.
 */

const EASE = 'cubic-bezier(0.16,1,0.3,1)'

export function introStep(
  inView: boolean,
  reduced: boolean,
  { delay, y, blur = 0, duration }: { delay: number; y: number; blur?: number; duration: number }
): CSSProperties {
  if (reduced) {
    // Opacity alone carries no vestibular risk, so the content still arrives.
    return {
      opacity: inView ? 1 : 0,
      transition: `opacity 0.3s linear ${delay}ms`
    }
  }

  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
    filter: blur ? (inView ? 'blur(0px)' : `blur(${blur}px)`) : undefined,
    transition:
      `opacity ${duration}s ${EASE} ${delay}ms, transform ${duration}s ${EASE} ${delay}ms` +
      (blur ? `, filter ${duration}s ${EASE} ${delay}ms` : ''),
    willChange: inView ? undefined : 'opacity, transform'
  }
}

export function SectionIntro({
  tag,
  title,
  blurb,
  className = '',
  align = 'left',
  margin = 'mb-16',
  titleClassName = 'mt-6 text-[clamp(2rem,4vw,3.25rem)]'
}: {
  tag: string

  /** Omit where the section's heading lives elsewhere — About puts its
   *  name in the left column, so the intro carries only the tag. */
  title?: ReactNode
  blurb?: ReactNode
  className?: string
  align?: 'left' | 'center'

  /** @deprecated The eyebrow has one treatment now. Accepted and ignored
   *  so existing call sites keep compiling. */
  variant?: 'pill' | 'mono'

  /** Sections that own their own spacing pass `margin=""`. */
  margin?: string
  titleClassName?: string
}) {
  // A low threshold so the cascade starts as the heading enters rather than
  // once it is already halfway up the screen and half of it has been missed.
  const { ref, inView } = useInView(0.05)
  const reduced = usePrefersReducedMotion()

  const centred = align === 'center'

  return (
    <div ref={ref} className={`${margin} ${READABLE} ${centred ? 'text-center' : ''} ${className}`}>
      {/* One eyebrow treatment for the whole page.
          This used to branch between a grey pill and tracked mono, so the same
          element changed costume from section to section while the hero used a
          third style. The rule is the shared signal — it also gives the eye a
          consistent left anchor as the page scrolls. */}
      <div style={introStep(inView, reduced, { delay: 0, y: 16, duration: 0.8 })}>
        <p className={`flex items-center gap-3 ${centred ? 'justify-center' : ''}`}>
          <span className='bg-ink/25 h-px w-8' aria-hidden='true' />
          <span className='eyebrow'>{tag}</span>
        </p>
      </div>

      {title != null && (
        <h2
          className={`${titleClassName} text-ink leading-[1.05] font-light tracking-tight`}
          style={{
            fontFamily: DISPLAY_FONT,
            ...introStep(inView, reduced, { delay: 200, y: 40, blur: 14, duration: 1.15 })
          }}
        >
          {title}
        </h2>
      )}

      {blurb && (
        <p
          className={`text-lead text-ink-2 mt-5 ${centred ? 'mx-auto' : ''} max-w-[54ch]`}
          style={introStep(inView, reduced, { delay: 420, y: 20, duration: 0.9 })}
        >
          {blurb}
        </p>
      )}
    </div>
  )
}
