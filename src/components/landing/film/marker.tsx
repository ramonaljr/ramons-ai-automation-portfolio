'use client'

import type { Rect } from '@/components/stageshow/kit'
import { STAGE } from '@/components/landing/film/talk-band'
import { inkPath, type Pt } from '@/components/landing/film/sketch'

/**
 * The marker pen: one hand-drawn terracotta loop round, or line under, the
 * film's key moment on the clean build. It draws itself on once and holds,
 * without boiling. `at` is where the thing marked is drawn now, in stage px
 * (the script measures it once the camera has settled).
 */

/** A loop drawn a little past where it began, as a hand circles something. */
function loop(r: Rect): Pt[] {
  const cx = r.x + r.width / 2
  const cy = r.y + r.height / 2
  const rx = r.width / 2 + 16
  const ry = r.height / 2 + 12
  const pts: Pt[] = []
  const n = 44

  for (let i = 0; i <= n; i++) {
    const a = -2.4 + (i / n) * (Math.PI * 2 + 0.6)
    const grow = 1 + (i / n) * 0.06

    pts.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow])
  }

  return pts
}

/** A quick underline, rising slightly to the right, with a short hook back. */
function under(r: Rect): Pt[] {
  const y = r.y + r.height + 5
  const pts: Pt[] = []
  const n = 14

  for (let i = 0; i <= n; i++) pts.push([r.x - 6 + ((r.width + 14) * i) / n, y + 2 - (3 * i) / n])

  pts.push([r.x + r.width - 10, y + 3])

  return pts
}

export function Marker({ shape, at, on }: { shape: 'loop' | 'under'; at: Rect | null; on: boolean }) {
  const d = at ? inkPath(shape === 'loop' ? loop(at) : under(at), { seed: 91, amp: 1.3, closed: false }) : ''

  return (
    <svg className='tw-marker' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} data-on={(on && !!at) || undefined} aria-hidden='true'>
      {/* Keyed by where it goes, so a new mark draws on from the start */}
      {at && <path key={d} d={d} pathLength={1} />}
    </svg>
  )
}
