'use client'

import { useEffect } from 'react'

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { gsap, MOTION_OK } from '@/components/landing/gsap'

/**
 * Smooths wheel scrolling on the landing page.
 *
 * Lenis eases the real window scroll position rather than translating a
 * wrapper, so `position: sticky` and motion's `useScroll` keep
 * reading native scroll and need no changes. What it fixes is a notched mouse
 * wheel: each ~100px jump used to move the pinned story and the process mark
 * in visible steps; Lenis spreads it over several frames. Trackpads already
 * send smooth input, and touch is left native (`syncTouch` stays off).
 */

let instance: Lenis | null = null

/** The running instance, for code that scrolls the page programmatically. */
export const getLenis = () => instance

/**
 * Scroll the window to `top`, through Lenis when it is running so the move
 * uses the same easing as the wheel instead of competing with it.
 */
export function scrollPageTo(top: number) {
  if (instance) instance.scrollTo(top)
  else window.scrollTo({ top, behavior: 'smooth' })
}

export function SmoothScroll() {
  useEffect(() => {
    // Reduced-motion readers get native scrolling, not a 1:1 Lenis.
    if (!window.matchMedia(MOTION_OK).matches) return

    const lenis = new Lenis({
      // `#contact`, `#portfolio`… glide with the wheel's easing.
      anchors: true,

      // The case-study body, chat lists and the n8n canvas scroll themselves.
      allowNestedScroll: true,
      prevent: node => node instanceof HTMLElement && node.matches('[role="dialog"]'),

      // A modal locks the page with `body { overflow: hidden }`; native scroll
      // honours that, Lenis would not, so step aside while it is set.
      virtualScroll: () => document.body.style.overflow !== 'hidden'
    })

    instance = lenis

    // One clock: GSAP's ticker drives Lenis.
    const tick = (time: number) => lenis.raf(time * 1000)

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      instance = null
    }
  }, [])

  return null
}
