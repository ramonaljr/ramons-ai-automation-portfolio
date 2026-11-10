'use client'

import { Ink } from '@/components/landing/film/ink'
import { ln, rr } from '@/components/landing/film/sketch'
import { STAGE } from '@/components/landing/film/talk-band'

/**
 * The drawn desk the "before" of films 2 onwards opens on: a pinboard, a
 * clock tag, and a card of the week's work done by hand, one row of it gone
 * wrong in red; in front, the desk with its label, a paper stack and a folder.
 * Each film gives it its own words; the drawing stays the same, so the films
 * read as one set.
 */

export type DeskRow = { title: string; note: string; at: string; wrong?: boolean }

export type DeskWords = {
  clock: string
  card: string
  sub: string
  rows: DeskRow[]
  label: string
  folder: string
}

const WOOD = rr(64, 358, 472, 22, 5)
const DESK = rr(84, 376, 432, 100, 4)
const BOARD = rr(66, 46, 210, 140, 8)
const CLOCK = rr(306, 64, 176, 36, 10)

// The card sits high, clear of the second robot's "?" when it walks in below
const CARD = rr(556, 50, 364, 238, 12)
const TAG = rr(206, 410, 188, 30, 6)

/** The pinboard, the clock and the card of hand work, behind the robots. */
export function DeskBack({ words, rows, still }: { words: DeskWords; rows: number; still: boolean }) {
  return (
    <svg className='fd' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} data-ink={still ? 'still' : undefined}>
      <Ink className='fb-board' pts={BOARD} seed={11} />
      {[
        [86, 62, 70, 52, -4],
        [168, 70, 84, 60, 3],
        [110, 122, 76, 50, 2]
      ].map(([x, y, w, h, r], i) => (
        <g key={i} transform={`rotate(${r} ${x! + w! / 2} ${y! + h! / 2})`}>
          <Ink className='fb-sheet' pts={rr(x!, y!, w!, h!, 2)} seed={12 + i} amp={0.6} />
          <Ink className='fd-rule' pts={ln(x! + 8, y! + 16, x! + w! - 12, y! + 16)} seed={15 + i} closed={false} passes={1} />
          <Ink className='fd-rule' pts={ln(x! + 8, y! + 28, x! + w! - 20, y! + 28)} seed={18 + i} closed={false} passes={1} />
        </g>
      ))}

      <Ink className='fd-tag' pts={CLOCK} seed={16} amp={0.7} />
      <text className='fd-clock' x='394' y='88'>
        {words.clock}
      </text>

      <g className='fd-missed' data-on={rows > 0 || undefined}>
        <Ink className='fd-card' pts={CARD} seed={17} />
        <text className='fd-missed__title' x='584' y='90'>
          {words.card}
        </text>
        <text className='fd-missed__sub' x='892' y='90'>
          {words.sub}
        </text>
        {words.rows.map((p, i) => {
          const y = 136 + i * 44

          return (
            <g key={i} className='fd-row' data-on={rows > i || undefined}>
              <Ink className='fd-rule' pts={ln(578, y - 26, 898, y - 26)} seed={20 + i} closed={false} passes={1} />
              <text className='fd-row__from' x='584' y={y - 4}>
                {p.title}
              </text>
              <text className={p.wrong ? 'fd-row__note fb-twice' : 'fd-row__note'} x='584' y={y + 13}>
                {p.note}
              </text>
              <text className='fd-row__at' x='892' y={y - 4}>
                {p.at}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** The desk front, with its label, a stack of paper and a folder on it. */
export function DeskFront({ words, still }: { words: DeskWords; still: boolean }) {
  return (
    <svg className='fd' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} data-ink={still ? 'still' : undefined}>
      <Ink className='fd-desk' pts={DESK} seed={41} />
      <Ink className='fd-wood' pts={WOOD} seed={42} amp={0.8} />
      <Ink className='fd-tag' pts={TAG} seed={43} amp={0.6} />
      <text className='fd-label' x='300' y='430'>
        {words.label}
      </text>
      {[0, 1, 2, 3, 4].map(i => (
        <Ink key={i} className='fb-sheet' pts={rr(396 + (i % 2) * 6, 344 - i * 8, 92, 14, 2)} seed={50 + i} amp={0.5} />
      ))}
      <Ink className='fb-folder' pts={rr(110, 336, 96, 24, 3)} seed={56} amp={0.6} />
      <text className='fb-folder__label' x='158' y='353'>
        {words.folder}
      </text>
    </svg>
  )
}
