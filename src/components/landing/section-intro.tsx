'use client'

import { useRef, type CSSProperties, type ReactNode } from 'react'

import { EASE_CSS } from '@/components/landing/tokens'
import { DISPLAY_FONT, READABLE, useInView, usePrefersReducedMotion } from '@/components/landing/motion'
import { gsap, LINE_DROP, MOTION_OK, SplitText, useGSAP } from '@/components/landing/gsap'

/**
 * The entrance every section heading shares.
 *
 *   tag      0ms    fade + 12px
 *   heading  80ms   fade + 16px
 *   blurb    180ms  fade + 12px
 *
 * The heading used to arrive from a 14px blur over 1.15s, 200ms late. At a
 * normal scroll speed the line that names the section was the last thing on
 * screen to become readable. It is now sharp from its first frame and settles
 * in well under a second, so motion never stands between a reader and a word.
 *
 * The heading itself is GSAP's: it rises line by line from behind each line's
 * own edge (see `useHeadingReveal`). Tag and blurb stay on the CSS steps.
 */

export function introStep(
  inView: boolean,
  reduced: boolean,
  { delay, y, duration }: { delay: number; y: number; duration: number }
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
    transition: `opacity ${duration}s ${EASE_CSS.entrance} ${delay}ms, transform ${duration}s ${EASE_CSS.entrance} ${delay}ms`
  }
}

/**
 * Masked line rise for a section heading, on the same beat as `introStep`'s
 * 80ms heading slot.
 *
 * The heading is hidden (`.heading-reveal` in globals.css) until its lines are
 * split and parked below their masks; only then is it shown, so there is no
 * frame where the whole heading is visible and then snaps out of view. That
 * class carries its own failsafe, so a script that never runs leaves the
 * headings readable rather than invisible.
 *
 * The split is `autoSplit`: SplitText re-measures when the display face
 * finishes loading and when the heading's width changes, and replays the
 * returned tween's progress on the new lines. Splitting once at mount measured
 * line breaks against the fallback face, so a heading that reflowed once the
 * real font arrived rose in the wrong lines. Once the lines land the split is
 * reverted, leaving the markup React rendered, so a heading measured at one
 * width never keeps those line breaks after a resize.
 *
 * Reduced motion never enters the matchMedia handler, and the caller falls
 * back to the opacity-only `introStep` for those readers.
 */
function useHeadingReveal() {
  const ref = useRef<HTMLHeadingElement>(null)

  useGSAP(() => {
    const heading = ref.current

    if (!heading) return

    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      SplitText.create(heading, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: self => {
          gsap.set(self.lines, { yPercent: LINE_DROP })
          gsap.set(heading, { opacity: 1 })

          return gsap.to(self.lines, {
            yPercent: 0,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.09,
            delay: 0.08,
            scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
            onComplete: () => self.revert()
          })
        }
      })
    })

    return () => mm.revert()
  })

  return ref
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

  /** The small label above the heading. Optional and rationed: the page keeps
   *  about one per three sections, so most sections let the heading stand alone. */
  tag?: string

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
  const headingRef = useHeadingReveal()

  const centred = align === 'center'

  return (
    <div ref={ref} className={`${margin} ${READABLE} saas-section-intro ${centred ? 'text-center' : ''} ${className}`}>
      {/* One eyebrow treatment for the whole page.
          This used to branch between a grey pill and tracked mono, so the same
          element changed costume from section to section while the hero used a
          third style. The rule is the shared signal — it also gives the eye a
          consistent left anchor as the page scrolls. */}
      {tag && (
        <div style={introStep(inView, reduced, { delay: 0, y: 12, duration: 0.6 })}>
          <p className={`flex items-center gap-3 ${centred ? 'justify-center' : ''}`}>
            <span className='saas-eyebrow-mark' aria-hidden='true'>
              <span />
            </span>
            <span className='eyebrow'>{tag}</span>
          </p>
        </div>
      )}

      {title != null && (
        <h2
          ref={headingRef}
          className={`${tag ? titleClassName : titleClassName.replace(/(^|\s)mt-\S+/g, '')} text-ink leading-[1.05] font-light tracking-tight ${reduced ? '' : 'heading-reveal'}`}
          style={{
            fontFamily: DISPLAY_FONT,

            // Hidden by `.heading-reveal` until `useHeadingReveal` has parked
            // the lines; reduced motion keeps the opacity-only step instead.
            ...(reduced ? introStep(inView, reduced, { delay: 80, y: 16, duration: 0.7 }) : null)
          }}
        >
          {title}
        </h2>
      )}

      {blurb && (
        <p
          className={`text-lead text-ink-2 mt-5 ${centred ? 'mx-auto' : ''} max-w-[54ch]`}
          style={introStep(inView, reduced, { delay: 180, y: 12, duration: 0.7 })}
        >
          {blurb}
        </p>
      )}
    </div>
  )
}
