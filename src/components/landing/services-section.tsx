'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

import { createPortal } from 'react-dom'

import { CalendarCheck, FileText, MessageCircle, Phone, ClipboardCheck, Mic } from 'lucide-react'

import { SectionIntro } from '@/components/landing/section-intro'
import { ServiceFigure } from '@/components/landing/service-figures'
import { pad, SheetHeader, SheetPlus } from '@/components/landing/sheet'
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

type Step = { label: string; example: string; icon: ReactNode }

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
    { label: 'New data arrives', example: 'An order email lands in the inbox', icon: logo('gmail', '#EA4335') },
    { label: 'Checked and entered', example: 'Details checked, then added to the sheet', icon: logo('n8n', '#EA4B71') },
    { label: 'Report sent to the team', example: 'The weekly summary posts itself', icon: logo('slack', '#4A154B') }
  ],
  'business-process-automation': [
    { label: 'A form is submitted', example: 'A new hire’s details come in', icon: icon(ClipboardCheck, '#2F6FD6') },
    { label: 'Approved in Slack', example: 'The manager taps Approve', icon: logo('slack', '#4A154B') },
    {
      label: 'Folder and record created',
      example: 'Drive folder and record set up',
      icon: logo('googledrive', '#4285F4')
    }
  ],
  'llm-rag-integrations': [
    { label: 'Someone asks a question', example: '“What is our refund policy?”', icon: icon(MessageCircle, '#2F6FD6') },
    {
      label: 'AI reads your documents',
      example: 'Policies and contracts searched',
      icon: logo('anthropic', '#191919')
    },
    {
      label: 'Answer with the source linked',
      example: 'The reply points to the exact page',
      icon: icon(FileText, '#7650D6')
    }
  ],
  'saas-api-integrations': [
    { label: 'A record changes', example: 'A customer’s email is updated', icon: logo('airtable', '#18BFFF') },
    { label: 'Updated everywhere', example: 'Sheet and CRM updated to match', icon: logo('googlesheets', '#34A853') },
    { label: 'The team is alerted', example: 'A note lands in the team channel', icon: logo('slack', '#4A154B') }
  ],
  'ai-voice-agents': [
    { label: 'A call comes in', example: 'After hours, on a Saturday', icon: icon(Phone, '#2F6FD6') },
    { label: 'AI answers and takes the details', example: 'Name, need and a good time', icon: icon(Mic, '#13917C') },
    {
      label: 'Booked in your calendar',
      example: 'The caller gets a confirmation',
      icon: icon(CalendarCheck, '#7650D6')
    }
  ]
}

/**
 * Where the floating preview runs: a mouse, a screen wide enough to keep it
 * beside the list, and a reader who has not asked for less motion.
 */
const FOLLOW = '(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** How far the preview sits from the pointer, and from the window's edges. */
const OFFSET = 28
const MARGIN = 16

/**
 * The preview card that trails the pointer over the index, showing how the
 * service under it runs. It eases toward the pointer each frame rather than
 * sitting on it, which reads as weight; the loop only runs while the pointer
 * is over the index.
 */
