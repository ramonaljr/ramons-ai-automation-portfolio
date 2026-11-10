'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Rect } from '@/components/stageshow/kit'
import { CalendarDay, MailCard, RecordCard, type CalState, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/hr-evaluation-assistant-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 8, HR Evaluation & Job Posting Assistant, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Myk is on the hiring team and
 * explains; Samantha applies and asks; Carlos, the interviewer, steps in when
 * the interview is booked into the interviewer's week.
 *
 * Before, in ink: Myk at a desk of applications waiting to be read by hand.
 * Then the paper drops to the band and Samantha's CV drives the tour: saved to
 * Drive and Airtable, read by AI against the real job posting, the decision
 * recorded, questions written for the role, a personal invite from Gmail.
 * Then the time: AI proposes 2 PM, Carlos is busy then, so the workflow reads
 * the week itself and takes the first free slot, and only then books it. The
 * marker lands twice: round the free times when the first one is picked, and
 * under the interview booked on the record. Then the screening questions for
 * Carlos, the declined path, and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/hr-evaluation-assistant.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The role, the
 * times and the CV details are illustration.
 */

const LANES = lanesOf('hr-evaluation-assistant')
const RECEIVE = laneNamed(LANES, 'Receive and filter applicants')
const QUESTIONS = laneNamed(LANES, 'Questionnaire for potential hires')
const INVITE = laneNamed(LANES, 'Personalised interview email')
const BOOK = laneNamed(LANES, 'Book the interview')
const SCREEN = laneNamed(LANES, 'Screening questions')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** Applications waiting to be read by hand: Samantha's for a week. */
const DESK: DeskWords = {
  clock: 'Friday · 5:30 PM',
  card: 'Applications to read',
  sub: 'Inbox',
  rows: [
    { title: 'Samantha · Front office lead', note: 'Waiting a week', at: 'Fri', wrong: true },
    { title: 'Aria · Night auditor', note: 'CV not opened', at: 'Mon' },
    { title: 'Bram · Concierge', note: 'Four emails to find a time', at: 'Tue' },
    { title: 'Cleo · Housekeeping lead', note: 'No questions prepared', at: 'Wed' }
  ],
  label: 'HIRING',
  folder: 'CVs'
}

const READ = [
  { label: 'Job posting', value: 'Front office lead' },
  { label: 'Experience', value: '4 years, hotel front desk' },
  { label: 'Decision', value: 'Potential hire' }
]

/** 2 PM is asked for and taken; the first free half hour is 2:30. */
const ASKED = 14
const FREE = [14.5, 15, 15.5]
const PICKED = 14.5

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { myk: Spot; samantha: Spot; carlos: Spot }> = {
  desk: {
    myk: { x: 250, y: 404, w: 250 },
    samantha: { x: 790, y: FLOOR - 2, w: 240 },
    carlos: { x: 790, y: FLOOR - 2, w: 240 }
  },
  band: { myk: BAND_SPOTS.left, samantha: BAND_SPOTS.right, carlos: BAND_SPOTS.right },
  end: {
    myk: { x: 230, y: FLOOR - 2, w: 220 },
    samantha: { x: 480, y: FLOOR - 2, w: 220 },
    carlos: { x: 730, y: FLOOR - 2, w: 220 }
  }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  mMood: Mood
  sMood: Mood
  cMood: Mood
  samantha: boolean
  carlos: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  app: number
  read: number
  decided: boolean
  answers: boolean
  invite: boolean
  cal: CalState
  booked: boolean
  screening: boolean
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
  sMood: 'normal',
  cMood: 'normal',
  samantha: false,
  carlos: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  app: 0,
  read: 0,
  decided: false,
  answers: false,
  invite: false,
  cal: 'idle',
  booked: false,
  screening: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, mMood: 'puzzled', sMood: 'puzzled', samantha: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', mMood: 'normal', sMood: 'normal' }

const P4: S = {
  ...P3,
  samantha: false,
  carlos: true,
  app: 3,
  read: READ.length,
  decided: true,
  answers: true,
  invite: true,
  cal: 'booked',
  booked: true,
  screening: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Every CV is read by hand, and applicants wait days.', ...wordsOf(0, 1)],
  ms: 9700,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ samantha: true })
    await cue.wait(1100)
    await say(a, cue, 0, { sMood: 'puzzled' })
    await say(a, cue, 1, { mMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The CV',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4700,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', mMood: 'normal', sMood: 'normal' })
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
  still: { ...P4, view: 'apps', focus: null, lane: SCREEN.n, step: SCREEN.steps.length - 1 },
  words: wordsOf(3, 16),
  ms: 47100,
  run: async (a, cue) => {
    // The CV to Drive, the applicant to Airtable, then read against the job
    a.mark('receive')
    a.put({ at: 3 })
    await toLane(a, cue, RECEIVE.n)
    await each(cue, 4, 260, i => a.put({ step: i }))
    await toApps(a, cue, {}, 'applicant')
    await each(cue, 3, 240, i => a.put({ app: i + 1 }))
    await cue.wait(rest(3, MOVE * 2 + 780 + 480))
    a.mark('read')
    a.put({ at: 4 })
    await toLane(a, cue, RECEIVE.n, { step: stepNamed(RECEIVE, 'Extract from File') })
    await cue.wait(300)
    a.put({ step: stepNamed(RECEIVE, 'AI Agent') })
    await toApps(a, cue, {}, 'screen')
    await each(cue, 2, 260, i => a.put({ read: i + 1 }))
    await cue.wait(rest(4, MOVE * 2 + 560))

    // Shortlisted or declined: either way, recorded
    await say(a, cue, 5, { sMood: 'puzzled' })
    a.mark('decided')
    a.put({ at: 6, sMood: 'normal', read: READ.length, decided: true, step: stepNamed(RECEIVE, 'Potential Hire / Rejected') })
    await cue.wait(rest(6, 0))

    // Questions for the role, then a personal invite
    a.mark('questions')
    a.put({ at: 7 })
    await toLane(a, cue, QUESTIONS.n)
    await each(cue, QUESTIONS.steps.length, 320, i => a.put({ step: i }))
    await toApps(a, cue, { answers: true }, 'applicant')
    await cue.wait(rest(7, MOVE * 2 + 640))
    a.mark('invite')
    a.put({ at: 8 })
    await toLane(a, cue, INVITE.n)
    await each(cue, INVITE.steps.length, 360, i => a.put({ step: i }))
    await toApps(a, cue, { invite: true }, 'mail')
    await cue.wait(rest(8, MOVE * 2 + 360))

    // AI proposes 2 PM: Carlos is busy then
    a.mark('propose')
    await say(a, cue, 9, { sMood: 'puzzled' })
    a.put({ at: 10, sMood: 'normal' })
    await toLane(a, cue, BOOK.n, { step: stepNamed(BOOK, 'Book Meeting (proposes a time)') })
    await toApps(a, cue, { cal: 'checking' }, 'calendar')
    await cue.wait(rest(10, MOVE * 2))
    a.put({ at: -1, samantha: false })
    await cue.wait(700)
    a.put({ carlos: true })
    await cue.wait(900)
    await say(a, cue, 11, { cMood: 'puzzled' })

    // The workflow reads the week itself: the first free slot wins
    a.mark('confirm')
    a.put({ at: 12, cMood: 'normal' })
    await toLane(a, cue, BOOK.n, { step: stepNamed(BOOK, 'Get Interviewer Week') })
    await cue.wait(400)
    a.put({ step: stepNamed(BOOK, 'Confirm Interview Slot') })
    await toApps(a, cue, { cal: 'open' }, 'calendar')
    await cue.wait(rest(12, MOVE * 2 + 400))
    a.put({ at: 13, mark: 'loop', markAt: a.rect('free-times') })
    await cue.wait(1500)
    a.put({ cal: 'recheck', mark: 'none' })
    await cue.wait(rest(13, 1500))

    // Only then booked, and the record updated
    a.mark('booked')
    a.put({ at: 14, mark: 'none', cal: 'booked', step: stepNamed(BOOK, 'Book Interview') })
    await cue.wait(700)
    a.put({ step: stepNamed(BOOK, 'Update Interview Schedule') })
    await toApps(a, cue, { booked: true }, 'applicant')
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('interview') })
    await cue.wait(rest(14, MOVE + 1000))

    // Screening questions for Carlos
    a.mark('screening')
    await say(a, cue, 15, { cMood: 'puzzled' })
    a.put({ at: 16, cMood: 'normal', mark: 'none' })
    await toLane(a, cue, SCREEN.n)
    await each(cue, SCREEN.steps.length, 400, i => a.put({ step: i }))
    await toApps(a, cue, { screening: true }, 'applicant')
    await cue.wait(rest(16, MOVE * 2 + 400))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'The declined path',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: RECEIVE.n, step: stepNamed(RECEIVE, 'Potential Hire / Rejected') },
  words: wordsOf(17, 18),
  ms: 5600,
  run: async (a, cue) => {
    a.mark('declined')
    a.put({ at: 17, cMood: 'puzzled' })
    await toLane(a, cue, RECEIVE.n, { step: stepNamed(RECEIVE, 'If') })
    await cue.wait(rest(17, MOVE))
    await say(a, cue, 18, { cMood: 'normal', step: stepNamed(RECEIVE, 'Potential Hire / Rejected') })
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: RECEIVE.n, step: stepNamed(RECEIVE, 'Potential Hire / Rejected') },
  still: {
    ...P4,
    samantha: true,
    world: 'ink',
    place: 'end',
    mMood: 'happy',
    sMood: 'happy',
    cMood: 'happy',
    focus: null,
    cta: true
  },
  words: wordsOf(19, 20),
  ms: 8900,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', samantha: true, focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 19, { mMood: 'happy', sMood: 'happy', cMood: 'happy' })
    await say(a, cue, 20, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the CV, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(9.5, 3, 7, 9, 1)} seed={83} amp={0.3} passes={1} />
  </svg>
)

