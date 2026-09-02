'use client'

import { useEffect, useRef } from 'react'

/**
 * The hero's petal fall, and its resolution into the constellation below.
 *
 * The page had two unrelated ambient effects stacked on top of each other: a
 * cherry-blossom video in the hero, and a link-line constellation running under
 * everything from About down. Neither referred to the other, so the blossom read
 * as wallpaper.
 *
 * This is the join. Petals drift down through the hero and, once they cross the
 * settle line in the lower third, they lerp — shape from petal to dot, colour
 * from warm rose to the constellation's ink — and begin drawing link lines to
 * their settled neighbours. By the time the hero fades into the page, the thing
 * falling has become the thing the rest of the page is drawn in.
 *
 * That transition is also the argument the section makes: organic input,
 * structured output, which is what the practice actually sells.
 *
 * Everything happens inside one canvas in the hero. Nothing is shared with
 * `ParticleField` below except the ink and the link distance, which are matched
 * deliberately so the two read as one system rather than two effects.
 */

/**
 * The two ends of the morph, as channel triples so the lerp can read them.
 * `INK` matches ParticleField's own ink exactly — that identity is the whole
 * point, since a settled petal has to be indistinguishable from a particle in
 * the field below. `PETAL` is sampled from the *graded* footage rather than the
 * raw pink, so the falling petals belong to the video as it actually renders.
 */
const PETAL = [196, 138, 118] as const
const INK_RGB = [42, 39, 36] as const
const INK = INK_RGB.join(', ')

/** Matched to ParticleField's LINK, so link density looks continuous. */
const LINK = 170
const LINK_SQ = LINK * LINK

/** Where petals begin to settle, as a fraction of canvas height. */
const SETTLE_AT = 0.58

/** How fast a petal completes its morph once past the settle line. */
const MORPH_RATE = 0.011

type Petal = {
  x: number
  y: number
  vy: number

  /** Horizontal sway is a sine over `phase`, not a velocity — petals drift. */
  phase: number
  sway: number
  spin: number
  angle: number
  r: number

  /** 0 = petal, 1 = fully settled dot. */
  t: number
}

export function PetalField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const box = boxRef.current

    if (!canvas || !box) return

    const ctx = canvas.getContext('2d', { alpha: true })

    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let raf = 0
    let running = false
    let petals: Petal[] = []

    /**
     * A petal that has finished falling respawns at the top rather than being
     * destroyed, so the population is fixed and no allocation happens per frame.
     */
    const spawn = (p: Petal, atTop: boolean) => {
      p.x = Math.random() * w
      p.y = atTop ? -20 - Math.random() * h * 0.4 : Math.random() * h
      p.vy = 0.22 + Math.random() * 0.38
      p.phase = Math.random() * Math.PI * 2
      p.sway = 0.35 + Math.random() * 0.75
      p.spin = (Math.random() - 0.5) * 0.02
      p.angle = Math.random() * Math.PI * 2
      p.r = 3.4 + Math.random() * 3.6
      p.t = 0
    }

    const resize = () => {
      const rect = box.getBoundingClientRect()

      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Sparse by design. This sits behind a headline, so it has to stay under
      // the threshold where it reads as weather.
      const count = Math.round(Math.min(64, Math.max(22, (w * h) / 21000)))

      petals = Array.from({ length: count }, () => {
        const p = {} as Petal

        spawn(p, false)

        return p
      })
    }

    /**
     * One petal: a rounded lozenge that narrows to a point at each end, drawn
     * with two quadratic curves. It flattens toward a circle as `t` rises, so
     * the same path serves both states and there is no swap to notice.
     */
    const drawPetal = (p: Petal) => {
      const settled = p.t
      const rx = p.r * (1 - settled) + 1.5 * settled
      const ry = p.r * 0.58 * (1 - settled) + 1.5 * settled

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle * (1 - settled))

      ctx.beginPath()
      ctx.moveTo(-rx, 0)
      ctx.quadraticCurveTo(0, -ry * 1.7, rx, 0)
      ctx.quadraticCurveTo(0, ry * 1.7, -rx, 0)
      ctx.closePath()

      // Colour crosses from rose to ink over the same ramp as the shape.
      const [r, g, b] = PETAL.map((c, i) => Math.round(c + (INK_RGB[i] - c) * settled))
      const alpha = 0.42 * (1 - settled) + 0.1 * settled

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.fill()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const settleY = h * SETTLE_AT

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i]

        if (!reduced) {
          // A settled dot drifts laterally like a constellation particle; a
          // falling petal sways. The handover is what sells the change of state.
          p.phase += 0.012
          p.y += p.vy * (1 - p.t * 0.82)
          p.x += Math.sin(p.phase) * p.sway * (1 - p.t) + p.t * 0.12
          p.angle += p.spin

          if (p.y > settleY && p.t < 1) p.t = Math.min(1, p.t + MORPH_RATE)
          if (p.y > h + 30 || p.x > w + 40) spawn(p, true)
        }

        // Link lines are drawn only between settled dots — the network exists
        // only where the petals have already become part of it.
        if (p.t > 0.55) {
          for (let j = i + 1; j < petals.length; j++) {
            const q = petals[j]

            if (q.t <= 0.55) continue

            const dx = p.x - q.x
            const dy = p.y - q.y
            const d2 = dx * dx + dy * dy

            if (d2 < LINK_SQ) {
              // Fade with distance, and with how far both ends have settled.
              const strength = (1 - d2 / LINK_SQ) * Math.min(p.t, q.t)

              ctx.strokeStyle = `rgba(${INK}, ${0.055 * strength})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(q.x, q.y)
              ctx.stroke()
            }
          }
        }

        drawPetal(p)
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
        // Reduced motion gets the resolved end state — dots and links, no fall.
        petals.forEach(p => {
          p.t = 1
          p.y = h * (SETTLE_AT + Math.random() * (1 - SETTLE_AT))
        })
        draw()
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0
    })

    io.observe(box)

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })

    ro.observe(box)

    const onVisibility = () => (document.hidden ? stop() : start())

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div ref={boxRef} aria-hidden='true' className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className='h-full w-full' />
    </div>
  )
}
