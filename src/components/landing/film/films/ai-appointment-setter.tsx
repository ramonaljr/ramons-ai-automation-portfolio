'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, States, type Act, type Layout, type Rect } from '@/components/stageshow/kit'
import {
  AirtableCard,
  CalendarDay,
  CallCard,
  MissedCalls,
  type CallState,
  type CalState,
  type Line,
  type Missed
} from '@/components/landing/film/app-cards'
import { FilmStage, type Cue, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'

/**
 * Film 1, the AI Appointment Setter (docs/stageshow-film-plans.md). One
 * after-hours call drives the tour: the caller asks for tomorrow at 2, 2:00
 * is taken, three open half hours are offered, the caller takes 2:30, it is
 * checked again right before booking, booked in Google Calendar and logged in
 * Airtable, and the call's result is saved. The camera moves in on each lane
 * of the process map the call uses, then back out to the apps where the
 * result lands. Then a pass over the two lanes it didn't use, and the end
 * frame.
 *
 * Facts come only from src/content/case-studies/ai-appointment-setter.mdx and
 * the map's lanes and steps (docs/process-diagrams/diagrams.json). The
 * phone numbers, the evening's missed calls and the calendar's other events
 * are illustration. Two rules of the live workflow hold throughout: a refused
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

const MISSED: Missed[] = [
  { from: FROM, at: '9:12 PM', note: 'No voicemail' },
  { from: '(737) 555-0192', at: '8:40 PM', note: 'No voicemail' },
  { from: '(512) 555-0117', at: '7:55 PM', note: 'Voicemail, 0:04' },
  { from: '(830) 555-0164', at: '6:21 PM', note: 'No voicemail' }
]

const LINES: readonly Line[] = [
  { who: 'agent', text: 'Thanks for calling. How can I help?' },
  { who: 'caller', text: 'Can I come in tomorrow at 2?' },
  { who: 'agent', text: '2:00 is taken. I have 2:30, 3:00 or 3:30.' },
  { who: 'caller', text: '2:30, please.' },
  { who: 'agent', text: 'You’re booked for tomorrow at 2:30.' }
]

const ASKED = 14
const FREE = [14.5, 15, 15.5]
const PICKED = 14.5

const IMPACT = 'Callers book, move or cancel appointments at any hour, without waiting for a person.'

const words = (i: number) => LINES[i]!.text.split(' ').length
const allWords = LINES.map((_, i) => words(i))

type View = 'before' | 'apps' | 'map' | 'end'

type S = {
  view: View

  /** The wide layout's camera: a rect to move in on, or null for the whole scene. */
  focus: Rect | null

  /** The phone layout's lower card, under the call. */
  app: 'cal' | 'air'
  cap: string
  missed: number
  call: CallState
  secs: number
  lines: number
  w: number[]
  cal: CalState
  booked: boolean
  result: boolean
  lane: number
  step: number
}

const BLANK: S = {
  view: 'before',
  focus: null,
  app: 'cal',
  cap: '',
  missed: 0,
  call: 'ring',
  secs: 0,
  lines: 0,
  w: [0, 0, 0, 0, 0],
  cal: 'idle',
  booked: false,
  result: false,
  lane: 0,
  step: -1
}

// Each part starts where the one before it ends, so a chapter jump and a
// straight run reach the same frame.
const P2: S = { ...BLANK, view: 'apps', missed: MISSED.length }

const P3: S = { ...P2, call: 'live', secs: 6, lines: 2, w: [words(0), 0, 0, 0, 0] }

const P4: S = {
  ...P3,
  secs: 14,
  call: 'ended',
  lines: 5,
  w: allWords,
  cal: 'booked',
  app: 'air',
  booked: true,
  result: true
}

const P5: S = { ...P4, view: 'end' }

