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
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/solar-lead-scoring-follow-up-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 10, Lead Scoring & Follow-Up, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice is the sales rep and
 * explains; Jeson, a business owner, sends the enquiry and asks; Karan, the
 * sales manager, takes the lead when its 15 minutes run out.
 *
 * Before, in ink: Dennice at a desk of website enquiries gone cold in an
 * inbox. Then the paper drops to the band and Jeson's enquiry drives the
 * tour: a reply in under a second, checked against Airtable, read by AI,
 * scored by fixed rules, given to the rep assigned least recently, answered
 * and alerted. Then the clock: checked every 5 minutes in working hours, it
 * runs out with no follow-up, and Karan walks in and takes it. The marker
 * lands twice: round the follow-up checks as the last one flags, and under
 * the handover in Slack. Then the overnight rule, repeats, the error lane,
 * and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/solar-lead-scoring-follow-up.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The enquiry, the
 * score and the times are illustration.
 */

const LANES = lanesOf('solar-lead-scoring-follow-up')
const RECEIVE = laneNamed(LANES, 'Receive & reply fast')
const READ = laneNamed(LANES, 'Read, score & assign')
const FOLLOW = laneNamed(LANES, '15-minute follow-up check')
const BREAKS = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, step, wordsOf } = scriptFor<S>(LINES)

/** Website enquiries, waiting in an inbox: Jeson's among them. */
const DESK: DeskWords = {
  clock: 'Thursday · 3:10 PM',
  card: 'Website enquiries',
  sub: 'Inbox',
  rows: [
    { title: 'Jeson · Rooftop solar', note: 'Waiting three days', at: 'Mon', wrong: true },
    { title: 'Aria · Battery storage', note: 'Assigned twice', at: 'Tue' },
    { title: 'Bram · Rooftop solar', note: 'Existing customer?', at: 'Tue' },
    { title: 'Cleo · Solar for a barn', note: 'No rep yet', at: 'Wed' }
  ],
  label: 'SOLAR SALES',
  folder: 'LEADS'
}

const READS = [
  { label: 'Wants', value: 'Rooftop solar' },
  { label: 'Owns home', value: 'Yes' },
  { label: 'Roof', value: 'Tile, 8 years old' },
  { label: 'Urgency', value: 'This month' }
]

const REASONS = ['High electricity use', 'Owns the home', 'Roof type and age', 'Wants it this month']

const CHECKS = ['4:05 · 10 minutes left', '4:10 · 5 minutes left', '4:15 · Not followed up']

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; jeson: Spot; karan: Spot }> = {
  desk: {
    dennice: { x: 250, y: 404, w: 250 },
    jeson: { x: 790, y: FLOOR - 2, w: 240 },
    karan: { x: 790, y: FLOOR - 2, w: 240 }
  },
  band: { dennice: BAND_SPOTS.left, jeson: BAND_SPOTS.right, karan: BAND_SPOTS.right },
  end: {
    dennice: { x: 230, y: FLOOR - 2, w: 220 },
    jeson: { x: 480, y: FLOOR - 2, w: 220 },
    karan: { x: 730, y: FLOOR - 2, w: 220 }
  }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  jMood: Mood
  kMood: Mood
  jeson: boolean
  karan: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  ack: boolean
  known: boolean
  ai: 'idle' | 'reading' | 'scored'
  read: number
  scored: number
  rep: 'none' | 'dennice' | 'karan'
  replied: boolean
  checks: number
  handed: boolean
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
  jMood: 'normal',
  kMood: 'normal',
  jeson: false,
  karan: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  ack: false,
  known: false,
  ai: 'idle',
  read: 0,
  scored: 0,
  rep: 'none',
  replied: false,
  checks: 0,
  handed: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', jMood: 'puzzled', jeson: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', jMood: 'normal' }

