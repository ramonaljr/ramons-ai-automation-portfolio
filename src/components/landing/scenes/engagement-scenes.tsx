'use client'

import type { ComponentType, CSSProperties } from 'react'

import { Badge, Bar, Check, Icon, Roll, Window } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'
import { ToolMark, type Tool } from '@/components/landing/scenes/tool-mark'

/**
 * The scene in each Working Together column. Each one plays the four things
 * its column lists, in the order listed, and lands on what the client
 * leaves with. The same invoice job runs through all three (and through the
 * Process sheet); the names, times and dates are illustration.
 */

const filler = (rows: number[][]) => (
  <div className='ps-filler'>
    {rows.map(([left, right], i) => (
      <div key={i}>
        <Bar w={left} h={5} tone={2} />
        <Bar w={right} h={5} tone={2} />
      </div>
    ))}
  </div>
)

/* ---------- Automation Audit: the plan ----------
   1 How the work is done today, written down
   2 A list of what is worth automating
   3 Which tool to build it on
   4 A plan in order of priority */

type AuditState = { written: number; tagged: number; tool: boolean; ranked: boolean; out: boolean }

/** Today's steps in the order they happen, and their place in the plan. */
const STEPS: { step: string; time: string; keep?: boolean; rank?: number }[] = [
  { step: 'Match invoice to PO', time: '6 min each', rank: 2 },
  { step: 'Chase approval', time: '2 days', rank: 1 },
  { step: 'Key into QuickBooks', time: '3 min each', rank: 3 },
  { step: 'Final approval', time: '1 min', keep: true }
]

const ROW = 46

const AUDIT_START: AuditState = { written: 0, tagged: 0, tool: false, ranked: false, out: false }

const audit: SceneDef<AuditState> = {
  size: SHEET_COMPACT,
  start: AUDIT_START,
  poster: { written: STEPS.length, tagged: STEPS.length, tool: true, ranked: true, out: false },
  hold: 2600,

  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 1; i <= STEPS.length; i++) {
      a.put({ written: i })
      await a.wait(260)
    }

    await a.wait(300)
    a.mark('verdicts')

    for (let i = 1; i <= STEPS.length; i++) {
      a.put({ tagged: i })
      await a.wait(240)
    }

    await a.wait(400)
    a.mark('tool')
    a.put({ tool: true })
    await a.wait(800)
    a.mark('ranked')
    a.put({ ranked: true })
    await a.wait(700)
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...AUDIT_START, out: true })
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Automation plan' className='ps-hero'>
      <div className='ps-body pse' data-out={s.out || undefined}>
        <div className='pse-head'>
          <span className='ps-strong'>What to automate first</span>
          <span className='ps-faint'>Week 1</span>
        </div>
        <div className='pse-cols ps-label'>
          <span>Step today · time (est.)</span>
        </div>
        <div className='pse-plan' style={{ height: STEPS.length * ROW }}>
          {STEPS.map((item, i) => {
            const at = s.ranked ? (item.rank ?? STEPS.length) - 1 : i

            return (
              <div
                key={item.step}
                className='pse-step'
                data-in={i < s.written || undefined}
                style={{ '--at': at } as CSSProperties}
              >
                <span className='pse-rank' data-on={(s.ranked && item.rank !== undefined) || undefined}>
                  <span>{item.rank}</span>
                </span>
                <span className='pse-step__name'>
                  <span className='ps-strong'>{item.step}</span>
                  <span className='ps-faint'>{item.time}</span>
                </span>
                {/* Undecided until tagged: a blank where the verdict goes */}
                <span className='pse-verdict' data-on={i < s.tagged || undefined}>
                  <Bar w={56} h={6} tone={2} />
                  <Badge tone={item.keep ? 'neutral' : 'accent'} dot>
                    {item.keep ? 'Keep a person' : 'Automate'}
                  </Badge>
                </span>
              </div>
            )
          })}
        </div>
        <div className='pse-tool ps-in' data-in={s.tool || undefined}>
          <span className='ps-label'>Build on</span>
          <span className='ps-tile'>
            <ToolMark tool='n8n' />
          </span>
          <span className='ps-strong'>n8n</span>
          <span className='ps-faint'>fits the tools you have</span>
        </div>
        {filler([
          [150, 40],
          [110, 52]
        ])}
      </div>
    </Window>
  )
}

/* ---------- Fixed-Price Build: the build, item by item ----------
   1 System design, including what happens on errors
   2 Build on n8n, Zapier or Make
   3 Testing with your unusual cases
   4 Documentation and handover */

type BuildState = { done: number; running: number; live: boolean; out: boolean }

const BUILD_ITEMS = ['System design', 'Built on n8n', 'Tested with unusual cases', 'Documented and handed over']
const TESTED = 2

const BUILD_START: BuildState = { done: 0, running: -1, live: false, out: false }

