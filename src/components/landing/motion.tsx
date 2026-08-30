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

/**
 * Reading surface for copy that sits over the constellation field.
 *
 * A blurred pseudo-element, not `backdrop-blur`: a backdrop filter re-samples
 * the animating canvas every frame, while this is one static layer the
 * compositor paints once. The blur is also what keeps it invisible — there is
 * no card edge to notice, so it reads as light gathering behind the text
 * rather than a panel sitting on top of it.
 *
 * Lowering the field's own alpha got the page readable, but that fix is
 * probabilistic: the particles drift, so a dense cluster can still wander
 * across a paragraph. This makes the reading zones unconditional.
 *
 * The horizontal inset has to stay inside the page gutter or the halo pushes
 * the document wider than the viewport — `px-6` gutters at 24px against a
 * 32px inset put 8px of horizontal scroll on a phone. It widens at `md`,
 * where the gutter grows to `px-12`.
 */
export const READABLE =
  'relative isolate before:pointer-events-none before:absolute before:-inset-x-4 before:-inset-y-6 ' +
  'md:before:-inset-x-8 before:-z-10 before:rounded-[2.5rem] before:bg-[#F5F4F0]/78 before:blur-2xl'

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
 * Gap between successive items in a `sweep`, in ms.
 *
 * Exported so a block that follows a swept row can chain off the end of it
 * rather than hard-coding a number that drifts out of sync when this changes.
 */
export const SWEEP_STEP = 180

/**
 * Step for grids that wrap onto more than one row.
 *
 * A linear index across a wrapping grid still sweeps correctly — it just reads
 * as a reading-order cascade that restarts at the left on each new row. But the
 * ramp is counted in cells, not columns, so the six-cell Services grid at the
 * full step would take about 1.7s to finish against roughly 1.3s for the single
 * rows. Tightening the step keeps every grid on the page inside the same
 * envelope instead of making the densest one the slowest.
 */
export const SWEEP_STEP_DENSE = 110

/**
 * The horizontal sibling of `rise`: a left-to-right sweep across a row of peers.
 *
 * These grids were already staggered by index, but on `translateY` — and
 * direction is read from movement, not from timing. Four cards rising a tenth
 * of a second apart look like one block arriving with a shimmer, never like a
 * sweep. Moving them on X is what makes the reading order legible.
 *
 * The step also has to clear a real fraction of the duration or the items
 * collapse back into a single event: at the previous 100ms against a 700ms
 * transition, the last card was already moving before the first was a seventh
 * of the way in. 180ms against 800ms leaves each card a visible head start.
 *
 * Negative X is safe at any distance — overflow past the left edge of an LTR
 * document is clipped, not scrolled, so this cannot widen the page the way a
 * positive offset would.
 *
 * Reduced motion needs nothing here: `useInView` hands those readers `inView`
 * on mount, and the duration override in globals.css stops the resulting state
 * change from playing.
 */
export function sweep(inView: boolean, index = 0, step = SWEEP_STEP, distance = 34): CSSProperties {
  const delay = index * step

  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0px)' : `translateX(-${distance}px)`,
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
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

/* ───────────────────────────────────────────────────────────────────────────
   Cinematic layer
   `rise` above is the workhorse. What follows is for focal points only — the
   hero entrance, section headings, figures. Animating everything flattens the
   hierarchy and costs frames; these are meant to be used sparingly.
   ─────────────────────────────────────────────────────────────────────────── */

/** Weighty and deliberate. Content entrances and scroll reveals. */
export const cinematicSpring = { type: 'spring', damping: 30, stiffness: 100, mass: 1.2 } as const

/** Fast and responsive. UI chrome that should feel immediate. */
export const snappySpring = { type: 'spring', damping: 25, stiffness: 200 } as const

/** Slow settle, no overshoot — numbers should not bounce past their value. */
export const countupSpring = { damping: 40, stiffness: 80, mass: 1 } as const

/** Easing to pair with an explicit duration, when a spring is wrong. */
export const CINEMATIC_EASE = [0.25, 0.1, 0.25, 1] as const

/**
 * Blur-to-sharp rise. The blur is what separates this from `rise` — it reads
 * as something resolving into focus rather than sliding in.
 *
 * Reduced motion collapses it to a plain fade: opacity alone carries no
 * vestibular risk, so the content still arrives rather than snapping.
 */
export function TextReveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div'
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span'
}) {
  const { ref, inView } = useInView(0.2)
  const reduced = usePrefersReducedMotion()

  const hidden: CSSProperties = reduced
    ? { opacity: 0 }
    : { opacity: 0, transform: 'translateY(26px)', filter: 'blur(10px)' }

  const shown: CSSProperties = { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...(inView ? shown : hidden),
        transition: reduced
          ? `opacity 0.3s linear ${delay}ms`
          : `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
             transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
             filter 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: inView ? 'auto' : 'opacity, transform, filter'
      }}
    >
      {children}
    </Tag>
  )
}

/**
 * Sequential reveal for a list or grid. `index` drives the offset rather than
 * a context provider, so it composes with existing `.map` calls without
 * restructuring them.
 */
export function StaggerItem({
  children,
  index = 0,
  step = 90,
  distance = 28,
  className
}: {
  children: ReactNode
  index?: number
  step?: number
  distance?: number
  className?: string
}) {
  const { ref, inView } = useInView(0.1)
  const reduced = usePrefersReducedMotion()
  const delay = index * step

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView || reduced ? 'none' : `translateY(${distance}px)`,
        transition: reduced
          ? `opacity 0.3s linear ${delay}ms`
          : `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Counts a figure up when it scrolls into view.
 *
 * Takes the rendered string ("25+ hrs", "< 30 SEC") and animates only its
 * leading number, so the data stays a single human-readable value rather than
 * being split into value/prefix/suffix fields across the codebase.
 */
export function CountUp({
  children,
  duration = 1400,
  start
}: {
  children: string
  duration?: number

  /**
   * Gate the count on something other than intersection. The hero stats are in
   * the DOM at opacity 0 while the intro plays, so on intersection alone they
   * finish counting before anyone can see them. Pass the reveal flag here.
   */
  start?: boolean
}) {
  const { ref, inView } = useInView(0.4)
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState<number | null>(null)

  const match = /^(\D*)(\d[\d,]*)(.*)$/.exec(children)

  useEffect(() => {
    if (!inView || reduced || start === false) return

    const m = /^(\D*)(\d[\d,]*)(.*)$/.exec(children)

    if (!m) return

    const target = Number(m[2].replace(/,/g, ''))

    if (!Number.isFinite(target)) return

    let raf = 0
    const t0 = performance.now()

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)


      // Quintic ease-out: fast start, long settle, never overshoots.
      setN(Math.round(target * (1 - Math.pow(1 - p, 5))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)

    // Depend on `children`, never on `match`: exec() returns a fresh array
    // each render, so listing it restarted the count on every parent re-render
    // — and the hero re-renders every 2.5s as its headline word rotates.
  }, [inView, reduced, duration, children, start])

  if (!match) return <span ref={ref as never}>{children}</span>

  const [, prefix, digits, suffix] = match
  const shown = n === null ? digits : n.toLocaleString('en-US')

  return (
    <span ref={ref as never}>
      {prefix}
      {shown}
      {suffix}
    </span>
  )
}
