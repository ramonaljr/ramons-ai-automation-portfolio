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
import { ln, rr } from '@/components/landing/film/sketch'
import { LINES } from '@/components/landing/film/films/gmail-attachment-filing-lines'
import { DeskBack, DeskFront, type DeskWords } from '@/components/landing/film/films/ink-desk'
import { MOVE, each, scriptFor } from '@/components/landing/film/films/script'
import { BAND_SPOTS, FLOOR, STAGE, TalkBand, type Actor, type Spot } from '@/components/landing/film/talk-band'
import { ToolMark } from '@/components/landing/scenes/tool-mark'

/**
 * Film 6, Gmail Attachment Filing, in two worlds
 * (docs/plans/2026-11-10-two-worlds-films.md). Karan keeps the books and
 * explains; Leo, a client, asks what a visitor would ask, and the email with
 * three files in it is Leo's.
 *
 * Before, in ink: Karan at a downloads folder of files saved by hand under
 * names that say nothing, scan001.pdf among them. Then the paper drops to the
 * band and Leo's email drives the tour: labelled To File, picked up by the
 * 15-minute check, its three attachments listed and the logo dropped as too
 * small to be a real file. Gemini names the two that are left, keeping the
 * extension; each is saved to Drive and logged, and Leo gets one receipt. The
 * marker lands twice: round the real-files check that drops the logo, and under
 * the new, findable name. Then the retries, and the paper rises for the end.
 *
 * Facts come only from src/content/case-studies/gmail-attachment-filing.mdx
 * and the map's lanes (docs/process-diagrams/diagrams.json). The file names,
 * sizes and dates are illustration.
 */

const LANES = lanesOf('gmail-attachment-filing')
const FIND = laneNamed(LANES, 'Find new attachments')
const NAME = laneNamed(LANES, 'Name it with AI')
const FILE = laneNamed(LANES, 'File and log')
const CONFIRM = laneNamed(LANES, 'Confirm once')
const BREAK = laneNamed(LANES, 'If something breaks')

const { say, rest, toLane, toApps, wordsOf } = scriptFor<S>(LINES)

/** Files saved by hand, under names that say nothing about what they are. */
const DESK: DeskWords = {
  clock: 'Monday · 9:40 AM',
  card: 'Downloads',
  sub: 'Not logged',
  rows: [
    { title: 'scan001.pdf', note: 'From which client?', at: '1.2 MB', wrong: true },
    { title: 'scan002.pdf', note: 'Saved by hand', at: '840 KB' },
    { title: 'IMG_4471.jpg', note: 'Not opened yet', at: '2.1 MB' },
    { title: 'document(3).pdf', note: 'Sender not told', at: '310 KB' }
  ],
  label: 'FERNHILL',
  folder: 'CLIENT DOCS'
}

type Place = 'desk' | 'band' | 'end'

const SPOTS: Record<Place, { karan: Spot; leo: Spot }> = {
  desk: { karan: { x: 250, y: 404, w: 250 }, leo: { x: 790, y: FLOOR - 2, w: 240 } },
  band: { karan: BAND_SPOTS.left, leo: BAND_SPOTS.right },
  end: { karan: { x: 320, y: FLOOR - 2, w: 240 }, leo: { x: 650, y: FLOOR - 2, w: 240 } }
}

type S = {
  world: 'ink' | 'build'
  place: Place
  settle: boolean
  kMood: Mood
  lMood: Mood
  leo: boolean
  pile: number

  at: number
  view: 'apps' | 'map'
  focus: Rect | null
  mail: boolean
  listed: boolean
  skipped: boolean
  named: number
  saved: number
  logged: boolean
  receipt: boolean
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
  kMood: 'normal',
  lMood: 'normal',
  leo: false,
  pile: 0,
  at: -1,
  view: 'apps',
  focus: null,
  mail: false,
  listed: false,
  skipped: false,
  named: 0,
  saved: 0,
  logged: false,
  receipt: false,
  lane: 0,
  step: -1,
  mark: 'none',
  markAt: null,
  cta: false
}

const P2: S = { ...BLANK, kMood: 'puzzled', lMood: 'puzzled', leo: true, pile: DESK.rows.length }

const P3: S = { ...P2, world: 'build', place: 'band', kMood: 'normal', lMood: 'normal', mail: true }

const P4: S = { ...P3, listed: true, skipped: true, named: 2, saved: 2, logged: true, receipt: true }

/* ── The five parts ─────────────────────────────────────────────────────── */

const before: FilmPart<S> = {
  chip: 'Before',
  start: BLANK,
  still: P2,
  words: ['Every attachment is saved by hand, under names like scan001.pdf.', ...wordsOf(0, 1)],
  ms: 9300,
  run: async (a, cue) => {
    await cue.wait(500)
    await each(cue, DESK.rows.length, 380, i => a.put({ pile: i + 1 }))
    await cue.wait(500)
    a.put({ leo: true })
    await cue.wait(1100)
    await say(a, cue, 0, { lMood: 'puzzled' })
    await say(a, cue, 1, { kMood: 'puzzled' })
  }
}

