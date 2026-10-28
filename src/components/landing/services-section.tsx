'use client'

import { useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { CalendarCheck, FileText, MessageCircle, Phone, ClipboardCheck, Mic } from 'lucide-react'

import { SectionIntro } from '@/components/landing/section-intro'
import {
  ArrowIcon,
  CONTAINER,
  Cta,
  DISPLAY_FONT,
  ICON_STROKE,
  rise,
  SECTION,
  useContactHref,
  useInView
} from '@/components/landing/motion'

import { ToolMark, ToolStackSection } from '@/components/landing/tool-stack-section'

import { PLATFORMS, SERVICES } from '@/lib/portfolio'

/**
 * Buyer-facing copy for each service. The catalogue in `lib/portfolio` is
 * written for the service detail pages; this is the plain-language version the
 * landing page leads with.
 */
const SERVICE_PRESENTATION: Record<string, { title: string; description: string; outcomes: string[] }> = {
  'n8n-ai-agents': {
    title: 'Routine work handled automatically',
    description:
      'Move information, prepare recurring reports and carry multi-step office work forward without someone checking every screen.',
    outcomes: ['Data entry', 'Follow-ups', 'Recurring reports']
  },
  'business-process-automation': {
    title: 'Smoother onboarding and approvals',
    description:
      'Turn forms, checks, approvals, folders and handoffs into one reliable process that keeps everyone informed.',
    outcomes: ['Onboarding', 'Approvals', 'Invoices']
  },
  'llm-rag-integrations': {
    title: 'Answers from your company documents',
    description:
      'Find information across policies, contracts and internal files, with links back to the source so every answer can be checked.',
    outcomes: ['Document reading', 'Knowledge search', 'Source links']
  },
  'saas-api-integrations': {
    title: 'Your everyday tools kept in sync',
    description:
      'Keep customer details, orders and updates consistent across spreadsheets, databases, inboxes and team channels.',
    outcomes: ['Spreadsheets', 'Customer records', 'Team alerts']
  },
  'ai-voice-agents': {
    title: 'Calls and customer questions answered 24/7',
    description:
      'Respond to common questions, collect the right details and book confirmed appointments even when your team is unavailable.',
    outcomes: ['Phone calls', 'Lead capture', 'Bookings']
  }
}

type Step = { label: string; icon: ReactNode }

/** A brand mark from public/images/tools, in its own colour. */
const logo = (slug: string, color: string) => (
  <span
    className='service-flow-logo'
    style={{
      backgroundColor: color,
      WebkitMaskImage: `url(/images/tools/${slug}.svg)`,
      maskImage: `url(/images/tools/${slug}.svg)`
    }}
  />
)

const icon = (Icon: typeof Phone, color: string) => (
  <Icon size={24} strokeWidth={ICON_STROKE} color={color} aria-hidden='true' />
)

/**
 * How each service runs, in three steps, drawn on the board beside the list.
 * An illustration of the kind of work, in the words the copy above already
 * uses; not a record of a particular client's system.
 */
const SERVICE_FLOWS: Record<string, Step[]> = {
  'n8n-ai-agents': [
    { label: 'New data arrives', icon: logo('gmail', '#EA4335') },
    { label: 'Checked and entered', icon: logo('n8n', '#EA4B71') },
    { label: 'Report sent to the team', icon: logo('slack', '#4A154B') }
  ],
  'business-process-automation': [
    { label: 'A form is submitted', icon: icon(ClipboardCheck, '#2F6FD6') },
    { label: 'Approved in Slack', icon: logo('slack', '#4A154B') },
    { label: 'Folder and record created', icon: logo('googledrive', '#4285F4') }
  ],
  'llm-rag-integrations': [
    { label: 'Someone asks a question', icon: icon(MessageCircle, '#2F6FD6') },
    { label: 'AI reads your documents', icon: logo('anthropic', '#191919') },
    { label: 'Answer with the source linked', icon: icon(FileText, '#7650D6') }
  ],
  'saas-api-integrations': [
    { label: 'A record changes', icon: logo('airtable', '#18BFFF') },
    { label: 'Updated everywhere', icon: logo('googlesheets', '#34A853') },
    { label: 'The team is alerted', icon: logo('slack', '#4A154B') }
  ],
  'ai-voice-agents': [
    { label: 'A call comes in', icon: icon(Phone, '#2F6FD6') },
    { label: 'AI answers and takes the details', icon: icon(Mic, '#13917C') },
    { label: 'Booked in your calendar', icon: icon(CalendarCheck, '#7650D6') }
  ]
}

/** The stages' colours, in the process maps' palette (docs/process-diagrams). */
const STAGE_COLOURS = [
  { bg: '#EBF2FD', border: '#AFCBF2', accent: '#2F6FD6' },
  { bg: '#E8F7F3', border: '#A4DACD', accent: '#13917C' },
  { bg: '#F2EDFB', border: '#C8B6EE', accent: '#7650D6' }
]

/** Where the list sits beside the board, so hovering it can switch services. */
const SIDE_BY_SIDE = '(min-width: 1024px)'

/**
 * Services as a picker and a board: the five services as a list on the left,
 * and the selected one on the right as a three-step flow on a process board,
 * in the same drawing language as the Story and the Selected Work maps,
 * with its description, the work it covers and the link to its page.
 *
 * Every service's copy stays in the DOM; the ones not selected are hidden,
 * so search engines and screen readers still meet all five. A mouse switches
 * services on hover; touch and keyboard on tap or focus.
 */
export function ServicesSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.12)
  const contactHref = useContactHref()

  // Its own trigger: tied to the picker's, a jump that skipped the picker
  // left this block invisible.
  const { ref: platformsRef, inView: platformsInView } = useInView<HTMLDivElement>(0.15)
  const [active, setActive] = useState(0)

  // Hover only switches services side by side. Stacked, the board is below
  // the list, and a pointer resting on the list would keep changing it.
  const openOnHover = (index: number) => (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && window.matchMedia(SIDE_BY_SIDE).matches) setActive(index)
  }

  const service = SERVICES[active]
  const steps = SERVICE_FLOWS[service.slug] ?? []

  return (
    <section id='services' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          title={
            <>
              What comes off
              <br />
              your team&rsquo;s desk.
            </>
          }
          blurb='Five practical ways to remove repetitive work: from intake and follow-up to approvals, reporting and customer response. Every build is documented so your team can run it without me.'
        />

        <div ref={ref} className='service-picker' style={rise(inView)}>
          <div className='service-list' role='tablist' aria-label='Services' aria-orientation='vertical'>
            {SERVICES.map((item, index) => {
              const copy = SERVICE_PRESENTATION[item.slug]

              return (
                <button
                  key={item.slug}
                  type='button'
                  role='tab'
                  id={`service-tab-${item.slug}`}
                  aria-selected={index === active}
                  aria-controls={`service-panel-${item.slug}`}
                  className='service-list-item'
                  onPointerEnter={openOnHover(index)}
                  onClick={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span className='service-list-index'>{String(index + 1).padStart(2, '0')}</span>
                  <span className='service-list-title' style={{ fontFamily: DISPLAY_FONT }}>
                    {copy?.title ?? item.title}
                  </span>
                  <span className='service-list-outcomes'>{(copy?.outcomes ?? []).join(' · ')}</span>
                </button>
              )
            })}
          </div>

          <div className='service-stage'>
            {/* The board: the selected service as three steps, drawn in afresh
                each time the service changes. Decorative; the copy below
                carries it. */}
            <div className='service-board' aria-hidden='true'>
              <span className='service-board-label'>How it runs</span>
              <AnimatePresence mode='wait' initial={false}>
                <motion.ol
                  key={service.slug}
                  className='service-flow'
                  initial='hidden'
                  animate='shown'
                  exit='gone'
                  variants={{ shown: { transition: { staggerChildren: 0.12 } } }}
                >
                  {steps.map((step, index) => (
                    <motion.li
                      key={step.label}
                      className='service-flow-step'
                      style={
                        {
                          '--stage-bg': STAGE_COLOURS[index].bg,
                          '--stage-border': STAGE_COLOURS[index].border,
                          '--stage-accent': STAGE_COLOURS[index].accent
                        } as CSSProperties
                      }
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                        gone: { opacity: 0, transition: { duration: 0.15 } }
                      }}
                    >
                      <span className='service-flow-head'>
                        <span className='service-flow-badge'>{index + 1}</span>
                        {step.label}
                      </span>
                      <span className='service-flow-tile'>{step.icon}</span>
                    </motion.li>
                  ))}
                </motion.ol>
              </AnimatePresence>
            </div>

            {SERVICES.map((item, index) => {
              const copy = SERVICE_PRESENTATION[item.slug]

              return (
                <div
                  key={item.slug}
                  id={`service-panel-${item.slug}`}
                  role='tabpanel'
                  aria-labelledby={`service-tab-${item.slug}`}
                  className='service-detail'
                  hidden={index !== active}
                >
                  <h3 className='service-detail-title' style={{ fontFamily: DISPLAY_FONT }}>
                    {copy?.title ?? item.title}
                  </h3>
                  <p className='service-detail-copy'>{copy?.description ?? item.description}</p>
                  <ul className='service-detail-tags' aria-label='Typical work'>
                    {(copy?.outcomes ?? item.tools.slice(0, 3)).map(outcome => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                  <a href={`/services/${item.slug}`} className='service-detail-link'>
                    See how it works
                    <ArrowIcon />
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* The contact route that used to fill the grid's sixth cell. */}
        <div className='service-accordion-cta' style={rise(inView, 180)}>
          <div>
            <p className='text-ink text-xl leading-snug font-light' style={{ fontFamily: DISPLAY_FONT }}>
              Not sure which you need?
            </p>
            <p className='text-fine text-ink-2 mt-1.5'>
              Describe the process that eats your week and I will tell you where it fits.
            </p>
          </div>
          <Cta href={contactHref}>Book a free call</Cta>
        </div>

        {/* Platforms used to be a section of their own, with four cards of
            bullets. Visitors rarely choose the platform (they want it
            recommended), so it is now one line each under the offer; the
            longer reasoning lives in the FAQ. */}
        <div ref={platformsRef} className='service-platforms' style={rise(platformsInView)}>
          <p className='label-quiet'>Where I build it</p>
          <ul>
            {PLATFORMS.map(platform => (
              <li key={platform.name} data-primary={platform.primary || undefined}>
                <strong style={{ fontFamily: DISPLAY_FONT }}>
                  <ToolMark tool={platform} size={26} />
                  {platform.name}
                  {platform.primary && <span>Primary</span>}
                </strong>
                <span>{platform.tagline}</span>
              </li>
            ))}
          </ul>
        </div>

        <ToolStackSection embedded />
      </div>
    </section>
  )
}
