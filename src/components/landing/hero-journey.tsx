'use client'

import { type SyntheticEvent, useEffect, useRef, useState } from 'react'

/**
 * The hero's journey: mountain ranges drifting past behind the tree, under a
 * snow-capped volcano.
 *
 * The view travels as in a side-scrolling game: each range pans at a fraction
 * of a walking pace by depth. The volcano is far enough away that it holds
 * still. The scene drifts calmly on its own, and scrolling makes it move
 * faster, settling again when the page stops. It fades out as the hero
 * scrolls away.
 */

/** Width of one seamless range tile, in px; each layer repeats it twice. */
const TILE = 1800

/** Calm travelling cadence, paces per second, and the most a flick adds. */
const CADENCE = 0.85
const CADENCE_MAX = 2.1

/** Distance travelled per pace, in px; each range moves a fraction of it. */
const PACE = 80

/**
 * How fast each range moves relative to the pace. The tiles and the volcano
 * are rendered offline (lit ridged noise, seamless across a tile) and baked to
 * WebP, about 200 KB together, so they load after the page rather than with it.
 */
const RANGES = [
  { depth: 0.04, src: '/images/landing/hero-range-far.webp', className: 'journey-range-far' },
  { depth: 0.1, src: '/images/landing/hero-range-mid.webp', className: 'journey-range-mid' },
  { depth: 0.2, src: '/images/landing/hero-range-near.webp', className: 'journey-range-near' }
] as const

/**
 * The shared clock: a calm cadence that a scroll flick raises and that
 * settles back, and the fade as the hero scrolls away. Calls `frame` with
 * the seconds elapsed, the current cadence and the layer's opacity.
 */
function useJourney(frame: (dt: number, cadence: number, fade: number) => void) {
  const frameRef = useRef(frame)

  useEffect(() => {
    frameRef.current = frame
  })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Read in the scroll and resize events, never in the frame: reading
    // scrollY or innerHeight after the frame has written to the page makes
    // the browser lay the whole page out again, every frame.
    let scroll = window.scrollY
    let viewport = window.innerHeight

    // Full while the hero fills the screen, gone before the work strip.
    const fadeOf = () => Math.max(0, Math.min(1, (0.75 - scroll / viewport) / 0.45))

    const onResize = () => {
      viewport = window.innerHeight
    }

    window.addEventListener('resize', onResize)

    if (reduced) {
      frameRef.current(0, 0, fadeOf())

      const onScroll = () => {
        scroll = window.scrollY
        frameRef.current(0, 0, fadeOf())
      }

      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    }

    let raf = 0
    let last = 0
    let lastScroll = scroll
    let scrollSpeed = 0
    let boost = 0

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60

      last = now

      const speed = Math.abs(scroll - lastScroll) / Math.max(dt, 1 / 120)

      lastScroll = scroll

      // A wheel scroll arrives as a few one-frame jumps, so the speed is
      // smoothed first; the boost then rises quickly and eases back over
      // about a second once the page stops.
      scrollSpeed += (speed - scrollSpeed) * Math.min(1, dt * 6)

      const target = Math.min(1, scrollSpeed / 600)

      boost = target > boost ? boost + (target - boost) * Math.min(1, dt * 12) : boost * Math.exp(-dt * 1.2)

      const fade = fadeOf()

      if (fade > 0) {
        frameRef.current(dt, CADENCE + (CADENCE_MAX - CADENCE) * boost, fade)
        raf = requestAnimationFrame(tick)

        return
      }

      // Scrolled past the hero: hide once and sleep until it comes back
      frameRef.current(0, 0, 0)
      raf = 0
    }

    const wake = () => {
      if (raf || fadeOf() === 0) return

      last = 0
      lastScroll = scroll
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      scroll = window.scrollY
      wake()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])
}

/** Distance travelled per second at a cadence, in px. */
const travelSpeed = (cadence: number) => cadence * PACE

/** Shown once decoded, so a tile never paints in halfway down. */
const reveal = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.dataset.loaded = ''
}

/** The volcano and the mountain ranges, over the tree footage. */
export function JourneyRanges() {
  const rootRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)

  // Mounted after the page has loaded, as the video is, so the scenery never
  // competes with the hero for bandwidth; skipped when data is being saved.
  const [withScenery, setWithScenery] = useState(false)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

    if (connection?.saveData) return

    const mount = () => setWithScenery(true)

    if (document.readyState === 'complete') {
      const id = window.setTimeout(mount, 300)

      return () => window.clearTimeout(id)
    }

    window.addEventListener('load', mount, { once: true })

    return () => window.removeEventListener('load', mount)
  }, [])

  useJourney((dt, cadence, fade) => {
    const root = rootRef.current

    if (!root) return

    root.style.opacity = String(fade)

    if (!dt) return

    offset.current += travelSpeed(cadence) * dt

    root.querySelectorAll<HTMLElement>('[data-depth]').forEach(range => {
      const shift = (offset.current * Number(range.dataset.depth)) % TILE

      range.style.transform = `translate3d(${-shift}px, 0, 0)`
    })
  })

  return (
    <div ref={rootRef} aria-hidden='true' className='journey-scenery'>
      {withScenery && (
        <>
          <img
            src='/images/landing/hero-fuji.webp'
            alt=''
            width={1800}
            height={400}
            decoding='async'
            onLoad={reveal}
            className='journey-fuji'
          />

          <div className='journey-ranges'>
            {RANGES.map(range => (
              <div key={range.className} data-depth={range.depth} className={`journey-range ${range.className}`}>
                {[0, 1].map(copy => (
                  <img key={copy} src={range.src} alt='' width={TILE} height={400} decoding='async' onLoad={reveal} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
