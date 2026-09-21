'use client'

import { useMemo, useState, type CSSProperties } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { SectionIntro } from '@/components/landing/section-intro'
import { CONTAINER, DISPLAY_FONT, SECTION_ANCHOR, useInView } from '@/components/landing/motion'
import { CaseStudyModal } from '@/components/landing/case-study-modal'

const WORK_LABELS: Record<string, string> = {
  'ai-voice-receptionist': '24/7 call answering',
  'invoice-processing-gl-reconciliation': 'Invoice processing',
  'lead-routing-and-crm-enrichment': 'Lead capture & follow-up',
  'multi-channel-order-sync': 'Orders & inventory',
  'rag-knowledge-base': 'Company knowledge search',
  'zero-touch-client-onboarding': 'Client onboarding'
}

/**
 * Each project's accent, used for the eyebrow labels inside the panel. Hues are
 * unchanged from the original set; lightness is solved so every tone clears
 * 4.5:1 on the white panel at 12px. The previous values ran 3.2–4.1:1, so the
 * THE CHALLENGE / THE SYSTEM labels failed AA on all six projects, not just
 * some. Chroma is trimmed only where the darker lightness pushed a hue out of
 * sRGB gamut.
 */
const WORK_TONES: Record<string, string> = {
  'ai-voice-receptionist': 'oklch(0.571 0.13 326)',
  'invoice-processing-gl-reconciliation': 'oklch(0.572 0.14 24)',
  'lead-routing-and-crm-enrichment': 'oklch(0.562 0.12 68)',
  'multi-channel-order-sync': 'oklch(0.542 0.11 158)',
  'rag-knowledge-base': 'oklch(0.562 0.13 274)',
  'zero-touch-client-onboarding': 'oklch(0.538 0.095 218)'
}

const WORK_USE_CASES: Record<string, string> = {
  'ai-voice-receptionist': 'Answer incoming calls, qualify callers and book confirmed appointments at any hour.',
  'invoice-processing-gl-reconciliation':
    'Read incoming invoices, check them against purchase orders and prepare entries for approval.',
  'lead-routing-and-crm-enrichment':
    'Capture every new lead, add the missing details, assign the right owner and alert sales immediately.',
  'multi-channel-order-sync': 'Keep orders and stock aligned across Shopify, Amazon and wholesale channels.',
  'rag-knowledge-base': 'Turn company files into a searchable assistant that answers with links to the source.',
  'zero-touch-client-onboarding':
    'Create agreements, folders, CRM records and team alerts as soon as a client submits a form.'
}

const WORK_SCENES: Record<string, string> = {
  'ai-voice-receptionist': '/images/landing/work-scenes/ai-voice-receptionist.webp',
  'invoice-processing-gl-reconciliation': '/images/landing/work-scenes/invoice-processing-gl-reconciliation.webp',
  'lead-routing-and-crm-enrichment': '/images/landing/work-scenes/lead-routing-and-crm-enrichment.webp',
  'multi-channel-order-sync': '/images/landing/work-scenes/multi-channel-order-sync.webp',
  'rag-knowledge-base': '/images/landing/work-scenes/rag-knowledge-base.webp',
  'zero-touch-client-onboarding': '/images/landing/work-scenes/zero-touch-client-onboarding.webp'
}

const workLabel = (cs: CaseStudyMetadata) => WORK_LABELS[cs.slug] ?? cs.title

const workStatus = (cs: CaseStudyMetadata) =>
  cs.sample ? { label: 'Architecture lab', short: 'Lab' } : { label: 'Detailed case study', short: 'Case study' }

const workTags = (cs: CaseStudyMetadata) => {
  const platform = cs.platform?.trim()
  const tools = cs.integrations?.length ? cs.integrations : (cs.tools ?? [])

  return {
    platform,
    tools: tools.filter((tool, index) => {
      const normalized = tool.toLowerCase()

      return (
        normalized !== platform?.toLowerCase() && tools.findIndex(item => item.toLowerCase() === normalized) === index
      )
    })
  }
}

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

const has = (u?: string) => typeof u === 'string' && u.trim().length > 0

