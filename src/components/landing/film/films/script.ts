import type { Act, Rect } from '@/components/stageshow/kit'
import type { Cue } from '@/components/landing/film/film-stage'
import { asWords, holdFor, type Line } from '@/components/landing/film/talk'

/**
 * The beats every Two Worlds film's script is made of, shared so each film
 * reads as its story, not its plumbing. Film 1 keeps its own copies, as it was
 * approved with them.
 */

/** A camera move between the apps and the map, and its wait. */
export const MOVE = 1150

/** The state every film's script moves: the line showing, the view and the lit lane. */
export type Base = {
  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  lane: number
  step: number
}

export function scriptFor<S extends Base>(lines: readonly Line[]) {
  /** Say line `i`, and hold it while the build shows what it means. */
  const say = async (a: Act<S>, cue: Cue, i: number, patch: Partial<S> = {}, ms = holdFor(lines[i]!)) => {
    a.put({ at: i, ...patch } as Partial<S>)
    await cue.wait(ms)
  }

  /** What's left of line `i`'s hold once `used` ms of it have gone on beats. */
  const rest = (i: number, used: number) => Math.max(400, holdFor(lines[i]!) - used)

  /** Move in on a lane of the map. */
  const toLane = async (a: Act<S>, cue: Cue, lane: number, patch: Partial<S> = {}) => {
    a.put({ view: 'map', lane, step: -1, focus: a.rect(`lane-${lane}`, { layout: true }), ...patch } as Partial<S>)
    await cue.wait(MOVE)
  }

  /** Back out to the apps: the whole build, or moved in on one card. */
  const toApps = async (a: Act<S>, cue: Cue, patch: Partial<S> = {}, on?: string) => {
    a.put({ view: 'apps', focus: on ? a.rect(on, { layout: true }) : null, ...patch } as Partial<S>)
    await cue.wait(MOVE)
  }

  const step = async (a: Act<S>, cue: Cue, i: number, ms: number) => {
    a.put({ step: i } as Partial<S>)
    await cue.wait(ms)
  }

  /** Each part's lines, as reduced-motion text under its still. */
  const wordsOf = (from: number, to: number) => lines.slice(from, to + 1).map(asWords)

  return { say, rest, toLane, toApps, step, wordsOf }
}

/** `n` beats `gap` ms apart, held by pause like every other wait. */
export async function each(cue: Cue, n: number, gap: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    if (i) await cue.wait(gap)
    fn(i)
  }
}
