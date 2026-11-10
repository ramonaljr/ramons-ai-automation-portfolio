'use client'

import { ArrowDown } from 'lucide-react'

import { Camera, type Rect } from '@/components/stageshow/kit'
import { RecordCard, type CheckState } from '@/components/landing/film/app-cards'
import type { Mood } from '@/components/landing/film/cast'
import { FilmStage, type FilmDef, type FilmPart } from '@/components/landing/film/film-stage'
import { Ink } from '@/components/landing/film/ink'
import { LaneMap } from '@/components/landing/film/lane-map'
import { laneNamed, lanesOf, stepNamed } from '@/components/landing/film/lanes'
import { Marker } from '@/components/landing/film/marker'
import { rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/ai-prospecting-apollo-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 3, AI Prospecting with Apollo, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice is the sales rep and
 * explains; Karan, the sales manager, asks what a visitor would ask, and
 * approves the prospect when it waits for review.
 *
 * Before, in ink: Dennice at a desk of prospects found and written to by
 * hand, one of them emailed twice. Then the paper drops to the band and one
 * request drives the tour: the form, Apollo's search, people already known
 * skipped, the best enriched and scored by fixed rules, the company website
 * read and a grounded first email drafted, all waiting in the sheet. Nothing
 * is sent: Karan approves it, and every 15 minutes approved prospects reach
 * Pipedrive as a deal with the research pinned, for Dennice to send.
 * The marker lands twice: round the person skipped, and under the status
 * that waits for a person. Then the thin website, the error lane, and the
 * paper rises for the end.
 *
 * Facts come only from src/content/case-studies/ai-prospecting-apollo.mdx and
 * the map's lanes (docs/process-diagrams/diagrams.json). The people, the
 * company and the score are illustration.
 */

const LANES = lanesOf('ai-prospecting-apollo')
const FIND = laneNamed(LANES, 'Find & score')
const RESEARCH = laneNamed(LANES, 'Research & queue')
const CRM = laneNamed(LANES, 'Approved → Pipedrive')
const BREAKS = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** Prospects found and written to by hand: one of them emailed twice. */
const DESK: DeskWords = {
  clock: 'Wednesday · 2:00 PM',
  card: 'Prospects by hand',
  sub: 'This week',
  rows: [
    { title: 'Ana Lee · Coastline Cargo', note: 'Emailed twice', at: 'Mon', wrong: true },
    { title: 'Tom Reyes · Pike Logistics', note: 'Website not read yet', at: 'Tue' },
    { title: 'Raj Mehta · Hollow Oak', note: 'Credits spent, poor fit', at: 'Tue' },
    { title: 'Nina Cole · Drift Supply', note: 'Email not written', at: 'Wed' }
  ],
  label: 'SALES',
  folder: 'PROSPECTS'
}

const REQUEST = [
  { label: 'Job titles', value: 'COO, Ops director' },
  { label: 'Location', value: 'Texas' },
  { label: 'Company size', value: '50 to 200' },
  { label: 'Industry', value: 'Logistics' }
]

const FOUND = ['Maya Ortiz, COO · new', 'Tom Reyes, Ops director · new', 'Ana Lee, COO · already known']

const RESEARCHED = [
  { label: 'Website', value: 'ridgewayfreight.com' },
  { label: 'Summary', value: 'Cross-dock freight, Texas' },
  { label: 'First email', value: 'Drafted, 90 words' }
]

const GROUNDED = ['Facts from the website only', 'No prices or guarantees', 'Flagged if the site says nothing']

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; karan: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, karan: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { dennice: BAND_SPOTS.left, karan: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, karan: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  dMood: Mood
  kMood: Mood
  karan: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  form: number
  found: boolean
  skipped: boolean
  scored: boolean
  read: number
  grounded: number
  status: 'none' | 'review' | 'approved'
  crm: number
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
  kMood: 'normal',
  karan: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  form: 0,
  found: false,
  skipped: false,
  scored: false,
  read: 0,
  grounded: 0,
  status: 'none',
  crm: 0,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', kMood: 'puzzled', karan: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', kMood: 'normal', form: 1 }

const P4: S = {
  ...P3,
  form: REQUEST.length,
  found: true,
  skipped: true,
  scored: true,
  read: RESEARCHED.length,
  grounded: 2,
  status: 'approved',
  crm: 5
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Prospects are found and written to by hand, and one is emailed twice.', ...wordsOf(0, 1)],
  ms: 9100,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ karan: true })
    await cue.wait(1100)
    await say(a, cue, 0, { kMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The request',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4200,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', dMood: 'normal', kMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { dMood: 'happy', form: 1 }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: CRM.n, step: CRM.steps.length - 1 },
  words: wordsOf(3, 16),
  ms: 42100,
  run: async (a, cue) => {
    // The form, then Apollo's search
    a.mark('request')
    a.put({ at: 3 })
    await toApps(a, cue, {}, 'form')
    await each(cue, REQUEST.length - 1, 260, i => a.put({ form: i + 2 }))
    await cue.wait(rest(3, MOVE + 780))
    a.put({ at: 4 })
    await toLane(a, cue, FIND.n, { step: stepNamed(FIND, 'Apollo – Search People') })
    await toApps(a, cue, { found: true }, 'found')
    await cue.wait(rest(4, MOVE * 2))

    // People already known are skipped
    a.mark('skip')
    await say(a, cue, 5, { kMood: 'puzzled' })
    a.put({ at: 6, kMood: 'normal', skipped: true, step: stepNamed(FIND, 'Shortlist New Prospects') })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('found-checks') })
    await cue.wait(rest(6, 300))

    // The best enriched, then scored by fixed rules
    a.mark('score')
    a.put({ at: 7, mark: 'none' })
    await toLane(a, cue, FIND.n, { step: stepNamed(FIND, 'Anything To Enrich?') })
    await each(cue, 2, 400, i => a.put({ step: stepNamed(FIND, 'Apollo – Enrich Contacts') + i }))
    await toApps(a, cue, { scored: true }, 'found')
    await cue.wait(rest(7, MOVE * 2 + 400))

    // AI reads the company website and drafts a grounded email
    a.mark('research')
    a.put({ at: 8 })
    await toLane(a, cue, RESEARCH.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await toApps(a, cue, {}, 'draft')
    await each(cue, RESEARCHED.length, 260, i => a.put({ read: i + 1 }))
    await cue.wait(rest(8, MOVE * 2 + 600 + 520))
    a.put({ at: 9 })
    await each(cue, 2, 400, i => a.put({ grounded: i + 1 }))
    await cue.wait(rest(9, 400))

    // Saved to the sheet to wait for review; a Slack digest
    a.mark('queue')
    a.put({ at: 10 })
    await toLane(a, cue, RESEARCH.n, { step: stepNamed(RESEARCH, 'Set Final Status') })
    await each(cue, 3, 300, i => a.put({ step: stepNamed(RESEARCH, 'Save To Prospects Sheet') + i }))
    await cue.wait(rest(10, MOVE + 600))

    // Nothing is sent: it waits for a person, and Karan approves
    a.mark('wait')
    a.put({ at: 11, kMood: 'puzzled' })
    await toApps(a, cue, { status: 'review' }, 'found')
    await cue.wait(rest(11, MOVE))
    a.put({ at: 12, kMood: 'normal' })
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('status') })
    await cue.wait(rest(12, 300))
    a.mark('approved')
    await say(a, cue, 13, { status: 'approved', kMood: 'happy' })

    // Every 15 minutes, approved prospects become a Pipedrive deal
    a.mark('crm')
    a.put({ at: 14, mark: 'none', kMood: 'normal' })
    await toLane(a, cue, CRM.n)
    await each(cue, 3, 300, i => a.put({ step: i }))
    await cue.wait(rest(14, MOVE + 600))
    a.put({ at: 15 })
    await each(cue, 4, 260, i => a.put({ step: stepNamed(CRM, 'Find or Create Org') + i }))
    await toApps(a, cue, {}, 'crm')
    await each(cue, 4, 240, i => a.put({ crm: i + 1 }))
    await cue.wait(rest(15, MOVE + 780 + 720))
    a.put({ at: 16, crm: 5, step: stepNamed(CRM, 'Mark As In CRM') })
    await cue.wait(rest(16, 0))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  words: wordsOf(17, 19),
  ms: 8800,
  run: async (a, cue) => {
    a.mark('thin')
    a.put({ at: 17, kMood: 'puzzled' })
    await toApps(a, cue, {}, 'draft')
    await cue.wait(rest(17, MOVE))
    await say(a, cue, 18, { kMood: 'normal' })
    a.mark('breaks')
    a.put({ at: 19 })
    await toLane(a, cue, BREAKS.n)
    await each(cue, BREAKS.steps.length, 300, i => a.put({ step: i }))
    await cue.wait(rest(19, MOVE + (BREAKS.steps.length - 1) * 300))
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  still: { ...P4, world: 'ink', place: 'end', dMood: 'happy', kMood: 'happy', focus: null, cta: true },
  words: wordsOf(20, 21),
  ms: 9000,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 20, { dMood: 'happy', kMood: 'happy' })
    await say(a, cue, 21, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: the prospect's card, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={81} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(8, 4, 10, 7, 1)} seed={83} amp={0.3} passes={1} />
  </svg>
)

