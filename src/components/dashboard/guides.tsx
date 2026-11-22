'use client'

import { useEffect, useRef, useState } from 'react'

import {
  GUIDE_BY_ID,
  GUIDE_CATEGORIES,
  GUIDES,
  PHASES,
  REFERENCES,
  TOOLS,
  type Guide,
  type GuideCategory,
  type GuideSection,
  type ToolKey
} from '@/lib/playbook'
import { cn } from '@/lib/utils'

const kindLabel = (cat: GuideCategory) => (cat === 'Interview' ? 'Interview guide' : cat)

/** Sections whose headings read as advice, rendered as a shaded note rather than a body section. */
const NOTE_HEADINGS = /^(Listen for|Avoid|Tips?|Rule|Rule of thumb|Also check)$/

export function GuidesView({ openGuide }: { openGuide: (id: string) => void }) {
  const [filter, setFilter] = useState<'All' | GuideCategory>('All')

  return (
    <section>
      <div className='rvd-head'>
        <span className='rvd-eyebrow'>Guides</span>
        <h1>Scripts, interview guides and standards</h1>
        <p>
          Everything I use from the first call to the retainer. Open a guide from any checklist item, or browse by stage
          here. Interview questions copy in one click.
        </p>
      </div>

      <div className='rvd-filters' role='group' aria-label='Filter guides'>
        {GUIDE_CATEGORIES.map(cat => (
          <button key={cat} type='button' aria-pressed={cat === filter} onClick={() => setFilter(cat)}>
            {cat === 'Interview' ? 'Interview guides' : cat}
            {cat !== 'All' && ` · ${GUIDES.filter(g => g.cat === cat).length}`}
          </button>
        ))}
      </div>

      <div className='rvd-ggrid'>
        {GUIDES.filter(g => filter === 'All' || g.cat === filter).map(g => (
          <button key={g.id} type='button' className='rvd-gcard' onClick={() => openGuide(g.id)}>
            <span className='meta'>
              <span className={cn('rvd-kind', g.cat === 'Interview' && 'interview')}>{kindLabel(g.cat)}</span>
              <span className='rvd-kind'>{g.time ?? ''}</span>
            </span>
            <h2>{g.title}</h2>
            <p>{g.sum}</p>
            <span className='rvd-kind'>Phase: {PHASES.find(p => p.id === g.ph)?.name}</span>
          </button>
        ))}
      </div>

      <div className='rvd-refs'>
        <h2>References</h2>
        <ul>
          {REFERENCES.map(r => (
            <li key={r.href}>
              <a href={r.href} target='_blank' rel='noopener noreferrer'>
                {r.title}
              </a>{' '}
              · {r.note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function SectionBody({ s }: { s: GuideSection }) {
  if (s.p) return <p>{s.p}</p>
  if (s.ul)
    return (
      <ul>
        {s.ul.map(l => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    )
  if (s.ol)
    return (
      <ol>
        {s.ol.map(l => (
          <li key={l}>{l}</li>
        ))}
      </ol>
    )
  if (s.qs)
    return (
      <ol className='rvd-qs'>
        {s.qs.map(l => (
          <li key={l}>
            <span>{l}</span>
          </li>
        ))}
      </ol>
    )
  if (s.email) return <pre className='rvd-email'>{s.email}</pre>
  if (s.pairs)
    return (
      <div className='rvd-pairs'>
        {s.pairs.map(([q, a]) => (
          <div key={q} className='rvd-pair'>
            <b>{q}</b>
            {a}
          </div>
        ))}
      </div>
    )

  return null
}

const questionsText = (g: Guide) =>
  `${g.title}\n\n` +
  g.s
    .filter(s => s.qs)
    .map(s => `${s.h}\n${(s.qs ?? []).map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
    .join('\n\n')

type DialogProps = {
  guideId: string | null
  onClose: () => void
  goTool: (key: ToolKey) => void
  goPhase: (id: string) => void
}

export function GuideDialog({ guideId, onClose, goTool, goPhase }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const guide = guideId ? GUIDE_BY_ID[guideId] : null

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return
    if (guide && !dialog.open) dialog.showModal()
    if (!guide && dialog.open) dialog.close()
  }, [guide])

  return (
    <dialog
      ref={ref}
      className='rvd-dialog'
      aria-labelledby='rvd-dlg-title'
      onClose={onClose}
      onClick={e => {
        if (e.target === ref.current) onClose()
      }}
    >
      {/* Keyed by guide, so copy state and scroll position start fresh each time. */}
      {guide && <GuideContent key={guide.id} guide={guide} onClose={onClose} goTool={goTool} goPhase={goPhase} />}
    </dialog>
  )
}

function GuideContent({ guide, onClose, goTool, goPhase }: { guide: Guide } & Omit<DialogProps, 'guideId'>) {
  const [copied, setCopied] = useState<string | null>(null)
  const [fallback, setFallback] = useState<string | null>(null)

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setFallback(text)
    }
  }

  const email = guide.s.find(s => s.email)?.email
  const hasQuestions = guide.s.some(s => s.qs)
  const phase = PHASES.find(p => p.id === guide.ph)

  return (
    <div className='rvd-dlg'>
      <header>
        <div>
          <span className={cn('rvd-kind', guide.cat === 'Interview' && 'interview')}>
            {kindLabel(guide.cat)}
            {guide.time ? ` · ${guide.time}` : ''}
          </span>
          <h2 id='rvd-dlg-title'>{guide.title}</h2>
        </div>
        <button className='rvd-btn sm x' type='button' onClick={onClose}>
          Close
        </button>
      </header>

      <div className='body'>
        <p className='sum'>{guide.sum}</p>
        {guide.s.map(s =>
          NOTE_HEADINGS.test(s.h) ? (
            <div key={s.h} className='rvd-callout'>
              <b>{s.h}</b>
              <SectionBody s={s} />
            </div>
          ) : (
            <div key={s.h} className='rvd-sec'>
              <h4>{s.h}</h4>
              <SectionBody s={s} />
            </div>
          )
        )}
        {fallback && (
          <textarea
            id='rvd-copy-fallback'
            className='rvd-copyfb'
            aria-label='Text to copy'
            readOnly
            value={fallback}
            ref={el => el?.select()}
          />
        )}
      </div>

      <footer>
        {hasQuestions && (
          <button className='rvd-btn primary sm' type='button' onClick={() => copy('q', questionsText(guide))}>
            {copied === 'q' ? 'Copied' : 'Copy questions'}
          </button>
        )}
        {email && (
          <button className='rvd-btn primary sm' type='button' onClick={() => copy('e', email)}>
            {copied === 'e' ? 'Copied' : 'Copy email'}
          </button>
        )}
        {guide.tool && (
          <button className='rvd-btn sm' type='button' onClick={() => goTool(guide.tool as ToolKey)}>
            Open {TOOLS[guide.tool]}
          </button>
        )}
        {phase && (
          <button className='rvd-btn sm ghost' type='button' onClick={() => goPhase(phase.id)}>
            Go to phase: {phase.name}
          </button>
        )}
      </footer>
    </div>
  )
}
