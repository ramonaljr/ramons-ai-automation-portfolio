/**
 * The landing page's plain design tokens, in a module with no 'use client'.
 *
 * Server components can import these as ordinary strings. Imported from
 * motion.tsx (a client module) instead, each one became a client reference,
 * and the 404 page, which the root layout carries on every route, pulled the
 * whole motion chunk into every page load a second time. motion.tsx re-exports
 * them, so existing imports keep working.
 */

/** One stroke weight for every icon on the landing page (all from lucide-react). */
export const ICON_STROKE = 1.75

/**
 * The hero headline's size, shared with the intro, which shows the same
 * headline from the first frame and hands it over at this exact size, so the
 * handover is a pure move with no scaling. The rate is set by the longest
 * line ("Stop losing hours to", 7.63em) fitting the copy column beside the
 * portrait, tightest where the portrait first appears: 462px at 1024, where
 * 5.75vw sets it at 449px (6vw wrapped it). At 1440 that is 83px. The floor
 * keeps phones where they were.
 */
export const HERO_HEADLINE_SIZE = 'text-[clamp(2.6rem,5.75vw,7rem)]'

/** Display face for headlines and figures. Always paired with `font-light`. */
export const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/** Page gutter width. Sections set their own horizontal padding. */
export const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

/** Cream page ground. Applied to the outermost wrapper of every page. */
export const PAGE = 'koisei-page bg-ground text-ink min-h-dvh font-sans antialiased'

/**
 * Motion tokens. The CSS twins of the easings and durations are at the top of
 * globals.css; these are for places that cannot read a custom property
 * (motion/react takes arrays, GSAP takes its own names).
 *
 * Use the CSS form (`EASE_CSS.entrance`) in inline `transition` strings: it
 * resolves against the same variable the stylesheet uses, so retuning the
 * curve there retunes every reveal.
 */
export const EASE_CSS = {
  entrance: 'var(--ease-entrance)',
  standard: 'var(--ease-standard)'
} as const

/** `--ease-entrance`, as the cubic-bezier array motion/react wants. */
export const EASE_ENTRANCE = [0.16, 1, 0.3, 1] as const

/**
 * A strong in-out, for a panel or view that crosses the whole stage. Distinct
 * from `--ease-emphasis` (a steeper curve that matches GSAP's expo.inOut), so
 * it is named for what it does here rather than folded into it.
 */
export const EASE_STAGE = [0.76, 0, 0.24, 1] as const

/**
 * Durations, in seconds. `base` is the reveal every section uses (`rise`,
 * the intro steps); `sweep` is its horizontal sibling, deliberately a touch
 * slower so a row reads as a sweep; `quick` is a hover or a swap; `slow` is a
 * count-up or a long settle.
 */
export const DURATION = { quick: 0.3, base: 0.7, sweep: 0.8, slow: 1.2 } as const

/** Weighty and deliberate. Content entrances and scroll reveals. */
export const cinematicSpring = { type: 'spring', damping: 30, stiffness: 100, mass: 1.2 } as const

/** Fast and responsive. UI chrome that should feel immediate. */
export const snappySpring = { type: 'spring', damping: 25, stiffness: 200 } as const

/** Slow settle, no overshoot: numbers should not bounce past their value. */
export const countupSpring = { damping: 40, stiffness: 80, mass: 1 } as const

/** The nav's active-link pill: glides rather than snaps, settles without overshoot. */
export const pillSpring = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 } as const

/**
 * Springs that smooth a scroll-driven value (no `type`: `useSpring` takes the
 * bare options). Named for the value they follow.
 */
export const scrollSprings = {
  /** The nav's progress line. */
  navProgress: { stiffness: 130, damping: 28, mass: 0.4 },

  /** The timeline's spine. */
  timeline: { stiffness: 120, damping: 20, mass: 0.5 },

  /** The story section's position. Deliberately slow; leave it. */
  story: { stiffness: 38, damping: 18, mass: 0.9, restDelta: 0.0005 }
} as const
