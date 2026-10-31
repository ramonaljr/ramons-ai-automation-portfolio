'use client'

import { useEffect, useRef } from 'react'

import { leafEdge, leafTone, type Rgb } from '@/lib/autumn-leaves'

/** Leaves fade over this many px as they near the hero copy, after a margin. */
const CLEAR_MARGIN = 16
const CLEAR_FADE = 80

/** Sprites are drawn once at this length (px) and scaled down per leaf. */
const SPRITE_LENGTH = 72

/** How far past the edges a leaf travels before it wraps round. */
const WRAP = 48

/**
 * Three depths of leaf. Far ones are small, slow and faint and barely move
 * with the page; near ones are large, quick, soft-focus and few, and slide
 * with the scroll the most, so the field reads as depth rather than a flat
 * pattern. `wind` is how strongly a gust carries each depth.
 */
const LAYERS = [
  { count: [10, 28], size: [4.6, 6.4], fall: [7, 12], alpha: [0.4, 0.5], parallax: 0.04, wind: 0.45, blur: 0 },
  { count: [8, 18], size: [8.5, 12], fall: [14, 22], alpha: [0.58, 0.72], parallax: 0.1, wind: 0.75, blur: 0 },
  { count: [3, 6], size: [18, 24], fall: [30, 42], alpha: [0.5, 0.62], parallax: 0.22, wind: 1.2, blur: 2.6 }
] as const

/** A gust every 6-11 s: up over 1.2 s, a short hold, then 2.5 s to die away. */
const GUST_GAP = [6, 11] as const
const GUST_RISE = 1.2
const GUST_HOLD = 0.5
const GUST_FALL = 2.5
const GUST_SPEED = 70

type Shape = 'maple' | 'ovate'

type Leaf = {
  layer: number
  x: number
  y: number
  size: number
  fall: number
  alpha: number
  drift: number
  sway: number
  swayRate: number
  phase: number
  rot: number
  spinRate: number
  flip: number
  flipRate: number

  /** Which way the scroll stir throws this leaf. */
  scatter: number
  front: HTMLCanvasElement
  back: HTMLCanvasElement
}

/** Traces a leaf pointing up, tip at -len/2, stem below the base. */
function traceLeaf(ctx: CanvasRenderingContext2D, shape: Shape, len: number) {
  const r = len / 2

  ctx.beginPath()

  if (shape === 'ovate') {
    // Elm or birch: pointed tip, full rounded base.
    ctx.moveTo(0, -r)
    ctx.bezierCurveTo(r * 0.52, -r * 0.55, r * 0.62, r * 0.28, 0, r * 0.7)
    ctx.bezierCurveTo(-r * 0.62, r * 0.28, -r * 0.52, -r * 0.55, 0, -r)
    ctx.closePath()

    return
  }

  // Maple: the right half as [angle from straight up, radius], tip to stem,
  // with a tooth on each upper lobe; the left half mirrors it.
  const half = [
    [0, 1],
    [14, 0.62],
    [22, 0.66],
    [30, 0.5],
    [54, 0.9],
    [66, 0.66],
    [74, 0.68],
    [90, 0.46],
    [118, 0.66],
    [134, 0.48],
    [168, 0.2]
  ] as const

  const points = [
    ...half,
    [180, 0.16] as const,
    ...half
      .slice(1)
      .reverse()
      .map(([deg, k]) => [-deg, k] as const)
  ]

  points.forEach(([deg, k], i) => {
    const a = ((deg - 90) * Math.PI) / 180
    const x = Math.cos(a) * r * k
    const y = (Math.sin(a) * k + 0.15) * r * 1.06

    if (i) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  })

  ctx.closePath()
}

