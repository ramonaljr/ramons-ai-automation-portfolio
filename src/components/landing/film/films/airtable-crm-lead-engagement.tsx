'use client'

import { ArrowDown } from 'lucide-react'

import { BrandMark, Camera, type Rect } from '@/components/stageshow/kit'
import { MailCard, RecordCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/airtable-crm-lead-engagement-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 5, Client Pipeline Emails, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice runs the agency and
 * explains; Jeson, a client, asks what a visitor would ask, sits on a quote
 * for two days, then approves it.
 *
 * Before, in ink: Dennice at a desk of clients whose next step waited on her
 * memory, one of them approved and never welcomed. Then the paper drops to
 * the band and Jeson's card drives the tour: moved to Quoted, let through only
 * because the stage isn't handled yet, claimed so it runs once, and sent down
 * the follow-up path. Two days later the card is checked again; still Quoted,
 * so one nudge, then no more. Jeson approves: an AI welcome; then Ready to
 * Start: a Drive folder and a task, every step logged. The marker lands
 * twice: round the checks that claim the stage, and under the one nudge.
 * Then the retry and the alert, and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/airtable-crm-lead-engagement.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The client, the
 * company and the times are illustration.
 */

const LANES = lanesOf('airtable-crm-lead-engagement')
const CATCH = laneNamed(LANES, 'Catch the stage change')
const READY = laneNamed(LANES, 'Ready to Start')
const FOLLOW = laneNamed(LANES, 'No Response & Quoted follow-ups')
const WELCOME = laneNamed(LANES, 'Approved, Paid and Closed')
const BREAKS = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** Clients whose next step waited on Dennice's memory: one approved, never welcomed. */
const DESK: DeskWords = {
  clock: 'Monday · 9:30 AM',
  card: 'Next steps to remember',
  sub: 'Pipeline',
  rows: [
    { title: 'Jeson · Brightside Co', note: 'Approved. No welcome sent.', at: 'Approved', wrong: true },
    { title: 'Aria · Fernhill Studio', note: 'Quote gone quiet', at: 'Quoted' },
    { title: 'Bram · North Pier', note: 'Folder not made', at: 'Ready' },
    { title: 'Cleo · Tallow & Wick', note: 'Thank-you forgotten', at: 'Paid' }
  ],
  label: 'AGENCY',
  folder: 'CLIENTS'
}

type Stage = 'call' | 'quoted' | 'approved' | 'ready'

const STAGE_NAME: Record<Stage, string> = {
  call: 'Discovery call',
  quoted: 'Quoted',
  approved: 'Approved',
  ready: 'Ready to Start'
}

const HANDLED: Record<Stage, string> = {
  call: 'None yet',
  quoted: 'Quoted',
  approved: 'Quoted, Approved',
  ready: 'Quoted, Approved, Ready'
}

const LOG = ['Follow-up sent · Mon 10:02', 'Nudge sent · Wed 10:02', 'Welcome sent · Wed 3:40', 'Folder made · Thu 9:15']

const RUN = ['Stage not yet handled', 'Stage claimed first', 'Route picked by Paths']

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; jeson: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, jeson: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { dennice: BAND_SPOTS.left, jeson: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, jeson: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  jMood: Mood
  jeson: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  card: boolean
  stage: Stage
  run: number
  recheck: boolean
  mails: number
  writing: boolean
  drive: boolean
  logged: number
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
  jeson: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  card: false,
  stage: 'call',
  run: 0,
  recheck: false,
  mails: 0,
  writing: false,
  drive: false,
  logged: 0,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', jMood: 'puzzled', jeson: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', jMood: 'normal', card: true }

const P4: S = {
  ...P3,
  stage: 'ready',
  run: RUN.length,
  recheck: true,
  mails: 3,
  drive: true,
  logged: LOG.length
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Each client’s next step waits on someone remembering it.', ...wordsOf(0, 1)],
  ms: 9600,
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
  chip: 'The client card',
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
    await say(a, cue, 2, { dMood: 'happy', card: true }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: READY.n, step: READY.steps.length - 1 },
  words: wordsOf(3, 15),
  ms: 39300,
  run: async (a, cue) => {
    // The card moves to Quoted; the Zap runs only for a stage not yet handled
    a.mark('quoted')
    a.put({ at: 3 })
    await toApps(a, cue, { stage: 'quoted' }, 'card')
    await cue.wait(rest(3, MOVE))
    a.put({ at: 4 })
    await toLane(a, cue, CATCH.n)
    await each(cue, 2, 400, i => a.put({ step: i }))
    await toApps(a, cue, { run: 1 }, 'run')
    await cue.wait(rest(4, MOVE * 2 + 400))

    // It claims the stage before anything is sent, so it runs once
    a.mark('claim')
    a.put({ at: 5, run: 2, step: stepNamed(CATCH, 'Claim The Stage') })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('run-checks') })
    await cue.wait(rest(5, 300))

    // Paths picks the follow-up route
    a.mark('follow')
    a.put({ at: 6, mark: 'none', run: 3 })
    await toLane(a, cue, FOLLOW.n)
    await each(cue, 2, 400, i => a.put({ step: i }))
    await toApps(a, cue, { mails: 1, logged: 1 }, 'mail')
    await cue.wait(rest(6, MOVE * 2 + 400))

    // Two days on, checked again: still Quoted, so one nudge
    a.mark('recheck')
    await say(a, cue, 7, { jMood: 'puzzled' })
    a.put({ at: 8, jMood: 'normal' })
    await toLane(a, cue, FOLLOW.n, { step: stepNamed(FOLLOW, 'Wait 2 Days') })
    await cue.wait(400)
    a.put({ step: stepNamed(FOLLOW, 'Recheck Lead Stage') })
    await toApps(a, cue, { recheck: true }, 'card')
    await cue.wait(rest(8, MOVE * 2 + 400))
    a.mark('nudge')
    a.put({ at: 9, step: stepNamed(FOLLOW, 'Log Second Follow-Up') })
    await toApps(a, cue, { mails: 2, logged: 2 }, 'mail')
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('nudge') })
    await cue.wait(rest(9, MOVE + 300))
    await say(a, cue, 10, { jMood: 'puzzled' })
    await say(a, cue, 11, { mark: 'none', jMood: 'normal' })

    // Jeson approves: an AI welcome
    a.mark('approved')
    a.put({ at: 12, jMood: 'happy' })
    await toApps(a, cue, { stage: 'approved', recheck: false }, 'card')
    await cue.wait(rest(12, MOVE))
    a.put({ at: 13, jMood: 'normal' })
    await toLane(a, cue, WELCOME.n, { step: stepNamed(WELCOME, 'AI Writes Welcome Email') })
    await toApps(a, cue, { writing: true }, 'mail')
    await cue.wait(500)
    a.put({ writing: false, mails: 3, logged: 3, step: stepNamed(WELCOME, 'Send Welcome Email') })
    await cue.wait(rest(13, MOVE * 2 + 500))

    // Ready to Start: a Drive folder and a content task, all logged
    a.mark('ready')
    a.put({ at: 14, stage: 'ready' })
    await toLane(a, cue, READY.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await toApps(a, cue, { drive: true }, 'drive')
    await cue.wait(rest(14, MOVE * 2 + 600))
    a.put({ at: 15, logged: LOG.length })
    await toApps(a, cue, {}, 'card')
    await cue.wait(rest(15, MOVE))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  words: wordsOf(16, 18),
  ms: 8400,
  run: async (a, cue) => {
    a.mark('fails')
    a.put({ at: 16, jMood: 'puzzled' })
    await toLane(a, cue, BREAKS.n, { step: 0 })
    await cue.wait(rest(16, MOVE))
    a.put({ at: 17, jMood: 'normal' })
    await each(cue, 3, 450, i => a.put({ step: 1 + i }))
    await cue.wait(rest(17, 900))
    await say(a, cue, 18, { step: BREAKS.steps.length - 1 })
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  still: { ...P4, world: 'ink', place: 'end', dMood: 'happy', jMood: 'happy', focus: null, cta: true },
  words: wordsOf(19, 20),
  ms: 8300,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 19, { dMood: 'happy', jMood: 'happy' })
    await say(a, cue, 20, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the client card, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(8, 4, 10, 7, 1.5)} seed={83} amp={0.3} passes={1} />
  </svg>
)

