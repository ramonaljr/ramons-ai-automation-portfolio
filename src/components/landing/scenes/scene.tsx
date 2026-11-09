'use client'

import { useState, type ReactNode } from 'react'

import type { MotionValue } from 'motion/react'

import { Stage, type Act, type Layout, type StageProps } from '@/components/stageshow/kit'

/**
 * One scene, three ways to show it:
 * - loop: plays to its payoff, holds, leaves and starts again (Process,
 *   Services).
 * - turn: starts on its payoff, leaves, plays once to the payoff again and
 *   holds there, then marks the stage `data-mark="turn-done"` so a host can
 *   pass the turn on (Engagement's columns, one at a time).
 * - once: plays from the start to its payoff and holds there (the Story
 *   panels on phones, each as it scrolls into view).
 * - scroll: follows a 0 to 1 `progress` step by step, forward or back, so
 *   the reader's scrolling is the clock (the pinned Story acts). Needs the
 *   scene's `steps`.
 * - still: its payoff, with no script.
 *
 * A scene's payoff state is its poster, so a turn starts and ends on the
 * same frame a still shows, and a column can swap between them unseen.
 */
export type SceneMode = 'loop' | 'turn' | 'once' | 'scroll' | 'still'

export type SceneProps = { mode?: SceneMode; progress?: MotionValue<number> }

/**
 * A scene told as numbered steps, for one that follows the scroll. Step 0 is
 * the start and step `count` the payoff.
 */
export type Steps<S> = {
  count: number

  /** The state with the first `n` steps taken: where stepping back lands. */
  at: (n: number) => S

  /** Plays step `n` from step `n - 1`. `quick` when the scroll is moving fast. */
  take: (a: Act<S>, n: number, quick: boolean) => Promise<void>
}

export type SceneSize = {
  width: number
  height: number
  compact?: { below: number; width: number; height: number }
}

export type SceneDef<S extends object> = {
  size: SceneSize
  start: S

  /** The payoff: where play ends and what a still shows. */
  poster: S

  /** From the start to the payoff. */
  play: (a: Act<S>) => Promise<void>

  /** From the payoff back to the start, fading first so nothing rewinds in view. */
  exit: (a: Act<S>) => Promise<void>

  /** How long a loop holds its payoff, in ms. */
  hold?: number
  cursor?: StageProps<S>['cursor']

  /** For scroll mode. */
  steps?: Steps<S>

  /** `layout` is 'compact' below the size's `compact.below`, for scenes placed in stage pixels. */
  render: (s: S, layout: Layout) => ReactNode
}

/** The size Process and Engagement scenes share, with a narrow design. */
export const SHEET: SceneSize = { width: 520, height: 460 }

export const SHEET_COMPACT: SceneSize = { ...SHEET, compact: { below: 400, width: 360, height: 440 } }

/** Services: the hover card's 16 : 10, with a narrow design for phones. */
export const CARD: SceneSize = { width: 600, height: 375, compact: { below: 380, width: 360, height: 400 } }

/** Resolves on the value's next change, or straight away once the run is stopped. */
const changed = (value: MotionValue<number>, signal: AbortSignal) =>
  new Promise<void>(resolve => {
    if (signal.aborted) return resolve()

    const done = () => {
      off()
      signal.removeEventListener('abort', done)
      resolve()
    }

    const off = value.on('change', done)

    signal.addEventListener('abort', done, { once: true })
  })

/**
 * Keeps the scene at the step the scroll says. One step ahead plays that
 * step; further ahead jumps to the step before and plays only the last, so a
 * fast scroll scrubs through like a video instead of trailing behind it (a
 * scene playing every step in turn was still two items short when its act
 * left). Back snaps one step at a time. With nothing to do it sleeps until
 * the scroll moves. The stage resets to the start whenever it stops a run, so
 * every run starts from step 0.
 */
const follow =
  <S extends object>(steps: Steps<S>, progress: MotionValue<number>) =>
  async (a: Act<S>) => {
    let n = 0

    const target = () => Math.round(Math.min(1, Math.max(0, progress.get())) * steps.count)

    for (;;) {
      const to = target()

      if (to > n) {
        const behind = to - n > 1

        if (behind) a.put(steps.at(to - 1))

        n = to
        await steps.take(a, n, behind)
      } else if (to < n) {
        n -= 1
        a.put(steps.at(n))
        await a.wait(90)
      } else {
        await changed(progress, a.signal)

        if (a.signal.aborted) return
      }
    }
  }

const scriptFor = <S extends object>(def: SceneDef<S>, mode: SceneMode, progress?: MotionValue<number>) => {
  if (mode === 'still') return undefined

  if (mode === 'scroll' && def.steps && progress) return follow(def.steps, progress)

  if (mode === 'once') {
    return async (a: Act<S>) => {
      // Past the stage's first measuring frames, as in a turn
      await a.wait(400)
      await def.play(a)
      a.mark('turn-done')
    }
  }

  if (mode === 'turn') {
    return async (a: Act<S>) => {
      // The stage holds transitions off while it first measures; leaving
      // inside that window would drop the payoff in one frame
      await a.wait(500)
      await def.exit(a)
      await def.play(a)
      a.mark('turn-done')
    }
  }

  return async (a: Act<S>) => {
    await def.play(a)
    await a.wait(def.hold ?? 2400)
    await def.exit(a)
  }
}

export function SceneStage<S extends object>({ def, mode = 'loop', progress }: SceneProps & { def: SceneDef<S> }) {
  // One script for the stage's life: Stage starts a fresh scene whenever its
  // script changes. A host changes the mode by remounting.
  const [script] = useState(() => scriptFor(def, mode, progress))

  return (
    <Stage<S>
      width={def.size.width}
      height={def.size.height}
      compact={def.size.compact}
      greys='cool'
      initial={mode === 'turn' || mode === 'still' ? def.poster : def.start}
      poster={def.poster}
      script={script}
      play={mode === 'loop' ? 'loop' : 'once'}
      cursor={def.cursor}
    >
      {(s, _rect, layout) => def.render(s, layout)}
    </Stage>
  )
}
