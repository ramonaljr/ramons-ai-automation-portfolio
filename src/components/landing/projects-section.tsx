'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { animate, motion, useInView as useMotionInView, useMotionValue, useTransform } from 'motion/react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { SectionIntro } from '@/components/landing/section-intro'
import {
  CONTAINER,
  countupSpring,
  DISPLAY_FONT,
  SECTION_ANCHOR,
  snappySpring,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { CaseStudyModal } from '@/components/landing/case-study-modal'
import { WorkCanvas } from '@/components/landing/work-canvas'
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

/**
 * An outcome figure that counts up when it comes into view.
 *
 * Only plain quantities count — "100%", "92%", "4,000+", "0". A value like
 * "24/7" is a phrase, not a number, and counting to 24 before a slash would
 * read as a glitch, so anything else renders as written. Driven through a
 * motion value, so the count never re-renders React; the `countup` spring is
 * overdamped, so it settles without overshooting its own target.
 */
function OutcomeFigure({ value, reduced }: { value: string; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const seen = useMotionInView(ref, { once: true, amount: 0.8 })
  const match = /^(\d[\d,]*(?:\.\d+)?)([%+]?)$/.exec(value)
  const countable = Boolean(match) && !reduced
  const digits = match?.[1] ?? '0'
  const suffix = match?.[2] ?? ''
  const target = Number(digits.replace(/,/g, ''))
  const decimals = digits.split('.')[1]?.length ?? 0
  const grouped = digits.includes(',')
  const count = useMotionValue(0)

  const text = useTransform(
    count,
    latest =>
      `${latest.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped
      })}${suffix}`
  )

  useEffect(() => {
    if (!countable || !seen) return

    const controls = animate(count, target, { type: 'spring', ...countupSpring })

    return () => controls.stop()
  }, [countable, seen, count, target])

  if (!countable) {
    return <strong style={{ fontFamily: DISPLAY_FONT }}>{value}</strong>
  }

  return (
    <motion.strong ref={ref} style={{ fontFamily: DISPLAY_FONT }}>
      {text}
    </motion.strong>
  )
}

/** Moves the card's spotlight to the pointer. Written straight to the style so no frame re-renders. */
function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget
  const box = card.getBoundingClientRect()

  card.style.setProperty('--mx', `${event.clientX - box.left}px`)
  card.style.setProperty('--my', `${event.clientY - box.top}px`)
}

type WorkCardProps = {
  cs: CaseStudyMetadata
  index: number

  /** The grid's own entrance, shared so the cards deal in sequence. */
  dealt: boolean
  reduced: boolean
  allLabs: boolean
  viewIndex: number
  onView: (index: number) => void
  onOpen: () => void
}

function WorkCard({ cs, index, dealt, reduced, allLabs, viewIndex, onView, onOpen }: WorkCardProps) {
  // The card's own sighting, separate from the grid's: the canvas should run
  // when this card is actually on screen, not when the first row arrives.
  const { ref, inView: seen } = useInView<HTMLLIElement>(0.3)

  // Each hover plays the run again. Starts at 0 and is offset below, so the
  // first positive value the canvas sees is the entrance run.
  const [replays, setReplays] = useState(0)

  const gallery = workViews(cs)
  const view = gallery[Math.min(viewIndex, gallery.length - 1)]
  const outcome = cs.keyOutcome
  const tags = workTags(cs)
  const tone = WORK_TONES[cs.slug] ?? 'var(--accent)'
  const delay = index * 0.11

  return (
    <motion.li
      ref={ref}
      className='work-card'
      style={{ '--work-tone': tone } as CSSProperties}
      initial={{ opacity: 0, y: 44, scale: 0.94 }}
      animate={dealt ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 44, scale: 0.94 }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? undefined : { y: -6, transition: snappySpring }}
      onPointerMove={trackSpotlight}
      onPointerEnter={event => {
        // Touch has no hover, and a tap is already opening the dialog.
        if (event.pointerType === 'mouse' && seen) setReplays(count => count + 1)
      }}
    >
      {/* The frame wipes open from the base, a beat after the card lands, so
          the canvas is revealed rather than simply present. */}
      <motion.div
        className='work-card-frame'
        data-view={view?.key}
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={dealt ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(100% 0% 0% 0%)' }}
        transition={reduced ? { duration: 0 } : { duration: 0.9, delay: delay + 0.18, ease: [0.76, 0, 0.24, 1] }}
      >
        {view?.key === 'canvas' ? (
          <WorkCanvas
            src={view.src}
            label={view.alt}
            idSuffix={`${cs.slug}-card`}
            run={seen ? replays + 1 : 0}
            reduced={reduced}
            lead={delay + 0.55}
          />
        ) : (
          view && (
            <img
              key={`${cs.slug}-${view.key}`}
              src={view.src}
              alt={view.alt}
              width={1400}
              height={875}
              loading={index < 2 ? 'eager' : 'lazy'}
              className='work-card-image'
            />
          )
        )}
        {/* Only the exception is marked. A badge repeated on every card is
            decoration, not information. */}
        {cs.sample && !allLabs && <span className='work-card-flag'>Architecture lab</span>}
      </motion.div>

      {gallery.length > 1 && (
        <div className='work-card-views' role='group' aria-label={`Views of ${cs.title ?? cs.slug}`}>
          {gallery.map((item, itemIndex) => (
            <motion.button
              key={item.key}
              type='button'
              className='work-card-view'
              data-view={item.key}
              aria-pressed={itemIndex === viewIndex}
              aria-label={`Show ${item.label}`}
              initial={false}
              animate={itemIndex === viewIndex ? 'active' : 'inactive'}
              variants={THUMB_VARIANTS}
              transition={thumbTransition(reduced)}
              onClick={() => onView(itemIndex)}
            >
              {/* The thumbnail is the label. A diagram, a UI mockup and a
                  photograph are told apart at a glance, so the name only needs
                  to exist for screen readers. */}
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

        {/* The stretched hit area lives on this button, so the whole card
            selects while the view buttons above stay clickable on their own —
            no nesting, one real control per action. */}
        <h3 className='work-card-title'>
          <button type='button' className='work-card-select' aria-haspopup='dialog' onClick={onOpen}>
            {cs.title ?? workLabel(cs)}
          </button>
        </h3>

        {outcome && (
          <p className='work-card-outcome'>
            <OutcomeFigure value={outcome.value} reduced={reduced} />
            <span>{outcome.label}</span>
            <em>{cs.sample ? 'target outcome' : 'measured'}</em>
          </p>
        )}

        <p className='work-card-summary'>{WORK_USE_CASES[cs.slug] ?? cs.description}</p>

        <p className='work-card-stack'>{[tags.platform, ...tags.tools.slice(0, 2)].filter(Boolean).join(' · ')}</p>

        {/* Above the card's stretched hit area, like the thumbnails, so a
            walkthrough opens instead of the dialog. Inert until the
            frontmatter carries a URL. */}
        <div className='work-card-links'>
          <WorkLink href={linkOf(cs.videoUrl)} label='Walkthrough' icon={<VideoIcon size={12} />} />
          <WorkLink href={linkOf(cs.repoUrl)} label='GitHub' icon={<GitHubIcon size={12} />} />
          {/* Opens the dialog, which is where the case study is read. Going
              straight to /case-study from here would duplicate the dialog's
              own "Read full case study" and skip the canvas, the views and the
              metrics on the way. */}
          <WorkLink label='Read case study' icon={<Ico d={P.arrow} size={12} />} onClick={onOpen} />
        </div>
      </div>
    </motion.li>
  )
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

        {/* Filters and the lab statement share one row: stacked, they spent a
            screen-height of intro before the first card appeared. */}
        <div className='work-toolbar'>
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
        </div>

        {/* Six cards, all six visible and all the same size, each canvas
            running its own workflow as it arrives and again on hover. */}
        <ul ref={ref} className='work-gallery'>
          {visible.map((cs, index) => (
            <WorkCard
              key={cs.slug}
              cs={cs}
              index={index}
              dealt={inView}
              reduced={reduced}
              allLabs={allLabs}
              viewIndex={views[cs.slug] ?? 0}
              onView={itemIndex => setViews(current => ({ ...current, [cs.slug]: itemIndex }))}
              onOpen={() => setSelectedStudy(cs)}
            />
          ))}
        </ul>

        {visible.length === 0 && (
          <p className='text-fine text-ink-3 py-16 text-center'>Nothing built on this platform yet.</p>
        )}
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
