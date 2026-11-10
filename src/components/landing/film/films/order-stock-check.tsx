'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Rect } from '@/components/stageshow/kit'
import { MailCard, RecordCard, SlackCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { ln, rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/order-stock-check-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 9, Order Stock Check, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice runs the shop and
 * explains; Samantha, a customer, asks what a visitor would ask, and hers is
 * the order that's short of stock.
 *
 * Before, in ink: Dennice at a desk of orders confirmed without a look at the
 * shelf, one of them for mugs that had run out. Then the paper drops to the
 * band and two orders drive the tour: picked up by the 15-minute check, each
 * product looked up by SKU, and the two numbers compared. The mug order has
 * enough, so it's reserved, confirmed and emailed; Samantha's six totes have
 * only four on the shelf, so her order is held, never partly filled, and she's
 * emailed why. The marker lands twice: round the comparison that falls short,
 * and under the delay email. Then the low-stock alert the mug order set off,
 * and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/order-stock-check.mdx and the
 * map's lanes (docs/process-diagrams/diagrams.json). The order numbers,
 * quantities and times are illustration.
 */

const LANES = lanesOf('order-stock-check')
const FIND = laneNamed(LANES, 'Find new orders')
const ROUTE = laneNamed(LANES, 'Route by stock')
const CONFIRM = laneNamed(LANES, 'Confirm the order')
const FLAG = laneNamed(LANES, 'Flag low stock')
const HOLD = laneNamed(LANES, 'Hold short orders')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** Orders confirmed without a look at the shelf: one of them for mugs that had run out. */
const DESK: DeskWords = {
  clock: 'Tuesday · 11:20 AM',
  card: 'Confirmed today',
  sub: 'Not checked',
  rows: [
    { title: '#1031 · 3 stoneware mugs', note: 'Confirmed. Shelf empty.', at: '$54', wrong: true },
    { title: '#1032 · 2 soy candles', note: 'Confirmed', at: '$36' },
    { title: '#1033 · 1 linen tote', note: 'Confirmed, not checked', at: '$22' },
    { title: '#1034 · 1 stoneware mug', note: 'Customer not told', at: '$18' }
  ],
  label: 'JUNIPER & MOSS',
  folder: 'ORDERS'
}

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; samantha: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, samantha: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { dennice: BAND_SPOTS.left, samantha: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, samantha: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  sMood: Mood
  samantha: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  mugs: 'none' | 'new' | 'confirmed'
  totes: 'none' | 'new' | 'held'
  looked: boolean
  compared: number
  mugsLeft: number
  confirmed: boolean
  delayed: boolean
  low: boolean
  stamped: boolean
  lane: number
  step: number

  mark: 'none' | 'loop' | 'under'
  markAt: Rect | null
  cta: boolean
}

const BLANK: S = {
  world: 'ink',
  place: 'desk',
  settle: false,
  dMood: 'normal',
  sMood: 'normal',
  samantha: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  mugs: 'none',
  totes: 'none',
  looked: false,
  compared: 0,
  mugsLeft: 11,
  confirmed: false,
  delayed: false,
  low: false,
  stamped: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', sMood: 'puzzled', samantha: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', sMood: 'normal', mugs: 'new', totes: 'new' }

const P4: S = {
  ...P3,
  mugs: 'confirmed',
  totes: 'held',
  looked: true,
  compared: 2,
  mugsLeft: 9,
  confirmed: true,
  delayed: true,
  stamped: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Orders are confirmed before anyone checks the shelf.', ...wordsOf(0, 1)],
  ms: 9400,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ samantha: true })
    await cue.wait(1100)
    await say(a, cue, 0, { sMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'Two orders',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4600,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', sMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { dMood: 'happy', mugs: 'new', totes: 'new' }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: HOLD.n, step: HOLD.steps.length - 1 },
  words: wordsOf(3, 15),
  ms: 39100,
  run: async (a, cue) => {
    // Find new orders: every 15 minutes, then each SKU looked up
    a.mark('find')
    a.put({ at: 3 })
    await toLane(a, cue, FIND.n)
    await each(cue, 2, 450, i => a.put({ step: i }))
    await cue.wait(rest(3, MOVE + 450))
    a.put({ at: 4, step: stepNamed(FIND, 'Look Up Stock For The SKU') })
    await cue.wait(400)
    await toApps(a, cue, { looked: true }, 'stock')
    await cue.wait(rest(4, MOVE + 400))

    // Route by stock: two numbers compared, and the mugs have enough
    a.mark('route')
    await say(a, cue, 5, { sMood: 'puzzled' })
    a.put({ at: 6, sMood: 'normal' })
    await toLane(a, cue, ROUTE.n)
    await each(cue, 2, 400, i => a.put({ step: i }))
    await toApps(a, cue, { compared: 1 }, 'stock')
    await cue.wait(rest(6, MOVE * 2 + 400))

    // Confirm the order: reserved, marked Confirmed, emailed
    a.mark('confirm')
    a.put({ at: 7 })
    await toLane(a, cue, CONFIRM.n, { step: stepNamed(CONFIRM, 'Reserve Stock') })
    await toApps(a, cue, { mugsLeft: 9 }, 'stock')
    await cue.wait(rest(7, MOVE * 2))
    a.put({ at: 8 })
    await toLane(a, cue, CONFIRM.n, { step: stepNamed(CONFIRM, 'Mark Order Confirmed') })
    await cue.wait(400)
    a.put({ step: stepNamed(CONFIRM, 'Email Order Confirmation') })
    await toApps(a, cue, { mugs: 'confirmed', confirmed: true })
    await cue.wait(rest(8, MOVE * 2 + 400))

    // Samantha's totes: six ordered, four on the shelf
    a.mark('short')
    a.put({ at: 9, sMood: 'puzzled' })
    await toLane(a, cue, ROUTE.n, { step: stepNamed(ROUTE, 'Not Enough Stock?') })
    await toApps(a, cue, {}, 'stock')
    await cue.wait(rest(9, MOVE * 2))
    a.put({ at: 10, sMood: 'normal', compared: 2 })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('stock-checks') })
    await cue.wait(rest(10, 300))

    // Held, never partly filled; Samantha told why, operations alerted
    a.mark('hold')
    a.put({ at: 11, mark: 'none' })
    await toLane(a, cue, HOLD.n, { step: stepNamed(HOLD, 'Put Order On Hold') })
    await toApps(a, cue, { totes: 'held' }, 'orders')
    await cue.wait(rest(11, MOVE * 2))
    a.mark('told')
    a.put({ at: 12, step: HOLD.steps.length - 1, dMood: 'happy' })
    await toApps(a, cue, { delayed: true }, 'mail')
    await cue.wait(400)
    a.put({ mark: 'under', markAt: a.rect('delay') })
    await cue.wait(rest(12, MOVE + 400))

    // No date promised: a person replies. Each order stamped.
    await say(a, cue, 13, { mark: 'none', dMood: 'normal', sMood: 'puzzled' })
    await say(a, cue, 14, { sMood: 'normal' })
    a.mark('stamped')
    a.put({ at: 15 })
    await toApps(a, cue, { stamped: true }, 'orders')
    await cue.wait(rest(15, MOVE))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Low stock',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, low: true, view: 'apps', focus: null, lane: FLAG.n, step: FLAG.steps.length - 1 },
  words: wordsOf(16, 18),
  ms: 9200,
  run: async (a, cue) => {
    a.mark('low')
    a.put({ at: 16, sMood: 'puzzled' })
    await toLane(a, cue, FLAG.n, { step: stepNamed(FLAG, 'Below Reorder Level?') })
    await cue.wait(rest(16, MOVE))
    a.put({ at: 17, sMood: 'normal', step: stepNamed(FLAG, 'Alert Operations In Slack') })
    await cue.wait(400)
    await toApps(a, cue, { low: true }, 'slack')
    await cue.wait(rest(17, MOVE + 400))
    await say(a, cue, 18)
    await toApps(a, cue, { at: -1 })
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, low: true, view: 'apps', focus: null },
  still: { ...P4, low: true, world: 'ink', place: 'end', dMood: 'happy', sMood: 'happy', focus: null, cta: true },
  words: wordsOf(19, 20),
  ms: 8100,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 19, { dMood: 'happy', sMood: 'happy' })
    await say(a, cue, 20, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: a taped parcel, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(8.5, 3.5, 9, 8, 1)} seed={83} amp={0.3} passes={1} />
    <Ink className='fa-token__tape' pts={ln(13, 3.5, 13, 11.5)} seed={84} amp={0.2} closed={false} passes={1} />
  </svg>
)

