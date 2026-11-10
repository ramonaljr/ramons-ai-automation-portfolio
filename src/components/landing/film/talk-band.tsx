'use client'

import type { CSSProperties, ReactNode } from 'react'

import { FEET, Robot, VIEW, type Mood, type Pose, type Who } from '@/components/landing/film/cast'
import { Ink } from '@/components/landing/film/ink'
import { ln, rr, type Pt } from '@/components/landing/film/sketch'
import type { Line } from '@/components/landing/film/talk'

/**
 * The drawn world of a film: the paper, the robots on it and what they say.
 * Every film's stage is 960 by 540, landscape on every screen.
 *
 * In the `ink` world the paper covers the whole stage and the film's drawn
 * props (`back`, behind the robots, and `front`, before them) stand on it.
 * In the `build` world the paper drops to a band along the foot of the stage,
 * the clean build shows above it, and the robots stand in the band and talk
 * the build through. One bubble shows at a time, its tail toward whoever
 * says it.
 */

export const STAGE = { w: 960, h: 540 } as const

/** The band's height in the build world: the build has the 420 px above it. */
export const BAND = 120

/** Where a robot stands, in stage px: `x` its centre, `y` its feet, `w` its width. */
export type Spot = { x: number; y: number; w: number }

/** The band's two places: one robot each end. */
export const BAND_SPOTS = {
  left: { x: 82, y: 534, w: 150 },
  right: { x: 878, y: 534, w: 150 }
} as const satisfies Record<string, Spot>

export type Actor = {
  who: Who
  spot: Spot
  mood: Mood

  /** Held whatever is said; otherwise a raised hand while speaking. */
  pose?: Pose

  /** Off stage: walked out to the side. */
  out?: boolean
}

/** A robot's box at width 100, from which every spot is scaled. */
const BASE = 100
const BASE_H = (BASE * VIEW.h) / VIEW.w

/** The bubbles: one long one in the band, a shorter one over a speaker on the paper. */
const BUBBLE = {
  build: { w: 640, h: 72, x: (STAGE.w - 660) / 2, y: STAGE.h - BAND + (BAND - 72) / 2 },
  ink: { w: 460, h: 80 }
} as const

const BUBBLE_INK = rr(0, 0, BUBBLE.ink.w, BUBBLE.ink.h, 20)

const BUBBLE_BAND = rr(0, 0, BUBBLE.build.w, BUBBLE.build.h, 20)

/** The tails: off the band bubble's ends, or down from the paper bubble. */
const TAIL_LEFT: Pt[] = [
  [3, 26],
  [-18, 38],
  [3, 48]
]

const TAIL_RIGHT: Pt[] = TAIL_LEFT.map(([x, y]) => [BUBBLE.build.w - x, y] as const)

/** The paper's top edge, a long wobbly line. */
const EDGE = ln(-10, 1, STAGE.w + 10, 1)

/** The paper's floor line, where robots on the paper stand. */
export const FLOOR = 472

const FLOOR_LINE = ln(-10, FLOOR, STAGE.w + 10, FLOOR)

function boxOf(spot: Spot) {
  const s = spot.w / BASE
  const h = BASE_H * s

  return { left: spot.x - spot.w / 2, top: spot.y - h * FEET, h }
}

/**
 * A speaker's bubble. It stays up while the same robot says one line after
 * another, and only its words change, so consecutive lines never pop.
 */
