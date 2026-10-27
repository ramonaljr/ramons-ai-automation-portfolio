import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

/**
 * GSAP owns the landing page's focal moments — the hero entrance and the
 * section headings — where text has to arrive line by line from behind its own
 * edge. Ordinary content keeps the CSS `rise`/`sweep` in motion.tsx, which is
 * cheaper and already tuned; the pinned story and the work cards stay on
 * motion/react.
 *
 * Plugins register once, here, so every component imports from this module
 * rather than registering inside a render.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * Every GSAP entrance runs inside `gsap.matchMedia()` on this query, so
 * reduced-motion readers never create the tweens at all, and toggling the
 * preference mid-session reverts them.
 */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/**
 * Split lines start this far below their mask.
 *
 * Not 100: masks are padded so descenders survive tight display leading (see
 * `.split-line-mask` in globals.css), and at 100% a line's ascenders still
 * peek over the bottom of that padding before it moves.
 */
export const LINE_DROP = 130

export { gsap, ScrollTrigger, SplitText, useGSAP }