function AuxLinks({ cs }: { cs: CaseStudyMetadata }) {
  const base = 'work-cinema-action'

  if (!has(cs.videoUrl) && !has(cs.repoUrl)) return null

  return (
    <>
      {has(cs.videoUrl) && (
        <a href={cs.videoUrl} target='_blank' rel='noopener noreferrer' className={base}>
          <VideoIcon size={12} />
          Live walkthrough
        </a>
      )}
      {has(cs.repoUrl) && (
        <a href={cs.repoUrl} target='_blank' rel='noopener noreferrer' className={base}>
          <GitHubIcon size={12} />
          View GitHub
        </a>
      )}
    </>
  )
}

/** The workflow canvas, framed as evidence rather than a decorative thumbnail. */
function Canvas({ cs, priority = false }: { cs: CaseStudyMetadata; priority?: boolean }) {
  if (!cs.workflowImage) return null

  return (
    <div className='work-story-canvas relative overflow-hidden'>
      <div className='work-story-canvas-head'>
        <span>System map</span>
        <span>{cs.stepCount ?? 4} stages</span>
      </div>
      {/* Keyed on the slug so React swaps the element rather than mutating src
          — without it the browser paints the previous canvas until the new one
          decodes, and the panel appears to lag a row behind the cursor. */}
      <div className='work-story-canvas-body'>
        <img
          key={cs.slug}
          src={cs.workflowImage}
          width={1400}
          height={900}
          loading={priority ? 'eager' : 'lazy'}
          alt={`Workflow canvas for ${cs.title}`}
          className='relative z-1 h-full w-full object-contain'
        />
      </div>
    </div>
  )
}

const PANEL_ID = 'work-detail-panel'

/**
 * Three views per project — and deliberately three *kinds* of view rather than
 * three screenshots: where the work happened, what the client actually touches,
 * and the canvas that proves it was built. The labels carry that distinction,
 * so a reader knows what the third thumbnail holds before opening it.
 *
 * Every project has all three on disk today. `filter` is there for the day one
 * is missing, not as a hedge against them never existing.
 */
