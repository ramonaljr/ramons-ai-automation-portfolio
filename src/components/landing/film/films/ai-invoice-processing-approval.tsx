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
import { LINES } from '@/components/landing/film/films/ai-invoice-processing-approval-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 2, AI Invoice Processing & Approval, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Dennice keeps accounts payable
 * and explains; Karan, the budget owner, asks what a visitor would ask, and
 * approves the bill himself when it reaches him.
 *
 * Before, in ink: Dennice at a desk of invoices matched by hand, one of them
 * sent twice. Then the paper drops to the band and one invoice drives the
 * tour: picked up from Gmail, checked against the log, read by AI, which is
 * less than 80% sure, so Dennice confirms it in Slack; matched to the PO and
 * delivery record, checked by fixed rules, approved by Karan in Slack, added
 * to QuickBooks at the amount after retention, logged, and the email marked
 * read. A drawn invoice rides the lit lane, and the marker lands twice: round
 * the fixed rules, and under Karan's approval. Then the flagged path and the
 * error lane, and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/ai-invoice-processing-approval.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The vendor, the
 * numbers and the 72% are illustration.
 */

const LANES = lanesOf('ai-invoice-processing-approval')
const RECEIVE = laneNamed(LANES, 'Receive & de-duplicate')
const READ = laneNamed(LANES, 'Read & check')
const APPROVE = laneNamed(LANES, 'Approve & post')
const BREAKS = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, step, wordsOf } = scriptFor<S>(LINES)

const INVOICE = 'RS-2207'
const VENDOR = 'Ridgeline Supply'

/** The week's invoices, matched by hand: one of them sent twice. */
const PILE = [
  { no: INVOICE, from: VENDOR, sum: '$18,400', note: 'PO? Delivery?' },
  { no: 'BL-0931', from: 'Bayline Lumber', sum: '$6,120', note: 'PO? Delivery?' },
  { no: INVOICE, from: VENDOR, sum: '$18,400', note: 'Sent again?', twice: true },
  { no: 'CR-0118', from: 'Crestview Rentals', sum: '$2,450', note: 'PO? Delivery?' }
]

const FIELDS = [
  { label: 'Vendor', value: VENDOR },
  { label: 'PO number', value: 'PO-1184' },
  { label: 'This bill', value: '$18,400.00' },
  { label: 'Retention', value: '$1,840.00' }
]

const CHECKS = ['Matches the PO, within 2%', 'Matches the delivery record', 'Retention held', 'Lien waiver attached']

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { dennice: Spot; karan: Spot }> = {
  desk: { dennice: { x: 250, y: 404, w: 250 }, karan: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { dennice: BAND_SPOTS.left, karan: BAND_SPOTS.right },
  end: { dennice: { x: 320, y: FLOOR - 2, w: 240 }, karan: { x: 650, y: FLOOR - 2, w: 240 } }
}

type AiState = 'idle' | 'reading' | 'unsure' | 'confirmed' | 'checking' | 'clean'

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
  mail: 'none' | 'new' | 'read'
  ai: AiState
  read: number
  checks: number
  ask: 'none' | 'shown' | 'done'
  approve: 'none' | 'shown' | 'done'
  qb: 'idle' | 'finding' | 'added'
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
  kMood: 'normal',
  karan: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  mail: 'none',
  ai: 'idle',
  read: 0,
  checks: 0,
  ask: 'none',
  approve: 'none',
  qb: 'idle',
  logged: 0,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, dMood: 'puzzled', kMood: 'puzzled', karan: true, pile: PILE.length }

const P3: S = { ...P2, world: 'build', place: 'band', dMood: 'normal', kMood: 'normal', mail: 'new' }

