/**
 * The hand-drawn films' ink, for SVG. Ported from the Storify engine
 * (docs/storify-films/engine-core.js: `hsh`, `jit`, `densify`, `rr`, `ell`,
 * `ln` and the stroke loop of `sk`), so a shape drawn here wobbles exactly as
 * it does in the hand-drawn films. Nothing is random: a seed always draws the
 * same line, so a live film, its stills and its MP4 all match.
 *
 * The engine redraws its lines every frame with a new `BOIL`; here each shape
 * is drawn once per boil frame and ink.tsx shows the frames in turn.
 *
 * Imports nothing, so its tests run without the app.
 */

export type Pt = readonly [number, number]

export type InkOptions = {
  seed?: number
  /** How far a point may stray, in px. */
  amp?: number
  closed?: boolean
  /** Which boil frame: each draws the same shape with a different wobble. */
  boil?: number
  /** Which pass: the engine draws an outline twice, slightly apart. */
  pass?: number
}

/** The engine's hash: a steady pseudo-random number in [0, 1) for `n`. */
function hsh(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453

  return x - Math.floor(x)
}

/** The engine's `jit`: a steady, seeded wobble for point `i`, different on each boil frame. */
export const jit = (seed: number, i: number, amp: number, boil = 0) =>
  (hsh(seed * 13.37 + i * 7.13 + boil * 3.1) - 0.5) * 2 * amp

/** Cuts each edge into pieces at most `step` px long, so long edges wobble along their length. */
function densify(p: readonly Pt[], closed: boolean, step: number): Pt[] {
  const out: Pt[] = []
  const n = p.length
  const m = closed ? n : n - 1

  for (let i = 0; i < m; i++) {
    const a = p[i]!
    const b = p[(i + 1) % n]!
    const k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step))

    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k])
  }

  if (!closed) out.push(p[n - 1]!)

  return out
}

/** A rounded box. */
export function rr(x: number, y: number, w: number, h: number, r: number): Pt[] {
  const rad = Math.min(r, w / 2, h / 2)
  const p: Pt[] = []
  const corners: [number, number, number][] = [
    [x + w - rad, y + rad, -Math.PI / 2],
    [x + w - rad, y + h - rad, 0],
    [x + rad, y + h - rad, Math.PI / 2],
    [x + rad, y + rad, Math.PI]
  ]

  for (const [cx, cy, a0] of corners) {
    for (let k = 0; k <= 5; k++) {
      const a = a0 + ((k / 5) * Math.PI) / 2

      p.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad])
    }
  }

  return densify(p, true, 10)
}

/** An ellipse of `n` points. */
export function ell(cx: number, cy: number, rx: number, ry: number, n = 18): Pt[] {
  const p: Pt[] = []

  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2

    p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry])
  }

  return p
}

/** A straight line, cut every 12 px. Draw it with `closed: false`. */
export const ln = (x1: number, y1: number, x2: number, y2: number): Pt[] =>
  densify(
    [
      [x1, y1],
      [x2, y2]
    ],
    false,
    12
  )

/** One hand-drawn line through `pts`, as an SVG path. */
export function inkPath(pts: readonly Pt[], o: InkOptions = {}) {
  const { seed = 1, amp = 1.1, closed = true, boil = 0, pass = 0 } = o
  const n = pts.length
  const count = closed ? n + 1 : n
  let d = ''

  for (let i = 0; i < count; i++) {
    const p = pts[i % n]!
    const x = p[0] + jit(seed + pass * 5, i % n, amp, boil)
    const y = p[1] + jit(seed + pass * 5 + 99, i % n, amp, boil)

    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }

  return closed ? `${d}Z` : d
}

export const BOILS = [0, 1, 2] as const

/** The three frames the line boils between. */
export const inkFrames = (pts: readonly Pt[], o: InkOptions = {}) => BOILS.map(boil => inkPath(pts, { ...o, boil }))
