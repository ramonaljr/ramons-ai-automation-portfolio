'use client'

import { useEffect, useRef } from 'react'

type FlowPoint = { x: number; y: number }

type FlowRoute = {
  points: FlowPoint[]
  phase: number
  speed: number
  direction: 1 | -1
}

type AmbientShard = {
  x: number
  y: number
  phase: number
  speed: number
  sway: number
  size: number
  spin: number
  tone: number
}

/**
 * A restrained automation-flow backdrop for the lower page.
 *
 * Short routed circuits live mainly in the outer thirds of the viewport, so
 * the animation supports the content instead of drawing a web over it. Data
 * packets move through the routes, junctions respond gently to the pointer,
 * and the whole field shifts at a slower rate than the page scroll.
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
    let routes: FlowRoute[] = []
    let shards: AmbientShard[] = []
    let raf = 0
    let running = false
    let dark = detectDark()
    let pointer = { x: 0, y: 0, active: false }

    const seeded = (seed: number) => {
      const value = Math.sin(seed * 91.733) * 43758.5453

      return value - Math.floor(value)
    }

    const createRoute = (index: number, count: number, desktop: boolean): FlowRoute => {
      const fromLeft = index % 2 === 0
      const baseY = ((index + 0.7) / count) * h
      const verticalRange = desktop ? 72 : 48
      const y1 = baseY + (seeded(index + 2) - 0.5) * verticalRange
      const y2 = y1 + (seeded(index + 12) - 0.5) * verticalRange
      const y3 = y2 + (seeded(index + 24) - 0.5) * verticalRange
      const reach = desktop ? 0.48 + seeded(index + 31) * 0.08 : 0.68 + seeded(index + 31) * 0.16
      const insetA = desktop ? 0.07 + seeded(index + 42) * 0.05 : 0.12
      const insetB = desktop ? 0.2 + seeded(index + 53) * 0.06 : 0.3

      const normalized = [
        { x: -0.03, y: y1 },
        { x: insetA, y: y1 },
        { x: insetA, y: y2 },
        { x: insetB, y: y2 },
        { x: insetB, y: y3 },
        { x: reach, y: y3 }
      ]

      const points = normalized.map(point => ({
        x: (fromLeft ? point.x : 1 - point.x) * w,
        y: point.y
      }))

      return {
        points,
        phase: seeded(index + 70),
        speed: 0.035 + seeded(index + 81) * 0.024,
        direction: fromLeft ? 1 : -1
      }
    }

    const resize = () => {
      const rect = box.getBoundingClientRect()

      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))

      const dpr = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1))

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const desktop = w >= 1024
      const count = desktop ? 10 : 7
      // Keep enough leaves in-frame for the drift to read as intentional
      // atmosphere, even through the translucent section veils.
      const shardCount = desktop ? 108 : 64

      routes = Array.from({ length: count }, (_, index) => createRoute(index, count, desktop))
      shards = Array.from({ length: shardCount }, (_, index) => ({
        x: seeded(index + 211) * w,
        y: seeded(index + 337) * (h + 120) - 60,
        phase: seeded(index + 419) * Math.PI * 2,
        speed: 8 + seeded(index + 503) * 11,
        sway: 10 + seeded(index + 607) * (desktop ? 34 : 22),
        size: 5 + seeded(index + 701) * 5.5,
        spin: (seeded(index + 809) - 0.5) * 0.72,
        tone: seeded(index + 907)
      }))
    }

    const drawAmbientShard = (shard: AmbientShard, index: number, now: number) => {
      const travel = reduced ? 0 : now * shard.speed
      const y = ((shard.y + travel + window.scrollY * (0.018 + (index % 3) * 0.006) + 60) % (h + 120)) - 60
      const x = shard.x + Math.sin(now * 0.42 + shard.phase) * shard.sway
      const rotation = shard.phase + (reduced ? 0 : now * shard.spin)
      const alpha = 0.52 + shard.tone * 0.2
      const red = Math.round(151 + shard.tone * 38)
      const green = Math.round(72 + shard.tone * 43)
      const blue = Math.round(39 + shard.tone * 27)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(-shard.size * 1.7, 0)
      ctx.quadraticCurveTo(0, -shard.size * 1.15, shard.size * 1.7, 0)
      ctx.quadraticCurveTo(0, shard.size * 1.15, -shard.size * 1.7, 0)
      ctx.closePath()
      ctx.fillStyle = dark
        ? `rgba(224, 143, 92, ${alpha * 0.78})`
        : `rgba(${red}, ${green}, ${blue}, ${alpha})`
      ctx.fill()
      ctx.strokeStyle = dark
        ? `rgba(255, 211, 169, ${alpha * 0.66})`
        : `rgba(103, 54, 31, ${alpha * 0.78})`
      ctx.lineWidth = 0.65
      ctx.stroke()
      ctx.restore()
    }

    const pointForFrame = (point: FlowPoint, routeIndex: number): FlowPoint => {
      const scrollShift = reduced ? 0 : (window.scrollY * (routeIndex % 2 === 0 ? 0.012 : -0.009)) % 54
      let x = point.x
      let y = point.y + scrollShift

      if (pointer.active && !reduced) {
        const dx = pointer.x - x
        const dy = pointer.y - y
        const distance = Math.hypot(dx, dy)
        const reach = 230

        if (distance < reach) {
          const pull = (1 - distance / reach) * 0.045

          x += dx * pull
          y += dy * pull
        }
      }

      return { x, y }
    }

    const pointAlongRoute = (points: FlowPoint[], progress: number) => {
      const lengths: number[] = []
      let total = 0

      for (let i = 1; i < points.length; i++) {
        const length = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)

        lengths.push(length)
        total += length
      }

      let target = progress * total

      for (let i = 0; i < lengths.length; i++) {
        if (target <= lengths[i]) {
          const start = points[i]
          const end = points[i + 1]
          const amount = lengths[i] === 0 ? 0 : target / lengths[i]

          return {
            x: start.x + (end.x - start.x) * amount,
            y: start.y + (end.y - start.y) * amount,
            angle: Math.atan2(end.y - start.y, end.x - start.x)
          }
        }

        target -= lengths[i]
      }

      const last = points.at(-1) ?? { x: 0, y: 0 }

      return { ...last, angle: 0 }
    }

    const drawRoute = (route: FlowRoute, routeIndex: number, now: number) => {
      const points = route.points.map(point => pointForFrame(point, routeIndex))
      const lineColor = dark ? '232, 238, 247' : '132, 82, 62'
      const nodeColor = dark ? '255, 255, 255' : '126, 67, 51'
      const lineAlpha = dark ? 0.17 : 0.14

      ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`
      ctx.lineWidth = 1
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)

      ctx.stroke()

      for (let i = 1; i < points.length - 1; i++) {
        const point = points[i]

        ctx.fillStyle = `rgba(${nodeColor}, ${dark ? 0.62 : 0.42})`
        ctx.beginPath()
        ctx.arc(point.x, point.y, 1.35, 0, Math.PI * 2)
        ctx.fill()

        if ((i + routeIndex) % 2 === 0) {
          ctx.strokeStyle = `rgba(${lineColor}, ${dark ? 0.18 : 0.12})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.arc(point.x, point.y, 4.6, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      const packetCount = routeIndex % 3 === 0 ? 2 : 1

      for (let packet = 0; packet < packetCount; packet++) {
        const base = reduced ? route.phase : route.phase + now * route.speed + packet / packetCount
        const progress = ((base % 1) + 1) % 1
        const position = pointAlongRoute(points, route.direction === 1 ? progress : 1 - progress)

        ctx.save()
        ctx.translate(position.x, position.y)
        ctx.rotate(position.angle)
        ctx.fillStyle = `rgba(${nodeColor}, ${dark ? 0.92 : 0.78})`
        ctx.fillRect(-3.5, -1.5, 7, 3)
        ctx.restore()
      }
    }

    const drawHeroHandoff = (now: number) => {
      const journey = Math.max(0, -wrap.getBoundingClientRect().top)
      const visibility = Math.max(0, Math.min(1, 1 - journey / (h * 0.72)))

      if (visibility <= 0) return

      ;[-1, 1].forEach((side, index) => {
        const entryX = side === -1 ? w * 0.12 : w * 0.88
        const innerX = side === -1 ? w * 0.22 : w * 0.78

        const points = [
          { x: entryX, y: -8 },
          { x: entryX, y: 54 },
          { x: innerX, y: 54 },
          { x: innerX, y: 96 }
        ]

        ctx.strokeStyle = dark
          ? `rgba(235, 240, 248, ${0.22 * visibility})`
          : `rgba(132, 82, 62, ${0.16 * visibility})`
        ctx.lineWidth = 0.9
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)

        ctx.stroke()

        ctx.fillStyle = dark
          ? `rgba(255, 255, 255, ${0.68 * visibility})`
          : `rgba(126, 67, 51, ${0.52 * visibility})`
        ctx.beginPath()
        ctx.arc(innerX, 54, 1.5, 0, Math.PI * 2)
        ctx.fill()

        const progress = ((now * 0.09 + index * 0.46) % 1 + 1) % 1
        const packet = pointAlongRoute(points, progress)
        const red = dark ? Math.round(244 + 11 * progress) : Math.round(150 + 42 * progress)
        const green = dark ? Math.round(114 + 141 * progress) : Math.round(73 + 54 * progress)
        const blue = dark ? Math.round(152 + 103 * progress) : Math.round(58 + 42 * progress)

        ctx.save()
        ctx.translate(packet.x, packet.y)
        ctx.rotate(packet.angle)
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.9 * visibility})`
        ctx.fillRect(-3.5, -1.45, 7, 2.9)
        ctx.restore()
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const now = performance.now() * 0.001

      shards.forEach((shard, index) => drawAmbientShard(shard, index, now))
      drawHeroHandoff(now)
      routes.forEach((route, index) => drawRoute(route, index, now))

      if (pointer.active && !reduced) {
        const color = dark ? '255, 255, 255' : '126, 67, 51'

        ctx.strokeStyle = `rgba(${color}, ${dark ? 0.2 : 0.13})`
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 13, 0, Math.PI * 2)
        ctx.stroke()
      }

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

    const onThemeChange = () => {
      dark = detectDark()
      if (reduced) draw()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    const themeObserver = new MutationObserver(onThemeChange)

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      wrap.classList.remove('is-canvas-ready')
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden='true'
      data-motion-story='petal-to-packet'
      className={`automation-field pointer-events-none absolute inset-0 ${className}`}
    >
      <div ref={boxRef} className='sticky top-0 h-screen w-full overflow-hidden'>
        <canvas ref={canvasRef} className='h-full w-full' />
      </div>
    </div>
  )
}