/**
 * Falling leaves behind the page.
 *
 * This used to draw routed "automation circuits" too: hairlines with square
 * junctions and moving packets, plus a ring that followed the pointer. They
 * were decoration rather than content, so the Taste-skill pass removed them
 * (2026-10-20). The leaves stay: they are the autumn scene the hero and the
 * background video belong to.
 *
 * Each leaf is simulated rather than computed from the clock, so wind can
 * act on it: a gust sweeps the field sideways every few seconds, and a fast
 * scroll stirs the leaves, which settle again when the page stops.
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
    let dpr = 1
    let leaves: Leaf[] = []
    let raf = 0
    let running = false
    let dark = detectDark()

    const seeded = (seed: number) => {
      const value = Math.sin(seed * 91.733) * 43758.5453

      return value - Math.floor(value)
    }

    const between = ([lo, hi]: readonly [number, number], roll: number) => lo + (hi - lo) * roll

    // Safari draws canvas filters as a no-op; there the soft focus comes
    // from a shadow cast back onto the canvas instead.
    const filterWorks = (() => {
      const probe = document.createElement('canvas').getContext('2d')

      if (!probe) return false
      probe.filter = 'blur(1px)'

      return probe.filter === 'blur(1px)'
    })()

    const sprites = new Map<string, HTMLCanvasElement>()

    /** One leaf face, drawn once and reused by every leaf that matches it. */
    const sprite = (shape: Shape, color: Rgb, blur: number, back: boolean) => {
      const key = `${shape}|${color.join(',')}|${blur}|${back}`
      const cached = sprites.get(key)

      if (cached) return cached

      // Blur is set in screen pixels for a near leaf, which draws about 63px
      // long; the sprite is larger, so the blur scales up with it.
      const scale = SPRITE_LENGTH / 63
      const pad = Math.ceil(blur * scale * 3) + 4
      const size = SPRITE_LENGTH + pad * 2
      const face = document.createElement('canvas')

      face.width = size
      face.height = size

      const g = face.getContext('2d')

      if (!g) return face

      // The underside is paler and flatter, so a turning leaf flickers.
      const tint: Rgb = back
        ? [
            Math.round(color[0] + (236 - color[0]) * 0.32),
            Math.round(color[1] + (222 - color[1]) * 0.32),
            Math.round(color[2] + (200 - color[2]) * 0.32)
          ]
        : color

      const edge = leafEdge(tint)
      const r = SPRITE_LENGTH / 2

      g.translate(size / 2, size / 2)

      const paint = () => {
        // Stem.
        g.beginPath()
        g.moveTo(0, r * (shape === 'ovate' ? 0.66 : 0.3))
        g.quadraticCurveTo(r * 0.04, r * 0.82, -r * 0.03, r)
        g.strokeStyle = `rgb(${edge.join(',')})`
        g.lineWidth = 2.2
        g.lineCap = 'round'
        g.stroke()

        g.lineJoin = 'round'
        traceLeaf(g, shape, SPRITE_LENGTH)

        const shade = g.createLinearGradient(-r, -r, r, r)

        shade.addColorStop(0, `rgb(${tint.map(c => Math.min(255, c + 26)).join(',')})`)
        shade.addColorStop(1, `rgb(${tint.map(c => Math.round(c * 0.82)).join(',')})`)
        g.fillStyle = shade
        g.fill()
        g.strokeStyle = `rgba(${edge.join(',')}, 0.7)`
        g.lineWidth = 1.6
        g.stroke()

        // Midrib and a few veins, faint.
        g.beginPath()
        g.moveTo(0, r * (shape === 'ovate' ? 0.66 : 0.3))
        g.lineTo(0, -r * 0.86)

        const veins = shape === 'ovate' ? [-0.4, -0.05, 0.3] : [0.05]

        for (const v of veins) {
          g.moveTo(0, r * v)
          g.lineTo(r * 0.36, r * (v - 0.28))
          g.moveTo(0, r * v)
          g.lineTo(-r * 0.36, r * (v - 0.28))
        }

        if (shape === 'maple') {
          for (const deg of [54, -54, 118, -118]) {
            const a = ((deg - 90) * Math.PI) / 180

            g.moveTo(0, r * 0.12)
            g.lineTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62 + r * 0.12)
          }
        }

        g.strokeStyle = `rgba(${edge.join(',')}, ${back ? 0.32 : 0.45})`
        g.lineWidth = 1.1
        g.stroke()
      }

      if (!blur) paint()
      else if (filterWorks) {
        g.filter = `blur(${blur * scale}px)`
        paint()
      } else {
        // The shape is drawn off the sprite and only its blurred shadow lands.
        const offset = size * 2

        g.shadowColor = `rgb(${tint.join(',')})`
        g.shadowBlur = blur * scale * 2
        g.shadowOffsetX = offset
        g.translate(-offset, 0)
        traceLeaf(g, shape, SPRITE_LENGTH)
        g.fillStyle = '#000'
        g.fill()
      }

      sprites.set(key, face)

      return face
    }

    const resize = () => {
      const rect = box.getBoundingClientRect()

      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))

      // The device's own density, capped. Forcing 1.5x on 1x screens drew
      // more than twice the pixels anyone could see, every frame.
      dpr = Math.min(1.5, window.devicePixelRatio || 1)

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const desktop = w >= 1024
      let seed = 0

      leaves = LAYERS.flatMap((layer, depth) =>
        Array.from({ length: layer.count[desktop ? 1 : 0] }, () => {
          const roll = (n: number) => seeded(++seed * 7 + n)
          const color = leafTone(roll(1))

          // Reds lean maple and golds lean elm, as they would under real trees.
          // Far leaves are always elm: at that size a maple reads as a star.
          const mapleOdds = color[0] > 170 && color[1] < 100 ? 0.75 : color[1] > 140 ? 0.3 : 0.5
          const shape: Shape = depth && roll(2) < mapleOdds ? 'maple' : 'ovate'

          return {
            layer: depth,
            x: roll(3) * w,
            y: roll(4) * (h + WRAP * 2) - WRAP,
            size: between(layer.size, roll(5)),
            fall: between(layer.fall, roll(6)),
            alpha: between(layer.alpha, roll(7)),
            drift: (roll(8) - 0.5) * 6,
            sway: (8 + roll(9) * (desktop ? 26 : 16)) * (0.6 + depth * 0.3),
            swayRate: 0.3 + roll(10) * 0.35,
            phase: roll(11) * Math.PI * 2,
            rot: roll(12) * Math.PI * 2,
            spinRate: (roll(13) - 0.5) * 0.9,
            flip: roll(14) * Math.PI * 2,
            flipRate: 0.5 + roll(15) * 1.1,
            scatter: roll(16) < 0.5 ? -1 : 1,
            front: sprite(shape, color, layer.blur, false),
            back: sprite(shape, color, layer.blur, true)
          }
        })
      )
    }

    // The hero's headline and lead. A leaf drifting through a letter made the
    // first line harder to read, so leaves fade out as they near this copy.
    const clearOf = [...document.querySelectorAll<HTMLElement>('[data-leaf-clear]')]

    /** 0 inside the copy (plus a margin), rising to 1 a short way outside it. */
    const clearance = (x: number, y: number, rects: DOMRect[]) => {
      let nearest = Infinity

      for (const r of rects) {
        const dx = Math.max(r.left - CLEAR_MARGIN - x, 0, x - r.right - CLEAR_MARGIN)
        const dy = Math.max(r.top - CLEAR_MARGIN - y, 0, y - r.bottom - CLEAR_MARGIN)

        nearest = Math.min(nearest, Math.hypot(dx, dy))
      }

      return Math.min(1, nearest / CLEAR_FADE)
    }

    // ── Wind ────────────────────────────────────────────────────────────────

    let clock = 0
    let gustAt = between(GUST_GAP, Math.random()) * 0.5
    let gustDir = 1
    let gustPower = 1
    let lastScroll = window.scrollY

    /** Smoothed scroll speed, px/s, and the stir it raises (0-1). */
    let scrollSpeed = 0
    let stir = 0

    /** 0-1: how hard the current gust is blowing. */
    const gust = () => {
      const t = clock - gustAt

      if (t < 0 || t > GUST_RISE + GUST_HOLD + GUST_FALL) return 0

      const ease = (k: number) => k * k * (3 - 2 * k)

      if (t < GUST_RISE) return ease(t / GUST_RISE) * gustPower
      if (t < GUST_RISE + GUST_HOLD) return gustPower

      return ease(1 - (t - GUST_RISE - GUST_HOLD) / GUST_FALL) * gustPower
    }

    const step = (dt: number) => {
      clock += dt

      if (clock - gustAt > GUST_RISE + GUST_HOLD + GUST_FALL) {
        gustAt = clock + between(GUST_GAP, Math.random())

        // Mostly from the left, now and then back the other way.
        gustDir = Math.random() < 0.75 ? 1 : -1
        gustPower = 0.65 + Math.random() * 0.35
      }

      const scroll = window.scrollY

      // A jump (an anchor link) is not a flick; only ordinary scrolling stirs.
      const moved = Math.max(-600, Math.min(600, scroll - lastScroll))

      lastScroll = scroll
      scrollSpeed += (Math.abs(moved) / Math.max(dt, 1 / 120) - scrollSpeed) * Math.min(1, dt * 8)

      // Rises quickly with a flick, settles over a second or so.
      const target = Math.min(1, Math.max(0, (scrollSpeed - 300) / 2400))

      stir = target > stir ? stir + (target - stir) * Math.min(1, dt * 10) : stir * Math.exp(-dt * 1.6)

      const g = gust()
      const breeze = 5 + g * GUST_SPEED * gustDir
      const span = h + WRAP * 2
      const across = w + WRAP * 2

      for (const leaf of leaves) {
        const layer = LAYERS[leaf.layer]

        leaf.x += (breeze * layer.wind + leaf.drift + stir * leaf.scatter * 90 * layer.wind) * dt

        // Gusts lift a little; the page sliding past moves near leaves most.
        leaf.y += leaf.fall * (1 - g * 0.18) * dt - moved * layer.parallax
        leaf.rot += leaf.spinRate * (1 + g * 2.2 + stir * 3) * dt
        leaf.flip += leaf.flipRate * (1 + g * 1.6 + stir * 2.6) * dt

        if (leaf.y > h + WRAP) leaf.y -= span
        else if (leaf.y < -WRAP) leaf.y += span

        if (leaf.x > w + WRAP) leaf.x -= across
        else if (leaf.x < -WRAP) leaf.x += across
      }
    }

    // ── Drawing ─────────────────────────────────────────────────────────────

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const origin = box.getBoundingClientRect()

      // Only the copy still on screen; past the hero this is empty and every
      // leaf draws at full strength.
      const rects = clearOf.map(el => el.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < origin.bottom)

      for (const leaf of leaves) {
        const x = leaf.x + Math.sin(clock * leaf.swayRate + leaf.phase) * leaf.sway
        const fade = rects.length ? clearance(origin.left + x, origin.top + leaf.y, rects) : 1

        if (fade <= 0) continue

        const turn = Math.cos(leaf.flip)
        const face = turn >= 0 ? leaf.front : leaf.back

        // Edge-on, a leaf is a sliver; keep a hairline so it never vanishes.
        const squash = Math.sign(turn || 1) * Math.max(0.08, Math.abs(turn))
        const scale = (leaf.size * 3) / SPRITE_LENGTH
        const cos = Math.cos(leaf.rot) * scale
        const sin = Math.sin(leaf.rot) * scale

        ctx.globalAlpha = leaf.alpha * fade * (0.62 + 0.38 * Math.abs(turn)) * (dark ? 0.86 : 1)

        // translate(x, y) · rotate(rot) · scale(1, squash), at device density.
        ctx.setTransform(dpr * cos, dpr * sin, dpr * -sin * squash, dpr * cos * squash, dpr * x, dpr * leaf.y)
        ctx.drawImage(face, -face.width / 2, -face.height / 2)
      }

      ctx.globalAlpha = 1
      wrap.classList.add('is-canvas-ready')
    }

    let last = 0

    const tick = (now: number) => {
      // Capped, so a frame after a stall does not throw every leaf at once.
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60

      last = now
      step(dt)
      draw()
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      last = 0
      lastScroll = window.scrollY

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
        {/* A slow drifting glow for the quiet middle of the homepage (shown
            only in its calm scene; see globals.css). */}
        <div className='field-aura'>
          <i />
          <i />
          <i />
        </div>
        <canvas ref={canvasRef} className='relative h-full w-full' />
      </div>
    </div>
  )
}