const CAP = {
  dark: 'After hours, the phone rang out.',
  gone: 'Most callers hung up without leaving a message.',
  rings: '9:12 PM, the office is closed. The voice agent answers.',
  asks: 'The caller asks for tomorrow at 2.',
  getAsk: 'The agent asks the Get slots flow: is tomorrow at 2:00 free?',
  getRead: 'It reads Google Calendar for that time.',
  getRules: 'A weekday, 9 AM to 6 PM Central, in the future, clear of other events?',
  getTaken: '2:00 is taken, so it lists the open 30-minute times that day.',
  getBack: 'The open times go back to the agent, on the call.',
  offer: 'The agent offers them. The caller takes 2:30.',
  bookAsk: 'The Book slots flow gets the caller’s details and 2:30.',
  bookDetails: 'Anything missing? The agent is told what to ask for.',
  bookZone: 'The time is converted to the business’s time zone.',
  bookAgain: 'Right before booking, it reads the calendar again for 2:30.',
  bookFree: 'Still free? Only then does it book. If it was taken, nothing changes.',
  bookEvent: 'Still free, so the event is created in Google Calendar.',
  bookConfirm: 'The agent confirms it on the call.',
  bookLog: 'The booking is logged in Airtable.',
  resultsIn: 'When the call ends, the Call results flow gets its details.',
  resultsSave: 'The caller’s record is created or updated in Airtable.',
  saved: 'Every call leaves a record of who called and what was agreed.',
  update: 'Moving a booking: nothing moves until the new time is confirmed free.',
  cancel: 'Cancelling: the event is deleted and the record marked cancelled.'
} as const

const CAPTIONS = Object.values(CAP)

/* ── Script helpers ─────────────────────────────────────────────────────── */

const MOVE = 1150

