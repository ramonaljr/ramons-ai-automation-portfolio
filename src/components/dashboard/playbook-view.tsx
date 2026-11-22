'use client'

import { Fragment } from 'react'

import {
  driveUrl,
  GUIDE_BY_ID,
  itemId,
  PHASES,
  TEMPLATES,
  TOOLS,
  type ItemLinks,
  type Phase,
  type TemplateKey,
  type ToolKey
} from '@/lib/playbook'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

export function phaseStats(phase: Phase, checks: Record<string, boolean>) {
  const done = phase.items.filter((_, i) => checks[itemId(phase.id, i)]).length

  return [done, phase.items.length] as const
}

type Props = {
  phaseId: string
  onPhase: (id: string) => void
  checks: Record<string, boolean>
  onCheck: (id: string, value: boolean) => void
  clientName: string | null
  openGuide: (id: string) => void
  goTool: (key: ToolKey) => void
}

function Chips({ links, openGuide, goTool }: { links: ItemLinks } & Pick<Props, 'openGuide' | 'goTool'>) {
  const guides = links.g ?? []
  const templates = links.t ?? []

  if (!guides.length && !templates.length && !links.k) return null

  return (
    <div className='rvd-chips'>
      {guides.map(id => (
        <button key={id} type='button' className='rvd-chip g' onClick={() => openGuide(id)}>
          {GUIDE_BY_ID[id].title}
        </button>
      ))}
      {templates.map(key => (
        <a
          key={key}
          className='rvd-chip t'
          href={driveUrl(TEMPLATES[key].id)}
          target='_blank'
          rel='noopener noreferrer'
        >
          {TEMPLATES[key].name} ↗
        </a>
      ))}
      {links.k && (
        <button type='button' className='rvd-chip k' onClick={() => goTool(links.k as ToolKey)}>
          {TOOLS[links.k]}
        </button>
      )}
    </div>
  )
}

export function PlaybookView({ phaseId, onPhase, checks, onCheck, clientName, openGuide, goTool }: Props) {
  const index = Math.max(
    0,
    PHASES.findIndex(p => p.id === phaseId)
  )

  const phase = PHASES[index]
  const [done, total] = phaseStats(phase, checks)
  const prev = PHASES[index - 1]
  const next = PHASES[index + 1]
  const templates = [...new Set(phase.items.flatMap(([, l]) => l.t ?? []))] as TemplateKey[]
  const guides = [...new Set(phase.items.flatMap(([, l]) => l.g ?? []))]

  const go = (id: string, scroll = false) => {
    onPhase(id)
    if (scroll) document.getElementById('rvd-phase')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className='rvd-pb'>
      <nav className='rvd-rail' aria-label='Phases'>
        {PHASES.map((p, i) => {
          const [d, t] = phaseStats(p, checks)

          return (
            <button
              key={p.id}
              type='button'
              className={d === t ? 'done' : undefined}
              aria-current={p.id === phase.id ? 'step' : undefined}
              onClick={() => go(p.id)}
            >
              <span className='n'>{pad(i + 1)}</span>
              <span className='nm'>{p.name}</span>
              <span className='ct'>
                {d === t ? '✓ ' : ''}
                {d}/{t}
              </span>
            </button>
          )
        })}
        <div className='rvd-railnote'>
          {clientName ? (
            <>
              Ticks save to <b>{clientName}</b>.
            </>
          ) : (
            'Add a client above to save your progress. Until then, ticks are for practice only.'
          )}
        </div>
      </nav>

      <article id='rvd-phase'>
        <div className='rvd-phead'>
          <span className='rvd-eyebrow'>
            Phase {pad(index + 1)} of {PHASES.length}
          </span>
          <h1>{phase.name}</h1>
          <p className='rvd-goal'>{phase.goal}</p>
          <div className='rvd-facts'>
            <span className='rvd-fact'>
              <b>Time</b>
              {phase.time}
            </span>
            <span className={cn('rvd-fact', done === total && 'done')}>
              <b>Done when</b>
              {phase.done}
            </span>
            <span className='rvd-fact'>
              <b>Progress</b>
              {done} of {total}
            </span>
          </div>
        </div>

        <div className='rvd-cols'>
          <div>
            <ul className='rvd-cl'>
              {phase.items.map(([text, links], i) => {
                const id = itemId(phase.id, i)
                const on = Boolean(checks[id])

                return (
                  <li key={id} className={cn('rvd-item', on && 'is-done')}>
                    <input id={`ck-${id}`} type='checkbox' checked={on} onChange={e => onCheck(id, e.target.checked)} />
                    <label htmlFor={`ck-${id}`}>{text}</label>
                    <Chips links={links} openGuide={openGuide} goTool={goTool} />
                  </li>
                )
              })}
            </ul>
            <div className='rvd-pnav'>
              {prev ? (
                <button className='rvd-btn' type='button' onClick={() => go(prev.id, true)}>
                  ← {prev.name}
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button className='rvd-btn primary' type='button' onClick={() => go(next.id, true)}>
                  {next.name} →
                </button>
              )}
            </div>
          </div>

          <aside className='rvd-side'>
            <div className='rvd-panel'>
              <h3>Templates for this phase</h3>
              {templates.length ? (
                <ul className='rvd-plist'>
                  {templates.map(key => (
                    <li key={key}>
                      <a href={driveUrl(TEMPLATES[key].id)} target='_blank' rel='noopener noreferrer'>
                        <span>{TEMPLATES[key].name}</span>
                        <span className='arr'>Drive ↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='rvd-hint'>No documents in this phase.</p>
              )}
            </div>
            <div className='rvd-panel'>
              <h3>Guides for this phase</h3>
              <ul className='rvd-plist'>
                {guides.map(id => (
                  <Fragment key={id}>
                    <li>
                      <button type='button' onClick={() => openGuide(id)}>
                        <span>{GUIDE_BY_ID[id].title}</span>
                        <span className='arr'>{GUIDE_BY_ID[id].cat === 'Interview' ? 'Interview' : 'Open'}</span>
                      </button>
                    </li>
                  </Fragment>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </section>
  )
}
