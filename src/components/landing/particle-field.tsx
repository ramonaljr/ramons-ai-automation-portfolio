"use client"

import { useEffect, useRef } from "react"

/**
 * Constellation backdrop for the lower half of the page.
 *
 * Written directly against canvas rather than pulling particles.js from a CDN:
 * that library is unmaintained (last release 2015), ships ~25KB over the wire
 * on every visit, and its `onclick: push` mode grows the particle count without
 * bound. This does the same job with no network request and a fixed budget.
 *
 * Three things keep it cheap:
 *  - The canvas is viewport-sized and sticky, so covering a ~10,000px region
 *    costs one screen of pixels rather than a 56MB backing store.
 *  - The loop stops entirely when the section is off-screen or the tab is
 *    hidden, so it burns nothing while you are reading the hero.
 *  - Link lines are found with a single triangular pass, and the alpha is
 *    derived from distance without a sqrt in the inner comparison.
 */

const INK = "42, 39, 36"

/**
 * Backdrop weights, kept in the same register as the rest of the page.
 *
 * These started at 0.40 / 0.30, which is where the field became a legibility
 * problem: section rules on this page are `black/0.06` and tag chips are
 * `black/0.04`, so the constellation was painting roughly ten times heavier
 * than any other background element and reading as foreground. Particles also
 * clump as they random-walk, and those clusters landed on body copy as dense
 * webs of lines that broke up word shapes.
 */
const DOT_ALPHA = 0.10
const LINK_ALPHA = 0.055

type P = { x: number; y: number; vx: number; vy: number; r: number }

export function ParticleField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const box = boxRef.current

    if (!canvas || !wrap || !box) return

    const ctx = canvas.getContext("2d", { alpha: true })

    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0
    let h = 0
    let dpr = 1
    let particles: P[] = []
    let raf = 0
    let running = false

    const LINK = 170
    const LINK_SQ = LINK * LINK

    const resize = () => {
      // Measure the sticky box, not the canvas and not the wrapper.
      //   - `wrap` spans the whole section range (~11,000px) and would
      //     allocate a backing store that large.
      //   - `canvas` is wrong in a subtler way: resize() writes an inline
      //     width onto it, so measuring it feeds its own output back in and
      //     the canvas ratchets wider on every observation.
      const rect = box.getBoundingClientRect()

      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))

      // Cap DPR at 2 — beyond that the cost quadruples for no visible gain.
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Density by area, clamped so a 4K display does not melt.
      const count = Math.round(Math.min(160, Math.max(50, (w * h) / 10500)))

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.1 + Math.random() * 1.9,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
        }

        // Triangular pass: each pair is considered once, not twice.
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d2 = dx * dx + dy * dy

          if (d2 < LINK_SQ) {
            ctx.strokeStyle = `rgba(${INK}, ${LINK_ALPHA * (1 - d2 / LINK_SQ)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }

        ctx.fillStyle = `rgba(${INK}, ${DOT_ALPHA})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const tick = () => {
      draw()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true

      if (reduced) {
        draw() // one static frame, no loop
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()

    // Only run while the section is actually on screen.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 }
    )

    io.observe(wrap)

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })

    ro.observe(box)

    const onVisibility = () => (document.hidden ? stop() : start())

    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"

      // No overflow-hidden here: `overflow: hidden` turns this into a scroll
      // container, and a sticky child then sticks to *it* rather than the
      // viewport — so the canvas scrolled away and the field vanished below
      // the first screen.
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {/* Sticky so one viewport of canvas covers the whole scroll range. */}
      <div ref={boxRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  )
}
