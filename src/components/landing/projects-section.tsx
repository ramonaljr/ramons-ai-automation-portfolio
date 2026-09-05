'use client'

import { useMemo, useState } from 'react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { SectionIntro } from '@/components/landing/section-intro'
import { CONTAINER, DISPLAY_FONT, SECTION_ANCHOR, useInView } from '@/components/landing/motion'
import { CaseStudyModal } from '@/components/landing/case-study-modal'

const FILTERS = ['ALL', 'AI AGENTS', 'N8N', 'ZAPIER', 'MAKE'] as const

type Filter = (typeof FILTERS)[number]

/** Where the aux links point until a project has its own recording or repo. */
const PROFILE_REPO = 'https://github.com/ramonaljr'

function Ico({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={d} />
    </svg>
  )
}

function VideoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <polygon points='23 7 16 12 23 17 23 7' />
      <rect x='1' y='5' width='15' height='14' rx='2' ry='2' />
    </svg>
  )
}

function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
      />
    </svg>
  )
}

const P = {
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',

  // Sustained volume rather than per-run latency — see `speedKind`.
  stack: 'M12 2l9 5-9 5-9-5 9-5zM3 17l9 5 9-5M3 12l9 5 9-5',
  arrow: 'M4 12h14M13 6l6 6-6 6'
}

/** A project matches a filter on its platform or on one of its categories. */
function matches(cs: CaseStudyMetadata, f: Filter) {
  if (f === 'ALL') return true
  const platform = (cs.platform ?? '').toUpperCase()
  const cats = (cs.categories ?? []).map(c => c.toUpperCase())

  return platform === f || cats.includes(f)
}

const has = (u?: string) => typeof u === 'string' && u.trim().length > 0

/**
 * Walkthrough and source links.
 *
 * Per-project URLs are still being filled in, so these fall back to the profile
 * while the recordings and repos are in progress. What changed is where they
 * live: one set in the preview panel, rather than a pair repeated on all six
 * cards, which is what made the old grid more chrome than work.
 */
function AuxLinks({ cs }: { cs: CaseStudyMetadata }) {
  const base =
    'inline-flex items-center gap-2 rounded-full border border-rule px-3.5 py-2 font-mono text-meta tracking-wide text-ink-3 transition-colors duration-300 hover:border-rule-strong hover:bg-ink/3 hover:text-ink'

  return (
    <>
      <a
        href={has(cs.videoUrl) ? cs.videoUrl : PROFILE_REPO}
        target='_blank'
        rel='noopener noreferrer'
        className={base}
      >
        <VideoIcon size={12} />
        Walkthrough
      </a>
      <a href={has(cs.repoUrl) ? cs.repoUrl : PROFILE_REPO} target='_blank' rel='noopener noreferrer' className={base}>
        <GitHubIcon size={12} />
        Source
      </a>
    </>
  )
}

