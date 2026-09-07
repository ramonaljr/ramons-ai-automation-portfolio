'use client'

import { useEffect, useRef } from 'react'

type FlowPoint = { x: number; y: number }

type FlowRoute = {
  points: FlowPoint[]
  phase: number
  speed: number
  direction: 1 | -1
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
      const reach = desktop ? 0.3 + seeded(index + 31) * 0.12 : 0.48 + seeded(index + 31) * 0.18
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
      const count = desktop ? 7 : 5

      routes = Array.from({ length: count }, (_, index) => createRoute(index, count, desktop))
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
      const lineColor = dark ? '232, 238, 247' : '42, 39, 36'
      const nodeColor = dark ? '255, 255, 255' : '42, 39, 36'
      const lineAlpha = dark ? 0.17 : 0.12

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
        ctx.fillStyle = `rgba(${nodeColor}, ${dark ? 0.92 : 0.68})`
        ctx.fillRect(-3.5, -1.5, 7, 3)
        ctx.restore()
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      const now = performance.now() * 0.001

      routes.forEach((route, index) => drawRoute(route, index, now))

      if (pointer.active && !reduced) {
        const color = dark ? '255, 255, 255' : '42, 39, 36'

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
    <div ref={wrapRef} aria-hidden='true' className={`automation-field pointer-events-none absolute inset-0 ${className}`}>
      <div ref={boxRef} className='sticky top-0 h-screen w-full overflow-hidden'>
        <canvas ref={canvasRef} className='h-full w-full' />
      </div>
    </div>
  )
}
