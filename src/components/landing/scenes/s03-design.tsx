'use client'

import { Badge, Bar, Connector, Icon, Window, type Act } from '@/components/stageshow/kit'
import { SceneStage, SHEET_COMPACT, type SceneDef, type SceneProps } from '@/components/landing/scenes/scene'
import { ToolMark, type Tool } from '@/components/landing/scenes/tool-mark'

/**
 * Process step 03 (Solution design): the system map for the invoice job,
 * drawn left to right from the inbox to the bill, with the one branch that
 * sends problems to a person. Then the client signs it off.
 *
 * The map sits on the stage itself, over the window's body, so its
 * connectors can use stage pixels.
 */

type S = { tiles: number; lines: number; branch: boolean; signed: boolean; out: boolean }

const START: S = { tiles: 0, lines: 0, branch: false, signed: false, out: false }

const NODES: { tool: Tool; label: string }[] = [
  { tool: 'gmail', label: 'Invoice in' },
  { tool: 'openai', label: 'AI reads it' },
  { tool: 'airtable', label: 'PO check' },
  { tool: 'slack', label: 'Approval' },
  { tool: 'quickbooks', label: 'Bill added' }
]

// Tile centres in stage pixels; the layout in scenes.css matches
/** Where the map sits, in stage pixels: wide, and the phone's narrow design. */
const MAP = {
  wide: { x: [92, 176, 260, 344, 428], y: 164, half: 20, issue: 254 },
  compact: { x: [60, 120, 180, 240, 300], y: 116, half: 18, issue: 188 }
}

const CHECK = 2

const design: SceneDef<S> = {
  size: SHEET_COMPACT,
  start: START,
  poster: { tiles: NODES.length, lines: NODES.length - 1, branch: true, signed: true, out: false },
  hold: 2600,

  play: async (a: Act<S>) => {
    a.mark('open')
    await a.wait(600)
    await a.stagger(
      NODES.map((_, i) => i + 1),
      n => a.put({ tiles: n }),
      90
    )
    await a.wait(500)
    a.mark('lines')

    for (let i = 1; i < NODES.length; i++) {
      a.put({ lines: i })
      await a.wait(380)
    }

    await a.wait(250)
    a.put({ branch: true })
    await a.wait(900)
    a.mark('signed')
    a.put({ signed: true })
  },

  exit: async (a: Act<S>) => {
    a.mark('exit')
    await a.set({ out: true })
    await a.wait(420)
    await a.snap({ ...START, out: true })
    await a.wait(200)
    await a.set({ out: false })
    await a.wait(300)
  },

  render: (s, layout) => {
    const { x: X, y: Y, half: HALF, issue: ISSUE } = MAP[layout]

    return (
      <>
        <Window title='System map' className='ps-hero'>
          <div className='ps-body ps03' data-out={s.out || undefined}>
            <div className='ps03-head'>
              <span className='ps-strong'>Inbox to bill, one approval</span>
              <span className='ps-faint'>Rev. A</span>
            </div>
            <div className='ps03-signed ps-in' data-in={s.signed || undefined}>
              <Badge tone='success' icon={<Icon name='check' size={12} stroke={2} />}>
                Signed off
              </Badge>
              <span className='ps-muted'>Ready to build</span>
            </div>
            <div className='ps-filler ps03-filler'>
              {[
                [132, 48],
                [176, 36],
                [104, 52]
              ].map(([left, right], i) => (
                <div key={i}>
                  <Bar w={left} h={5} tone={2} />
                  <Bar w={right} h={5} tone={2} />
                </div>
              ))}
            </div>
          </div>
        </Window>

        <div className='ps03-map' data-out={s.out || undefined}>
          {NODES.map((node, i) => (
            <div
              key={node.tool}
              className='ps03-node ps-in'
              data-in={i < s.tiles || undefined}
              style={{ left: X[i] - HALF, top: Y - HALF }}
            >
              <span className='ps-tile ps03-tile'>
                <ToolMark tool={node.tool} size={layout === 'compact' ? 16 : 18} />
              </span>
              <span className='ps03-node__label'>{node.label}</span>
            </div>
          ))}
          <div className='ps03-issue ps-in' data-in={s.branch || undefined}>
            Problems go to accounts payable
          </div>
        </div>

        {X.slice(1).map((x, i) => (
          <Connector
            key={x}
            from={{ x: X[i] + HALF + 4, y: Y }}
            to={{ x: x - HALF - 4, y: Y }}
            route='straight'
            arrow
            show={!s.out && i < s.lines}
            className='ps03-line'
          />
        ))}
        <Connector
          from={{ x: X[CHECK], y: Y + 46 }}
          to={{ x: X[CHECK], y: ISSUE }}
          route='straight'
          arrow
          dashed
          show={!s.out && s.branch}
          className='ps03-line'
        />
      </>
    )
  }
}

export function Design(props: SceneProps) {
  return <SceneStage def={design} {...props} />
}
