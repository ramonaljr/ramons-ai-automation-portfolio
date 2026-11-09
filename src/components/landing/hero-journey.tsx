'use client'

import { type SyntheticEvent, useEffect, useRef, useState } from 'react'

/**
 * The hero's journey: a figure walking along the foot of the hero while
 * mountain ranges drift past behind the tree, under a snow-capped volcano.
 *
 * The walker stays in place and the world moves, as in a side-scrolling game.
 * The ground pans at exactly his stride speed so his feet never slide; each
 * range pans at a fraction of it by depth. The volcano is far enough away
 * that it holds still. He walks calmly on his own, and scrolling makes him
 * stride faster, settling again when the page stops. Both layers fade out as
 * the hero scrolls away.
 *
 * Two components because they sit at different depths in the background:
 * the scenery over the tree footage, the ground and walker above the branch
 * overlay. Each runs its own clock from the same rules, so they agree.
 */

/** Width of one seamless range tile, in px; each layer repeats it twice. */
const TILE = 1800

/** Calm walking cadence, full strides per second, and the most a flick adds. */
const CADENCE = 0.85
const CADENCE_MAX = 2.1

const TAU = Math.PI * 2

/** The leg's swing either side of upright, and hip to sole in drawing units. */
const SWING = (24 * Math.PI) / 180
const LEG = 40.3

/**
 * Ground covered per stride, in walker-drawing units (the viewBox is 88 tall):
 * each foot sweeps back its full reach, twice a stride.
 */
const STRIDE = 4 * LEG * Math.sin(SWING)
const FIGURE_HEIGHT = 88

/**
 * How fast each range moves relative to the ground. The tiles and the volcano
 * are rendered offline (lit ridged noise, seamless across a tile) and baked to
 * WebP, about 200 KB together, so they load after the page rather than with it.
 */
const RANGES = [
  { depth: 0.04, src: '/images/landing/hero-range-far.webp', className: 'journey-range-far' },
  { depth: 0.1, src: '/images/landing/hero-range-mid.webp', className: 'journey-range-mid' },
  { depth: 0.2, src: '/images/landing/hero-range-near.webp', className: 'journey-range-near' }
] as const

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

    // Read in the scroll and resize events, never in the frame: reading
    // scrollY or innerHeight after the frame has written to the page makes
    // the browser lay the whole page out again, every frame.
    let scroll = window.scrollY
    let viewport = window.innerHeight

    // Full while the hero fills the screen, gone before the work strip.
    const fadeOf = () => Math.max(0, Math.min(1, (0.75 - scroll / viewport) / 0.45))

    const onResize = () => {
      viewport = window.innerHeight
    }

    window.addEventListener('resize', onResize)

    if (reduced) {
      frameRef.current(0, 0, fadeOf())

      const onScroll = () => {
        scroll = window.scrollY
        frameRef.current(0, 0, fadeOf())
      }

      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    }

    let raf = 0
    let last = 0
    let lastScroll = scroll
    let scrollSpeed = 0
    let boost = 0

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60

      last = now

      const speed = Math.abs(scroll - lastScroll) / Math.max(dt, 1 / 120)

      lastScroll = scroll

      // A wheel scroll arrives as a few one-frame jumps, so the speed is
      // smoothed first; the boost then rises quickly and eases back over
      // about a second once the page stops.
      scrollSpeed += (speed - scrollSpeed) * Math.min(1, dt * 6)

      const target = Math.min(1, scrollSpeed / 600)

      boost = target > boost ? boost + (target - boost) * Math.min(1, dt * 12) : boost * Math.exp(-dt * 1.2)

      const fade = fadeOf()

      if (fade > 0) {
        frameRef.current(dt, CADENCE + (CADENCE_MAX - CADENCE) * boost, fade)
        raf = requestAnimationFrame(tick)

        return
      }

      // Scrolled past the hero: hide once and sleep until it comes back
      frameRef.current(0, 0, 0)
      raf = 0
    }

    const wake = () => {
      if (raf || fadeOf() === 0) return

      last = 0
      lastScroll = scroll
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      scroll = window.scrollY
      wake()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])
}

/** The walker's drawn height in px, measured on mount and on resize. */
let figurePx = 70

/** Ground covered per second at a cadence, in px. */
const groundSpeed = (cadence: number) => cadence * STRIDE * (figurePx / FIGURE_HEIGHT)

/** Shown once decoded, so a tile never paints in halfway down. */
const reveal = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.dataset.loaded = ''
}