const P4: S = {
  ...P3,
  jeson: false,
  karan: true,
  ack: true,
  known: true,
  ai: 'scored',
  read: READS.length,
  scored: REASONS.length,
  rep: 'karan',
  replied: true,
  checks: CHECKS.length,
  handed: true
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Website enquiries wait in an inbox until they go cold.', ...wordsOf(0, 1)],
  ms: 9500,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ jeson: true })
    await cue.wait(1100)
    await say(a, cue, 0, { jMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The enquiry',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4400,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', jMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { dMood: 'happy' }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: FOLLOW.n, step: stepNamed(FOLLOW, 'Alert – Not Followed Up') },
  words: wordsOf(3, 14),
  ms: 38100,
  run: async (a, cue) => {
    // Receive & reply fast: a "received" reply in under a second
    a.mark('receive')
    a.put({ at: 3 })
    await toLane(a, cue, RECEIVE.n)
    await each(cue, 4, 260, i => a.put({ step: i }))
    await toApps(a, cue, { ack: true }, 'mail')
    await cue.wait(rest(3, MOVE * 2 + 780))
    a.put({ at: 4, step: stepNamed(RECEIVE, 'Find Existing Lead') })
    await toApps(a, cue, { known: true }, 'lead')
    await cue.wait(rest(4, MOVE))

    // AI reads the message; fixed rules score it
    a.mark('read')
    await say(a, cue, 5, { jMood: 'puzzled' })
    a.put({ at: 6, jMood: 'normal' })
    await toLane(a, cue, READ.n, { step: stepNamed(READ, 'AI Reads Enquiry') })
    await toApps(a, cue, { ai: 'reading' }, 'enquiry')
    await each(cue, READS.length, 240, i => a.put({ read: i + 1 }))
    await cue.wait(rest(6, MOVE * 2 + 720))
    a.mark('score')
    a.put({ at: 7, step: stepNamed(READ, 'Score And Tier Lead') })
    await each(cue, REASONS.length, 280, i => a.put({ scored: i + 1 }))
    a.put({ ai: 'scored' })
    await cue.wait(rest(7, 840))

    // The rep assigned least recently; a reply, and a Slack alert
    a.mark('assign')
    a.put({ at: 8 })
    await toLane(a, cue, READ.n, { step: stepNamed(READ, 'Route By Lead Type') })
    await step(a, cue, stepNamed(READ, 'Assign Rep'), 400)
    await toApps(a, cue, { rep: 'dennice' }, 'lead')
    await cue.wait(rest(8, MOVE * 2 + 400))
    a.put({ at: 9, step: stepNamed(READ, 'Alert Rep In Slack') })
    await toApps(a, cue, { replied: true })
    await cue.wait(rest(9, MOVE))

    // The clock: checked every 5 minutes, in working hours
    a.mark('clock')
    await say(a, cue, 10, { jMood: 'puzzled' })
    a.put({ at: 11, jMood: 'normal' })
    await toLane(a, cue, FOLLOW.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await toApps(a, cue, { checks: 1 }, 'lead')
    await cue.wait(rest(11, MOVE * 2 + 600))
    a.put({ at: 12, checks: 2 })
    await cue.wait(rest(12, 0))

    // It runs out: Karan walks in and takes the lead
    a.mark('overdue')
    a.put({ at: -1, checks: 3, step: stepNamed(FOLLOW, 'Reassign To Manager') })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('lead-checks'), jeson: false })
    await cue.wait(700)
    a.put({ karan: true })
    await cue.wait(900)
    await say(a, cue, 13, { rep: 'karan', kMood: 'happy' })

    // The handover, in Slack
    a.mark('handover')
    a.put({ at: 14, mark: 'none', kMood: 'normal', step: stepNamed(FOLLOW, 'Alert – Not Followed Up') })
    await toApps(a, cue, { handed: true }, 'slack')
    await cue.wait(400)
    a.put({ mark: 'under', markAt: a.rect('handover') })
    await cue.wait(rest(14, MOVE + 400))
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  words: wordsOf(15, 19),
  ms: 14000,
  run: async (a, cue) => {
    a.mark('overnight')
    a.put({ mark: 'none' })
    await toApps(a, cue, { at: 15, kMood: 'puzzled' }, 'lead')
    await cue.wait(rest(15, MOVE))
    await say(a, cue, 16, { kMood: 'normal' })
    a.mark('repeats')
    a.put({ at: 17, kMood: 'puzzled' })
    await toLane(a, cue, RECEIVE.n, { step: stepNamed(RECEIVE, 'Find Existing Lead') })
    await cue.wait(rest(17, MOVE))
    await say(a, cue, 18, { kMood: 'normal' })
    a.mark('breaks')
    a.put({ at: 19 })
    await toLane(a, cue, BREAKS.n)
    await each(cue, BREAKS.steps.length, 280, i => a.put({ step: i }))
    await cue.wait(rest(19, MOVE + (BREAKS.steps.length - 1) * 280))
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  still: {
    ...P4,
    jeson: true,
    world: 'ink',
    place: 'end',
    dMood: 'happy',
    jMood: 'happy',
    kMood: 'happy',
    focus: null,
    cta: true
  },
  words: wordsOf(20, 21),
  ms: 8900,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', jeson: true, focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 20, { dMood: 'happy', jMood: 'happy', kMood: 'happy' })
    await say(a, cue, 21, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the enquiry, riding the lit lane. */
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
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'jeson', spot: spots.jeson, mood: s.jMood, out: !s.jeson },
    { who: 'karan', spot: spots.karan, mood: s.kMood, out: !s.karan }
  ]

  const left = ['15 min left', '10 min left', '5 min left', 'Overdue'][s.checks]!

  return (
    <div className='fa fa-four fs' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Replies to Jeson'
                status={s.replied ? '2 sent' : s.ack ? 'Sent' : 'Waiting'}
                mails={[
                  {
                    from: 'To Jeson',
                    subject: 'Your rooftop solar enquiry: next steps with Dennice',
                    shown: s.replied
                  },
                  { from: 'To Jeson', subject: 'Received: thanks for your enquiry', shown: s.ack, read: true }
                ]}
              />
              <RecordCard
                target='enquiry'
                mark={<ToolMark tool='openai' size={18} />}
                title='Read by AI'
                status={s.ai === 'scored' ? 'Score 82 / 100' : s.ai === 'reading' ? 'Reading' : 'Waiting'}
                tone={s.ai === 'scored' ? 'ok' : 'neutral'}
                fields={READS.map((f, i) => ({ ...f, shown: s.read > i }))}
                checksTitle='Scored by fixed rules'
                checks={REASONS.map((label, i) => ({ label, state: tick(s.scored, i) }))}
              />
              <RecordCard
                target='lead'
                mark={<ToolMark tool='airtable' size={18} />}
                title='Lead'
                status={s.rep === 'none' ? (s.known ? 'New lead' : 'Searching') : left}
                tone={s.checks === CHECKS.length ? 'warn' : 'neutral'}
                fields={[
                  { label: 'Lead', value: 'Jeson · New, large', shown: s.known },
                  { label: 'Rep', value: s.rep === 'karan' ? 'Karan, manager' : 'Dennice', shown: s.rep !== 'none' },
                  { label: 'Due by', value: '4:15 PM', shown: s.rep !== 'none' },
                  { label: 'Followed up', value: 'Not yet', shown: s.rep !== 'none' }
                ]}
                checksTitle='Every 5 minutes'
                checks={CHECKS.map((label, i) => ({
                  label,
                  state: i === CHECKS.length - 1 && s.checks > i ? 'flag' : tick(s.checks, i)
                }))}
              />
              <SlackCard
                channel='#solar-leads'
                posts={[
                  {
                    who: 'Lead alert',
                    text: '@Dennice New large lead: Jeson, score 82. Owns the home, tile roof.',
                    shown: s.replied
                  },
                  {
                    who: 'Lead alert',
                    text: 'Jeson not followed up in 15 working minutes.',
                    shown: s.handed,
                    reply: 'Reassigned to @Karan, sales manager',
                    replied: s.handed,
                    target: 'handover'
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

export const LEAD_SCORING: FilmDef<S> = {
  title: 'Lead Scoring & Follow-Up',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function LeadScoringFilm() {
  return <FilmStage def={LEAD_SCORING} />
}