function Bubble({
  on,
  world,
  spot,
  lines,
  at
}: {
  on: boolean
  world: 'ink' | 'build'
  spot: Spot
  lines: readonly { text: string; i: number }[]
  at: number
}) {
  const words = (
    <div className='tw-say__words'>
      {lines.map(l => (
        <p key={l.i} className='tw-say__text' data-on={l.i === at || undefined}>
          {l.text}
        </p>
      ))}
    </div>
  )

  if (world === 'build') {
    const b = BUBBLE.build
    const left = spot.x < STAGE.w / 2

    return (
      <div
        className='tw-say tw-say--band'
        data-on={on || undefined}
        style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
      >
        <svg
          className='tw-say__ink'
          viewBox={`-20 0 ${b.w + 40} ${b.h}`}
          style={{ left: -20, width: b.w + 40, height: b.h }}
          aria-hidden='true'
        >
          <Ink className='tw-say__shape' pts={BUBBLE_BAND} seed={left ? 71 : 72} amp={1.2} />
          <Ink className='tw-say__shape' pts={left ? TAIL_LEFT : TAIL_RIGHT} seed={73} amp={0.8} closed={false} />
        </svg>
        {words}
      </div>
    )
  }

  const b = BUBBLE.ink
  const box = boxOf(spot)
  const x = Math.round(Math.min(Math.max(spot.x - b.w / 2, 20), STAGE.w - b.w - 20))

  // Its foot sits just over the speaker's head, clear of the "?" tag's place
  const y = Math.round(Math.max(16, box.top + box.h * 0.12 - b.h - 18))
  const tx = Math.min(Math.max(spot.x - x, 40), b.w - 40)

  const tail: Pt[] = [
    [tx - 12, b.h - 3],
    [tx + (spot.x < x + b.w / 2 ? -6 : 6), b.h + 18],
    [tx + 12, b.h - 3]
  ]

  return (
    <div className='tw-say tw-say--ink' data-on={on || undefined} style={{ left: x, top: y, width: b.w, height: b.h }}>
      <svg
        className='tw-say__ink'
        viewBox={`0 0 ${b.w} ${b.h + 24}`}
        style={{ left: 0, width: b.w, height: b.h + 24 }}
        aria-hidden='true'
      >
        <Ink className='tw-say__shape' pts={BUBBLE_INK} seed={71} amp={1.2} />
        <Ink className='tw-say__shape' pts={tail} seed={75} amp={0.8} closed={false} />
      </svg>
      {words}
    </div>
  )
}

export function TalkBand({
  world,
  actors,
  lines,
  at,
  back,
  front
}: {
  world: 'ink' | 'build'
  actors: Actor[]
  lines: readonly Line[]

  /** The line showing, or -1 for none. */
  at: number
  back?: ReactNode
  front?: ReactNode
}) {
  const line = lines[at]
  const speaker = line?.who

  // Who each robot faces: whoever else is on stage, by where they stand
  const faceOf = (a: Actor) => {
    const other = actors.find(o => o !== a && !o.out)

    if (!other) return a.spot.x > STAGE.w / 2 ? 'left' : 'right'

    return other.spot.x < a.spot.x ? 'left' : 'right'
  }

  return (
    <div className='tw' data-world={world}>
      <div className='tw-paper' aria-hidden='true'>
        <div className='tw-paper__floor' style={{ top: FLOOR }} />
        <svg className='tw-paper__ink' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}>
          <Ink className='tw-paper__edge' pts={EDGE} seed={61} amp={1.4} closed={false} />
          <Ink className='tw-paper__line' pts={FLOOR_LINE} seed={63} amp={1.2} closed={false} />
        </svg>
      </div>

      <div className='tw-back'>{back}</div>

      {actors.map(a => {
        const s = a.spot.w / BASE
        const box = boxOf(a.spot)
        const says = speaker === a.who
        const mood = says ? (line?.mood ?? a.mood) : line && line.hears ? line.hears : a.mood
        const pose = a.pose ?? (says ? (line?.pose ?? 'talk') : 'idle')

        return (
          <div
            key={a.who}
            className='tw-actor'
            data-out={a.out || undefined}
            data-talking={says || undefined}
            style={
              {
                width: BASE,
                transform: `translate(${box.left}px, ${box.top}px) scale(${s})`,
                '--out': a.spot.x > STAGE.w / 2 ? '60px' : '-60px'
              } as CSSProperties
            }
          >
            <Robot who={a.who} mood={mood} pose={says && line?.pose ? line.pose : pose} facing={faceOf(a)} />
          </div>
        )
      })}

      <div className='tw-front'>{front}</div>

      {actors.map(a => (
        <Bubble
          key={a.who}
          on={speaker === a.who}
          world={world}
          spot={a.spot}
          lines={lines.flatMap((l, i) => (l.who === a.who ? [{ text: l.text, i }] : []))}
          at={at}
        />
      ))}
    </div>
  )
}