const arrives: FilmPart<S> = {
  chip: 'The email',
  start: P2,
  still: P3,
  words: wordsOf(2, 2),
  ms: 4200,
  run: async (a, cue) => {
    a.put({ at: -1 })
    a.mark('settle')
    a.put({ settle: true })
    await cue.wait(300)
    a.put({ world: 'build', place: 'band', kMood: 'normal', lMood: 'normal' })
    await cue.wait(1200)
    a.put({ settle: false })
    a.mark('arrives')
    await say(a, cue, 2, { kMood: 'happy', mail: true }, 900)
    a.put({ kMood: 'normal' })
    await cue.wait(rest(2, 900))
  }
}

const build: FilmPart<S> = {
  chip: 'Through the build',
  start: P3,
  still: { ...P4, view: 'apps', focus: null, lane: CONFIRM.n, step: CONFIRM.steps.length - 1 },
  words: wordsOf(3, 15),
  ms: 39800,
  run: async (a, cue) => {
    // Find new attachments: every 15 minutes, emails labelled To File
    a.mark('find')
    a.put({ at: 3 })
    await toLane(a, cue, FIND.n)
    await each(cue, 2, 450, i => a.put({ step: i }))
    await toApps(a, cue, {}, 'inbox')
    await cue.wait(rest(3, MOVE * 2 + 450))

    // Three attachments listed, and only the real files go on
    a.put({ at: 4 })
    await toLane(a, cue, FIND.n, { step: stepNamed(FIND, 'List Attachments') })
    await cue.wait(300)
    a.put({ step: stepNamed(FIND, 'Keep Real Attachments') })
    await toApps(a, cue, { listed: true }, 'files')
    await cue.wait(rest(4, MOVE * 2 + 300))

    // The logo was too small to be a real file
    a.mark('skipped')
    await say(a, cue, 5, { lMood: 'puzzled' })
    a.put({ at: 6, lMood: 'normal', skipped: true })
    await cue.wait(300)
    a.put({ mark: 'loop', markAt: a.rect('files-checks') })
    await cue.wait(rest(6, 300))

    // Gemini reads each file and names it, keeping the extension
    a.mark('name')
    a.put({ at: 7, mark: 'none' })
    await toLane(a, cue, NAME.n, { step: stepNamed(NAME, 'Upload File To Gemini') })
    await cue.wait(400)
    a.put({ step: stepNamed(NAME, 'Gemini Names The File') })
    await toApps(a, cue, { named: 1 }, 'files')
    await cue.wait(rest(7, MOVE * 2 + 400))
    a.put({ at: 8, kMood: 'happy' })
    await cue.wait(300)
    a.put({ mark: 'under', markAt: a.rect('newname') })
    await cue.wait(rest(8, 300))
    await say(a, cue, 9, { kMood: 'normal', lMood: 'puzzled' })
    await say(a, cue, 10, { mark: 'none', lMood: 'normal', named: 2 })

    // Saved to the client documents folder in Drive, and logged
    a.mark('file')
    a.put({ at: 11 })
    await toLane(a, cue, FILE.n, { step: stepNamed(FILE, 'Upload To Drive Folder') })
    await toApps(a, cue, {}, 'log')
    await each(cue, 2, 350, i => a.put({ saved: i + 1 }))
    await cue.wait(rest(11, MOVE * 2 + 350))
    a.put({ at: 12, logged: true, step: stepNamed(FILE, 'Add Row To Sheets Log') })
    await cue.wait(rest(12, 0))

    // One receipt to the sender, only when something was saved
    a.mark('receipt')
    await say(a, cue, 13, { lMood: 'puzzled' })
    a.put({ at: 14, lMood: 'normal', kMood: 'happy' })
    await toLane(a, cue, CONFIRM.n, { step: stepNamed(CONFIRM, 'Gather New File Names') })
    await cue.wait(400)
    a.put({ step: stepNamed(CONFIRM, 'Send Receipt To Sender') })
    await toApps(a, cue, { receipt: true }, 'sent')
    await cue.wait(rest(14, MOVE * 2 + 400))
    await say(a, cue, 15, { kMood: 'normal' })
    await toApps(a, cue, { at: -1 })
  }
}

const others: FilmPart<S> = {
  chip: 'A second try',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, view: 'apps', focus: null, lane: BREAK.n, step: BREAK.steps.length - 1 },
  words: wordsOf(16, 18),
  ms: 9300,
  run: async (a, cue) => {
    a.mark('retry')
    a.put({ at: 16, lMood: 'puzzled' })
    await toLane(a, cue, BREAK.n, { step: stepNamed(BREAK, 'Gemini Or Drive Step Fails') })
    await cue.wait(rest(16, MOVE))
    a.put({ at: 17, lMood: 'normal' })
    await each(cue, 2, 450, i => a.put({ step: 1 + i }))
    await cue.wait(rest(17, 450))
    a.put({ at: 18 })
    await toApps(a, cue, {}, 'inbox')
    await cue.wait(rest(18, MOVE))
    await toApps(a, cue, { at: -1 })
  }
}

