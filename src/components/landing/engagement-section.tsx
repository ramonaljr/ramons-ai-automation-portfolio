'use client'

import type { CSSProperties, ReactNode } from 'react'

import { AuditVisual, BuildVisual, LaunchVisual } from '@/components/landing/how-it-works-section'
import {
  ArrowIcon,
  ArrowRight,
  CONTAINER,
  DISPLAY_FONT,
  SECTION_ANCHOR,
  useContactHref,
  useInView
} from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

import { ENGAGEMENTS } from '@/lib/portfolio'

/** The same illustrations How it works uses, one per stage of the path. */
const VISUALS: ReactNode[] = [<AuditVisual key='audit' />, <BuildVisual key='build' />, <LaunchVisual key='launch' />]

/**
 * The homepage's pricing row: the three ways to work together and how each is
 * priced, in one band after How it works. It says prices are fixed up front
 * without sending anyone away to find out; what each includes is on /services,
 * where the full path below lives.
 */
export function EngagementSummary() {
  const { ref, inView } = useInView<HTMLOListElement>(0.2)

  return (
    <section id='pricing' aria-labelledby='pricing-title' className='pricing-summary px-6 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='pricing-summary-head'>
          <div>
            <p className='eyebrow'>Working together</p>
            <h2 id='pricing-title' className='pricing-summary-title' style={{ fontFamily: DISPLAY_FONT }}>
              Priced up front, not by the hour.
            </h2>
          </div>
          <a href='/services#engagement' className='pricing-summary-link'>
            See what each includes
          </a>
        </div>

        <ol ref={ref} className='pricing-summary-list' data-visible={inView}>
          {ENGAGEMENTS.map((tier, index) => (
            <li
              key={tier.name}
              data-featured={tier.featured || undefined}
              style={{ '--step-delay': `${index * 120}ms` } as CSSProperties}
            >
              <p className='pricing-summary-meta'>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {tier.duration}
                {tier.start && <em>Most clients start here</em>}
              </p>
              <h3 className='pricing-summary-name' style={{ fontFamily: DISPLAY_FONT }}>
                {tier.name}
              </h3>
              <p className='pricing-summary-price'>
                <strong>{tier.pricing}</strong> {tier.pricingNote}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * Working together, as a path rather than a menu.
 *
 * Audit, build and retainer are the order most clients take them in, so they
 * read left to right as numbered steps on a line that draws in as the section
 * arrives. Each step carries its How it works illustration, how it is priced
 * and what the client leaves with; the build is the dark card, the one the
 * page leads towards.
 */
export function EngagementSection() {
  const { ref, inView } = useInView<HTMLOListElement>(0.12)
  const contactHref = useContactHref()

  return (
    <section id='engagement' className={SECTION_ANCHOR}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='WORKING TOGETHER'
          title={
            <>
              One path,
              <br />
              three steps.
            </>
          }
          blurb='Most clients start with the audit, build what it finds, and keep it running on a retainer. Start wherever you are.'
        />

        <ol ref={ref} className='engagement-path' data-visible={inView}>
          {ENGAGEMENTS.map((tier, index) => {
            // A tier pointing at a real page keeps it; one pointing at the
            // contact section goes wherever contact is from this page.
            const href = tier.href && !tier.href.startsWith('#') ? tier.href : contactHref

            return (
            <li
              key={tier.name}
              className='engagement-step'
              data-featured={tier.featured || undefined}
              style={{ '--step-delay': `${index * 160}ms` } as CSSProperties}
            >
              <div className='engagement-step-head'>
                <span className='engagement-step-number'>{String(index + 1).padStart(2, '0')}</span>
                {tier.start && <span className='engagement-step-badge'>Most clients start here</span>}
              </div>

              <article className='engagement-card'>
                <div className='engagement-visual' aria-hidden='true'>
                  {VISUALS[index]}
                </div>

                <div className='engagement-card-body'>
                  <p className='engagement-duration'>{tier.duration}</p>
                  <h3 className='engagement-name' style={{ fontFamily: DISPLAY_FONT }}>
                    {tier.name}
                  </h3>

                  <p className='engagement-price'>
                    <strong style={{ fontFamily: DISPLAY_FONT }}>{tier.pricing}</strong>
                    <span>{tier.pricingNote}</span>
                  </p>

                  <p className='engagement-for'>{tier.forWhen}</p>

                  <ul className='engagement-includes'>
                    {tier.includes.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <p className='engagement-outcome'>
                    <span>You leave with</span>
                    {tier.outcome}
                  </p>

                  <a href={href} className='engagement-cta'>
                    {tier.cta}
                    {href === contactHref ? <ArrowRight size={14} /> : <ArrowIcon />}
                  </a>
                </div>
              </article>
            </li>
            )
          })}
        </ol>

        <p className='engagement-reassure'>
          Every engagement starts with a free 30-minute call. What is included and the price are agreed in writing before any
          build starts.
        </p>
      </div>
    </section>
  )
}