function workViews(cs: CaseStudyMetadata) {
  const platform = cs.platform ?? 'Workflow'

  // Canvas first, and therefore the default view. The scene photographs are
  // atmosphere — a tidy desk proves nothing a stock library could not. The
  // canvas is the only one of the three a competitor cannot reproduce.
  return [
    {
      key: 'canvas',
      label: `${platform} canvas`,
      src: cs.workflowImage,
      alt: `${platform} workflow canvas for ${cs.title ?? cs.slug}`
    },
    {
      key: 'interface',
      label: 'Interface',
      src: cs.heroImage ?? cs.image,
      alt: `Interface mockup for ${cs.title ?? cs.slug}`
    },
    {
      key: 'scene',
      label: 'Scene',
      src: WORK_SCENES[cs.slug],
      alt: `Working environment for ${cs.title ?? cs.slug}`
    }
  ].filter(view => has(view.src))
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.06)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyMetadata | null>(null)

  /**
   * Which thumbnail each card is showing. One record rather than six pieces of
   * state, so a card that has never been touched simply has no entry and falls
   * back to its first view.
   */
  const [views, setViews] = useState<Record<string, number>>({})

  /** `null` is "all platforms" rather than a sentinel string. */
  const [platform, setPlatform] = useState<CaseStudyMetadata['platform'] | null>(null)

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
    () => [...caseStudies].sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample))),
    [caseStudies]
  )

  /**
   * Counts come from the data rather than a hand-kept list, so a new case study
   * appears in the filter the moment its MDX lands. Order follows the count, so
   * the platform with the most work leads.
   */
  const platforms = shown.reduce<{ name: NonNullable<CaseStudyMetadata['platform']>; count: number }[]>((all, cs) => {
    if (!cs.platform) return all

    const seen = all.find(entry => entry.name === cs.platform)

    return seen
      ? all.map(e => (e === seen ? { ...e, count: e.count + 1 } : e))
      : [...all, { name: cs.platform, count: 1 }]
  }, [])

  const visible = platform ? shown.filter(cs => cs.platform === platform) : shown

  /**
   * The panel always has something to show, and what it shows is always in the
   * grid above it — picking a filter that excludes the open project moves the
   * panel to the first project that survived rather than stranding it.
   */
  const active = visible.find(cs => cs.slug === activeSlug) ?? visible.find(cs => cs.featured) ?? visible[0]

  const sceneStyle = {
    '--work-tone': WORK_TONES[active?.slug ?? ''] ?? 'var(--accent)'
  } as CSSProperties

  const activeTags = active ? workTags(active) : null

  return (
    <section id='portfolio' className={`${SECTION_ANCHOR} work-story-section`}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='SELECTED WORK'
          margin=''
          titleClassName='display-xl mt-2 max-w-[15ch] text-[clamp(2.55rem,5vw,4.8rem)]'
          title='Business problems, designed as systems.'
          blurb='Each one starts with what a team was doing by hand, and ends with what runs instead. Pick a project to see both.'
        />

        <div className='work-proof-strip' aria-label='Portfolio design principles'>
          <span>
            <b>01</b> Business case first
          </span>
          <span>
            <b>02</b> Failure paths mapped
          </span>
          <span>
            <b>03</b> Human control retained
          </span>
        </div>

        {platforms.length > 1 && (
          <div className='work-filters' role='group' aria-label='Filter projects by automation platform'>
            <button
              type='button'
              className='work-filter'
              aria-pressed={platform === null}
              onClick={() => setPlatform(null)}
            >
              All <b>{shown.length}</b>
            </button>
            {platforms.map(entry => (
              <button
                key={entry.name}
                type='button'
                className='work-filter'
                aria-pressed={platform === entry.name}
                onClick={() => setPlatform(entry.name)}
              >
                {entry.name} <b>{entry.count}</b>
              </button>
            ))}
          </div>
        )}

        {/* Six cards, all six visible. The previous rail showed one project at a
            time and had to abbreviate every title to fit 84px — "Autonomous RAG
            Knowledge Base & Document Intelligence System" became "Company
            knowledge search". A card has room for the name a client would
            recognise. */}
        <ul ref={ref} className='work-gallery' style={{ opacity: inView ? 1 : 0 }}>
          {visible.map((cs, index) => {
            const gallery = workViews(cs)
            const viewIndex = Math.min(views[cs.slug] ?? 0, gallery.length - 1)
            const view = gallery[viewIndex]
            const outcome = cs.keyOutcome
            const isActive = cs.slug === active?.slug
            const tags = workTags(cs)

            return (
              <li
                key={cs.slug}
                className='work-card'
                data-active={isActive ? 'true' : 'false'}
                style={
                  {
                    '--work-tone': WORK_TONES[cs.slug] ?? 'var(--accent)',
                    transform: inView ? 'none' : 'translateY(24px)',
                    transition: `opacity .8s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms, transform .8s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms`,
                    opacity: inView ? 1 : 0
                  } as CSSProperties
                }
              >
                <div className='work-card-frame'>
                  {view && (
                    <img
                      key={`${cs.slug}-${view.key}`}
                      src={view.src}
                      alt={view.alt}
                      width={1400}
                      height={875}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      className='work-card-image'
                    />
                  )}
                  {/* Only the exception is marked. "Case study" is the default
                      and printing it four times told the reader nothing. */}
                  {cs.sample && <span className='work-card-flag'>Architecture lab</span>}
                </div>

                {gallery.length > 1 && (
                  <div className='work-card-views' role='group' aria-label={`Views of ${cs.title ?? cs.slug}`}>
                    {gallery.map((item, itemIndex) => (
                      <button
                        key={item.key}
                        type='button'
                        className='work-card-view'
                        aria-pressed={itemIndex === viewIndex}
                        onClick={() => setViews(current => ({ ...current, [cs.slug]: itemIndex }))}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className='work-card-body'>
                  <p className='work-card-context'>
                    <span className='work-card-index'>{String(index + 1).padStart(2, '0')}</span>
                    {cs.organisation ?? workLabel(cs)}
                  </p>

                  {/* The stretched hit area lives on this button, so the whole
                      card selects while the view buttons above stay clickable
                      on their own — no nesting, one real control per action. */}
                  <h3 className='work-card-title'>
                    <button
                      type='button'
                      className='work-card-select'
                      aria-expanded={isActive}
                      aria-controls={PANEL_ID}
                      onClick={() => setActiveSlug(cs.slug)}
                    >
                      {cs.title ?? workLabel(cs)}
                    </button>
                  </h3>

                  {outcome && (
                    <p className='work-card-outcome'>
                      <strong style={{ fontFamily: DISPLAY_FONT }}>{outcome.value}</strong>
                      <span>{outcome.label}</span>
                      <em>{cs.sample ? 'target outcome' : 'measured'}</em>
                    </p>
                  )}

                  <p className='work-card-summary'>{WORK_USE_CASES[cs.slug] ?? cs.description}</p>

                  <p className='work-card-stack'>
                    {[tags.platform, ...tags.tools.slice(0, 2)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {/* The written argument stays on the page rather than behind a modal:
            THEN/NOW is the whole thesis of this portfolio, and a reader who
            never clicks through should still meet it. */}
        <div className='work-detail' id={PANEL_ID} style={sceneStyle} aria-live='polite'>
          {active && (
            <AnimatePresence mode='wait' initial={false}>
              <motion.article
                key={active.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className='work-detail-head'>
                  <span className='work-detail-context'>{active.organisation ?? workLabel(active)}</span>
                  <span className='work-detail-status'>{workStatus(active).label}</span>
                </div>

                {/* Full width and unobstructed. This is the one asset a reader
                    cannot get from a competitor's portfolio, and it spent the
                    last revision cropped behind a desk photo. */}
                <Canvas cs={active} priority />

                <div className='work-cinema-story'>
                  <div className='work-cinema-story-main'>
                    <div className='work-claim'>
                      <h3 style={{ fontFamily: DISPLAY_FONT }}>{active.impactHighlight ?? active.title}</h3>
                      {active.keyOutcome && (
                        <p className='work-claim-figure'>
                          <strong style={{ fontFamily: DISPLAY_FONT }}>{active.keyOutcome.value}</strong>
                          <span>{active.keyOutcome.label}</span>
                          <em>{active.sample ? 'target outcome' : 'measured'}</em>
                        </p>
                      )}
                    </div>

                    {/* The two halves are the same pair of facts the section
                        always carried, but weighted: THEN recedes, NOW holds
                        full ink, so the reader watches the change rather than
                        reading two columns. */}
                    <div className='work-shift'>
                      <div className='work-shift-half work-shift-then'>
                        <small>THEN</small>
                        <p>{active.problem ?? WORK_USE_CASES[active.slug] ?? active.description}</p>
                      </div>

                      <span className='work-shift-hinge' aria-hidden='true' />

                      <div className='work-shift-half work-shift-now'>
                        <small>NOW</small>
                        <p>{active.solution ?? WORK_USE_CASES[active.slug] ?? active.description}</p>
                      </div>
                    </div>

                    <div className='work-cinema-tech' aria-label='Platform, tools and AI models used'>
                      <small>BUILT WITH</small>
                      <div>
                        {activeTags?.platform && (
                          <span className='work-cinema-tech-platform'>PLATFORM · {activeTags.platform}</span>
                        )}
                        {activeTags?.tools.map(tool => (
                          <span key={tool}>{tool}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='work-cinema-result'>
                    {active.roi && active.roi.length > 1 && (
                      <div className='work-story-secondary-metrics'>
                        {active.roi.slice(1, 3).map(metric => (
                          <span key={metric.label}>
                            <b>{metric.value}</b>
                            <small>{metric.label}</small>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className='flex flex-wrap items-center gap-2.5'>
                      <button type='button' onClick={() => setSelectedStudy(active)} className='work-story-cta'>
                        Explore case study <Ico d={P.arrow} size={14} />
                      </button>
                      <AuxLinks cs={active} />
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          )}
        </div>

        {visible.length === 0 && (
          <p className='text-fine text-ink-3 py-16 text-center'>Nothing built on this platform yet.</p>
        )}
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
