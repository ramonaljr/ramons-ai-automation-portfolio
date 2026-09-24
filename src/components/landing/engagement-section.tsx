'use client'

import type { CSSProperties, ReactNode } from 'react'

import { AuditVisual, BuildVisual, LaunchVisual } from '@/components/landing/how-it-works-section'
import { ArrowIcon, CONTAINER, DISPLAY_FONT, SECTION_ANCHOR, useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

import { ENGAGEMENTS } from '@/lib/portfolio'

/** The same illustrations How it works uses, one per stage of the path. */
const VISUALS: ReactNode[] = [<AuditVisual key='audit' />, <BuildVisual key='build' />, <LaunchVisual key='launch' />]

/**
 * Working together, as a path rather than a menu.
 *
 * Audit, build and retainer are the order most clients take them in, so they
 * read left to right as numbered steps on a line that draws in as the section
 * arrives. Each step carries its How it works illustration, a starting price
 * and what the client leaves with; the build is the dark card, the one the
 * page leads towards.
 */
export function EngagementSection() {
  const { ref, inView } = useInView<HTMLOListElement>(0.12)

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
          {ENGAGEMENTS.map((tier, index) => (
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
                    <strong style={{ fontFamily: DISPLAY_FONT }}>{tier.price}</strong>
                    <span>{tier.priceNote}</span>
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

                  <a href={tier.href ?? '#contact'} className='engagement-cta'>
                    {tier.cta}
                    <ArrowIcon />
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <p className='engagement-reassure'>
          The audit begins with the free 30-minute workflow call. Every scope and price is fixed in writing before
          any build starts.
        </p>
      </div>
    </section>
  )
}
