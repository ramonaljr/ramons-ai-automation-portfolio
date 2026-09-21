'use client'

import { useMemo, useState, type CSSProperties } from 'react'

import { motion } from 'motion/react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { SectionIntro } from '@/components/landing/section-intro'
import {
  CONTAINER,
  DISPLAY_FONT,
  SECTION_ANCHOR,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { CaseStudyModal } from '@/components/landing/case-study-modal'
import { THUMB_VARIANTS, thumbTransition, WORK_TONES, workViews } from '@/lib/work-views'
import { GitHubIcon, Ico, linkOf, P, VideoIcon, WorkLink } from '@/components/landing/work-icons'

const WORK_LABELS: Record<string, string> = {
  'ai-voice-receptionist': '24/7 call answering',
  'invoice-processing-gl-reconciliation': 'Invoice processing',
  'lead-routing-and-crm-enrichment': 'Lead capture & follow-up',
  'multi-channel-order-sync': 'Orders & inventory',
  'rag-knowledge-base': 'Company knowledge search',
  'zero-touch-client-onboarding': 'Client onboarding'
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

const workLabel = (cs: CaseStudyMetadata) => WORK_LABELS[cs.slug] ?? cs.title

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

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.06)
  const reduced = usePrefersReducedMotion()
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
   * Delivered work leads; labs sort to the back.
   *
   * `getCaseStudies` orders by `publishedAt`, which put illustrative builds
   * first simply because they carried the latest dates. Every project is
   * currently a lab, so this is a no-op today — it earns its place the moment
   * the first delivered engagement lands. The sort is stable, so within each
   * group the date order is preserved.
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
   * A per-card badge only means something when it separates one card from
   * another. When every visible project is a lab it is six repetitions of the
   * same word, so the qualification moves up to the section and is stated once,
   * plainly. Flip any project to `sample: false` and the per-card flags return
   * on their own.
   */
  const allLabs = visible.length > 0 && visible.every(cs => cs.sample)

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

        {allLabs && (
          <p className='work-lab-note'>
            Every system below is an architecture lab — designed, built and run end to end, with the figures stated as
            target outcomes rather than measured client results.
          </p>
        )}

        {/* Six cards, all six visible. The previous rail showed one project at a
            time and had to abbreviate every title to fit 84px — "Autonomous RAG
            Knowledge Base & Document Intelligence System" became "Company
            knowledge search". A card has room for the name a client would
            recognise. */}
        <ul ref={ref} className='work-gallery'>
          {visible.map((cs, index) => {
            const gallery = workViews(cs)
            const viewIndex = Math.min(views[cs.slug] ?? 0, gallery.length - 1)
            const view = gallery[viewIndex]
            const outcome = cs.keyOutcome
            const tags = workTags(cs)

            /**
             * A cascade you can actually see: each card lifts 44px, comes out
             * of a slight recede and fades in, 110ms behind the one before it,
             * so six cards read as a hand being dealt rather than a block
             * appearing. `style` carries only the tone token — motion owns
             * transform and opacity, and the two must not both drive them.
             */
            return (
              <motion.li
                key={cs.slug}
                className='work-card'
                style={{ '--work-tone': WORK_TONES[cs.slug] ?? 'var(--accent)' } as CSSProperties}
                initial={{ opacity: 0, y: 44, scale: 0.94 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 44, scale: 0.94 }}
                transition={reduced ? { duration: 0 } : { duration: 0.8, delay: index * 0.11, ease: [0.16, 1, 0.3, 1] }}
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
                  {/* Only the exception is marked. A badge repeated on every
                      card is decoration, not information. */}
                  {cs.sample && !allLabs && <span className='work-card-flag'>Architecture lab</span>}
                </div>

                {gallery.length > 1 && (
                  <div className='work-card-views' role='group' aria-label={`Views of ${cs.title ?? cs.slug}`}>
                    {gallery.map((item, itemIndex) => (
                      <motion.button
                        key={item.key}
                        type='button'
                        className='work-card-view'
                        aria-pressed={itemIndex === viewIndex}
                        aria-label={`Show ${item.label}`}
                        initial={false}
                        animate={itemIndex === viewIndex ? 'active' : 'inactive'}
                        variants={THUMB_VARIANTS}
                        transition={thumbTransition(reduced)}
                        onClick={() => setViews(current => ({ ...current, [cs.slug]: itemIndex }))}
                      >
                        {/* The thumbnail is the label. A diagram, a UI mockup
                            and a photograph are told apart at a glance, so the
                            name only needs to exist for screen readers. */}
                        <img src={item.src} alt='' aria-hidden='true' width={280} height={175} loading='lazy' />
                      </motion.button>
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
                      aria-haspopup='dialog'
                      onClick={() => setSelectedStudy(cs)}
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

                  {/* Above the card's stretched hit area, like the thumbnails,
                      so a walkthrough opens instead of the dialog. Inert until
                      the frontmatter carries a URL. */}
                  <div className='work-card-links'>
                    <WorkLink href={linkOf(cs.videoUrl)} label='Walkthrough' icon={<VideoIcon size={12} />} />
                    <WorkLink href={linkOf(cs.repoUrl)} label='GitHub' icon={<GitHubIcon size={12} />} />
                    {/* Always live — the case-study page exists for every
                        project, so this one never sits inert. Same page the
                        dialog's "Read full case study" opens. */}
                    <WorkLink
                      href={`/case-study/${cs.slug}`}
                      label='Read case study'
                      icon={<Ico d={P.external} size={12} />}
                      sameTab
                    />
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>

        {/* The written argument stays on the page rather than behind a modal:
            THEN/NOW is the whole thesis of this portfolio, and a reader who
            never clicks through should still meet it. */}

        {visible.length === 0 && (
          <p className='text-fine text-ink-3 py-16 text-center'>Nothing built on this platform yet.</p>
        )}
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
