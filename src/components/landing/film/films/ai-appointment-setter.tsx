'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Act, type Rect } from '@/components/stageshow/kit'
import {
  AirtableCard,
  CalendarDay,
  CallCard,
  type CallState,
  type CalState,
  type Line as CallLine
} from '@/components/landing/film/app-cards'
import type { Mood, Pose } from '@/components/landing/film/cast'
import { FilmStage, type Cue, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { ell, ln, rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/ai-appointment-setter-lines'
import { asWords, holdFor } from '@/components/landing/film/talk'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'

/**
 * Film 1, the AI Appointment Setter, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). The drawn world is people and
 * the problem; the clean world is the build. Dennice, who keeps the front
 * desk, and Leo, who calls it, are the hand-drawn films' robots, and they
 * talk the whole film through: Leo asks what a visitor would ask, Dennice
 * answers while the build shows it.
 *
 * Before, in ink: after hours, Leo's call rings out, and in the morning
 * Dennice finds the missed calls. Then the line settles: the paper drops to a
 * band along the foot of the stage and the build shows above it. Leo calls
 * again, and that call drives the tour: he asks for tomorrow at 2, 2:00 is
 * taken, the open half hours are offered, he takes 2:30, it is checked again
 * right before booking, booked in Google Calendar and logged in Airtable, and
 * the call's result is saved. A small drawn phone rides the lit lane of the
 * process map, and a marker pen lands twice: round the open times, and under
 * the check made right before booking. Then a pass over the two lanes the
 * call didn't use, and the paper rises again for the end.
 *
 * Facts come only from src/content/case-studies/ai-appointment-setter.mdx and
 * the map's lanes and steps (docs/process-diagrams/diagrams.json). The phone
 * numbers, the missed calls and the calendar's other events are
 * illustration. Two rules of the live workflow hold throughout: a refused
 * time is never called booked, and nothing is booked until the slot is
 * checked again.
 */

const LANES = lanesOf('ai-appointment-setter')
const GET = laneNamed(LANES, 'Get slots')
const BOOK = laneNamed(LANES, 'Book slots')
const UPDATE = laneNamed(LANES, 'Update slots')
const CANCEL = laneNamed(LANES, 'Cancel slots')
const RESULTS = laneNamed(LANES, 'Call results')

const FROM = '(512) 555-0148'

const MISSED = [
  { from: FROM, at: '9:12 PM', note: 'No voicemail' },
  { from: '(737) 555-0192', at: '8:40 PM', note: 'No voicemail' },
  { from: '(512) 555-0117', at: '7:55 PM', note: 'Voicemail, 0:04' },
  { from: '(830) 555-0164', at: '6:21 PM', note: 'No voicemail' }
]

/** The call itself, as the call card's transcript shows it. */
const CALL: readonly CallLine[] = [
  { who: 'agent', text: 'Thanks for calling. How can I help?' },
  { who: 'caller', text: 'Can I come in tomorrow at 2?' },
  { who: 'agent', text: '2:00 is taken. I have 2:30, 3:00 or 3:30.' },
  { who: 'caller', text: '2:30, please.' },
  { who: 'agent', text: 'You’re booked for tomorrow at 2:30.' }
]

const ASKED = 14
const FREE = [14.5, 15, 15.5]
const PICKED = 14.5

/** Each part's lines, as reduced-motion text under its still. */
const wordsOf = (from: number, to: number) => LINES.slice(from, to + 1).map(asWords)

const callWords = (i: number) => CALL[i]!.text.split(' ').length
const allCallWords = CALL.map((_, i) => callWords(i))

type Place = 'desk' | 'band' | 'end'

/** Where each robot stands: at the front desk, in the band, and at the end. */
const SPOTS: Record<Place, { dennice: Spot; leo: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, leo: { x: 790, y: FLOOR - 2, w: 230 } },
  band: { dennice: BAND_SPOTS.left, leo: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, leo: { x: 650, y: FLOOR - 2, w: 220 } }
}

type S = {

  /** The drawn world over the whole stage, or the build above the band. */
  world: 'ink' | 'build'
  place: Place

  /** The desk's ink stops boiling: the moment before the line settles. */
  settle: boolean
  night: boolean
  ring: boolean
  list: boolean
  missed: number
  dMood: Mood
  lMood: Mood
  leo: boolean
  lPose: Pose | null

  /** The line showing, or -1. */
  at: number

  /** The build: the apps, or moved in on the map. */
  view: 'apps' | 'map'
  focus: Rect | null
  call: CallState
  secs: number
  lines: number
  w: number[]
  cal: CalState
  booked: boolean
  result: boolean
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
  night: true,
  ring: false,
  list: false,
  missed: 0,
  dMood: 'off',
  lMood: 'normal',
  leo: true,
  lPose: 'phone',
  at: -1,
  view: 'apps',
  focus: null,
  call: 'ring',
  secs: 0,
  lines: 0,
  w: [0, 0, 0, 0, 0],
  cal: 'idle',
  booked: false,
  result: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

// Each part starts where the one before it ends, so a chapter jump and a
// straight run reach the same frame.
const P2: S = { ...BLANK, night: false, dMood: 'puzzled', leo: false, list: true, missed: MISSED.length }

const P3: S = {
  ...P2,
  world: 'build',
  place: 'band',
  dMood: 'normal',
  leo: true,
  list: false,
  call: 'live',
  secs: 6,
  lines: 2,
  w: [callWords(0), 0, 0, 0, 0]
}

const P4: S = {
  ...P3,
  lPose: null,
  secs: 14,
  call: 'ended',
  lines: 5,
  w: allCallWords,
  cal: 'booked',
  booked: true,
  result: true
}

/* ── Script helpers ─────────────────────────────────────────────────────── */

const MOVE = 1150

/** Say line `i`, and hold it while the build shows what it means. */
async function say(a: Act<S>, cue: Cue, i: number, patch: Partial<S> = {}, ms = holdFor(LINES[i]!)) {
  a.put({ at: i, ...patch })
  await cue.wait(ms)
}

/** What's left of line `i`'s hold once `used` ms of it have gone on beats. */
const rest = (i: number, used: number) => Math.max(400, holdFor(LINES[i]!) - used)

async function stream(a: Act<S>, cue: Cue, line: number) {
  for (let i = 1; i <= callWords(line); i++) {
    a.put(s => ({ w: s.w.map((v, j) => (j === line ? i : v)) }))
    await cue.wait(60)
  }
}

/** `n` beats `gap` ms apart, held by pause like every other wait. */
async function each(cue: Cue, n: number, gap: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    if (i) await cue.wait(gap)
    fn(i)
  }
}

/** The call timer, one tick a second while the call is live, until stopped. */
function ticker(a: Act<S>, cue: Cue) {
  let on = true

  void (async () => {
    try {
      while (on) {
        await cue.wait(1000)

        if (on) a.put(s => (s.call === 'live' ? { secs: s.secs + 1 } : {}))
      }
    } catch {
      // The run was stopped: a chapter jump, or the stage left the screen
    }
  })()

  return () => {
    on = false
  }
}

/** Move in on a lane of the map. */
async function toLane(a: Act<S>, cue: Cue, lane: number) {
  a.put({ view: 'map', lane, step: -1, focus: a.rect(`lane-${lane}`, { layout: true }) })
  await cue.wait(MOVE)
}

/** Back out to the apps: the whole build, or moved in on one card. */
async function toApps(a: Act<S>, cue: Cue, patch: Partial<S> = {}, on?: string) {
  a.put({ view: 'apps', focus: on ? a.rect(on, { layout: true }) : null, ...patch })
  await cue.wait(MOVE)
}

async function step(a: Act<S>, cue: Cue, i: number, ms: number) {
  a.put({ step: i })
  await cue.wait(ms)
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['After hours, the front desk phone rings out.', ...wordsOf(0, 1)],
  ms: 11200,
  run: async (a, cue) => {
    await cue.wait(400)
    a.put({ ring: true })
    await cue.wait(2400)
    a.put({ ring: false })
    await cue.wait(300)
    await say(a, cue, 0)
    a.put({ at: -1, lMood: 'puzzled' })
    await cue.wait(800)
    a.put({ leo: false })
    await cue.wait(700)

    // Morning: Dennice powers on to the night's missed calls
    a.put({ night: false, dMood: 'normal' })
    await cue.wait(700)
    a.put({ list: true })
    await cue.wait(250)
    await each(cue, MISSED.length, 220, i => a.put({ missed: i + 1 }))
    await cue.wait(300)
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The call',
  start: P2,
  still: P3,
  words: wordsOf(2, 3),
  ms: 7400,
  run: async (a, cue) => {
    // The line settles: the desk's ink stops, the paper drops to the band
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', lMood: 'normal', leo: true, lPose: 'phone' })
    await cue.wait(1200)
    a.put({ settle: false })

    a.mark('answer')
    a.put({ at: 2, dMood: 'happy', call: 'live', lines: 1 })

    const stop = ticker(a, cue)

    await cue.wait(300)
    await stream(a, cue, 0)
    await cue.wait(rest(2, 300 + callWords(0) * 60))
    await say(a, cue, 3, { lines: 2, dMood: 'normal' })
    stop()
    a.put({ secs: 6 })
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: {
    ...P4,
    view: 'apps',
    focus: null,
    lane: BOOK.n,
    step: stepNamed(BOOK, 'Log book details')
  },
  words: wordsOf(4, 14),
  ms: 38800,
  run: async (a, cue) => {
    const stop = ticker(a, cue)

    // Get slots: is 2:00 free?
    a.mark('get-slots')
    a.put({ at: 4, lPose: null })
    await toLane(a, cue, GET.n)
    await step(a, cue, stepNamed(GET, 'GetSlots'), rest(4, MOVE))
    await say(a, cue, 5, { step: stepNamed(GET, 'Prepare request') }, 900)
    await step(a, cue, stepNamed(GET, 'Get all events'), rest(5, 900))
    await say(a, cue, 6, { step: stepNamed(GET, 'Check rules, list free times') })

    // Back to the apps: 2:00 is taken
    await toApps(a, cue, { at: -1 })
    a.put({ cal: 'checking' })
    await cue.wait(600)
    a.put({ at: 7 })
    await cue.wait(1000)
    a.put({ cal: 'open', step: stepNamed(GET, 'Respond to Vapi') })
    await cue.wait(rest(7, 1000))

    // The open times, offered on the call: the marker rings them
    a.mark('offer')
    a.put({ at: 8, lines: 3, mark: 'loop', markAt: a.rect('free-times') })
    await stream(a, cue, 2)
    await cue.wait(rest(8, callWords(2) * 60))
    await say(a, cue, 9, { lines: 4, lPose: 'phone' })
    a.put({ mark: 'none', lPose: null })

    // Book slots: checked again before anything is written
    a.mark('book-slots')
    a.put({ at: 10 })
    await toLane(a, cue, BOOK.n)
    await step(a, cue, stepNamed(BOOK, 'BookSlots'), 450)
    await step(a, cue, stepNamed(BOOK, 'Details provided?'), 450)
    await step(a, cue, stepNamed(BOOK, 'Convert time to CST'), rest(10, MOVE + 900))
    a.put({ at: 11, step: stepNamed(BOOK, 'Get events in window') })
    await cue.wait(700)

    const check = stepNamed(BOOK, 'Check slot is free')

    a.put({ step: check })
    await cue.wait(150)
    a.mark('check-again')
    a.put({ mark: 'under', markAt: a.rect(`step-${BOOK.n}-${check}`) })
    await cue.wait(rest(11, 850))
    await step(a, cue, stepNamed(BOOK, 'Slot free to book?'), 700)

    a.mark('booked')
    await toApps(a, cue, { at: -1, mark: 'none', cal: 'recheck' })
    await cue.wait(500)
    await say(a, cue, 12, { cal: 'booked', step: stepNamed(BOOK, 'Create an event'), lines: 5 }, 300)
    await stream(a, cue, 4)
    await cue.wait(rest(12, 300 + callWords(4) * 60))
    await say(a, cue, 13, { step: stepNamed(BOOK, 'Log book details'), booked: true })

    // The call ends; Call results saves it
    stop()
    a.put({ call: 'ended', secs: 14, at: 14 })
    a.mark('call-results')
    await toLane(a, cue, RESULTS.n)
    await step(a, cue, stepNamed(RESULTS, 'call_results'), 350)
    await step(a, cue, stepNamed(RESULTS, 'All input arguments'), 300)
    await step(a, cue, stepNamed(RESULTS, 'Create or update record'), rest(14, MOVE + 650))
    await toApps(a, cue, { at: -1, result: true }, 'airtable')
    await cue.wait(900)
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: UPDATE.n, step: UPDATE.steps.length - 1 },
  words: wordsOf(15, 18),
  ms: 10000,
  run: async (a, cue) => {
    a.mark('update-slots')
    a.put({ at: 15 })
    await toLane(a, cue, UPDATE.n)
    await cue.wait(rest(15, MOVE))
    a.put({ at: 16 })
    await each(cue, UPDATE.steps.length, 260, i => a.put({ step: i }))
    await cue.wait(rest(16, (UPDATE.steps.length - 1) * 260))
    a.mark('cancel-slots')
    a.put({ at: 17 })
    await toLane(a, cue, CANCEL.n)
    await cue.wait(rest(17, MOVE))
    a.put({ at: 18 })
    await each(cue, CANCEL.steps.length, 280, i => a.put({ step: i }))
    await cue.wait(rest(18, (CANCEL.steps.length - 1) * 280))
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: CANCEL.n, step: CANCEL.steps.length - 1 },
  still: { ...P4, world: 'ink', place: 'end', dMood: 'happy', lMood: 'happy', focus: null, cta: true },
  words: wordsOf(19, 20),
  ms: 9000,
  run: async (a, cue) => {
    // The paper rises back over the build
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 19, { dMood: 'happy', lMood: 'happy' })
    await say(a, cue, 20, { cta: true })
    await cue.wait(1300)
  }
}

/* ── The drawn front desk ───────────────────────────────────────────────── */

const WOOD = rr(64, 358, 472, 22, 5)
const DESK = rr(84, 376, 432, 100, 4)
const WINDOW = rr(66, 46, 210, 140, 8)
const CLOCK = rr(306, 64, 176, 36, 10)
const CARD = rr(556, 92, 364, 262, 12)
const TAG = rr(236, 410, 128, 30, 6)
const PHONE_BASE = rr(404, 326, 72, 34, 10)
const PHONE_SET = rr(396, 314, 88, 16, 8)

/** The desk and everything behind the robots: the window, the clock, the missed calls. */
function DeskBack({ s }: { s: S }) {
  return (
    <svg className='fd' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} data-ink={s.settle ? 'still' : undefined}>
      <g className='fd-time' data-night={s.night || undefined}>
        <g className='fd-night'>
          <Ink className='fd-window fd-window--night' pts={WINDOW} seed={11} />
          <Ink className='fd-moon' pts={ell(226, 86, 16, 16, 16)} seed={12} amp={0.6} />
          {[
            [104, 76],
            [140, 150],
            [190, 120]
          ].map(([x, y]) => (
            <circle key={x} className='fd-star' cx={x} cy={y} r='2' />
          ))}
        </g>
        <g className='fd-day'>
          <Ink className='fd-window fd-window--day' pts={WINDOW} seed={11} />
          <Ink className='fd-sun' pts={ell(222, 90, 18, 18, 16)} seed={13} amp={0.6} />
        </g>
        <Ink className='fd-frame' pts={ln(171, 48, 171, 184)} seed={14} closed={false} passes={1} />
        <Ink className='fd-frame' pts={ln(68, 116, 274, 116)} seed={15} closed={false} passes={1} />

        <Ink className='fd-tag' pts={CLOCK} seed={16} amp={0.7} />
        <text className='fd-clock fd-clock--night' x='394' y='88'>
          9:12 PM · Closed
        </text>
        <text className='fd-clock fd-clock--day' x='394' y='88'>
          8:00 AM · Open
        </text>
        <text className='fd-zz' x='336' y='236'>
          z<tspan dx='3' dy='-10' fontSize='14'>
            z
          </tspan>
        </text>
      </g>

      {/* The night's missed calls, landing one by one */}
      <g className='fd-missed' data-on={s.list || undefined}>
        <Ink className='fd-card' pts={CARD} seed={17} />
        <text className='fd-missed__title' x='584' y='134'>
          Missed calls
        </text>
        <text className='fd-missed__sub' x='892' y='134'>
          Last night
        </text>
        {MISSED.map((m, i) => {
          const y = 182 + i * 46

          return (
            <g key={m.from} className='fd-row' data-on={s.missed > i || undefined}>
              <Ink className='fd-rule' pts={ln(578, y - 26, 898, y - 26)} seed={20 + i} closed={false} passes={1} />
              <Ink className='fd-miss' pts={ln(584, y - 12, 596, y)} seed={30 + i} closed={false} passes={1} />
              <Ink className='fd-miss' pts={ln(584, y - 6, 584, y)} seed={34 + i} closed={false} passes={1} />
              <Ink className='fd-miss' pts={ln(584, y, 590, y)} seed={38 + i} closed={false} passes={1} />
              <text className='fd-row__from' x='608' y={y - 4}>
                {m.from}
              </text>
              <text className='fd-row__note' x='608' y={y + 13}>
                {m.note}
              </text>
              <text className='fd-row__at' x='892' y={y - 4}>
                {m.at}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** The desk front and the phone on it, before Dennice. */
function DeskFront({ s }: { s: S }) {
  return (
    <svg className='fd' viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} data-ink={s.settle ? 'still' : undefined}>
      <Ink className='fd-desk' pts={DESK} seed={41} />
      <Ink className='fd-wood' pts={WOOD} seed={42} amp={0.8} />
      <Ink className='fd-tag' pts={TAG} seed={43} amp={0.6} />
      <text className='fd-label' x='300' y='430'>
        FRONT DESK
      </text>
      <g className='fd-phone' data-ring={s.ring || undefined}>
        <Ink className='fd-phone__base' pts={PHONE_BASE} seed={44} />
        <Ink className='fd-phone__set' pts={PHONE_SET} seed={45} />
        <Ink className='fd-phone__key' pts={rr(424, 336, 32, 12, 3)} seed={46} amp={0.4} passes={1} />
      </g>
      <g className='fd-ring' data-on={s.ring || undefined}>
        <path d='M384 314q-8 12 0 24M374 308q-12 18 0 36M496 314q8 12 0 24M506 308q12 18 0 36' />
      </g>
    </svg>
  )
}

/** The case, drawn small: Leo's phone, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 16'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__phone' pts={rr(9.5, 3.5, 7, 9, 2)} seed={82} amp={0.3} passes={1} />
  </svg>
)

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'leo', spot: spots.leo, mood: s.lMood, pose: s.lPose ?? undefined, out: !s.leo }
  ]

  return (
    <div className='fa' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <CalendarDay
                day='Tomorrow'
                cal={s.cal}
                asked={ASKED}
                free={FREE}
                picked={PICKED}
                event='Appointment, 2:30 PM'
              />
              <CallCard
                lines={CALL}
                shown={s.lines}
                words={s.w}
                call={s.call}
                secs={s.secs}
                from={FROM}
                note={s.call === 'ring' ? '9:12 PM' : 'After hours'}
              />
              <AirtableCard
                tables={[
                  {
                    name: 'Appointments',
                    head: ['Caller', 'Time', 'Status'],
                    rows: [{ cells: [FROM, 'Tomorrow, 2:30 PM', 'Booked'], shown: s.booked }],
                    filler: true
                  },
                  {
                    name: 'Calls',
                    head: ['Caller', 'Asked for', 'Result'],
                    rows: [{ cells: [FROM, 'Tomorrow, 2 PM', 'Booked'], shown: s.result }],
                    filler: true
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
            <DeskBack s={s} />
          </div>
        }
        front={
          <div className='fa-desk' data-on={s.place === 'desk' || undefined}>
            <DeskFront s={s} />
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

export const APPOINTMENT_SETTER: FilmDef<S> = {
  title: 'AI Appointment Setter',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function AppointmentSetterFilm() {
  return <FilmStage def={APPOINTMENT_SETTER} />
}