const P4: S = {
  ...P3,
  mail: 'read',
  ai: 'clean',
  read: FIELDS.length,
  checks: CHECKS.length,
  ask: 'done',
  approve: 'done',
  qb: 'added',
  logged: 2
}

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Invoices are matched by hand, and one comes twice.', ...wordsOf(0, 1)],
  ms: 9100,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, PILE.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ karan: true })
    await cue.wait(1100)
    await say(a, cue, 0, { kMood: 'puzzled' })
    await say(a, cue, 1, { dMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The invoice',
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
    await say(a, cue, 2, { dMood: 'happy', mail: 'new' }, 900)
    a.put({ dMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: APPROVE.n, step: APPROVE.steps.length - 1 },
  words: wordsOf(3, 16),
  ms: 43200,
  run: async (a, cue) => {
    // Receive & de-duplicate: picked up, and checked against the log
    a.mark('receive')
    a.put({ at: 3 })
    await toLane(a, cue, RECEIVE.n)
    await each(cue, 3, 380, i => a.put({ step: i }))
    await cue.wait(rest(3, MOVE + 760))
    a.put({ at: 4 })
    await each(cue, 5, 360, i => a.put({ step: 3 + i }))
    await cue.wait(rest(4, 1440))
    await say(a, cue, 5, { kMood: 'puzzled' })
    await say(a, cue, 6, { kMood: 'normal', step: stepNamed(RECEIVE, 'Seen This Invoice Before?') })

    // Read & check: AI reads it, and isn't sure enough
    a.mark('read')
    a.put({ at: 7 })
    await toLane(a, cue, READ.n)
    await step(a, cue, stepNamed(READ, 'AI Reads Invoice'), 500)
    await toApps(a, cue, { ai: 'reading' }, 'invoice')
    await each(cue, FIELDS.length, 260, i => a.put({ read: i + 1 }))
    await cue.wait(300)
    await say(a, cue, 8, { ai: 'unsure', kMood: 'puzzled' })

    // Under 80% sure: Dennice confirms it in Slack
    a.mark('ask')
    a.put({ at: 9, kMood: 'normal', step: stepNamed(READ, 'Ask Team To Check Details') })
    await toApps(a, cue, { ask: 'shown' }, 'slack')
    await cue.wait(rest(9, MOVE))
    await say(a, cue, 10, { ask: 'done', ai: 'confirmed', dMood: 'happy' })

    // Matched to the PO and delivery record, then the fixed rules
    a.mark('match')
    a.put({ at: 11, dMood: 'normal' })
    await toLane(a, cue, READ.n)
    await step(a, cue, stepNamed(READ, 'Search Log By Invoice Number'), 450)
    await step(a, cue, stepNamed(READ, 'Find Purchase Order'), 450)
    await step(a, cue, stepNamed(READ, 'Find Delivery Record'), rest(11, MOVE + 900))
    a.put({ at: 12, step: stepNamed(READ, 'Check Invoice & Flag Issues') })
    await toApps(a, cue, { ai: 'checking' }, 'invoice')
    await each(cue, CHECKS.length, 280, i => a.put({ checks: i + 1 }))
    a.mark('rules')
    a.put({ ai: 'clean', mark: 'loop', markAt: a.rect('invoice-checks') })
    await cue.wait(rest(12, MOVE + 840))

    // Approve & post: no issues, so it goes to Karan
    a.mark('approve')
    a.put({ at: 13, mark: 'none' })
    await toLane(a, cue, APPROVE.n)
    await step(a, cue, stepNamed(APPROVE, 'Any Issues Found?'), 450)
    await step(a, cue, stepNamed(APPROVE, 'Approve in Slack'), rest(13, MOVE + 450))
    await toApps(a, cue, { at: -1, approve: 'shown' }, 'slack')
    await cue.wait(400)
    a.mark('approved')
    a.put({ at: 14, approve: 'done', kMood: 'happy' })
    await cue.wait(350)
    a.put({ mark: 'under', markAt: a.rect('approved') })
    await cue.wait(rest(14, 350))

    // Into QuickBooks at the amount after retention, then logged
    a.mark('post')
    a.put({ at: 15, mark: 'none', kMood: 'normal' })
    await toLane(a, cue, APPROVE.n)
    await each(cue, 4, 300, i => a.put({ step: stepNamed(APPROVE, 'Approved?') + i }))
    await toApps(a, cue, { qb: 'finding' }, 'quickbooks')
    await cue.wait(500)
    a.put({ qb: 'added' })
    await cue.wait(rest(15, MOVE * 2 + 1400))
    a.put({ at: 16, step: stepNamed(APPROVE, 'Save To Invoice Log'), logged: 1 })
    await cue.wait(700)
    a.put({ step: stepNamed(APPROVE, 'Mark Email As Read'), logged: 2, mail: 'read' })
    await cue.wait(rest(16, 700))
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'Other paths',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'map', lane: BREAKS.n, step: BREAKS.steps.length - 1 },
  words: wordsOf(17, 19),
  ms: 7900,
  run: async (a, cue) => {
    a.mark('flagged')
    a.put({ at: 17, kMood: 'puzzled' })
    await toLane(a, cue, APPROVE.n)
    a.put({ step: stepNamed(APPROVE, 'Any Issues Found?') })
    await cue.wait(rest(17, MOVE))
    await say(a, cue, 18, { kMood: 'normal', step: stepNamed(APPROVE, 'Approve in Slack') })
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
  still: { ...P4, world: 'ink', place: 'end', dMood: 'happy', kMood: 'happy', focus: null, cta: true },
  words: wordsOf(20, 21),
  ms: 9100,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 20, { dMood: 'happy', kMood: 'happy' })
    await say(a, cue, 21, { cta: true })
    await cue.wait(1300)
  }
}

/* ── The drawn accounts payable desk ────────────────────────────────────── */

const DESK: DeskWords = {
  clock: 'Friday · 4:40 PM',
  card: 'To match by hand',
  sub: 'This week',
  rows: PILE.map(p => ({ title: `${p.no} · ${p.from}`, note: p.note, at: p.sum, wrong: p.twice })),
  label: 'ACCOUNTS PAYABLE',
  folder: 'PO'
}

/** The case, drawn small: the invoice PDF, riding the lit lane. */
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
    { who: 'karan', spot: spots.karan, mood: s.kMood, out: !s.karan }
  ]

  const ai = {
    idle: { status: 'Waiting', tone: 'neutral' },
    reading: { status: 'Reading', tone: 'neutral' },
    unsure: { status: '72% sure', tone: 'warn' },
    confirmed: { status: 'Confirmed', tone: 'ok' },
    checking: { status: 'Checking', tone: 'neutral' },
    clean: { status: 'No issues', tone: 'ok' }
  } as const

  return (
    <div className='fa fa-four fb' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <MailCard
                mark={<ToolMark tool='gmail' size={18} />}
                title='Invoices inbox'
                status={s.mail === 'read' ? 'Read' : s.mail === 'new' ? '1 new' : 'Checked'}
                mails={[
                  {
                    from: VENDOR,
                    subject: `Invoice ${INVOICE} · Progress payment 4`,
                    attach: [`${INVOICE}.pdf`],
                    shown: s.mail !== 'none',
                    read: s.mail === 'read'
                  }
                ]}
              />
              <RecordCard
                target='invoice'
                mark={<ToolMark tool='openai' size={18} />}
                title='Read by AI'
                status={ai[s.ai].status}
                tone={ai[s.ai].tone}
                fields={FIELDS.map((f, i) => ({ ...f, shown: s.read > i }))}
                checksTitle='Fixed rules'
                checks={CHECKS.map((label, i) => ({ label, state: tick(s.checks, i) }))}
              />
              <SlackCard
                channel='#invoice-approvals'
                posts={[
                  {
                    who: 'Invoice check',
                    text: `AI is 72% sure of ${INVOICE}. Please check the details.`,
                    shown: s.ask !== 'none',
                    buttons: [{ label: 'Confirm', tone: 'go', pressed: s.ask === 'done' }],
                    reply: 'Confirmed by Dennice',
                    replied: s.ask === 'done'
                  },
                  {
                    who: 'Invoice check',
                    text: `${INVOICE} · ${VENDOR} · $16,560.00 to pay. No issues found.`,
                    shown: s.approve !== 'none',
                    buttons: [
                      { label: 'Approve', tone: 'go', pressed: s.approve === 'done' },
                      { label: 'Reject', tone: 'stop' }
                    ],
                    reply: 'Approved by Karan',
                    replied: s.approve === 'done',
                    target: 'approved'
                  }
                ]}
              />
              <RecordCard
                target='quickbooks'
                mark={<ToolMark tool='quickbooks' size={18} />}
                title='New bill'
                status={s.qb === 'added' ? 'Added' : s.qb === 'finding' ? 'Finding vendor' : 'Waiting'}
                tone={s.qb === 'added' ? 'ok' : 'neutral'}
                fields={[
                  { label: 'Vendor', value: VENDOR, shown: s.qb === 'added' },
                  { label: 'Bill no.', value: INVOICE, shown: s.qb === 'added' },
                  { label: 'To pay', value: '$16,560.00', shown: s.qb === 'added' },
                  { label: 'Retention held', value: '$1,840.00', shown: s.qb === 'added' }
                ]}
                checks={[
                  { label: 'Saved to the invoice log', state: tick(s.logged, 0) },
                  { label: 'Email marked as read', state: tick(s.logged, 1) }
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

export const INVOICE_APPROVAL: FilmDef<S> = {
  title: 'AI Invoice Processing & Approval',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function InvoiceApprovalFilm() {
  return <FilmStage def={INVOICE_APPROVAL} />
}
