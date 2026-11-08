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

/** Display face for headlines and figures. Always paired with `font-light`. */
export const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/** Page gutter width. Sections set their own horizontal padding. */
export const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

/** Cream page ground. Applied to the outermost wrapper of every page. */
export const PAGE = 'koisei-page bg-ground text-ink min-h-dvh font-sans antialiased'