/** The volcano and the mountain ranges, over the tree footage. */
export function JourneyRanges() {
  const rootRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)

  // Mounted after the page has loaded, as the video is, so the scenery never
  // competes with the hero for bandwidth; skipped when data is being saved.
  const [withScenery, setWithScenery] = useState(false)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection

    if (connection?.saveData) return

    const mount = () => setWithScenery(true)

    if (document.readyState === 'complete') {
      const id = window.setTimeout(mount, 300)

      return () => window.clearTimeout(id)
    }

    window.addEventListener('load', mount, { once: true })

    return () => window.removeEventListener('load', mount)
  }, [])

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
    <div ref={rootRef} aria-hidden='true' className='journey-scenery'>
      {withScenery && (
        <>
          <img
            src='/images/landing/hero-fuji.webp'
            alt=''
            width={1800}
            height={400}
            decoding='async'
            onLoad={reveal}
            className='journey-fuji'
          />

          <div className='journey-ranges'>
            {RANGES.map(range => (
              <div key={range.className} data-depth={range.depth} className={`journey-range ${range.className}`}>
                {[0, 1].map(copy => (
                  <img key={copy} src={range.src} alt='' width={TILE} height={400} decoding='async' onLoad={reveal} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * The walker's colours: slate-blue clothes in two tones, the far limbs a step
 * darker so they read in depth, black hair and thin dark line art.
 */
const C = {
  ink: 'oklch(0.17 0.02 250)',
  hair: 'oklch(0.2 0.015 255)',
  hairShade: 'oklch(0.13 0.012 258)',
  hairStrand: 'oklch(0.4 0.025 250)',
  brow: 'oklch(0.2 0.015 255)',
  skin: 'oklch(0.9 0.035 70)',
  skinShade: 'oklch(0.79 0.05 55)',
  jacket: 'oklch(0.33 0.035 235)',
  jacketShade: 'oklch(0.245 0.03 240)',
  jacketLight: 'oklch(0.44 0.035 228)',
  trousers: 'oklch(0.31 0.026 232)',
  trousersShade: 'oklch(0.235 0.022 238)',
  farJacket: 'oklch(0.22 0.026 242)',
  farTrousers: 'oklch(0.21 0.02 240)',
  shoe: 'oklch(0.21 0.015 245)',
  shoeLight: 'oklch(0.36 0.02 240)'
}

/** Outlined shape, and a bare stroke for creases and strands. */
const inked = (fill: string) => ({ fill, stroke: C.ink, strokeWidth: 0.32, strokeLinejoin: 'round' as const })

const line = (stroke: string, strokeWidth: number) => ({
  fill: 'none',
  stroke,
  strokeWidth,
  strokeLinecap: 'round' as const
})

/**
 * Locks of hair swept up and back, a fringe over the brow and short tips at
 * the nape. Generated once (tips round the skull, each edge bowed outward)
 * and kept as a path.
 */
const HAIR =
  'M1.6 3.8 Q2.57 4.92 2.4 6.4 Q2.25 5.39 2.9 4.6 Q4.06 5.46 4.2 6.9 Q3.70 5.63 4.3 4.4 Q5.24 4.64 5.7 5.5 Q4.88 4.73 4.9 3.6 Q5.17 2.65 6.05 2.21 Q5.05 2.49 4.17 1.94 Q3.95 -0.06 5.28 -1.58 Q4.46 -0.15 2.85 0.21 Q1.86 -0.99 2.08 -2.53 Q1.88 -1.32 0.86 -0.65 Q-0.55 -1.17 -1.11 -2.56 Q-0.74 -1.45 -1.31 -0.43 Q-3.18 -0.26 -4.57 -1.53 Q-3.31 -0.68 -3.08 0.82 Q-4.49 1.83 -6.19 1.47 Q-4.82 1.65 -4.02 2.78 Q-4.66 4.24 -6.16 4.75 Q-4.98 4.35 -3.88 4.95 Q-3.79 6.85 -5.12 8.2 Q-4.61 7.02 -3.4 6.6 Q-3.17 7.81 -3.9 8.8 Q-3.59 7.89 -2.7 7.5 Q-2.04 8.05 -2 8.9 Q-2.08 7.09 -0.8 5.8 Q-0.51 4.84 0.4 4.4 Q0.87 3.84 1.6 3.8 Z'

/** High stand collar, cropped at the hip, a placket down the front. */
const JACKET = (
  <>
    <path
      d='M-2.2 9.8 L2.6 9.4 L3 12.6 C4.4 13 5.4 14.8 5.6 18.5 C5.6 22 4.8 27 4.6 31 C4.6 35 4.8 39 5.2 42.6 Q0 43.4 -5.5 43.1 C-5.2 38 -4.9 34 -4.8 30 C-5 25 -5.8 21 -5.7 17.6 C-5.6 15.4 -5 14.2 -3.2 13.4 Z'
      {...inked(C.jacket)}
    />
    <path
      d='M-3.2 13.4 C-5 14.2 -5.6 15.4 -5.7 17.6 C-5.8 21 -5 25 -4.8 30 C-4.9 34 -5.2 38 -5.5 43.1 L-1.6 43.3 C-1.8 36 -1.4 26 -1 13.2 Z'
      fill={C.jacketShade}
    />
    <path d='M3.6 13.6 C4.8 15 5.1 17 5 19.6' {...line(C.jacketLight, 0.55)} />
    <path d='M2.9 12.8 C3.4 22 3.6 33 3.9 42.8' {...line(C.jacketShade, 0.35)} />
    <path d='M-4.2 31.6 C-2.4 32.4 0.6 32.4 3.8 31.4' {...line(C.jacketShade, 0.3)} />
    <path d='M-2.6 9.4 L2.9 9 L3.2 13.2 Q0.2 14.2 -2.9 13.7 Z' {...inked(C.jacket)} />
    <path d='M-2.6 9.4 L-0.4 9.2 L-0.5 14 Q-1.8 13.9 -2.9 13.7 Z' fill={C.jacketShade} />
  </>
)

/** In profile: brow, nose, lips and a pointed chin, the eyes half-lidded. */
const HEAD = (
  <>
    <path
      d='M-1.2 8.8 C-3.4 7.8 -4 4.6 -3.4 2.6 C-2.4 0.4 1.4 -0.4 3.4 1.2 C4.2 2 4.4 3.4 4.6 4.6 L4.3 5.3 C4.9 5.9 5.5 6.4 5.9 6.9 L4.9 7.4 L5.05 7.9 L4.65 8.25 L4.85 8.65 C4.7 9.4 4.4 9.9 3.9 10.1 C2.6 10.4 1.4 10.2 0.4 9.8 Z'
      {...inked(C.skin)}
    />
    <path d='M-1.2 8.8 C0 9.6 1.4 10 3.9 10.1 C2.4 9.4 1.4 8.4 1 7 C0.4 7.6 -0.4 8.2 -1.2 8.8 Z' fill={C.skinShade} />
    <path d='M-0.9 4.8 C-0.2 4.6 0.4 5.2 0.4 6.2 C0.4 7.2 -0.2 7.6 -0.8 7.4 Z' {...inked(C.skinShade)} />
    <path d='M2.5 5.7 C3.1 5.4 3.7 5.35 4.2 5.5' {...line(C.ink, 0.45)} />
    <path d='M2.6 6.05 C3.1 6.2 3.6 6.2 3.95 6.05' {...line(C.skinShade, 0.25)} />
    <path d='M2.3 4.5 C3 4.15 3.7 4.05 4.4 4.2' {...line(C.brow, 0.4)} />
    <path d='M4.7 8.25 L4.2 8.3' {...line(C.skinShade, 0.25)} />
    <path d={HAIR} {...inked(C.hair)} />
    <path
      d='M-0.8 5.8 C0 4.6 1 3.9 2 3.9 C3 3.9 3.9 4.2 4.8 4.4 L5.2 5.2 C4 4.9 3 4.8 2 5 C0.9 5.2 0 5.5 -0.8 5.8 Z'
      fill={C.hairShade}
    />
    <path
      d='M-3.6 0.6 C-2.2 -0.6 -0.2 -0.8 1.6 0 M-4.4 3.2 C-3.2 2.4 -1.8 2.2 -0.6 2.6 M2.4 0.8 C3.4 1.2 4.4 1.8 5 2.6 M0.2 -0.6 C0.6 0.6 1.2 1.6 2 2.2'
      {...line(C.hairStrand, 0.3)}
    />
  </>
)

/** The ground path and the walker, above the branch overlay. */
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

      // From heel strike the planted foot must keep pace with the ground, so
      // it slides back at a steady rate (a sine would skate it at mid-stance);
      // in the air it swings forward again on the sine.
      const sinceStrike = ((((p as number) - Math.PI / 2) % TAU) + TAU) % TAU
      const reach = sinceStrike < Math.PI ? 1 - (2 * sinceStrike) / Math.PI : s
      const thigh = (-Math.asin(reach * Math.sin(SWING)) * 180) / Math.PI

      // The knee folds most just after push-off, as the leg swings through.
      const knee = 4 + 42 * Math.max(0, Math.cos((p as number) + 0.35)) ** 1.2

      // The foot's angle to the ground: toes up at heel strike, flat through
      // the stance, the heel lifting at push-off.
      const foot = -12 * s + 24 * Math.max(0, -Math.sin((p as number) + 0.25)) ** 2

      set(`${side}-thigh`, thigh, 0.4, 41)
      set(`${side}-shin`, knee, 0.1, 60.4)
      set(`${side}-foot`, foot - thigh - knee, 0.2, 78.6)

      // Hands in the pockets: the arms only sway a little with the stride.
      set(`${side}-arm`, 20 + 3 * s, 0, 14.8)
      set(`${side}-forearm`, -48 - 2 * s, 0, 29.6)
    })

    // Highest as the legs pass each other, lowest at full stride.
    bodyRef.current?.setAttribute('transform', `translate(0 ${(-1.2 * (Math.cos(phase * 2) + 1)) / 2 + 1.2})`)
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

  const leg = (side: 'front' | 'back') => {
    const far = side === 'back'
    const cloth = far ? C.farTrousers : C.trousers
    const shade = far ? C.farTrousers : C.trousersShade

    return (
      <g ref={el => void (limbs.current[`${side}-thigh`] = el)}>
        <path d='M-2.8 39.8 C-3 46 -2.5 54 -1.9 60.8 L2 60.8 C2.6 54 3 46 3 39.8 Z' {...inked(cloth)} />
        <path d='M-2.8 39.8 C-3 46 -2.5 54 -1.9 60.8 L-0.6 60.8 C-1 54 -1.2 46 -1 39.8 Z' fill={shade} />
        <g ref={el => void (limbs.current[`${side}-shin`] = el)}>
          <path d='M-1.9 60 C-1.7 66 -1.6 72 -1.7 78.6 L1.8 78.6 C1.7 72 1.8 66 2 60 Z' {...inked(cloth)} />
          <path d='M-1.9 60 C-1.7 66 -1.6 72 -1.7 78.6 L-0.4 78.6 C-0.5 72 -0.6 66 -0.6 60 Z' fill={shade} />
          {!far && (
            <path
              d='M-1.6 61.6 C-0.6 62.4 0.8 62.4 1.8 61.4 M-1.4 76.2 C-0.4 76.9 0.9 76.9 1.8 76.1'
              {...line(C.trousersShade, 0.35)}
            />
          )}
          <g ref={el => void (limbs.current[`${side}-foot`] = el)}>
            <path
              d='M-2 77.6 C-2.5 79 -2.5 80.4 -2.2 81.3 L6.1 81.3 C6.8 81 6.9 80 6.3 79.4 C5 78.5 3.4 78 2.2 77.6 Z'
              {...inked(C.shoe)}
            />
            <path d='M-2.2 80.6 L6.4 80.6' {...line(C.shoeLight, 0.35)} />
          </g>
        </g>
      </g>
    )
  }

  const arm = (side: 'front' | 'back') => {
    const far = side === 'back'
    const cloth = far ? C.farJacket : C.jacket

    return (
      <g ref={el => void (limbs.current[`${side}-arm`] = el)}>
        <path d='M-2.6 13.6 C-3 18 -2.9 24 -2.3 29.9 L2.2 30 C2.6 24 2.8 18 2.6 13.8 Z' {...inked(cloth)} />
        {!far && (
          <>
            <path d='M-2.6 13.6 C-3 18 -2.9 24 -2.3 29.9 L-0.6 29.9 C-1 24 -1.2 18 -0.8 13.6 Z' fill={C.jacketShade} />
            <path d='M-1.6 27.4 C-0.4 28.4 1 28.4 2 27.6' {...line(C.jacketShade, 0.35)} />
          </>
        )}
        <g ref={el => void (limbs.current[`${side}-forearm`] = el)}>
          <path
            d='M-2.2 29.2 L2.1 29.4 C2.3 34 2.1 38.5 1.8 42.4 L-1.7 42.6 C-2 38.5 -2.2 34 -2.2 29.2 Z'
            {...inked(cloth)}
          />
          {!far && (
            <>
              <path d='M-1.9 41.2 L1.9 41.1 L1.8 42.4 L-1.7 42.6 Z' fill={C.jacketShade} />
              <path
                d='M-1.4 42.6 L1.5 42.4 C1.6 43.2 1.3 43.8 0.2 44 C-0.8 43.9 -1.3 43.4 -1.4 42.6 Z'
                {...inked(C.skin)}
              />
            </>
          )}
        </g>
      </g>
    )
  }

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

      {/* Tall and slim, hands in his pockets, leaning back a little with his
          head bowed: the far arm and leg first, then the near leg, the
          jacket, the head and the near arm over them. */}
      <svg className='journey-walker' viewBox='-22 -4 44 88'>
        <ellipse className='journey-shadow' cx='1.5' cy='81.4' rx='11' ry='1.8' />
        <g ref={bodyRef}>
          <g transform='rotate(-3 0.4 41)'>{arm('back')}</g>
          {leg('back')}
          {leg('front')}
          <g transform='rotate(-3 0.4 41)'>
            {JACKET}
            <g transform='rotate(9 0.6 10) translate(0.6 10) scale(0.84) translate(-0.6 -10)'>{HEAD}</g>
            {arm('front')}
          </g>
        </g>
      </svg>
    </div>
  )
}
