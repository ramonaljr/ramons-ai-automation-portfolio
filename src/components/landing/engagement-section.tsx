'use client'

import type { CSSProperties, ReactNode } from 'react'

import { Check } from 'lucide-react'

import { AuditVisual, BuildVisual, LaunchVisual } from '@/components/landing/how-it-works-section'
import {
  CONTAINER,
  Cta,
  DISPLAY_FONT,
  ICON_STROKE,
  SECTION_ANCHOR,
  useContactHref,
  useInView
} from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

import { ENGAGEMENTS } from '@/lib/portfolio'

/** The same illustrations How it works uses, one per stage of the path. */
const VISUALS: ReactNode[] = [<AuditVisual key='audit' />, <BuildVisual key='build' />, <LaunchVisual key='launch' />]

/**
 * Working together, as a path rather than a menu.
 *
 * Audit, build and retainer are the order most clients take them in, so they
 * read left to right as steps on a line that draws in as the section arrives.
 * Each step carries its How it works illustration, how it is priced and what
 * the client leaves with; the build is the inverted card, the one the page
 * leads towards. Every tier starts the same way, with the free call, so the
 * path ends in one "Book a free call" rather than a button per card.
 *
 * `band` is the homepage's version: the same path on the page's one dark
 * band, where a reader decides. /services shows it on the light page.
 */
export function EngagementSection({ band = false }: { band?: boolean }) {
  const { ref, inView } = useInView<HTMLOListElement>(0.12)
  const contactHref = useContactHref()

  return (
    <section id='engagement' className={`${SECTION_ANCHOR} ${band ? 'pricing-band' : ''}`}>
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
                <span className='engagement-step-dot' aria-hidden='true' />
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
                      <li key={item}>
                        <Check size={12} strokeWidth={ICON_STROKE} aria-hidden='true' />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className='engagement-outcome'>
                    <span>You leave with</span>
                    {tier.outcome}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className='engagement-close'>
          <p className='engagement-reassure'>
            Every engagement starts with a free 30-minute call. What is included and the price are agreed in writing
            before any build starts.
          </p>
          <Cta href={contactHref}>Book a free call</Cta>
        </div>
      </div>
    </section>
  )
}
