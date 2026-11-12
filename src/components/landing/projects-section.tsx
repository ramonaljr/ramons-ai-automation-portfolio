'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { LayoutGrid } from 'lucide-react'
import { animate, motion, useInView as useMotionInView, useMotionValue, useTransform } from 'motion/react'

import './work-cards.css'

import { EASE_ENTRANCE, EASE_STAGE } from '@/components/landing/tokens'
import type { CaseStudyMetadata } from '@/lib/case-studies'
import { SectionIntro } from '@/components/landing/section-intro'
import {
  CONTAINER,
  countupSpring,
  DISPLAY_FONT,
  ICON_STROKE,
  SECTION_ANCHOR,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { LazyCaseStudyModal, preloadCaseStudyModal } from '@/components/landing/lazy-case-study-modal'
import { WorkCanvas } from '@/components/landing/work-canvas'
import { orderWork, WORK_TONES, workViews } from '@/lib/work-views'
import { Ico, P } from '@/components/landing/work-icons'
import { ToolMark } from '@/components/landing/tool-stack-section'
import { toolNamed } from '@/lib/portfolio'

const WORK_LABELS: Record<string, string> = {
  'hr-evaluation-assistant': 'Applicant screening',
  'order-stock-check': 'Order stock check',
  'ai-appointment-setter': 'Appointment booking',
  'ai-prospecting-apollo': 'Sales prospecting',
  'ai-invoice-processing-approval': 'Invoice approval',
  'solar-lead-scoring-follow-up': 'Lead follow-up',
  'hotel-employee-onboarding': 'Employee onboarding',
  'ai-unpaid-invoice-reminders': 'Payment reminders',
  'airtable-crm-lead-engagement': 'Client pipeline',
  'gmail-attachment-filing': 'Document filing',
  'ai-customer-support-agent': 'WhatsApp support'
}

const WORK_USE_CASES: Record<string, string> = {
  'hr-evaluation-assistant':
    'Every applicant screened against the job the moment they apply, with tailored questions, invites and interviews booked for you.',
  'order-stock-check':
    'Every new order checked against stock before it is promised: confirmed and reserved, flagged for restock, or held with the customer told why.',
  'ai-appointment-setter':
    'Callers book, move or cancel appointments with an AI voice agent at any hour, while Google Calendar and Airtable stay in step.',
  'ai-prospecting-apollo':
    'New decision-makers found, scored and researched, each with a grounded first email that waits for your approval.',
  'ai-invoice-processing-approval':
    'Every invoice matched to its PO and delivery record before anyone approves it in Slack, then posted to QuickBooks.',
  'solar-lead-scoring-follow-up':
    'Every enquiry answered in under a second, scored and assigned, and escalated if nobody follows up within 15 minutes.',
  'hotel-employee-onboarding':
    'One HR form sets up each new hire, then tasks, documents and check-ins are followed up for their first 30 days.',
  'ai-unpaid-invoice-reminders':
    'Overdue invoices chased by your own policy, every reply read, and all reminders stopped the moment a customer disputes.',
  'airtable-crm-lead-engagement':
    'Move a client card to a new stage, and its folder, follow-ups, nudges and emails happen on their own, exactly once.',
  'gmail-attachment-filing':
    'Label a client email once, and every attachment is named by AI, filed in Drive, logged, and confirmed to the sender.',
  'ai-customer-support-agent':
    'Customers answered on WhatsApp at any hour from your own policies and order records, with every refund left to a person in Slack.'
}

export const workLabel = (cs: CaseStudyMetadata) => WORK_LABELS[cs.slug] ?? cs.title

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
  onOpen: () => void
}

/**
 * One project, led by its result.
 *
 * The figure comes first and largest, because the result is what a reader is
 * weighing; the process map sits beside it as the evidence, small enough that
 * two projects share a row. The whole card is one control that opens the
 * case-study dialog, where the film, the other views, the demo run and the
 * source live. The card used to carry three of those as buttons of its own,
 * thirty buttons across ten cards, each one also inside the dialog.
 */