/** The workflow canvas, framed. Shared by the preview panel and the mobile rows. */
function Canvas({ cs, priority = false }: { cs: CaseStudyMetadata; priority?: boolean }) {
  if (!cs.workflowImage) return null

  return (
    <div className='border-rule bg-surface-raised relative overflow-hidden rounded-xl border p-3'>
      {/* Keyed on the slug so React swaps the element rather than mutating src
          — without it the browser paints the previous canvas until the new one
          decodes, and the panel appears to lag a row behind the cursor. */}
      <img
        key={cs.slug}
        src={cs.workflowImage}
        width={1400}
        height={900}
        loading={priority ? 'eager' : 'lazy'}
        alt={`Workflow canvas for ${cs.title}`}
        className='w-full rounded-lg'
      />
    </div>
  )
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView(0.06)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyMetadata | null>(null)

  /**
   * Delivered work leads; SAMPLE builds sort to the back.
   *
   * `getCaseStudies` orders by `publishedAt`, and the two illustrative builds
   * happen to carry the latest dates — so this section opened on two projects
   * badged SAMPLE. That was survivable when the section sat at beat 6. It is
   * not now that it answers the hero directly. The sort is stable, so within
   * each group the date order is preserved.
   */
  const shown = useMemo(
    () =>
      caseStudies
        .filter(cs => matches(cs, filter))
        .sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample))),
    [caseStudies, filter]
  )

  /**
   * The panel always has something to show, so the section reads correctly at
   * rest rather than waiting for a hover.
   *
   * `activeSlug` is validated against the current filter rather than reset in an
   * effect: when a filter hides the active project the lookup simply misses and
   * falls through to the featured one, costing no extra render.
   */
  const active = shown.find(cs => cs.slug === activeSlug) ?? shown.find(cs => cs.featured) ?? shown[0]

  return (
    <section id='portfolio' className={SECTION_ANCHOR}>
      <div className={CONTAINER}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className='flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between'>
          <SectionIntro
            tag='SELECTED'
            margin=''
            titleClassName='display-xl mt-2 text-[clamp(2.5rem,6vw,5rem)]'
            title='WORK'
            blurb='Automation systems running in production. Each one replaced a job somebody was doing by hand — the workflow canvas shows exactly how.'
          />

          <div className='flex flex-col items-start gap-4 lg:items-end'>
            <span className='text-meta text-ink-3 font-mono tracking-[0.18em] uppercase'>
              {caseStudies.length} automation projects
            </span>

            <div className='flex flex-wrap gap-2 lg:justify-end' role='tablist' aria-label='Filter projects'>
              {FILTERS.map(f => {
                const on = filter === f
                const n = caseStudies.filter(cs => matches(cs, f)).length

                return (
                  <button
                    key={f}
                    type='button'
                    role='tab'
                    aria-selected={on}
                    disabled={n === 0}
                    onClick={() => setFilter(f)}
                    className={`text-meta inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono tracking-wide transition-all duration-300 ${
                      on
                        ? 'border-ink bg-ink text-ground'
                        : n === 0
                          ? 'border-rule text-ink-4 cursor-default'
                          : 'border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink'
                    }`}
                  >
                    {f}
                    <span className={on ? 'text-ground/65' : 'text-ink-3'}>{n}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Index + preview ────────────────────────────────────────────────
            A card grid gave six workflow canvases a 150px thumbnail each, which
            is the one economy this section cannot make: the canvas is the
            evidence. An index trades those thumbnails for a single large
            preview, and reads as a catalogue of work rather than a shop shelf.

            Below `lg` there is no room for a side-by-side, so each row carries
            its own canvas and the whole thing degrades to a plain stack. */}
        <div
          ref={ref}
          className='mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]'
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)'
          }}
        >
          <ol className='border-rule border-t'>
            {shown.map((cs, i) => {
              const isActive = cs.slug === active?.slug

              // `onFocus` drives the preview as well as `onMouseEnter`, so a
              // keyboard reader tabbing the index sees the same canvas change.
              // Kept above the element rather than between the attributes:
              // prettier strips the blank line that @stylistic/lines-around-
              // comment then demands, and neither formatter can win in place.
              return (
                <li key={cs.slug} className='border-rule border-b'>
                  <button
                    type='button'
                    onClick={() => setSelectedStudy(cs)}
                    onMouseEnter={() => setActiveSlug(cs.slug)}
                    onFocus={() => setActiveSlug(cs.slug)}
                    aria-current={isActive ? 'true' : undefined}
                    className='group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-6 text-left lg:py-7'
                  >
                    <span
                      className={`text-fine font-mono transition-colors duration-300 ${isActive ? 'text-accent' : 'text-ink-3'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className='min-w-0'>
                      <span
                        className={`display-md block text-[1.2rem] leading-snug font-light transition-colors duration-300 lg:text-[1.45rem] ${
                          isActive ? 'text-ink' : 'text-ink-2 group-hover:text-ink'
                        }`}
                        style={{ fontFamily: DISPLAY_FONT }}
                      >
                        {cs.title}
                      </span>

                      <span className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
                        {cs.platform && (
                          <span className='text-meta text-ink-3 font-mono tracking-[0.14em] uppercase'>
                            {cs.platform}
                          </span>
                        )}
                        {cs.speed && (
                          <span className='text-meta text-accent inline-flex items-center gap-1.5 font-mono'>
                            <Ico d={cs.speedKind === 'throughput' ? P.stack : P.bolt} size={11} />
                            {cs.speed}
                          </span>
                        )}
                        {cs.sample && <span className='badge badge-accent'>SAMPLE</span>}
                      </span>

                      {/* Below lg the preview panel is gone, so the row carries
                          its own canvas and copy. */}
                      <span className='mt-5 block lg:hidden'>
                        <Canvas cs={cs} />
                        <span className='text-fine text-ink-2 mt-4 block'>{cs.description}</span>
                      </span>
                    </span>

                    <span
                      className={`transition-[color,transform] duration-300 group-hover:translate-x-1 ${
                        isActive ? 'text-accent' : 'text-ink-3'
                      }`}
                    >
                      <Ico d={P.arrow} size={16} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {/* Preview panel, sticky so the canvas stays with the reader as they
              work down the index. */}
          <aside className='hidden lg:block'>
            {active && (
              <div className='sticky top-28'>
                <Canvas cs={active} priority />

                <div className='mt-6'>
                  <h3
                    className='display-md text-ink text-[1.6rem] leading-snug font-light'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {active.title}
                  </h3>
                  <p className='text-body text-ink-2 mt-3 max-w-[56ch]'>{active.description}</p>

                  <div className='mt-5 flex flex-wrap gap-1.5'>
                    {active.tools?.map(t => (
                      <span
                        key={t}
                        className='border-rule bg-ink/2 text-meta text-ink-3 rounded-md border px-2.5 py-1 font-mono'
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className='border-rule mt-7 flex flex-wrap items-center gap-2.5 border-t pt-6'>
                    <button
                      type='button'
                      onClick={() => setSelectedStudy(active)}
                      className='bg-ink text-meta text-ground hover:bg-ink/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono tracking-wide transition-[background-color,transform] duration-300 active:scale-[0.98] motion-reduce:active:scale-100'
                    >
                      Read case study
                      <Ico d={P.arrow} size={13} />
                    </button>
                    <AuxLinks cs={active} />
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {shown.length === 0 && (
          <p className='text-fine text-ink-3 py-16 text-center'>Nothing built on this platform yet.</p>
        )}
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
