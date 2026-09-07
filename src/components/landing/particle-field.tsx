'use client'

import { useEffect, useRef } from 'react'

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
const LIGHT_DOT = '42, 39, 36'
const LIGHT_LINK = '42, 39, 36'
const DARK_DOT = '238, 242, 255'
const DARK_LINK = '151, 166, 214'

type P = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  depth: number
  phase: number
  twinkle: number
}

export function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const box = boxRef.current

    if (!canvas || !wrap || !box) return

    const ctx = canvas.getContext('2d', { alpha: true })

    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let dpr = 1
    let particles: P[] = []
    let raf = 0
    let running = false
    let dark = document.documentElement.classList.contains('dark')
    let pointer = { x: 0, y: 0, active: false }

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
      const count = Math.round(Math.min(195, Math.max(68, (w * h) / 8500)))

      particles = Array.from({ length: count }, () => {
        const depth = 0.35 + Math.random() * 0.65

        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25 * depth,
          vy: (Math.random() - 0.5) * 0.25 * depth,
          r: 0.65 + Math.random() * 1.65 * depth,
          depth,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.35 + Math.random() * 0.85
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const now = performance.now() * 0.001
      const dotColor = dark ? DARK_DOT : LIGHT_DOT
      const linkColor = dark ? DARK_LINK : LIGHT_LINK
      const dotAlpha = dark ? 0.58 : 0.1
      const linkAlpha = dark ? 0.17 : 0.055

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!reduced) {
          p.x += p.vx
          p.y += p.vy

          if (pointer.active) {
            const dx = p.x - pointer.x
            const dy = p.y - pointer.y
            const d2 = dx * dx + dy * dy
            const influence = 165

            if (d2 > 1 && d2 < influence * influence) {
              const distance = Math.sqrt(d2)
              const force = (1 - distance / influence) * 0.7 * p.depth

              p.x += (dx / distance) * force
              p.y += (dy / distance) * force
            }
          }

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
            const sharedDepth = Math.min(p.depth, q.depth)

            ctx.strokeStyle = `rgba(${linkColor}, ${linkAlpha * sharedDepth * (1 - d2 / LINK_SQ)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }

        const shimmer = reduced ? 0.8 : 0.58 + Math.sin(now * p.twinkle + p.phase) * 0.24

        ctx.fillStyle = `rgba(${dotColor}, ${dotAlpha * p.depth * shimmer})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        // Only the nearest stars receive a halo, keeping the field dimensional
        // without putting a blur operation on every point.
        if (dark && p.depth > 0.86) {
          ctx.fillStyle = `rgba(151, 166, 214, ${0.1 * shimmer})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 4.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Nearby stars acknowledge the pointer with temporary connections. It
      // makes the background feel responsive without turning it into a cursor
      // trail or competing with the content above it.
      if (pointer.active && !reduced) {
        particles.forEach(p => {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          const reach = 135

          if (d2 >= reach * reach) return

          ctx.strokeStyle = `rgba(${linkColor}, ${(dark ? 0.2 : 0.1) * (1 - d2 / (reach * reach))})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(pointer.x, pointer.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        })
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
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 })

    io.observe(wrap)

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })

    ro.observe(box)

    const onVisibility = () => (document.hidden ? stop() : start())

    document.addEventListener('visibilitychange', onVisibility)

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduced) return
      const rect = box.getBoundingClientRect()

      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      }
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    const themeObserver = new MutationObserver(() => {
      dark = document.documentElement.classList.contains('dark')
      if (reduced) draw()
    })

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden='true'

      // No overflow-hidden here: `overflow: hidden` turns this into a scroll
      // container, and a sticky child then sticks to *it* rather than the
      // viewport — so the canvas scrolled away and the field vanished below
      // the first screen.
      className={`galaxy-field pointer-events-none absolute inset-0 ${className}`}
    >
      {/* Sticky so one viewport of canvas covers the whole scroll range. */}
      <div ref={boxRef} className='sticky top-0 h-screen w-full overflow-hidden'>
        <canvas ref={canvasRef} className='h-full w-full' />
      </div>
    </div>
  )
}
