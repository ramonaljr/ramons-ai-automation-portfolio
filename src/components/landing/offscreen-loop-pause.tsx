'use client'

import { useEffect } from 'react'

/**
 * How far past the viewport a section still counts as on screen, so its loops
 * are already running by the time it scrolls into view.
 */
const MARGIN = '200px 0px'

/**
 * Holds the CSS loops of every section that is off screen.
 *
 * The page runs about fifty infinite CSS animations (the service flow, the
 * process explorer, the marquees, the footer clock), and they all kept
 * painting while scrolled away: 45 of 71 were running off screen at load.
 * This flags each landing section with `data-offscreen` while it is out of
 * view, and globals.css sets `animation-play-state: paused` under the flag.
 * Pausing rather than removing the animation means a loop resumes from the
 * frame it stopped on, with no restart jump.
 *
 * GSAP and motion/react are not affected; they run on their own clocks and
 * already gate on scroll position.
 */
export function OffscreenLoopPause() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.blossom-story-root section, .blossom-story-root footer')

    if (!sections.length) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
      },
      { rootMargin: MARGIN }
    )

    for (const section of sections) observer.observe(section)

    return () => {
      observer.disconnect()

      for (const section of sections) section.removeAttribute('data-offscreen')
    }
  }, [])

  return null
}
