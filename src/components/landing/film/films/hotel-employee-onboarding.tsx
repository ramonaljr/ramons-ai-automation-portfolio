'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Rect } from '@/components/stageshow/kit'
import { MailCard, RecordCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/hotel-employee-onboarding-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 7, New Employee Onboarding, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Myk is in HR and explains;
 * Unix, the new hire, asks what a visitor would ask.
 *
 * Before, in ink: Myk at a desk of new hires set up by hand, one of them
 * without a key card on day one. Then the paper drops to the band and Unix's
 * intake form drives the tour: details checked, a plan of tasks for the role,
 * the Drive folder, record and orientation, IT and the manager told in Slack,
 * the welcome email, and documents uploaded through a form. Then the daily
 * check: on day 3 a check-in and a missing-document reminder are both due, so
 * they're folded into one email. The marker lands twice: round what's due
 * that day, and under the one email. IT is chased for the key card alongside,
 * and onboarding closes after 30 days. Then the HR assistant, and the paper
 * rises for the end.
 *
 * Facts come only from src/content/case-studies/hotel-employee-onboarding.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The role and the
 * documents are illustration.
 */

const LANES = lanesOf('hotel-employee-onboarding')
const FORM = laneNamed(LANES, 'Form & plan')
const SETUP = laneNamed(LANES, 'Set everything up')
const UPLOAD = laneNamed(LANES, 'Document upload')
const DAILY = laneNamed(LANES, 'Daily check 8:00')
const ASSIST = laneNamed(LANES, 'HR assistant')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** New hires set up by hand: one without a key card on day one. */
const DESK: DeskWords = {
  clock: 'Monday · 7:50 AM',
  card: 'New hires to set up',
  sub: 'This month',
  rows: [
    { title: 'Unix · Front desk agent', note: 'Key card not ready', at: 'Today', wrong: true },
    { title: 'Aria · Night auditor', note: 'Documents chased by email', at: 'Wed' },
    { title: 'Bram · Housekeeping', note: 'No orientation booked', at: 'Wed' },
    { title: 'Cleo · Concierge', note: 'Folder not made', at: 'Fri' }
  ],
  label: 'HUMAN RESOURCES',
  folder: 'NEW HIRES'
}

const DETAILS = [
  { label: 'New hire', value: 'Unix' },
  { label: 'Role', value: 'Front desk agent' },
  { label: 'Starts', value: 'Monday' }
]

const SETUP_DONE = ['Drive folder and record', 'Orientation booked', 'IT and manager told', 'Welcome email sent']

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { myk: Spot; unix: Spot }> = {
  desk: { myk: { x: 250, y: 404, w: 250 }, unix: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { myk: BAND_SPOTS.left, unix: BAND_SPOTS.right },
  end: { myk: { x: 320, y: FLOOR - 2, w: 240 }, unix: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  mMood: Mood
  uMood: Mood
  unix: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  details: number
  complete: boolean
  tasks: boolean
  setup: number
  uploaded: boolean
  daily: number
  combined: boolean
  itChased: boolean
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
  mMood: 'normal',
  uMood: 'normal',
  unix: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  details: 0,
  complete: false,
  tasks: false,
  setup: 0,
  uploaded: false,
  daily: 0,
  combined: false,
  itChased: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, mMood: 'puzzled', uMood: 'puzzled', unix: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', mMood: 'normal', uMood: 'normal' }

const P4: S = {
  ...P3,
  details: DETAILS.length,
  complete: true,
  tasks: true,
  setup: SETUP_DONE.length,
  uploaded: true,
  daily: 3,
  combined: true,
  itChased: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Every new hire is set up by hand, and things are missed.', ...wordsOf(0, 1)],
  ms: 9100,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ unix: true })
    await cue.wait(1100)
    await say(a, cue, 0, { uMood: 'puzzled' })
    await say(a, cue, 1, { mMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The intake form',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4100,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', mMood: 'normal', uMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { mMood: 'happy' }, 900)
    a.put({ mMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: DAILY.n, step: DAILY.steps.length - 1 },
  words: wordsOf(3, 16),
  ms: 43100,
  run: async (a, cue) => {
    // The form, checked complete, and a plan of tasks for the role
    a.mark('form')
    a.put({ at: 3 })
    await toApps(a, cue, {}, 'hire')
    await each(cue, DETAILS.length, 260, i => a.put({ details: i + 1 }))
    await cue.wait(rest(3, MOVE + 520))
    a.put({ at: 4 })
    await toLane(a, cue, FORM.n)
    await each(cue, 3, 360, i => a.put({ step: i }))
    a.put({ complete: true })
    await cue.wait(rest(4, MOVE + 720))
    a.mark('plan')
    a.put({ at: 5 })
    await each(cue, 3, 360, i => a.put({ step: stepNamed(FORM, 'Generate Plan') + i }))
    await toApps(a, cue, { tasks: true }, 'tasks')
    await cue.wait(rest(5, MOVE + 720))

    // Everything set up: folder, record, orientation, Slack, welcome email
    a.mark('setup')
    await say(a, cue, 6, { uMood: 'puzzled' })
    a.put({ at: 7, uMood: 'normal' })
    await toLane(a, cue, SETUP.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await toApps(a, cue, { setup: 2 }, 'hire')
    await cue.wait(rest(7, MOVE * 2 + 600))
    await say(a, cue, 8, { setup: 3, step: stepNamed(SETUP, 'Notify IT And Manager') })
    a.put({ at: 9, step: stepNamed(SETUP, 'Send Welcome Email') })
    await toApps(a, cue, { setup: 4 }, 'mail')
    await cue.wait(rest(9, MOVE))

    // Documents uploaded through a form, each marked received
    a.mark('upload')
    a.put({ at: 10 })
    await toLane(a, cue, UPLOAD.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await toApps(a, cue, { uploaded: true }, 'tasks')
    await cue.wait(rest(10, MOVE * 2 + 600))

    // The daily check: day 3 has two things due, so one email
    a.mark('daily')
    a.put({ at: 11, uMood: 'puzzled' })
    await toLane(a, cue, DAILY.n, { step: 0 })
    await cue.wait(rest(11, MOVE))
    a.put({ at: 12, uMood: 'normal' })
    await each(cue, 3, 320, i => a.put({ step: 1 + i }))
    await toApps(a, cue, { daily: 1 }, 'daily')
    await cue.wait(rest(12, MOVE + 640))
    a.mark('twodue')
    a.put({ at: 13, daily: 2 })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('due') })
    await cue.wait(rest(13, 300))
    a.mark('oneemail')
    a.put({ at: 14, mark: 'none', daily: 3, step: stepNamed(DAILY, 'Email New Hire') })
    await toApps(a, cue, { combined: true }, 'mail')
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('oneemail') })
    await cue.wait(rest(14, MOVE + 300))

    // IT chased for the key card; closed after 30 days
    a.mark('it')
    a.put({ at: 15, mark: 'none', step: stepNamed(DAILY, 'Remind IT') })
    await toApps(a, cue, { itChased: true }, 'tasks')
    await cue.wait(rest(15, MOVE))
    a.put({ at: 16 })
    await toLane(a, cue, DAILY.n, { step: stepNamed(DAILY, 'Mark Complete') })
    await cue.wait(rest(16, MOVE))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'The HR assistant',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: ASSIST.n, step: ASSIST.steps.length - 1 },
  words: wordsOf(17, 19),
  ms: 8800,
  run: async (a, cue) => {
    a.mark('assistant')
    a.put({ at: 17, uMood: 'puzzled' })
    await toLane(a, cue, ASSIST.n, { step: 0 })
    await cue.wait(rest(17, MOVE))
    a.put({ at: 18, uMood: 'normal' })
    await each(cue, 2, 450, i => a.put({ step: 1 + i }))
    await cue.wait(rest(18, 450))
    await say(a, cue, 19)
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: ASSIST.n, step: ASSIST.steps.length - 1 },
  still: { ...P4, world: 'ink', place: 'end', mMood: 'happy', uMood: 'happy', focus: null, cta: true },
  words: wordsOf(20, 21),
  ms: 9100,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 20, { mMood: 'happy', uMood: 'happy' })
    await say(a, cue, 21, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the intake form, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(9.5, 3, 7, 9, 1)} seed={83} amp={0.3} passes={1} />
  </svg>
)

const tick = (n: number, i: number): CheckState => (n > i ? 'ok' : 'wait')

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'myk', spot: spots.myk, mood: s.mMood },
    { who: 'unix', spot: spots.unix, mood: s.uMood, out: !s.unix }
  ]

  const docs: { label: string; state: CheckState }[] = [
    { label: 'ID and right to work', state: s.uploaded ? 'ok' : 'wait' },
    { label: 'Uniform size', state: s.uploaded ? 'ok' : 'wait' },
    { label: 'Bank details', state: s.uploaded ? 'flag' : 'wait' },
    { label: s.itChased ? 'Key card · IT chased' : 'Key card · IT', state: s.itChased ? 'ok' : 'wait' }
  ]

  return (
    <div className='fa fa-four fn' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='hire'
                mark={<ToolMark tool='airtable' size={18} />}
                title='New hire'
                status={s.complete ? 'Details complete' : s.details ? 'Checking' : 'Waiting'}
                tone={s.complete ? 'ok' : 'neutral'}
                fields={DETAILS.map((f, i) => ({ ...f, shown: s.details > i }))}
                checksTitle='Set up'
                checks={SETUP_DONE.map((label, i) => ({ label, state: tick(s.setup, i) }))}
              />
              <RecordCard
                target='tasks'
                mark={<ToolMark tool='airtable' size={18} />}
                title='Tasks and documents'
                status={s.uploaded ? '1 missing' : s.tasks ? 'Plan built' : 'Waiting'}
                tone={s.uploaded ? 'warn' : 'neutral'}
                fields={[
                  { label: 'Plan for', value: 'Front desk agent', shown: s.tasks },
                  { label: 'Each row', value: 'An owner and a status', shown: s.tasks }
                ]}
                checksTitle='One row each'
                checks={s.tasks ? docs : []}
              />
              <RecordCard
                target='daily'
                mark={<ToolMark tool='n8n' size={18} />}
                title='Daily check · 8:00'
                status={s.daily >= 3 ? '1 email' : s.daily ? 'Checking' : 'Waiting'}
                tone={s.daily >= 3 ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Today', value: 'Day 3 for Unix', shown: s.daily > 0 },
                  { label: 'Due', value: 'Check-in, and a reminder', shown: s.daily > 1, target: 'due' },
                  { label: 'Sends', value: 'One email, both in it', shown: s.daily > 2 }
                ]}
                checksTitle='Rule'
                checks={[{ label: 'At most one email a day', state: tick(s.daily, 2) }]}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Emails to Unix'
                status={s.combined ? 'Day 3' : s.setup >= 4 ? 'Welcome sent' : 'Waiting'}
                mails={[
                  {
                    from: 'Day 3 check-in',
                    subject: 'How’s it going? Bank details still needed',
                    shown: s.combined,
                    target: 'oneemail'
                  },
                  {
                    from: 'Welcome, Unix',
                    subject: 'Your first day, orientation and folder',
                    shown: s.setup >= 4,
                    read: true
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

export const ONBOARDING: FilmDef<S> = {
  title: 'New Employee Onboarding',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function OnboardingFilm() {
  return <FilmStage def={ONBOARDING} />
}