const tick = (on: boolean): CheckState => (on ? 'ok' : 'wait')

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'samantha', spot: spots.samantha, mood: s.sMood, out: !s.samantha }
  ]

  const status = { none: '', new: 'New', confirmed: 'Confirmed', held: 'On hold' }

  return (
    <div className='fa fa-four fo' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='orders'
                mark={<ToolMark tool='googlesheets' size={18} />}
                title='Order sheet'
                status={s.mugs === 'none' ? 'Waiting' : '2 new'}
                fields={[
                  { label: '#1042', value: `2 mugs · ${status[s.mugs]}`, shown: s.mugs !== 'none' },
                  { label: '#1043', value: `6 totes · ${status[s.totes]}`, shown: s.totes !== 'none' },
                  { label: 'Customer', value: 'Samantha, #1043', shown: s.totes !== 'none' }
                ]}
                checksTitle='Stamped'
                checks={[
                  { label: '#1042 · Confirmed, 11:15', state: tick(s.stamped) },
                  { label: '#1043 · On hold, 11:15', state: tick(s.stamped) }
                ]}
              />
              <RecordCard
                target='stock'
                mark={<ToolMark tool='googlesheets' size={18} />}
                title='Inventory'
                status={s.compared === 2 ? 'Totes short' : s.looked ? 'Looked up' : 'Waiting'}
                tone={s.compared === 2 ? 'warn' : 'neutral'}
                fields={[
                  { label: 'MUG-STN', value: `${s.mugsLeft} in stock`, shown: s.looked },
                  { label: 'TOTE-LIN', value: '4 in stock', shown: s.looked },
                  { label: 'Mug reorder', value: 'Below 10', shown: s.looked }
                ]}
                checksTitle='Ordered, in stock'
                checks={[
                  { label: 'Mugs: 2 of 11', state: tick(s.compared > 0) },
                  { label: 'Totes: 6 of 4', state: s.compared > 1 ? 'flag' : 'wait' }
                ]}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Customer emails'
                status={s.delayed ? '2 sent' : s.confirmed ? '1 sent' : 'Waiting'}
                mails={[
                  {
                    from: 'To Samantha',
                    subject: 'Order #1043 is delayed: 6 ordered, 4 in stock',
                    shown: s.delayed,
                    target: 'delay'
                  },
                  {
                    from: 'To the #1042 customer',
                    subject: 'Order #1042 confirmed: 2 stoneware mugs',
                    shown: s.confirmed,
                    read: true
                  }
                ]}
              />
              <SlackCard
                channel='#operations'
                bot='make'
                posts={[
                  {
                    who: 'Stock check',
                    text: 'Order #1043 on hold: 6 linen totes ordered, 4 in stock. Follow up within one business day.',
                    shown: s.delayed
                  },
                  {
                    who: 'Stock check',
                    text: 'Stoneware mug below its reorder level: 9 left, reorder at 10.',
                    shown: s.low
                  }
                ]}
              />
            </div>
            <div className='fa-map'>
              <div className='fa-plate' />
              <LaneMap lanes={LANES} lit={s.lane} step={s.step} token={TOKEN} />
            </div>
          </Camera>
        </div>
      </div>

      <TalkBand
        world={s.world}
        actors={actors}
        lines={LINES}
        at={s.at}
        back={
          <div className='fa-desk' data-on={s.place === 'desk' || undefined}>
            <DeskBack words={DESK} rows={s.pile} still={s.settle} />
          </div>
        }
        front={
          <div className='fa-desk' data-on={s.place === 'desk' || undefined}>
            <DeskFront words={DESK} still={s.settle} />
          </div>
        }
      />

      <Marker shape={s.mark === 'under' ? 'under' : 'loop'} at={s.markAt} on={s.mark !== 'none' && s.world === 'build'} />

      <p className='fa-cta' data-on={s.cta || undefined}>
        Run it yourself below
        <ArrowDown size={16} absoluteStrokeWidth strokeWidth={1.75} aria-hidden='true' />
      </p>
    </div>
  )
}

export const ORDER_STOCK: FilmDef<S> = {
  title: 'Order Stock Check',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function OrderStockFilm() {
  return <FilmStage def={ORDER_STOCK} />
}