function WorkCard({ cs, index, dealt, reduced, allLabs, onOpen }: WorkCardProps) {
  // Hovers only count once the card has actually been on screen.
  const { ref, inView: seen } = useInView<HTMLLIElement>(0.3)

  // The map rests finished and each hover plays the run. Its first time on
  // screen it traces itself: the tiles stay put and only the connectors and
  // outlines play (WorkCanvas `trace`).
  const [replays, setReplays] = useState(0)

  const view = workViews(cs)[0]
  const outcome = cs.keyOutcome
  const tags = workTags(cs)
  const tone = WORK_TONES[cs.slug] ?? 'var(--accent)'
  const delay = index * 0.08

  return (
    <motion.li
      ref={ref}
      className='wk-card'
      style={{ '--work-tone': tone } as CSSProperties}
      initial={{ opacity: 0, y: 28 }}
      animate={dealt ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: EASE_ENTRANCE }}
      onPointerMove={trackSpotlight}
      onPointerEnter={event => {
        // Touch has no hover, and a tap is already opening the dialog.
        if (event.pointerType === 'mouse' && seen) setReplays(count => count + 1)
      }}
    >
      <div className='wk-grid'>
        <div className='wk-lead'>
          <p className='wk-context'>
            {cs.organisation ?? workLabel(cs)}
            {cs.sampleClient && <span> · Sample client</span>}
            {cs.sample && !allLabs && <span> · Demo project</span>}
          </p>

          {outcome && (
            <p className='wk-outcome'>
              <OutcomeFigure value={outcome.value} reduced={reduced} />
              <span>
                {outcome.label}
                <em>{cs.sample ? 'target outcome' : cs.sampleClient ? 'by design' : 'real build'}</em>
              </span>
            </p>
          )}
        </div>

        {/* The map wipes open from the base, a beat after the card lands. */}
        {view && (
          <motion.div
            className='wk-frame'
            data-view={view.key}
            aria-hidden='true'
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={dealt ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(100% 0% 0% 0%)' }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: delay + 0.1, ease: EASE_STAGE }}
          >
            {view.key === 'canvas' ? (
              <WorkCanvas
                src={view.cardSrc ?? view.src}
                label={view.alt}
                idSuffix={`${cs.slug}-card`}
                run={replays}
                reduced={reduced}
                rest='static'
                trace={seen}
              />
            ) : (
              <img src={view.src} alt='' width={800} height={500} loading='lazy' className='wk-image' />
            )}
          </motion.div>
        )}

        {/* The stretched hit area lives on this button, so the whole card opens
          the dialog through one real control. */}
        <h3 className='wk-title'>
          <button type='button' className='wk-select' aria-haspopup='dialog' onClick={onOpen}>
            {cs.title ?? workLabel(cs)}
          </button>
        </h3>

        <p className='wk-summary'>{WORK_USE_CASES[cs.slug] ?? cs.description}</p>

        <div className='wk-foot'>
          {/* The marks sit in ink until the card is hovered, so three brand
            colours do not compete with the card's own tone at rest. */}
          <p className='wk-stack'>
            {[tags.platform, ...tags.tools.slice(0, 2)]
              .filter((name): name is string => Boolean(name))
              .map(name => (
                <span key={name} className='wk-tool'>
                  <ToolMark tool={toolNamed(name)} size={14} />
                  {name}
                </span>
              ))}
          </p>
          <span className='wk-open' aria-hidden='true'>
            Open case study <Ico d={P.arrow} size={13} />
          </span>
        </div>
      </div>
    </motion.li>
  )
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.06)
  const reduced = usePrefersReducedMotion()
  const [selected, setSelected] = useState<CaseStudyMetadata | null>(null)

  // Delivered work first, then sample clients, then labs (see `orderWork`).
  const shown = useMemo(() => orderWork(caseStudies), [caseStudies])

  /** `null` is "all platforms" rather than a sentinel string. */
  const [platform, setPlatform] = useState<string | null>(null)

  /**
   * Counts come from the data rather than a hand-kept list, so a new case study
   * joins the filter the moment its MDX lands. The platform with the most work
   * leads. Counts are shown because a platform can hold a single project, and
   * it is better to say so than to let a reader click into a near-empty grid.
   * (Removed in September when two of three buttons led to one card each;
   * back now that only one does.)
   */
  const platforms = shown
    .reduce<{ name: string; count: number }[]>((all, cs) => {
      const name = cs.platform?.trim()

      if (!name) return all

      const seen = all.find(entry => entry.name === name)

      return seen ? all.map(e => (e === seen ? { ...e, count: e.count + 1 } : e)) : [...all, { name, count: 1 }]
    }, [])
    .sort((a, b) => b.count - a.count)

  const visible = platform ? shown.filter(cs => cs.platform?.trim() === platform) : shown

  // Three to a row on desktop, two below that, phones included. A count that
  // would leave one card alone on the last row has the first card take a
  // full row instead, so the rest fill their rows (see work-cards.css).
  const featureAtTwo = visible.length % 2 === 1
  const featureAtThree = visible.length % 3 === 1

  /**
   * A per-card badge only means something when it separates one card from
   * another. When every visible project is a lab it is six repetitions of the
   * same word, so the qualification moves up to the section and is stated once,
   * plainly. Flip any project to `sample: false` and the per-card flags return
   * on their own.
   */
  const allLabs = visible.length > 0 && visible.every(cs => cs.sample)

  // Fetch the dialog's code as the work arrives, so the first open is instant.
  useEffect(() => {
    if (inView) preloadCaseStudyModal()
  }, [inView])

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

        <div className='work-toolbar'>
          {/* Hidden when there is only one platform, where it could only
              ever show the same grid. */}
          {platforms.length > 1 && (
            <div className='work-filters' role='group' aria-label='Filter projects by automation platform'>
              <button
                type='button'
                className='work-filter'
                aria-pressed={platform === null}
                onClick={() => setPlatform(null)}
              >
                <LayoutGrid size={14} strokeWidth={ICON_STROKE} aria-hidden='true' />
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
                  <ToolMark tool={toolNamed(entry.name)} size={14} />
                  {entry.name} <b>{entry.count}</b>
                </button>
              ))}
            </div>
          )}

          {allLabs && (
            <p className='work-lab-note'>
              Every system below is a demo project, designed, built and run end to end. The figures are targets, not
              results measured with a client.
            </p>
          )}
        </div>

        {/* Every project visible, two to a row, each map running its own
            workflow as it arrives and again on hover. */}
        <ul
          ref={ref}
          className='wk-gallery'
          data-feature-2={featureAtTwo || undefined}
          data-feature-3={featureAtThree || undefined}
        >
          {visible.map((cs, index) => (
            <WorkCard
              key={cs.slug}
              cs={cs}
              index={index}
              dealt={inView}
              reduced={reduced}
              allLabs={allLabs}
              onOpen={() => setSelected(cs)}
            />
          ))}
        </ul>
      </div>

      {/* Keyed by project, so each open starts on its first view without
          carrying the last one's choice over. */}
      <LazyCaseStudyModal key={selected?.slug ?? 'closed'} study={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
