'use client'

import { useState, type PointerEvent } from 'react'

import { SectionIntro } from '@/components/landing/section-intro'
import { ArrowIcon, CONTAINER, Cta, DISPLAY_FONT, rise, SECTION, useInView } from '@/components/landing/motion'

import { SERVICES } from '@/lib/portfolio'

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

/** One warm, lamp-lit scene per service, shared with the Selected Work cards. */
const SERVICE_SCENES: Record<string, string> = {
  'n8n-ai-agents': '/images/landing/work-scenes/invoice-processing-gl-reconciliation.webp',
  'business-process-automation': '/images/landing/work-scenes/zero-touch-client-onboarding.webp',
  'llm-rag-integrations': '/images/landing/work-scenes/rag-knowledge-base.webp',
  'saas-api-integrations': '/images/landing/work-scenes/lead-routing-and-crm-enrichment.webp',
  'ai-voice-agents': '/images/landing/work-scenes/ai-voice-receptionist.webp'
}

/** Matches the breakpoint in globals.css where the panels fold sideways. */
const SIDEWAYS = '(min-width: 768px)'

/**
 * Services as an image accordion: one panel open, the rest folded to a spine.
 *
 * Every panel's copy stays in the DOM whether or not it is open, so search
 * engines and screen readers get all five services. Closed panels are `inert`,
 * which keeps their links out of the tab order without hiding the text.
 *
 * A mouse opens a panel on hover; touch and keyboard open it on tap or focus,
 * because hover alone would leave phones with a single service.
 */
export function ServicesSection() {
  const { ref, inView } = useInView<HTMLUListElement>(0.12)
  const [active, setActive] = useState(0)

  // Hover only opens panels in the sideways layout. Stacked, an opening panel
  // pushes the next one under a resting pointer, which would open that too.
  const openOnHover = (index: number) => (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && window.matchMedia(SIDEWAYS).matches) setActive(index)
  }

  return (
    <section id='services' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='SERVICES'
          title={
            <>
              What comes off
              <br />
              your team&rsquo;s desk.
            </>
          }
          blurb='Five practical ways to remove repetitive work — from intake and follow-up to approvals, reporting and customer response. Every build is documented so your team can run it without me.'
        />

        <ul ref={ref} className='service-accordion' style={rise(inView)}>
          {SERVICES.map((service, index) => {
            const copy = SERVICE_PRESENTATION[service.slug]
            const title = copy?.title ?? service.title
            const isOpen = index === active
            const panelId = `service-panel-${service.slug}`

            return (
              <li
                key={service.slug}
                className='service-panel'
                data-open={isOpen}
                onPointerEnter={openOnHover(index)}
              >
                <img
                  src={SERVICE_SCENES[service.slug]}
                  alt=''
                  aria-hidden='true'
                  width={1400}
                  height={875}
                  loading='lazy'
                  className='service-panel-image'
                />
                <div className='service-panel-shade' aria-hidden='true' />

                <h3 className='service-panel-heading'>
                  <button
                    type='button'
                    className='service-panel-toggle'
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setActive(index)}
                    onFocus={() => setActive(index)}
                  >
                    <span className='service-panel-index'>{String(index + 1).padStart(2, '0')}</span>
                    <span className='service-panel-spine'>{title}</span>
                  </button>
                </h3>

                <div id={panelId} className='service-panel-body' inert={!isOpen}>
                  <p className='service-panel-title' style={{ fontFamily: DISPLAY_FONT }}>
                    {title}
                  </p>
                  <p className='service-panel-copy'>{copy?.description ?? service.description}</p>

                  <ul className='service-panel-tags' aria-label='Typical work'>
                    {(copy?.outcomes ?? service.tools.slice(0, 3)).map(outcome => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>

                  <a href={`/services/${service.slug}`} className='service-panel-link'>
                    See how it works
                    <ArrowIcon />
                  </a>
                </div>
              </li>
            )
          })}
        </ul>

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
          <Cta href='#contact'>Book a workflow audit</Cta>
        </div>
      </div>
    </section>
  )
}
