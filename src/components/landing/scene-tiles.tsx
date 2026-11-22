'use client'

import { useEffect, useRef } from 'react'

/**
 * A curtain of slate tiles between the opening chapter (hero, work strip,
 * proof strip) and the story. The layer sits over the scene and the opening
 * chapter but under the story, so as the handover's stretch of scroll passes,
 * tiles close one by one over the picture and the copy as it leaves, and the
 * story rises onto finished slate. At the booking form they open again in
 * reverse, and the page closes on the scene it opened with.
 *
 * Scrubbed by scroll, not played: scrolling back reopens the curtain.
 */

/** Where in an element's approach each tile starts to turn, and how long it
 *  takes. `q` runs 0 (the element's top at the bottom of the screen) to 1
 *  (at the top). Tiles start between 0.05 and 0.7 and each turns over 0.2,
 *  so the curtain is shut a little before the story's top comes into view. */
const FIRST = 0.05
const SPREAD = 0.65
const TURN = 0.2

/** Tile size in design px: 8 × 5 tiles at 1440 × 900, smaller on phones. */
const TILE_DESKTOP = 180
const TILE_MOBILE = 104

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** A seeded shuffle: the same order on every visit. */
function order(n: number): number[] {
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const ranks = Array.from({ length: n }, (_, i) => i)

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))

    ;[ranks[i], ranks[j]] = [ranks[j], ranks[i]]
  }

  return ranks
}

function tileSize() {
  const w = window.innerWidth
  const h = window.innerHeight

  return w >= 1024 ? TILE_DESKTOP * Math.min(w / 1440, h / 800) : TILE_MOBILE * Math.min(w / 415, h / 760)
}

/** How far a section has come up the screen: 0 entering, 1 at the top. */
function approach(element: HTMLElement | null) {
  return element ? clamp(1 - element.getBoundingClientRect().top / window.innerHeight) : 0
}

export function SceneTiles({
  from = 'handover',
  until = 'contact',
  className = ''
}: {
  from?: string
  until?: string
  className?: string
}) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current

    if (!grid) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let tiles: HTMLElement[] = []
    let ranks: number[] = []
    let last: string[] = []
    let frame = 0

    const build = () => {
      const size = tileSize()
      const w = window.innerWidth
      const h = window.innerHeight
      const cols = Math.ceil(w / size)
      const rows = Math.ceil(h / size)
      const fragment = document.createDocumentFragment()

      tiles = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Whole-pixel edges, so neighbours meet without hairline seams.
          const left = Math.round(c * size)
          const top = Math.round(r * size)
          const tile = document.createElement('i')

          tile.style.cssText = `left:${left}px;top:${top}px;width:${Math.round((c + 1) * size) - left}px;height:${Math.round((r + 1) * size) - top}px;opacity:0`
          fragment.append(tile)
          tiles.push(tile)
        }
      }

      grid.replaceChildren(fragment)
      ranks = order(tiles.length)
      last = tiles.map(() => '0')
    }

    const update = () => {
      frame = 0

      const n = Math.max(1, tiles.length - 1)
      const cover = approach(document.getElementById(from))
      const uncover = approach(document.getElementById(until))

      tiles.forEach((tile, i) => {
        let value: number

        if (reduced.matches) {
          // No tiles turning one by one: the whole layer fades at the same point.
          value = clamp((cover - FIRST) / (SPREAD + TURN)) * (1 - clamp((uncover - FIRST) / (SPREAD + TURN)))
        } else {
          const start = FIRST + (SPREAD * ranks[i]) / n

          // The last tile to arrive is the first to leave.
          const leave = FIRST + (SPREAD * (n - ranks[i])) / n

          value = clamp((cover - start) / TURN) * (1 - clamp((uncover - leave) / TURN))
        }

        const next = value.toFixed(3)

        // Unchanged tiles are not rewritten.
        if (next !== last[i]) {
          tile.style.opacity = next
          last[i] = next
        }
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const resize = () => {
      build()
      schedule()
    }

    build()
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', resize)
    reduced.addEventListener('change', schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', resize)
      reduced.removeEventListener('change', schedule)
    }
  }, [from, until])

  return (
    <div className={`scene-tiles pointer-events-none absolute inset-0 ${className}`} aria-hidden='true'>
      <div ref={gridRef} className='sticky top-0 h-screen overflow-hidden' />
    </div>
  )
}
