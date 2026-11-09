'use client'

import { useEffect, useState, type RefObject } from 'react'

import { useReducedMotion } from '@/components/stageshow/kit'

/** A beat on the finished payoff before the next column starts. */
const PAUSE = 1400

/** Move on anyway if a turn never reports (it left the screen mid-play). */
const FALLBACK = 20000

/**
 * Takes turns between scenes played in `turn` mode (scene.tsx): one plays
 * while the others hold their payoff. A scene marks its stage
 * `data-mark="turn-done"` when it lands; after a beat, the next one plays.
 * `round` counts every turn, so the playing scene can be remounted fresh.
 * Nothing turns while `running` is false or under reduced motion.
 */
export function useTurns(ref: RefObject<HTMLElement | null>, count: number, running: boolean) {
  const reduced = useReducedMotion()
  const [round, setRound] = useState(0)

  useEffect(() => {
    const node = ref.current

    if (!node || !running || reduced) return

    let timer = 0

    const next = (delay: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setRound(value => value + 1), delay)
    }

    const observer = new MutationObserver(records => {
      if (records.some(record => (record.target as Element).getAttribute('data-mark') === 'turn-done')) next(PAUSE)
    })

    observer.observe(node, { subtree: true, attributes: true, attributeFilter: ['data-mark'] })
    next(FALLBACK)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [ref, count, running, reduced, round])

  return { turn: running && !reduced ? round % count : -1, round }
}