function usePointerFollow(on: boolean) {
  const cardRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const at = useRef({ x: 0, y: 0, placed: false })

  useEffect(() => {
    if (!on) return

    let frame = 0

    const tick = () => {
      const card = cardRef.current

      if (card) {
        // Aimed each frame, not on each pointer event: the card is mounted by
        // the first hover, after that hover's own event has been handled.
        // Right of the pointer, or left of it where the right would clip.
        const { x, y } = pointer.current
        const width = card.offsetWidth
        const height = card.offsetHeight
        const right = x + OFFSET
        const goalX = right + width > window.innerWidth - MARGIN ? x - OFFSET - width : right
        const goalY = Math.min(Math.max(y - height / 2, MARGIN), Math.max(window.innerHeight - height - MARGIN, MARGIN))
        const pos = at.current

        // The first frame lands on the pointer: easing in from wherever the
        // card was last shown would sweep it across the list.
        if (!pos.placed) {
          pos.x = goalX
          pos.y = goalY
          pos.placed = true
        }

        pos.x += (goalX - pos.x) * 0.16
        pos.y += (goalY - pos.y) * 0.16
        card.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [on])

  const aim = (clientX: number, clientY: number) => {
    pointer.current.x = clientX
    pointer.current.y = clientY
  }

  const reset = () => {
    at.current.placed = false
  }

  return { cardRef, aim, reset }
}

/**
 * Services as an index, in the drafting-sheet language About and Process
 * share: five ruled rows, each with its number, what comes off the desk, the
 * work it covers and the tools it runs on.
 *
 * With a mouse, the row under the pointer steps forward, the rest step back,
 * and a card trails the pointer showing that service's three steps. A click
 * (or tap, or Enter) opens the row in place with the description, the full
 * flow and the link to the service's page. All five services' copy stays in
 * the DOM, open or not, for search engines and screen readers.
 *
 * `sheet` adds the sheet header the homepage numbers its sections with;
 * /services shows the index without it.
 */
export function ServicesSection({ sheet = false }: { sheet?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12)
  const contactHref = useContactHref()

  // Its own trigger: tied to the index's, a jump that skipped the index left
  // this block invisible.
  const { ref: platformsRef, inView: platformsInView } = useInView<HTMLDivElement>(0.15)

  const [open, setOpen] = useState<number | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [previous, setPrevious] = useState<number | null>(null)

  // The card is mounted on first hover, never on touch screens, and the
  // pointer loop runs only while the pointer is over the index.
  const [following, setFollowing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cardRef, aim, reset } = usePointerFollow(following)

  const canFollow = (event: PointerEvent) => event.pointerType === 'mouse' && window.matchMedia(FOLLOW).matches

  const enterRow = (index: number) => (event: PointerEvent<HTMLElement>) => {
    if (!canFollow(event)) return

    if (index !== active) {
      setPrevious(active)
      setActive(index)
    }

    setMounted(true)
    setFollowing(true)
    aim(event.clientX, event.clientY)
  }

  const leaveIndex = () => {
    setActive(null)
    setPrevious(null)
    setFollowing(false)
    reset()
  }

  // The card has nothing to add over a row that is already open: the full
  // flow is on show inside it.
  const previewOn = following && active !== null && active !== open

  const preview =
    mounted &&
    createPortal(
      <div ref={cardRef} className='sheet-pv' data-on={previewOn || undefined} aria-hidden='true'>
        <div className='sheet-pv-stage'>
          {SERVICES.map((item, index) => (
            <div
              key={item.slug}
              className='sheet-pv-layer'
              data-on={index === active || undefined}
              data-prev={index === previous || undefined}
            >
              <ServiceFigure slug={item.slug} on={index === active} />
            </div>
          ))}
        </div>
        <p className='sheet-pv-cap'>
          <span>{active === null ? '' : (SERVICE_PRESENTATION[SERVICES[active].slug]?.outcomes[0] ?? '')}</span>
          <span>{active === null ? '' : `Service ${pad(active + 1)} / ${pad(SERVICES.length)}`}</span>
        </p>
      </div>,
      document.body
    )

  return (
    <section id='services' className={SECTION}>
      <div className={CONTAINER}>
        {sheet && <SheetHeader number={2} title='Services · What comes off the desk' />}

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

        <div
          ref={ref}
          className='sheet-index svc-index'
          data-in={inView || undefined}
          data-has-active={active !== null || undefined}
          onPointerMove={event => aim(event.clientX, event.clientY)}
          onPointerLeave={leaveIndex}
        >
          <div className='sheet-cols' aria-hidden='true'>
            <span>No.</span>
            <span>Service</span>
            <span className='sheet-wide'>Typical work</span>
            <span className='sheet-wide svc-col-tools'>Runs on</span>
            <span />
          </div>

          <ul className='sheet-rows'>
            {SERVICES.map((item, index) => {
              const copy = SERVICE_PRESENTATION[item.slug]
              const steps = SERVICE_FLOWS[item.slug] ?? []
              const outcomes = copy?.outcomes ?? item.tools.slice(0, 3)
              const isOpen = open === index

              return (
                <li
                  key={item.slug}
                  className='sheet-row'
                  data-active={active === index || undefined}
                  data-open={isOpen || undefined}
                  style={{ '--i': index + 1 } as CSSProperties}
                  onPointerEnter={enterRow(index)}
                >
                  <h3>
                    <button
                      type='button'
                      id={`service-row-${item.slug}`}
                      className='sheet-row-head'
                      aria-expanded={isOpen}
                      aria-controls={`service-body-${item.slug}`}
                      onClick={() => setOpen(isOpen ? null : index)}
                    >
                      <span className='sheet-mono sheet-no'>{pad(index + 1)}</span>
                      <span>
                        <span className='sheet-name'>{copy?.title ?? item.title}</span>
                        <span className='sheet-mono sheet-meta'>{outcomes.join(' · ')}</span>
                      </span>
                      <span className='sheet-mono sheet-wide'>{outcomes.join(' · ')}</span>
                      <span className='sheet-wide svc-col-tools svc-tools' aria-hidden='true'>
                        {steps.map(step => (
                          <span key={step.label}>{step.icon}</span>
                        ))}
                      </span>
                      <SheetPlus />
                    </button>
                  </h3>

                  <div
                    id={`service-body-${item.slug}`}
                    role='region'
                    aria-labelledby={`service-row-${item.slug}`}
                    className='sheet-row-body'
                  >
                    <div>
                      <div className='sheet-row-grid'>
                        <div className='svc-row-text'>
                          <p className='sheet-copy'>{copy?.description ?? item.description}</p>
                          <a href={`/services/${item.slug}`} className='sheet-link tap-area'>
                            See how it works
                            <ArrowIcon />
                          </a>
                        </div>

                        {/* Decorative: the copy beside it carries the meaning. */}
                        <figure className='svc-board' aria-hidden='true'>
                          <ServiceFigure slug={item.slug} on={isOpen} />
                        </figure>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {preview}

        {/* The contact route that used to fill the grid's sixth cell. */}
        <div className='service-accordion-cta' style={rise(inView, 180)}>
          <div>
            <p className='text-ink text-xl leading-snug font-light' style={{ fontFamily: DISPLAY_FONT }}>
              Not sure which you need?
            </p>
            <p className='text-fine text-ink-2 mt-1.5'>
              Tell me what your team still does by hand, and I will tell you which of these fits.
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