async function stream(a: Act<S>, cue: Cue, line: number) {
  for (let i = 1; i <= words(line); i++) {
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

/** Move in on a lane of the map (the phone layout slides to it). */
async function toLane(a: Act<S>, cue: Cue, lane: number, cap: string) {
  const focus = a.layout === 'wide' ? a.rect(`lane-${lane}`, { layout: true }) : null

  a.put({ view: 'map', lane, step: -1, focus, cap })
  await cue.wait(MOVE)
}

/** Back out to the apps: the whole scene, or moved in on one card. */
async function toApps(a: Act<S>, cue: Cue, patch: Partial<S> = {}, on?: string) {
  const focus = on && a.layout === 'wide' ? a.rect(on, { layout: true }) : null

  a.put({ view: 'apps', focus, ...patch })
  await cue.wait(MOVE)
}

async function step(a: Act<S>, cue: Cue, i: number, cap: string, ms = 2300) {
  a.put({ step: i, cap })
  await cue.wait(ms)
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: { ...BLANK, missed: MISSED.length },
  words: [CAP.dark, CAP.gone],
  ms: 8000,
  run: async (a, cue) => {
    a.put({ cap: CAP.dark })
    await cue.wait(500)
    await each(cue, MISSED.length, 380, i => a.put({ missed: i + 1 }))
    await cue.wait(2200)
    a.put({ cap: CAP.gone })
    await cue.wait(3700)
  }
}

const arrives: FilmPart<S> = {
  chip: 'The call',
  start: P2,
  still: { ...P3, focus: null },
  words: [CAP.rings, CAP.asks],
  ms: 7000,
  run: async (a, cue) => {
    await toApps(a, cue, { cap: CAP.rings }, 'call')
    await cue.wait(1200)
    a.mark('answer')
    a.put({ call: 'live', lines: 1 })

    const stop = ticker(a, cue)

    await cue.wait(250)
    await stream(a, cue, 0)
    await cue.wait(900)
    a.put({ lines: 2, cap: CAP.asks })
    await cue.wait(2600)
    stop()
    a.put({ secs: 6 })
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: BOOK.n, step: stepNamed(BOOK, 'Log book details'), app: 'cal' },
  words: [
    CAP.getAsk,
    CAP.getRead,
    CAP.getRules,
    CAP.getTaken,
    CAP.offer,
    CAP.bookAgain,
    CAP.bookFree,
    CAP.bookEvent,
    CAP.bookLog,
    CAP.resultsSave
  ],
  ms: 56000,
  run: async (a, cue) => {
    const stop = ticker(a, cue)

    // Lane 1, Get slots: is 2:00 free?
    a.mark('get-slots')
    await toLane(a, cue, GET.n, CAP.getAsk)
    await step(a, cue, stepNamed(GET, 'GetSlots'), CAP.getAsk, 1600)
    await step(a, cue, stepNamed(GET, 'Prepare request'), CAP.getAsk, 1300)
    await step(a, cue, stepNamed(GET, 'Get all events'), CAP.getRead, 2200)
    await step(a, cue, stepNamed(GET, 'Check rules, list free times'), CAP.getRules, 2900)

    // Back to the apps: the calendar shows what the flow found
    await toApps(a, cue, { app: 'cal', cap: CAP.getTaken })
    a.put({ cal: 'checking' })
    await cue.wait(900)
    a.put({ cal: 'open' })
    await cue.wait(2000)
    a.put({ step: stepNamed(GET, 'Respond to Vapi'), cap: CAP.getBack })
    await cue.wait(800)
    a.put({ lines: 3 })
    await cue.wait(200)
    await stream(a, cue, 2)
    await cue.wait(900)
    a.put({ lines: 4, cap: CAP.offer })
    await cue.wait(2300)

    // Lane 2, Book slots: checked again before anything is written
    a.mark('book-slots')
    await toLane(a, cue, BOOK.n, CAP.bookAsk)
    await step(a, cue, stepNamed(BOOK, 'BookSlots'), CAP.bookAsk, 2000)
    await step(a, cue, stepNamed(BOOK, 'Details provided?'), CAP.bookDetails, 2300)
    await step(a, cue, stepNamed(BOOK, 'Convert time to CST'), CAP.bookZone, 2100)
    await step(a, cue, stepNamed(BOOK, 'Get events in window'), CAP.bookAgain, 2400)
    await step(a, cue, stepNamed(BOOK, 'Check slot is free'), CAP.bookFree, 1500)
    await step(a, cue, stepNamed(BOOK, 'Slot free to book?'), CAP.bookFree, 1600)

    a.mark('booked')
    await toApps(a, cue, { app: 'cal', cap: CAP.bookAgain })
    a.put({ cal: 'recheck' })
    await cue.wait(1200)
    a.put({ cal: 'booked', step: stepNamed(BOOK, 'Create an event'), cap: CAP.bookEvent })
    await cue.wait(2300)
    a.put({ step: stepNamed(BOOK, 'Respond to Vapi'), cap: CAP.bookConfirm, lines: 5 })
    await cue.wait(200)
    await stream(a, cue, 4)
    await cue.wait(1300)
    a.put({ step: stepNamed(BOOK, 'Log book details'), cap: CAP.bookLog, app: 'air', booked: true })
    await cue.wait(2500)

    // The call ends; lane 5, Call results, saves it
    stop()
    a.put({ call: 'ended', secs: 14 })
    await cue.wait(900)
    a.mark('call-results')
    await toLane(a, cue, RESULTS.n, CAP.resultsIn)
    await step(a, cue, stepNamed(RESULTS, 'call_results'), CAP.resultsIn, 1900)
    await step(a, cue, stepNamed(RESULTS, 'All input arguments'), CAP.resultsIn, 1200)
    await step(a, cue, stepNamed(RESULTS, 'Create or update record'), CAP.resultsSave, 2000)
    await toApps(a, cue, { app: 'air', result: true, cap: CAP.saved }, 'airtable')
    await cue.wait(2600)
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: P4,
  still: { ...P4, view: 'apps', lane: UPDATE.n, step: UPDATE.steps.length - 1, cap: '' },
  words: [CAP.update, CAP.cancel],
  ms: 9500,
  run: async (a, cue) => {
    a.mark('update-slots')
    await toLane(a, cue, UPDATE.n, CAP.update)
    await each(cue, UPDATE.steps.length, 260, i => a.put({ step: i }))
    await cue.wait(1300)
    a.mark('cancel-slots')
    await toLane(a, cue, CANCEL.n, CAP.cancel)
    await each(cue, CANCEL.steps.length, 280, i => a.put({ step: i }))
    await cue.wait(1300)
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: CANCEL.n, step: CANCEL.steps.length - 1, focus: null },
  still: { ...P5, lane: 0, step: -1 },
  words: [IMPACT, 'Run it yourself below.'],
  ms: 5500,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ view: 'end', focus: null, cap: '' })
    await cue.wait(5500)
  }
}

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S, layout: Layout) {
  const wide = layout === 'wide'
  const missed = <MissedCalls calls={MISSED} shown={s.missed} />

  const call = (
    <CallCard
      lines={LINES}
      shown={s.lines}
      words={s.w}
      call={s.call}
      secs={s.secs}
      from={FROM}
      note={s.call === 'ring' ? '9:12 PM' : 'After hours'}
    />
  )

  const calendar = (
    <CalendarDay day='Tomorrow' cal={s.cal} asked={ASKED} free={FREE} picked={PICKED} event='Appointment, 2:30 PM' />
  )

  const airtable = (
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
  )

  const end = (
    <div className='fa-end' data-on={s.view === 'end' || undefined}>
      <p className='fa-end__line'>{IMPACT}</p>
      <p className='fa-end__cta'>
        Run it yourself below
        <ArrowDown size={16} absoluteStrokeWidth strokeWidth={1.75} aria-hidden='true' />
      </p>
    </div>
  )

  // Every caption is drawn, stacked and centred, and the one showing fades in as the last fades out
  const caption = (
    <div className='fa-cap'>
      {CAPTIONS.map(c => (
        <span key={c} className='fa-cap__text' data-on={c === s.cap || undefined}>
          {c}
        </span>
      ))}
    </div>
  )

  if (wide) {
    return (
      <div className='fa fa--wide' data-view={s.view}>
        <div className='fa-world'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-before'>{missed}</div>
            <div className='fa-apps'>
              <div className='fa-plate' />
              {calendar}
              {call}
              {airtable}
            </div>
            <div className='fa-map'>
              <div className='fa-plate' />
              <LaneMap lanes={LANES} lit={s.lane} step={s.step} layout='wide' />
            </div>
          </Camera>
          {end}
        </div>
        {caption}
      </div>
    )
  }

  const laneNow = LANES.find(l => l.n === s.lane)

  return (
    <div className='fa fa--compact' data-view={s.view}>
      <div className='fa-world'>
        <div className='fa-before'>{missed}</div>
        <div className='fa-apps'>
          <div className='fa-lanechip' data-on={laneNow && s.step >= 0 ? true : undefined}>
            {laneNow && (
              <>
                <span className='fa-lanechip__n' style={{ background: laneNow.tone.accent }}>
                  {laneNow.n}
                </span>
                <span className='fa-lanechip__text'>{laneNow.steps[s.step]?.name ?? laneNow.title}</span>
              </>
            )}
          </div>
          {call}
          <States value={s.app} className='fa-lower' align='start' states={{ cal: calendar, air: airtable }} />
        </div>
        <div className='fa-map'>
          <LaneMap lanes={LANES} lit={s.lane} step={s.step} layout='compact' />
        </div>
        {end}
      </div>
      {caption}
    </div>
  )
}

export const APPOINTMENT_SETTER: FilmDef<S> = {
  title: 'AI Appointment Setter',
  size: { width: 960, height: 540, compact: { below: 520, width: 300, height: 500 } },
  parts: [before, arrives, build, others, result],
  render
}

export function AppointmentSetterFilm() {
  return <FilmStage def={APPOINTMENT_SETTER} />
}