const tick = (n: number, i: number): CheckState => (n > i ? 'ok' : 'wait')

/** Pipedrive's mark, as the process map draws it: a dark disc with a "p". */
const PIPEDRIVE = (
  <span className='fc-pd' aria-hidden='true'>
    p
  </span>
)

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'dennice', spot: spots.dennice, mood: s.dMood },
    { who: 'karan', spot: spots.karan, mood: s.kMood, out: !s.karan }
  ]

  const status = { none: '', review: 'Waiting for review', approved: 'Approved' }

  return (
    <div className='fa fa-four fp' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <RecordCard
                target='form'
                mark={<ToolMark tool='n8n' size={18} />}
                title='Prospecting request'
                status={s.form ? 'Sent' : 'Waiting'}
                fields={[
                  ...REQUEST.map((f, i) => ({ ...f, shown: s.form > i })),
                  { label: 'Offer', value: 'Route planning audit', shown: s.form >= REQUEST.length }
                ]}
              />
              <RecordCard
                target='found'
                mark={<ToolMark tool='googlesheets' size={18} />}
                title='Prospects sheet'
                status={s.status === 'approved' ? 'Approved' : s.found ? 'From Apollo' : 'Waiting'}
                tone={s.status === 'approved' ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Prospect', value: 'Maya Ortiz, COO', shown: s.scored },
                  { label: 'Score', value: '84 / 100, by rules', shown: s.scored },
                  { label: 'Email', value: 'Verified', shown: s.scored },
                  { label: 'Status', value: status[s.status], shown: s.status !== 'none', target: 'status' }
                ]}
                checksTitle='Found in Apollo'
                checks={FOUND.map((label, i) => ({
                  label,
                  state: !s.found ? 'wait' : i === 2 ? (s.skipped ? 'flag' : 'wait') : 'ok'
                }))}
              />
              <RecordCard
                target='draft'
                mark={<ToolMark tool='openai' size={18} />}
                title='Researched by AI'
                status={s.read >= RESEARCHED.length ? 'Drafted' : s.read ? 'Reading the site' : 'Waiting'}
                tone={s.read >= RESEARCHED.length ? 'ok' : 'neutral'}
                fields={RESEARCHED.map((f, i) => ({ ...f, shown: s.read > i }))}
                checksTitle='Grounded'
                checks={GROUNDED.map((label, i) => ({ label, state: tick(s.grounded, i) }))}
              />
              <RecordCard
                target='crm'
                mark={PIPEDRIVE}
                title='Pipedrive'
                status={s.crm >= 5 ? 'In CRM' : s.crm ? 'Adding' : 'Every 15 min'}
                tone={s.crm >= 5 ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Organisation', value: 'Ridgeway Freight', shown: s.crm > 0 },
                  { label: 'Person', value: 'Maya Ortiz', shown: s.crm > 1 },
                  { label: 'Deal', value: 'Created', shown: s.crm > 2 },
                  { label: 'Pinned', value: 'Research and draft', shown: s.crm > 3 }
                ]}
                checks={[{ label: 'Left for Dennice to send', state: tick(s.crm, 4) }]}
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

export const PROSPECTING: FilmDef<S> = {
  title: 'AI Prospecting with Apollo',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function ProspectingFilm() {
  return <FilmStage def={PROSPECTING} />
}