const build: SceneDef<BuildState> = {
  size: SHEET_COMPACT,
  start: BUILD_START,
  poster: { done: BUILD_ITEMS.length, running: -1, live: true, out: false },
  hold: 2600,

  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 0; i < BUILD_ITEMS.length; i++) {
      // The unusual cases take longest
      a.put({ running: i })
      await a.wait(i === TESTED ? 1200 : 650)
      a.put({ done: i + 1, running: -1 })
      await a.wait(300)
    }

    await a.wait(300)
    a.mark('live')
    a.put({ live: true })
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...BUILD_START, out: true })
    await a.wait(350)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => {
    // Each item's result, shown once it ticks
    const details = [
      <>Signed off, with an error path to AP</>,
      <>
        <ToolMark tool='n8n' size={12} />
        Gmail, Airtable, Slack, QuickBooks
      </>,
      <>12 of 12 cases passed</>,
      <>Runbook and a team walkthrough</>
    ]

    return (
      <Window title='Invoice check · build' className='ps-hero'>
        <div className='ps-body pse' data-out={s.out || undefined}>
          <div className='pse-head'>
            <span className='ps-strong'>Fixed-price build</span>
            <span className='pse-live ps-in' data-in={s.live || undefined}>
              <Badge tone='success' dot>
                Running in your accounts
              </Badge>
            </span>
          </div>
          <div className='pse-items'>
            {BUILD_ITEMS.map((item, i) => (
              <div key={item} className='pse-item' data-on={i < s.done || undefined}>
                <Check size={16} on={i < s.done} pending={s.running === i} />
                <span className='pse-item__text'>
                  <span className='ps-strong'>{item}</span>
                  <span className='pse-item__detail ps-in' data-in={i < s.done || undefined}>
                    {details[i]}
                  </span>
                </span>
              </div>
            ))}
          </div>
          {filler([
            [150, 40],
            [110, 52]
          ])}
        </div>
      </Window>
    )
  }
}

/* ---------- Ongoing Retainer: this month ----------
   1 Monitoring and failure alerts
   2 Fixes when your tools change
   3 New workflows as they come up
   4 Faster replies when you need me */

type RetainerState = { shown: number; settled: number; healthy: boolean; out: boolean }

type Entry = {
  mark: Tool | 'chat'
  title: string
  sub: string
  before: { tone: 'danger' | 'warning' | 'neutral' | 'accent'; label: string }
  after: { tone: 'success' | 'accent'; label: string }
}

const ENTRIES: Entry[] = [
  {
    mark: 'slack',
    title: 'Run failed, Slack alert',
    sub: 'Invoice check · 09:12',
    before: { tone: 'danger', label: 'Failed' },
    after: { tone: 'success', label: 'Fixed' }
  },
  {
    mark: 'quickbooks',
    title: 'QuickBooks API changed',
    sub: 'Workflow updated to match',
    before: { tone: 'warning', label: 'Changed' },
    after: { tone: 'success', label: 'Updated' }
  },
  {
    mark: 'n8n',
    title: 'New workflow added',
    sub: 'Receipts filed to Drive',
    before: { tone: 'accent', label: 'Building' },
    after: { tone: 'accent', label: 'Added' }
  },
  {
    mark: 'chat',
    title: 'Question answered',
    sub: 'Within 2 hours',
    before: { tone: 'neutral', label: 'Asked' },
    after: { tone: 'success', label: 'Answered' }
  }
]

const RETAINER_START: RetainerState = { shown: 0, settled: 0, healthy: false, out: false }

const retainer: SceneDef<RetainerState> = {
  size: SHEET_COMPACT,
  start: RETAINER_START,
  poster: { shown: ENTRIES.length, settled: ENTRIES.length, healthy: true, out: false },
  hold: 2600,

  // Each thing that comes up arrives, then gets dealt with
  play: async a => {
    a.mark('open')
    await a.wait(500)

    for (let i = 1; i <= ENTRIES.length; i++) {
      a.put({ shown: i })
      await a.wait(700)
      a.put({ settled: i })
      await a.wait(350)
    }

    await a.wait(300)
    a.mark('healthy')
    a.put({ healthy: true })
    a.mark('done')
  },

  exit: async a => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...RETAINER_START, out: true })
    await a.wait(200)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Retainer' className='ps-hero'>
      <div className='ps-body pse' data-out={s.out || undefined}>
        <div className='pse-head'>
          <span className='ps-strong'>This month</span>
          <span className='pse-live ps-in' data-in={s.healthy || undefined}>
            <Badge tone='success' dot>
              All workflows running
            </Badge>
          </span>
        </div>
        <div className='pse-log'>
          {ENTRIES.map((entry, i) => {
            const status = i < s.settled ? entry.after : entry.before

            return (
              <div key={entry.title} className='pse-entry ps-in' data-in={i < s.shown || undefined}>
                <span className='ps-tile'>
                  {entry.mark === 'chat' ? <Icon name='send' size={14} /> : <ToolMark tool={entry.mark} />}
                </span>
                <span className='pse-entry__text'>
                  <span className='ps-strong'>{entry.title}</span>
                  <span className='ps-faint'>{entry.sub}</span>
                </span>
                <Badge tone={status.tone} dot className='pse-status'>
                  <Roll variant='fade'>{status.label}</Roll>
                </Badge>
              </div>
            )
          })}
        </div>
        {filler([
          [150, 40],
          [110, 52]
        ])}
      </div>
    </Window>
  )
}

function AuditScene(props: SceneProps) {
  return <SceneStage def={audit} {...props} />
}

function BuildScene(props: SceneProps) {
  return <SceneStage def={build} {...props} />
}

function RetainerScene(props: SceneProps) {
  return <SceneStage def={retainer} {...props} />
}

/** In ENGAGEMENTS order: audit, build, retainer. */
export const ENGAGEMENT_SCENES: ComponentType<SceneProps>[] = [AuditScene, BuildScene, RetainerScene]
