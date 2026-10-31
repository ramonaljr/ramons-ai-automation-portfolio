'use client'

import { useEffect, useRef } from 'react'

/**
 * The hero's journey: a figure walking along the foot of the hero while
 * mountain ranges drift past behind the tree.
 *
 * The walker stays in place and the world moves, as in a side-scrolling game.
 * The ground pans at exactly his stride speed so his feet never slide; each
 * range pans at a fraction of it by depth. He walks calmly on his own, and
 * scrolling makes him stride faster, settling again when the page stops.
 * Both layers fade out as the hero scrolls away.
 *
 * Two components because they sit at different depths in the background:
 * the ranges under the tree footage, the ground and walker above the branch
 * overlay. Each runs its own clock from the same rules, so they agree.
 */

/** Width of one seamless range tile, in px; each layer repeats it twice. */
const TILE = 1800

/** Calm walking cadence, full strides per second, and the most a flick adds. */
const CADENCE = 0.85
const CADENCE_MAX = 2.1

/** Ground covered per stride, in walker-drawing units (figure is 86 tall). */
const STRIDE = 66
const FIGURE_HEIGHT = 86

/** How fast each range moves relative to the ground. */
const RANGES = [
  {
    depth: 0.04,
    base: 0.42,
    peaks: [
      [2, 0.34],
      [5, 0.2],
      [11, 0.08]
    ],
    className: 'journey-range-far'
  },
  {
    depth: 0.1,
    base: 0.6,
    peaks: [
      [3, 0.32],
      [7, 0.16],
      [13, 0.07]
    ],
    className: 'journey-range-mid'
  },
  {
    depth: 0.2,
    base: 0.82,
    peaks: [
      [4, 0.22],
      [9, 0.12],
      [17, 0.05]
    ],
    className: 'journey-range-near'
  }
] as const

/** A seamless ridge line: every wave fits a whole number of times in a tile. */
function ridgePath(base: number, peaks: readonly (readonly [number, number])[], seed: number) {
  const h = 400
  const points: string[] = []

  for (let x = 0; x <= TILE; x += 12) {
    let lift = 0

    peaks.forEach(([waves, amp], i) => {
      const phase = Math.sin((seed + i) * 12.9898) * 43758.5453
      const wave = (1 + Math.sin((x / TILE) * Math.PI * 2 * waves + phase)) / 2

      // Raised to a power so the waves read as peaks rather than rolling hills.
      lift += amp * Math.pow(wave, 2.1)
    })

    points.push(`${x},${(h * (base - lift)).toFixed(1)}`)
  }

  return `M0,${h} L${points.join(' L')} L${TILE},${h} Z`
}

const RIDGES = RANGES.map((range, i) => ridgePath(range.base, range.peaks, i * 3 + 1))

/** Small tufts along the ground tile, so the path visibly moves underfoot. */
const TUFTS = Array.from({ length: 26 }, (_, i) => {
  const x = (((Math.sin(i * 78.233) * 43758.5453) % 1) + 1) % 1
  const size = 0.6 + ((((Math.sin(i * 39.425) * 24634.6345) % 1) + 1) % 1)

  return { x: (i + x * 0.8) * (TILE / 26), size }
})

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
    // Sized by CSS (smaller on phones), so the stride follows what is drawn.
    const measure = () => {
      figurePx = document.querySelector('.journey-walker')?.getBoundingClientRect().height || figurePx
    }

    measure()
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const fadeOf = () => {
      const progress = window.scrollY / window.innerHeight

      // Full while the hero fills the screen, gone before the work strip.
      return Math.max(0, Math.min(1, (0.75 - progress) / 0.45))
    }

    if (reduced) {
      frameRef.current(0, 0, fadeOf())

      const onScroll = () => frameRef.current(0, 0, fadeOf())

      window.addEventListener('scroll', onScroll, { passive: true })

      return () => window.removeEventListener('scroll', onScroll)
    }

    let raf = 0
    let last = 0
    let lastScroll = window.scrollY
    let scrollSpeed = 0
    let boost = 0

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60

      last = now

      const scroll = window.scrollY
      const speed = Math.abs(scroll - lastScroll) / Math.max(dt, 1 / 120)

      lastScroll = scroll

      // A wheel scroll arrives as a few one-frame jumps, so the speed is
      // smoothed first; the boost then rises quickly and eases back over
      // about a second once the page stops.
      scrollSpeed += (speed - scrollSpeed) * Math.min(1, dt * 6)

      const target = Math.min(1, scrollSpeed / 600)

      boost = target > boost ? boost + (target - boost) * Math.min(1, dt * 12) : boost * Math.exp(-dt * 1.2)

      const fade = fadeOf()

      if (fade > 0) frameRef.current(dt, CADENCE + (CADENCE_MAX - CADENCE) * boost, fade)
      else frameRef.current(0, 0, 0)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [])
}

/** The walker's drawn height in px, measured on mount and on resize. */
let figurePx = 70

/** Ground covered per second at a cadence, in px. */
const groundSpeed = (cadence: number) => cadence * STRIDE * (figurePx / FIGURE_HEIGHT)

