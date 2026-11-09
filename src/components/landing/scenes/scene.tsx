'use client'

import { useState, type ReactNode } from 'react'

import { Stage, type Act, type Layout, type StageProps } from '@/components/stageshow/kit'

/**
 * One scene, three ways to show it:
 * - loop: plays to its payoff, holds, leaves and starts again (Process,
 *   Services).
 * - turn: starts on its payoff, leaves, plays once to the payoff again and
 *   holds there, then marks the stage `data-mark="turn-done"` so a host can
 *   pass the turn on (Engagement's columns, one at a time).
 * - still: its payoff, with no script.
 *
 * A scene's payoff state is its poster, so a turn starts and ends on the
 * same frame a still shows, and a column can swap between them unseen.
 */
export type SceneMode = 'loop' | 'turn' | 'still'

export type SceneProps = { mode?: SceneMode }

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

  /** `layout` is 'compact' below the size's `compact.below`, for scenes placed in stage pixels. */
  render: (s: S, layout: Layout) => ReactNode
}

/** The size Process and Engagement scenes share, with a narrow design. */
export const SHEET: SceneSize = { width: 520, height: 460 }

export const SHEET_COMPACT: SceneSize = { ...SHEET, compact: { below: 400, width: 360, height: 440 } }

/** Services: the hover card's 16 : 10, with a narrow design for phones. */
export const CARD: SceneSize = { width: 600, height: 375, compact: { below: 380, width: 360, height: 400 } }

const scriptFor = <S extends object>(def: SceneDef<S>, mode: SceneMode) => {
  if (mode === 'still') return undefined

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

export function SceneStage<S extends object>({ def, mode = 'loop' }: SceneProps & { def: SceneDef<S> }) {
  // One script for the stage's life: Stage starts a fresh scene whenever its
  // script changes. A host changes the mode by remounting.
  const [script] = useState(() => scriptFor(def, mode))

  return (
    <Stage<S>
      width={def.size.width}
      height={def.size.height}
      compact={def.size.compact}
      greys='cool'
      initial={mode === 'loop' ? def.start : def.poster}
      poster={def.poster}
      script={script}
      play={mode === 'turn' ? 'once' : 'loop'}
      cursor={def.cursor}
    >
      {(s, _rect, layout) => def.render(s, layout)}
    </Stage>
  )
}