const result: FilmPart<S> = {
  chip: 'The result',
  start: { ...P4, view: 'apps', focus: null },
  still: { ...P4, world: 'ink', place: 'end', kMood: 'happy', lMood: 'happy', focus: null, cta: true },
  words: wordsOf(19, 20),
  ms: 7900,
  run: async (a, cue) => {
    a.mark('end')
    a.put({ at: -1, world: 'ink', place: 'end', focus: null, lane: 0, step: -1 })
    await cue.wait(1300)
    await say(a, cue, 19, { kMood: 'happy', lMood: 'happy' })
    await say(a, cue, 20, { cta: true })
    await cue.wait(1300)
  }
}

/** The case, drawn small: a page with a folded corner, riding the lit lane. */
const TOKEN = (
  <svg className='fa-token' viewBox='0 0 26 15'>
    <Ink className='fa-token__pill' pts={rr(1, 1, 24, 14, 7)} seed={61} amp={0.5} passes={1} />
    <Ink className='fa-token__doc' pts={rr(9, 3, 8, 9.5, 1)} seed={63} amp={0.3} passes={1} />
    <Ink className='fa-token__tape' pts={ln(10.5, 6.5, 15.5, 6.5)} seed={64} amp={0.2} closed={false} passes={1} />
  </svg>
)

const tick = (on: boolean): CheckState => (on ? 'ok' : 'wait')

const RECEIPT = 'Fuel receipt, 4 Mar.pdf'
const STATEMENT = 'Bank statement, Feb.pdf'

/* ── The scene ──────────────────────────────────────────────────────────── */

function render(s: S) {
  const spots = SPOTS[s.place]

  const actors: Actor[] = [
    { who: 'karan', spot: spots.karan, mood: s.kMood },
    { who: 'leo', spot: spots.leo, mood: s.lMood, out: !s.leo }
  ]

  return (
    <div className='fa fa-four fg' data-view={s.view} data-world={s.world}>
      <div className='fa-world'>
        <div className='fa-fit'>
          <Camera focus={s.focus} max={2.2} pad={20} duration={MOVE}>
            <div className='fa-apps'>
              <div className='fa-plate' />
              <MailCard
                target='inbox'
                mark={<ToolMark tool='gmail' size={18} />}
                title='Inbox'
                status={s.mail ? 'To File' : 'Waiting'}
                mails={[
                  {
                    from: 'Leo',
                    subject: 'March receipts and statement',
                    attach: ['scan001.pdf', 'scan002.pdf', 'logo.png'],
                    shown: s.mail
                  }
                ]}
              />
              <RecordCard
                target='files'
                mark={<ToolMark tool='make' size={18} />}
                title='Attachments'
                status={s.named === 2 ? 'Named' : s.skipped ? '2 real files' : s.listed ? '3 listed' : 'Waiting'}
                fields={[
                  { label: 'scan001.pdf', value: RECEIPT, shown: s.named > 0, target: 'newname' },
                  { label: 'scan002.pdf', value: STATEMENT, shown: s.named > 1 }
                ]}
                checksTitle='Real files only'
                checks={[
                  { label: 'scan001.pdf · 1.2 MB', state: tick(s.listed) },
                  { label: 'scan002.pdf · 840 KB', state: tick(s.listed) },
                  { label: 'logo.png · 9 KB, skipped', state: s.skipped ? 'flag' : 'wait' }
                ]}
              />
              <RecordCard
                target='log'
                mark={<ToolMark tool='googlesheets' size={18} />}
                title='Filing log'
                status={s.logged ? '2 rows' : 'Waiting'}
                fields={[
                  { label: 'Date', value: 'Monday', shown: s.logged },
                  { label: 'Original', value: 'scan001.pdf', shown: s.logged },
                  { label: 'New name', value: RECEIPT, shown: s.logged },
                  { label: 'Type', value: 'PDF', shown: s.logged },
                  { label: 'Link', value: 'Client documents', shown: s.logged }
                ]}
                checksTitle='Saved to Drive'
                checks={[
                  { label: RECEIPT, state: tick(s.saved > 0) },
                  { label: STATEMENT, state: tick(s.saved > 1) }
                ]}
              />
              <MailCard
                target='sent'
                mark={<ToolMark tool='gmail' size={18} />}
                title='Receipt to Leo'
                status={s.receipt ? 'Sent' : 'Waiting'}
                mails={[
                  {
                    from: '2 files saved',
                    subject: 'Your files, under their new names',
                    attach: [RECEIPT, STATEMENT],
                    shown: s.receipt
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

export const ATTACHMENT_FILING: FilmDef<S> = {
  title: 'Gmail Attachment Filing',
  size: { width: STAGE.w, height: STAGE.h },
  parts: [before, arrives, build, others, result],
  render
}

export function AttachmentFilingFilm() {
  return <FilmStage def={ATTACHMENT_FILING} />
}
