'use client'

import { Button, Check, Count, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'
import { ToolMark, type Tool } from '@/components/landing/scenes/tool-mark'

/**
 * Process step 04 (Build & connect): the system is connected to the
 * client's own accounts, one at a time, and each connection adds a line to
 * the build log.
 */

type S = { connected: number; out: boolean }

const START: S = { connected: 0, out: false }

const APPS: { tool: Tool; name: string; use: string; log: string }[] = [
  { tool: 'gmail', name: 'Gmail', use: 'Invoices inbox', log: 'Watching the invoices inbox' },
  { tool: 'airtable', name: 'Airtable', use: 'PO and delivery records', log: 'Matching each invoice to its PO' },
  { tool: 'slack', name: 'Slack', use: '#approvals', log: 'Sending approvals to #approvals' },
  { tool: 'quickbooks', name: 'QuickBooks', use: 'Bills', log: 'Adding approved bills' }
]

const build: SceneDef<S> = {
  size: SHEET_COMPACT,
  start: START,
  poster: { connected: APPS.length, out: false },
  hold: 2400,
  cursor: { at: 'rest', style: 'arrow', ripple: true },

  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(700)
    a.mark('connect')

    for (let i = 0; i < APPS.length; i++) {
      await a.click({ at: `connect-${i}`, x: 0.5, y: 0.55 })
      a.put({ connected: i + 1 })
      await a.wait(i === APPS.length - 1 ? 300 : 420)
    }

    await a.move('rest')
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
    <>
      <Window title='Connections' className='ps-hero'>
        <div className='ps-body ps04' data-out={s.out || undefined}>
          <div className='ps04-head'>
            <span className='ps-strong'>Connected in your accounts</span>
            <span className='ps04-count'>
              <Count value={s.connected} duration={300} />
              <span className='ps-muted'>of 4</span>
            </span>
          </div>

          <div className='ps04-apps'>
            {APPS.map((app, i) => {
              const on = i < s.connected

              return (
                <div key={app.tool} className='ps04-app'>
                  <span className='ps-tile'>
                    <ToolMark tool={app.tool} />
                  </span>
                  <span className='ps04-app__name'>
                    <span className='ps-strong'>{app.name}</span>
                    <span className='ps-faint'>{app.use}</span>
                  </span>
                  <Button size='small' className='ps04-btn' data-target={`connect-${i}`} data-on={on || undefined}>
                    {on ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              )
            })}
          </div>

          <span className='ps-label ps04-log__label'>Build log</span>
          <div className='ps04-log'>
            {APPS.map((app, i) => (
              <div key={app.tool} className='ps04-log__line ps-in' data-in={i < s.connected || undefined}>
                <Check on size={12} />
                <span>{app.log}</span>
              </div>
            ))}
          </div>
        </div>
      </Window>
      <span className='ps-rest ps04-rest' data-target='rest' />
    </>
  )
}

export function Build(props: SceneProps) {
  return <SceneStage def={build} {...props} />
}
