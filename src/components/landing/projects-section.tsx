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

const WORK_TONES: Record<string, string> = {
  'ai-voice-receptionist': 'oklch(0.63 0.13 326)',
  'invoice-processing-gl-reconciliation': 'oklch(0.62 0.14 24)',
  'lead-routing-and-crm-enrichment': 'oklch(0.66 0.14 68)',
  'multi-channel-order-sync': 'oklch(0.61 0.11 158)',
  'rag-knowledge-base': 'oklch(0.6 0.13 274)',
  'zero-touch-client-onboarding': 'oklch(0.62 0.12 218)'
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

  return (
    <>
      {has(cs.videoUrl) ? (
        <a href={cs.videoUrl} target='_blank' rel='noopener noreferrer' className={base}>
          <VideoIcon size={12} />
          Live walkthrough
        </a>
      ) : (
        <span className={`${base} is-disabled`} title='Walkthrough coming soon' aria-disabled='true'>
          <VideoIcon size={12} />
          Live walkthrough
        </span>
      )}
      {has(cs.repoUrl) ? (
        <a href={cs.repoUrl} target='_blank' rel='noopener noreferrer' className={base}>
          <GitHubIcon size={12} />
          View GitHub
        </a>
      ) : (
        <span className={`${base} is-disabled`} title='GitHub project coming soon' aria-disabled='true'>
          <GitHubIcon size={12} />
          View GitHub
        </span>
      )}
    </>
  )
}

/** The workflow canvas, framed as evidence rather than a decorative thumbnail. */
function Canvas({ cs, priority = false }: { cs: CaseStudyMetadata; priority?: boolean }) {
  if (!cs.workflowImage) return null

  return (
    <div className='work-story-canvas relative overflow-hidden'>
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
        className='relative z-1 h-full w-full object-contain'
      />
    </div>
  )
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView(0.06)
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
    () => [...caseStudies].sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample))),
    [caseStudies]
  )

  /**
   * The panel always has something to show, so the section reads correctly at
   * rest rather than waiting for a hover.
   *
   * The featured project opens first; after that the left selector owns the
   * scene without needing an effect or an extra render.
   */
  const active = shown.find(cs => cs.slug === activeSlug) ?? shown.find(cs => cs.featured) ?? shown[0]

  const activeIndex = Math.max(
    0,
    shown.findIndex(cs => cs.slug === active?.slug)
  )

  const sceneStyle = {
    '--work-tone': WORK_TONES[active?.slug ?? ''] ?? 'var(--accent)'
  } as CSSProperties

  return (
    <section id='portfolio' className={`${SECTION_ANCHOR} work-story-section`}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='SELECTED WORK'
          margin=''
          titleClassName='display-xl mt-2 max-w-[15ch] text-[clamp(2.55rem,5vw,4.8rem)]'
          title='Work that gives time back.'
          blurb='Select a project to see what changed—and what the team no longer has to do by hand.'
        />

        <div
          ref={ref}
          className='work-cinema mt-10 grid lg:grid-cols-[19rem_minmax(0,1fr)]'
          style={{ ...sceneStyle, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)' }}
        >
          <aside className='work-cinema-selector'>
            <div className='work-cinema-selector-head'>
              <span>PROJECTS</span>
              <span>{String(shown.length).padStart(2, '0')}</span>
            </div>
            <ol role='tablist' aria-label='Choose a case study'>
              {shown.map((cs, i) => {
                const isActive = cs.slug === active?.slug

                return (
                  <li key={cs.slug}>
                    <button
                      type='button'
                      role='tab'
                      aria-selected={isActive}
                      onClick={() => setActiveSlug(cs.slug)}
                      onFocus={() => setActiveSlug(cs.slug)}
                      className='work-cinema-project group'
                    >
                      <span className='work-cinema-project-number'>{String(i + 1).padStart(2, '0')}</span>
                      <span className='work-cinema-project-copy'>
                        <strong>{workLabel(cs)}</strong>
                        <small>
                          {cs.keyOutcome?.value ?? cs.speed} {cs.keyOutcome?.label ?? 'RESULT'}
                        </small>
                      </span>
                      <span className='work-cinema-project-arrow'>
                        <Ico d={P.arrow} size={13} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <p className='work-cinema-selector-foot'>Select a project to change the scene.</p>
          </aside>

          <div className='work-cinema-screen'>
            {active && (
              <AnimatePresence mode='wait' initial={false}>
                <motion.article
                  key={active.slug}
                  initial={{ opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className='work-cinema-scene'
                >
                  <div className='work-cinema-art'>
                    <img
                      src={WORK_SCENES[active.slug]}
                      alt=''
                      aria-hidden='true'
                      width={1400}
                      height={875}
                      className='work-cinema-scene-image'
                    />
                    <span className='work-cinema-count'>{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className='work-cinema-context-label'>Illustrative business context</span>
                    <div className='work-story-status'>
                      <span className='work-story-status-dot' />
                      System running
                    </div>
                    <Canvas cs={active} priority />
                    <div className='work-story-flowline' aria-hidden='true'>
                      <span>WORK ARRIVES</span>
                      <i />
                      <span>RUNS AUTOMATICALLY</span>
                      <i />
                      <span>TEAM NOTIFIED</span>
                    </div>
                  </div>

                  <div className='work-cinema-story'>
                    <div className='work-cinema-story-main'>
                      <p>{active.organisation ?? workLabel(active)}</p>
                      <h3 style={{ fontFamily: DISPLAY_FONT }}>{active.impactHighlight ?? active.title}</h3>
                      <div className='work-cinema-use-case'>
                        <small>USE CASE</small>
                        <span>{WORK_USE_CASES[active.slug] ?? active.description}</span>
                      </div>
                    </div>

                    <div className='work-cinema-result'>
                      {active.keyOutcome && (
                        <div className='work-story-outcome'>
                          <strong>{active.keyOutcome.value}</strong>
                          <span>{active.keyOutcome.label}</span>
                        </div>
                      )}
                      <div className='flex flex-wrap items-center gap-2.5'>
                        <button type='button' onClick={() => setSelectedStudy(active)} className='work-story-cta'>
                          Read case study <Ico d={P.arrow} size={14} />
                        </button>
                        <AuxLinks cs={active} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            )}
          </div>
        </div>

        {shown.length === 0 && (
          <p className='text-fine text-ink-3 py-16 text-center'>Nothing built on this platform yet.</p>
        )}
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