const tick = (n: number, i: number): CheckState => (n > i ? 'ok' : 'wait')

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'jeson', spot: spots.jeson, mood: s.jMood, out: !s.jeson }
  ]

  const path = s.stage === 'ready' ? 'Folder and task' : s.stage === 'approved' ? 'AI welcome' : 'Quoted follow-up'

  return (
    <div className='fa fa-four fe' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='card'
                mark={<ToolMark tool='airtable' size={18} />}
                title='Client card'
                status={s.recheck ? 'Still Quoted' : STAGE_NAME[s.stage]}
                tone={s.recheck ? 'warn' : 'neutral'}
                fields={[
                  { label: 'Client', value: 'Jeson · Brightside Co', shown: s.card },
                  { label: 'Stage', value: STAGE_NAME[s.stage], shown: s.card },
                  { label: 'Owner', value: 'Dennice', shown: s.card },
                  { label: 'Handled', value: HANDLED[s.stage], shown: s.card && s.run > 1 }
                ]}
                checksTitle='Pipeline log'
                checks={LOG.map((label, i) => ({ label, state: tick(s.logged, i) }))}
              />
              <RecordCard
                target='run'
                mark={<ToolMark tool='zapier' size={18} />}
                title='Zap run'
                status={s.run >= RUN.length ? 'Running once' : s.run ? 'Checking' : 'Waiting'}
                tone={s.run >= RUN.length ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Trigger', value: `Stage → ${STAGE_NAME[s.stage]}`, shown: s.run > 0 },
                  { label: 'Handled before', value: 'No', shown: s.run > 0 },
                  { label: 'Path', value: path, shown: s.run >= RUN.length }
                ]}
                checksTitle='Exactly once'
                checks={RUN.map((label, i) => ({ label, state: tick(s.run, i) }))}
              />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Emails to Jeson'
                status={s.writing ? 'AI writing' : s.mails ? `${s.mails} sent` : 'Waiting'}
                mails={[
                  { from: 'Welcome, Jeson', subject: 'Your kickoff call and project folder', shown: s.mails > 2 },
                  { from: 'Nudge, 2 days on', subject: 'Any questions on the quote?', shown: s.mails > 1, target: 'nudge' },
                  { from: 'Follow-up', subject: 'Your Brightside Co quote', shown: s.mails > 0, read: true }
                ]}
              />
              <RecordCard
                target='drive'
                mark={<BrandMark brand='google-drive' size={18} tile={false} />}
                title='Ready to Start'
                status={s.drive ? 'Made' : 'Waiting'}
                tone={s.drive ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Drive folder', value: 'Brightside Co', shown: s.drive },
                  { label: 'Folder link', value: 'Saved on the card', shown: s.drive }
                ]}
                checks={[{ label: 'Social Media Content task added', state: s.drive ? 'ok' : 'wait' }]}
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

export const CLIENT_PIPELINE: FilmDef<S> = {
  title: 'Client Pipeline Emails',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function ClientPipelineFilm() {
  return <FilmStage def={CLIENT_PIPELINE} />
}
