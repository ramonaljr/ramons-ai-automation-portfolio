'use client'

import type { ReactNode } from 'react'

import { Ink } from '@/components/landing/film/ink'
import { ell, ln, rr, type Pt } from '@/components/landing/film/sketch'

/**
 * The films' robots, in ink: the hand-drawn films' cast, drawn with the
 * Storify engine's own shapes and seeds (docs/storify-films/engine-core.js,
 * `CAST`, `drawChar` and `drawHead`), so each robot here is the robot in
 * those films line for line. Only Dennice and Leo are ported so far; the
 * others follow when their films are built.
 *
 * A robot stands with its feet on y = 0 of its viewBox, centred on x = 0.
 * Every robot shares one viewBox, so robots drawn at the same width are drawn
 * at the same scale. Colours come from film.css ("The cast, in ink").
 */

export type Mood = 'off' | 'normal' | 'puzzled' | 'happy'

export type Who = 'dennice' | 'leo'

/** `talk` raises a hand while speaking; `phone` holds one to the ear; `down` points at what's below. */
export type Pose = 'idle' | 'talk' | 'phone' | 'down'

export const VIEW = { x: -80, y: -135, w: 160, h: 145 } as const

/** Where a robot's feet sit, from the top of its box, as a share of its height. */
export const FEET = -VIEW.y / VIEW.h

type Spec = { w: number; h: number; r: number; head: 'bulb' | 'beanie'; name: string }

/** The engine's `CAST` entries, unchanged. */
const SPECS: Record<Who, Spec> = {
  dennice: { name: 'Dennice', w: 80, h: 70, r: 28, head: 'bulb' },
  leo: { name: 'Leo', w: 70, h: 72, r: 22, head: 'beanie' }
}

const MOODS: Mood[] = ['off', 'normal', 'puzzled', 'happy']

const POSES: Pose[] = ['idle', 'talk', 'phone', 'down']

/** The engine's hand positions per pose, before scaling to the robot's size. */
const HANDS: Record<Pose, [Pt, Pt]> = {
  idle: [
    [-48, -28],
    [48, -28]
  ],
  talk: [
    [-48, -28],
    [52, -50]
  ],
  phone: [
    [-48, -28],
    [30, -70]
  ],
  down: [
    [-48, -28],
    [58, -8]
  ]
}

/** Everything about a robot that only depends on who it is, worked out once. */
function geometry(who: Who) {
  const c = SPECS[who]
  const W2 = c.w / 2
  const top = -16 - c.h
  const kx = c.w / 80
  const ky = c.h / 70

  // The engine seeds each robot by its name and width, so the wobble matches
  const seed = c.name.length * 37 + c.w
  const scW = Math.min(56, c.w * 0.7)
  const scH = Math.min(34, c.h * 0.48)
  const scY = top + 9
  const ey = scY + scH * 0.42
  const my = scY + scH * 0.78
  const lx = Math.min(13, W2 * 0.35)
  const sh = -16 - c.h * 0.43

  return { c, W2, top, kx, ky, seed, scW, scH, scY, ey, my, lx, sh }
}

type G = ReturnType<typeof geometry>

function Body({ g }: { g: G }) {
  const { c, W2, top, seed, lx } = g

  return (
    <>
      <ellipse className='rb-shadow' cx='0' cy='2' rx={W2 * 0.75} ry='4' />
      <Ink className='rb-leg' pts={ln(-lx, -18, -lx, -5)} closed={false} seed={seed + 1} amp={0.4} passes={1} />
      <Ink className='rb-leg' pts={ln(lx, -18, lx, -5)} closed={false} seed={seed + 2} amp={0.4} passes={1} />
      <Ink className='rb-foot' pts={ell(-lx - 1, -4, 10, 5)} seed={seed + 3} amp={0.4} />
      <Ink className='rb-foot' pts={ell(lx + 1, -4, 10, 5)} seed={seed + 4} amp={0.4} />
      <Ink className='rb-body' pts={rr(-W2, top, c.w, c.h, c.r)} seed={seed + 5} />
      <ellipse
        className='rb-shine'
        cx={-W2 * 0.45}
        cy={top + c.h * 0.8}
        rx={W2 * 0.25}
        ry='6'
        transform={`rotate(-28.6 ${-W2 * 0.45} ${top + c.h * 0.8})`}
      />
    </>
  )
}

function Head({ g }: { g: G }) {
  const { W2, top: hb, seed } = g

  if (g.c.head === 'bulb') {
    return (
      <g className='rb-bulb'>
        <Ink className='rb-stem' pts={ln(0, hb, 3, hb - 15)} closed={false} seed={seed + 6} amp={0.4} passes={1} />
        <circle className='rb-bulb__glow' cx='3' cy={hb - 20} r='9' />
        <Ink className='rb-bulb__lamp' pts={ell(3, hb - 20, 5, 5, 10)} seed={seed + 7} amp={0.3} />
      </g>
    )
  }

  const R = W2 * 0.66

  return (
    <g className='rb-beanie'>
      <path className='rb-beanie__cap' d={`M${-R} ${hb + 9}A${R} ${R} 0 0 1 ${R} ${hb + 9}Z`} />
      <Ink className='rb-beanie__band' pts={rr(-R - 2, hb + 3, 2 * R + 4, 8, 3)} seed={seed + 50} amp={0.3} />
      <Ink className='rb-beanie__pom' pts={ell(0, hb + 9 - R - 4, 6, 6, 10)} seed={seed + 51} amp={0.3} />
    </g>
  )
}

