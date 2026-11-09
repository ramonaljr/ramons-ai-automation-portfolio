'use client'

import { Badge, Bar, Count, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'

/**
 * Process step 02 (Process audit), also Engagement's audit: the invoice job
 * broken into its steps, each with the time it takes today and a verdict.
 * Final approval stays with a person. The times are estimates and say so.
 */

type S = { active: number; tagged: number; out: boolean }

const ROWS: { step: string; time: string; keep?: boolean }[] = [
  { step: 'Read the invoice', time: '4 min each' },
  { step: 'Find the PO', time: '6 min each' },
  { step: 'Check the delivery', time: '5 min each' },
  { step: 'Chase approval', time: '2 days' },
  { step: 'Final approval', time: '1 min', keep: true },
  { step: 'Key into QuickBooks', time: '3 min each' }
]

const START: S = { active: -1, tagged: 0, out: false }

const toAutomate = (tagged: number) => ROWS.slice(0, tagged).filter(row => !row.keep).length

const audit: SceneDef<S> = {
  size: SHEET_COMPACT,
  start: START,
  poster: { ...START, tagged: ROWS.length },
  hold: 2600,

  // Each step is looked at, then given its verdict
  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(700)
    a.mark('rows')

    for (let i = 0; i < ROWS.length; i++) {
      a.put({ active: i })
      await a.wait(300)
      a.put({ tagged: i + 1 })
      await a.wait(260)
    }

    a.put({ active: -1 })
    a.mark('done')
  },

  exit: async (a: Act<S>) => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(320)
    await a.snap({ ...START, out: true })
    await a.wait(350)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: s => (
    <Window title='Invoice process' className='ps-hero'>
      <div className='ps-body ps02' data-out={s.out || undefined}>
        <div className='ps02-head'>
          <span className='ps-strong'>How it runs today</span>
          <span className='ps02-total'>
            <Count value={toAutomate(s.tagged)} duration={300} />
            <span className='ps-muted'>of 6 to automate</span>
          </span>
        </div>

        <div className='ps02-table'>
          <div className='ps02-row ps02-row--head ps-label'>
            <span>Step</span>
            <span>Time (est.)</span>
            <span />
          </div>
          {ROWS.map((row, i) => (
            <div key={row.step} className='ps02-row' data-active={s.active === i || undefined}>
              <span className='ps-strong'>{row.step}</span>
              <span className='ps-muted'>{row.time}</span>
              <span className='ps02-verdict ps-in' data-in={i < s.tagged || undefined}>
                <Badge tone={row.keep ? 'neutral' : 'accent'} dot>
                  {row.keep ? 'Keep a person' : 'Automate'}
                </Badge>
              </span>
            </div>
          ))}
        </div>

        <div className='ps-filler'>
          {[
            [112, 48],
            [148, 40],
            [96, 56]
          ].map(([left, right], i) => (
            <div key={i}>
              <Bar w={left} h={5} tone={2} />
              <Bar w={right} h={5} tone={2} />
            </div>
          ))}
        </div>
      </div>
    </Window>
  )
}

export function Audit(props: SceneProps) {
  return <SceneStage def={audit} {...props} />
}
