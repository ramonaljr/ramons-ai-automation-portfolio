'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'

/**
 * Design tokens and the reveal primitive shared by every surface that has to
 * sit alongside the landing page.
 *
 * The landing page is deliberately not themed through the shadcn CSS variables
 * in globals.css — those still drive the original template pages. Its palette
 * lives as literals, so anything that wants to match it reads the literals from
 * here rather than re-declaring them per file.
 */

/** Display face for headlines and figures. Always paired with `font-light`. */
export const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

/** Page gutter width. Sections set their own horizontal padding. */
export const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

/** A full landing section: vertical rhythm, gutters, and the hairline divider. */
export const SECTION = 'py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]'

/** Cream page ground. Applied to the outermost wrapper of every page. */
export const PAGE = 'bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const subscribeToMotionPreference = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION)

  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

/**
 * Read as an external store rather than in an effect: the server has no
 * `matchMedia`, and setting state on mount instead would cost a second render
 * on every revealed element.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )
}

/**
 * Fires once when the element scrolls into view.
 *
 * Readers who ask for reduced motion are handed the final state immediately and
 * the observer is never created — paired with the transition override in
 * globals.css, that means the content is simply there rather than arriving.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current

    if (!el || reduced) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold, reduced])

  return { ref, inView: seen || reduced }
}

/** The landing page's signature entrance: 22px rise with a decelerating ease. */
export function rise(inView: boolean, delay = 0): CSSProperties {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(22px)',
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
  }
}

/**
 * `rise` as a wrapper, so server-rendered pages can use the landing entrance
 * without turning the whole page into a client component.
 */
export function Reveal({
  children,
  delay = 0,
  threshold = 0.12,
  className
}: {
  children: ReactNode
  delay?: number
  threshold?: number
  className?: string
}) {
  const { ref, inView } = useInView(threshold)

  return (
    <div ref={ref} className={className} style={rise(inView, delay)}>
      {children}
    </div>
  )
}

/** Outbound arrow used on every landing call to action. */
export function ArrowIcon() {
  return (
    <svg width='13' height='13' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
      <path
        d='M3 11L11 3M11 3H5M11 3V9'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

/** Rightward arrow used on inline "keep reading" links. */
export function ArrowRight({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M4 12h14M13 6l6 6-6 6' />
    </svg>
  )
}
