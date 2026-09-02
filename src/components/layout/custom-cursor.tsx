'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Utils Imports
import { isIdCardHover } from '@/lib/id-card-cursor'

/**
 * The site cursor.
 *
 * Drawn rather than loaded. It used to be two `.webp` files behind
 * `next/image`, which made a decorative flourish into a single point of
 * failure: `globals.css` hides the real cursor with
 * `html.custom-cursor-active * { cursor: none !important }`, so any request
 * that failed — a cold cache, a blocked asset, a dev server mid-recompile —
 * left the page with no pointer at all rather than a degraded one. Two divs
 * cannot 404.
 *
 * The hotspot was also wrong. The offset was carried by `-translate-x-4.75`,
 * which is not a class Tailwind generates, so it resolved to nothing — and the
 * rAF loop writes `style.transform` inline anyway, which would have beaten it.
 * The image's top-left corner therefore sat on the pointer, putting the cursor
 * you saw down and right of the point you were actually clicking. Centring is
 * now done in the transform itself, where it cannot be overridden.
 *
 * Two elements at two speeds: the dot tracks the pointer exactly, so precision
 * is never in doubt, while the ring eases in behind it. That lag is the whole
 * character of the thing — it reads as an instrument settling on a target,
 * which is the same register as the workflow canvases the site is selling.
 */

const CURSOR_INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="pointer"]'

/** How much of the remaining distance the ring closes each frame. */
const RING_EASE = 0.18

const CustomCursor = () => {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Kept in refs, never state: this updates every frame, and a re-render per
  // pointer move would be the most expensive thing on the page.
  const target = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    document.documentElement.classList.add('custom-cursor-active')

    const root = rootRef.current
    const ringEl = ringRef.current
    const dotEl = dotRef.current

    if (!root || !ringEl || !dotEl) return

    const render = () => {
      const t = target.current
      const r = ring.current

      // Reduced motion gets no lag — the ring is simply where the pointer is.
      if (reduced) {
        r.x = t.x
        r.y = t.y
      } else {
        r.x += (t.x - r.x) * RING_EASE
        r.y += (t.y - r.y) * RING_EASE
      }

      // `calc(-50%)` in the transform keeps both elements centred on the
      // hotspot regardless of their rendered size, so the ring can grow on
      // hover without drifting off the point.
      ringEl.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%)`
      dotEl.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%)`

      frame.current = requestAnimationFrame(render)
    }

    const onMove = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY }
      root.dataset.visible = 'true'

      // `closest` only exists on Elements — a pointermove whose target is the
      // document (or a synthetic event) would otherwise throw here.
      const el = event.target instanceof Element ? event.target : null
      const interactive = Boolean(el?.closest(CURSOR_INTERACTIVE_SELECTOR)) || isIdCardHover()

      root.dataset.interactive = interactive ? 'true' : 'false'
    }

    const onLeave = () => {
      root.dataset.visible = 'false'
    }

    const onDown = () => {
      root.dataset.pressed = 'true'
    }

    const onUp = () => {
      root.dataset.pressed = 'false'
    }

    frame.current = requestAnimationFrame(render)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      if (frame.current) cancelAnimationFrame(frame.current)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div ref={rootRef} data-custom-cursor data-visible='false' data-interactive='false' className='cursor-root'>
      <div ref={ringRef} className='cursor-ring' />
      <div ref={dotRef} className='cursor-dot' />
    </div>
  )
}

export default CustomCursor
