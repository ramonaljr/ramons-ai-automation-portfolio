'use client'

import { useEffect, useRef } from 'react'

/** The hero owns one visual language: the blossom video and drifting petals. */
const PETAL = [244, 114, 152] as const

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
    let dark = document.documentElement.classList.contains('dark')
    let pointer = { x: 0, y: 0, active: false }

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

    /** One petal: a rounded lozenge that narrows to a point at each end. */
    const drawPetal = (p: Petal) => {
      const rx = p.r
      const ry = p.r * 0.58

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)

      ctx.beginPath()
      ctx.moveTo(-rx, 0)
      ctx.quadraticCurveTo(0, -ry * 1.7, rx, 0)
      ctx.quadraticCurveTo(0, ry * 1.7, -rx, 0)
      ctx.closePath()

      ctx.fillStyle = `rgba(${PETAL.join(', ')}, ${dark ? 0.68 : 0.58})`
      ctx.fill()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i]

        if (!reduced) {
          p.phase += 0.012
          p.y += p.vy
          p.x += Math.sin(p.phase) * p.sway
          p.angle += p.spin

          if (pointer.active) {
            const dx = p.x - pointer.x
            const dy = p.y - pointer.y
            const d2 = dx * dx + dy * dy
            const breeze = 150

            if (d2 > 1 && d2 < breeze * breeze) {
              const distance = Math.sqrt(d2)
              const force = (1 - distance / breeze) * 1.15

              p.x += (dx / distance) * force
              p.y += (dy / distance) * force * 0.35
              p.angle += force * 0.012
            }
          }

          if (p.y > h + 30 || p.x > w + 40) spawn(p, true)
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
        // Reduced motion gets a single still frame of blossom petals.
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
    <div ref={boxRef} aria-hidden='true' className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className='h-full w-full' />
    </div>
  )
}
