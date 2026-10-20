'use client'

import { useEffect, useRef } from 'react'

import { leafEdge, leafTone, type Rgb } from '@/lib/autumn-leaves'

type AmbientShard = {
  x: number
  y: number
  phase: number
  speed: number
  sway: number
  size: number
  spin: number
  tone: number
  color: Rgb
}

/**
 * Falling leaves behind the page.
 *
 * This used to draw routed "automation circuits" too: hairlines with square
 * junctions and moving packets, plus a ring that followed the pointer. They
 * were decoration rather than content, so the Taste-skill pass removed them
 * (2026-10-20). The leaves stay: they are the autumn scene the hero and the
 * background video belong to.
 */
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
    const detectDark = () => canvas.closest('.dark') !== null || document.documentElement.classList.contains('dark')

    let w = 0
    let h = 0
    let shards: AmbientShard[] = []
    let raf = 0
    let running = false
    let dark = detectDark()

    const seeded = (seed: number) => {
      const value = Math.sin(seed * 91.733) * 43758.5453

      return value - Math.floor(value)
    }

    const resize = () => {
      const rect = box.getBoundingClientRect()

      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))

      // The device's own density, capped. Forcing 1.5x on 1x screens drew
      // more than twice the pixels anyone could see, every frame.
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const desktop = w >= 1024

      // Keep enough leaves in-frame for the drift to read as intentional
      // atmosphere, even through the translucent section veils.
      const shardCount = desktop ? 64 : 26

      shards = Array.from({ length: shardCount }, (_, index) => ({
        x: seeded(index + 211) * w,
        y: seeded(index + 337) * (h + 120) - 60,
        phase: seeded(index + 419) * Math.PI * 2,
        speed: 8 + seeded(index + 503) * 11,
        sway: 10 + seeded(index + 607) * (desktop ? 34 : 22),
        size: 5 + seeded(index + 701) * 5.5,
        spin: (seeded(index + 809) - 0.5) * 0.72,
        tone: seeded(index + 907),
        color: leafTone(seeded(index + 1009))
      }))
    }

    const drawAmbientShard = (shard: AmbientShard, index: number, now: number) => {
      const travel = reduced ? 0 : now * shard.speed
      const y = ((shard.y + travel + window.scrollY * (0.018 + (index % 3) * 0.006) + 60) % (h + 120)) - 60
      const x = shard.x + Math.sin(now * 0.42 + shard.phase) * shard.sway
      const rotation = shard.phase + (reduced ? 0 : now * shard.spin)

      // Faint: leaves drift behind body copy for most of the page, and at
      // 0.52-0.72 they competed with it.
      const alpha = 0.4 + shard.tone * 0.18
      const edge = leafEdge(shard.color)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(-shard.size * 1.7, 0)
      ctx.quadraticCurveTo(0, -shard.size * 1.15, shard.size * 1.7, 0)
      ctx.quadraticCurveTo(0, shard.size * 1.15, -shard.size * 1.7, 0)
      ctx.closePath()
      ctx.fillStyle = `rgba(${shard.color.join(', ')}, ${dark ? alpha * 0.86 : alpha})`
      ctx.fill()
      ctx.strokeStyle = `rgba(${edge.join(', ')}, ${alpha * 0.78})`
      ctx.lineWidth = 0.65
      ctx.stroke()
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const now = performance.now() * 0.001

      shards.forEach((shard, index) => drawAmbientShard(shard, index, now))

      wrap.classList.add('is-canvas-ready')
    }

    const tick = () => {
      draw()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true

      if (reduced) draw()
      else raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 })

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw()
    })

    io.observe(wrap)
    ro.observe(box)

    const onVisibility = () => (document.hidden ? stop() : start())

    const onThemeChange = () => {
      dark = detectDark()
      if (reduced) draw()
    }

    document.addEventListener('visibilitychange', onVisibility)

    const themeObserver = new MutationObserver(onThemeChange)

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      wrap.classList.remove('is-canvas-ready')
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden='true'
      data-motion-story='falling-leaves'
      className={`automation-field pointer-events-none absolute inset-0 ${className}`}
    >
      <div ref={boxRef} className='sticky top-0 h-screen w-full overflow-hidden'>
        <canvas ref={canvasRef} className='h-full w-full' />
      </div>
    </div>
  )
}