/** The mountain ranges, drawn behind the tree footage. */
export function JourneyRanges() {
  const rootRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)

  useJourney((dt, cadence, fade) => {
    const root = rootRef.current

    if (!root) return

    root.style.opacity = String(fade)

    if (!dt) return

    offset.current += groundSpeed(cadence) * dt

    root.querySelectorAll<HTMLElement>('[data-depth]').forEach(range => {
      const shift = (offset.current * Number(range.dataset.depth)) % TILE

      range.style.transform = `translate3d(${-shift}px, 0, 0)`
    })
  })

  return (
    <div ref={rootRef} aria-hidden='true' className='journey-ranges'>
      {RANGES.map((range, i) => (
        <div key={range.className} data-depth={range.depth} className={`journey-range ${range.className}`}>
          {[0, 1].map(copy => (
            <svg key={copy} width={TILE} viewBox={`0 0 ${TILE} 400`} preserveAspectRatio='none'>
              <path d={RIDGES[i]} />
            </svg>
          ))}
        </div>
      ))}
    </div>
  )
}

/** The ground path and the walking silhouette, above the branch overlay. */
export function JourneyWalker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<SVGGElement>(null)
  const limbs = useRef<Record<string, SVGGElement | null>>({})
  const state = useRef({ phase: 0.6, offset: 0 })

  const pose = (phase: number) => {
    const set = (key: string, angle: number, x: number, y: number) =>
      limbs.current[key]?.setAttribute('transform', `rotate(${angle.toFixed(2)} ${x} ${y})`)

    // Forward (to the right) is a negative rotation for a limb hanging down.
    ;[
      ['front', phase],
      ['back', phase + Math.PI]
    ].forEach(([side, p]) => {
      const s = Math.sin(p as number)
      const c = Math.cos(p as number)

      set(`${side}-thigh`, -26 * s, 0, 42)

      // The knee folds while the leg swings through.
      set(`${side}-shin`, 5 + 40 * Math.max(0, c), 0, 61)

      // Arms swing against the leg on their side.
      set(`${side}-arm`, 20 * s, 0, 16)
      set(`${side}-forearm`, -(10 + 18 * Math.max(0, -s)), 0, 29)
    })

    // Highest as the legs pass each other, lowest at full stride.
    bodyRef.current?.setAttribute(
      'transform',
      `translate(0 ${(-1.6 * (Math.cos(phase * 2) + 1)) / 2 + 1.6}) rotate(4 0 42)`
    )
  }

  useJourney((dt, cadence, fade) => {
    const root = rootRef.current

    if (!root) return

    root.style.opacity = String(fade)

    if (!dt) {
      pose(state.current.phase)

      return
    }

    state.current.phase += cadence * Math.PI * 2 * dt

    state.current.offset = (state.current.offset + groundSpeed(cadence) * dt) % TILE

    if (groundRef.current) groundRef.current.style.transform = `translate3d(${-state.current.offset}px, 0, 0)`

    pose(state.current.phase)
  })

  const limb = (side: 'front' | 'back') => (
    <>
      <g ref={el => void (limbs.current[`${side}-thigh`] = el)}>
        <line x1='0' y1='42' x2='0' y2='61' strokeWidth='6' />
        <g ref={el => void (limbs.current[`${side}-shin`] = el)}>
          <line x1='0' y1='61' x2='0' y2='79' strokeWidth='5' />
          <line x1='0' y1='80' x2='4.5' y2='80' strokeWidth='4' />
        </g>
      </g>
    </>
  )

  const arm = (side: 'front' | 'back') => (
    <g ref={el => void (limbs.current[`${side}-arm`] = el)}>
      <line x1='0' y1='16' x2='0' y2='29' strokeWidth='4.6' />
      <g ref={el => void (limbs.current[`${side}-forearm`] = el)}>
        <line x1='0' y1='29' x2='0' y2='40' strokeWidth='4' />
      </g>
    </g>
  )

  return (
    <div ref={rootRef} aria-hidden='true' className='journey-ground'>
      <div ref={groundRef} className='journey-path'>
        {[0, 1].map(copy => (
          <svg key={copy} width={TILE} viewBox={`0 0 ${TILE} 20`} preserveAspectRatio='none'>
            {/* Three curved blades rising from the line, leaning apart. */}
            {TUFTS.map(t => (
              <path
                key={t.x}
                d={`M${t.x} 20 q${-1 * t.size} ${-5 * t.size} ${-3.5 * t.size} ${-9 * t.size} M${t.x} 20 q0 ${-7 * t.size} ${0.8 * t.size} ${-12 * t.size} M${t.x} 20 q${1 * t.size} ${-4 * t.size} ${3.5 * t.size} ${-8 * t.size}`}
              />
            ))}
          </svg>
        ))}
      </div>

      <svg className='journey-walker' viewBox='-22 -4 44 88'>
        <ellipse className='journey-shadow' cx='1' cy='81' rx='13' ry='2.2' />
        <g ref={bodyRef} strokeLinecap='round'>
          <g className='journey-far-side'>
            {arm('back')}
            {limb('back')}
          </g>
          <line x1='0' y1='17' x2='0' y2='41' strokeWidth='10' />
          <circle cx='1' cy='7' r='6' />
          {limb('front')}
          {arm('front')}
        </g>
      </svg>
    </div>
  )
}