const tick = (on: boolean): CheckState => (on ? 'ok' : 'wait')

/** Groq has no mark in /images/tools: a letter disc, as Pipedrive's is drawn. */
const GROQ = (
  <span className='fc-pd fc-pd--groq' aria-hidden='true'>
    g
  </span>
)

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'myk', spot: spots.myk, mood: s.mMood },
    { who: 'samantha', spot: spots.samantha, mood: s.sMood, out: !s.samantha },
    { who: 'carlos', spot: spots.carlos, mood: s.cMood, out: !s.carlos }
  ]

  return (
    <div className='fa fa-four fh' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='applicant'
                mark={<ToolMark tool='airtable' size={18} />}
                title='Applicant'
                status={s.booked ? 'Interview booked' : s.decided ? 'Potential hire' : s.app ? 'New' : 'Waiting'}
                tone={s.decided ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Applicant', value: 'Samantha', shown: s.app > 0 },
                  { label: 'Role', value: 'Front office lead', shown: s.app > 1 },
                  { label: 'CV', value: 'Saved to Drive', shown: s.app > 2 },
                  { label: 'Interview', value: 'Tue 2:30 PM, with Carlos', shown: s.booked, target: 'interview' }
                ]}
                checksTitle='Recorded'
                checks={[
                  { label: 'Decision: potential hire', state: tick(s.decided) },
                  { label: 'Questionnaire answers', state: tick(s.answers) },
                  { label: 'Screening questions for Carlos', state: tick(s.screening) }
                ]}
              />
              <RecordCard
                target='screen'
                mark={GROQ}
                title='Read by AI'
                status={s.decided ? 'Shortlisted' : s.read ? 'Reading' : 'Waiting'}
                tone={s.decided ? 'ok' : 'neutral'}
                fields={READ.map((f, i) => ({ ...f, shown: s.read > i }))}
                checksTitle='Checked'
                checks={[
                  { label: 'Against the real job posting', state: tick(s.read > 0) },
                  { label: 'Answer in a set structure', state: tick(s.decided) }
                ]}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Invite'
                status={s.invite ? 'Sent' : 'Waiting'}
                mails={[
                  {
                    from: 'To Samantha',
                    subject: 'Your interview for the Front office lead role',
                    shown: s.invite
                  }
                ]}
              />
              <CalendarDay
                day='Tuesday'
                cal={s.cal}
                asked={ASKED}
                free={FREE}
                picked={PICKED}
                event='Interview: Samantha'
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

export const HR_EVALUATION: FilmDef<S> = {
  title: 'HR Evaluation & Job Posting Assistant',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function HrEvaluationFilm() {
  return <FilmStage def={HR_EVALUATION} />
}