/** A face per mood, drawn plain as the engine draws faces: only outlines wobble. */
function Face({ g, mood }: { g: G; mood: Mood }) {
  const { ey, my } = g
  const ex = [-11, 11]

  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) =>
    `M${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`

  if (mood === 'off') {
    return (
      <g className='rb-face rb-face--off'>
        {ex.map(e => (
          <path key={e} d={`M${e - 5} ${ey + 2}h10`} />
        ))}
        <path d={`M-4 ${my - 3}h8`} />
      </g>
    )
  }

  if (mood === 'happy') {
    return (
      <g className='rb-face'>
        {ex.map(e => (
          <path key={e} d={arc(e, ey + 3, 5, Math.PI * 1.1, Math.PI * 1.9)} />
        ))}
        <path d={arc(0, my - 5, 6, Math.PI * 0.15, Math.PI * 0.85)} />
      </g>
    )
  }

  if (mood === 'puzzled') {
    return (
      <g className='rb-face'>
        <ellipse className='rb-eye' cx={ex[0]} cy={ey} rx='3.6' ry='6' />
        <ellipse className='rb-eye' cx={ex[1]} cy={ey + 1} rx='2.6' ry='3' />
        <path d={`M-6 ${my}Q-2 ${my - 4} 1 ${my}Q4 ${my + 4} 7 ${my}`} />
      </g>
    )
  }

  return (
    <g className='rb-face'>
      {ex.map(e => (
        <ellipse key={e} className='rb-eye rb-eye--blink' cx={e} cy={ey} rx='3.6' ry='6' />
      ))}
      <path d={arc(0, my - 6, 5, Math.PI * 0.2, Math.PI * 0.8)} />
    </g>
  )
}

function Arms({ g, pose }: { g: G; pose: Pose }) {
  const { W2, kx, ky, sh, seed } = g
  const hands = HANDS[pose].map(([hx, hy]) => [hx * kx, -16 + (hy + 16) * ky] as const)
  const shoulders = [-(W2 - 4), W2 - 4]

  return (
    <>
      {hands.map((h, i) => (
        <g key={i}>
          <Ink
            className='rb-arm'
            pts={ln(shoulders[i]!, sh, h[0], h[1])}
            closed={false}
            seed={seed + 20 + i}
            amp={0.5}
            passes={1}
          />
          <Ink className='rb-hand' pts={ell(h[0], h[1], 5.5, 5.5, 10)} seed={seed + 22 + i} amp={0.3} />
        </g>
      ))}
      {pose === 'phone' && (
        <Ink className='rb-phone' pts={rr(hands[1][0] - 6, hands[1][1] - 16, 12, 30, 5)} seed={seed + 26} amp={0.3} />
      )}
    </>
  )
}

/** The engine's "?" over a puzzled robot, never mirrored. */
function Puzzled({ g }: { g: G }) {
  const bx = g.W2 - 4
  const by = g.top - 44

  return (
    <g className='rb-q'>
      <Ink className='rb-q__tag' pts={rr(bx, by, 26, 30, 8)} seed={g.seed + 27} />
      <text x={bx + 13} y={by + 16} className='rb-q__mark'>
        ?
      </text>
    </g>
  )
}

/** Each robot's drawing, worked out once: only which face, pose and tag show changes. */
const DRAWN: Record<Who, { body: ReactNode; faces: Record<Mood, ReactNode>; arms: Record<Pose, ReactNode>; q: ReactNode }> =
  Object.fromEntries(
    (Object.keys(SPECS) as Who[]).map(who => {
      const g = geometry(who)

      return [
        who,
        {
          body: (
            <>
              <Body g={g} />
              <Head g={g} />
              <Ink
                className='rb-screen'
                pts={rr(-g.scW / 2, g.scY, g.scW, g.scH, 12)}
                seed={g.seed + 14}
                amp={1.1}
              />
            </>
          ),
          faces: Object.fromEntries(MOODS.map(m => [m, <Face key={m} g={g} mood={m} />])) as Record<Mood, ReactNode>,
          arms: Object.fromEntries(POSES.map(p => [p, <Arms key={p} g={g} pose={p} />])) as Record<Pose, ReactNode>,
          q: <Puzzled g={g} />
        }
      ]
    })
  ) as Record<Who, { body: ReactNode; faces: Record<Mood, ReactNode>; arms: Record<Pose, ReactNode>; q: ReactNode }>

export function Robot({
  who,
  mood = 'normal',
  pose = 'idle',
  facing = 'right'
}: {
  who: Who
  mood?: Mood
  pose?: Pose
  facing?: 'left' | 'right'
}) {
  const d = DRAWN[who]

  return (
    <svg
      className={`rb rb--${who}`}
      data-mood={mood}
      data-pose={pose}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      aria-hidden='true'
    >
      <g transform={facing === 'left' ? 'scale(-1 1)' : undefined}>
        {d.body}
        {MOODS.map(m => (
          <g key={m} className='rb-mood' data-on={m === mood || undefined}>
            {d.faces[m]}
          </g>
        ))}
        {POSES.map(p => (
          <g key={p} className='rb-pose' data-on={p === pose || undefined}>
            {d.arms[p]}
          </g>
        ))}
      </g>
      {d.q}
    </svg>
  )
}
