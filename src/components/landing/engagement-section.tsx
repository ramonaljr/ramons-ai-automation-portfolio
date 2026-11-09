'use client'

import type { CSSProperties, ReactNode } from 'react'

import './engagement.css'

import { CONTAINER, Cta, DISPLAY_FONT, SECTION_ANCHOR, useContactHref, useInView } from '@/components/landing/motion'
import { AuditFigure, BuildFigure, MonitorFigure } from '@/components/landing/process-figures'
import { SectionIntro } from '@/components/landing/section-intro'

import { ENGAGEMENTS } from '@/lib/portfolio'

/**
 * What the client holds at the end of each step, drawn as the same documents
 * the Process sheet uses: the audit's opportunity list, the build's log and
 * the retainer's run monitor. One running example, so the two sections read
 * as one job.
 */
const FIGURES: ReactNode[] = [<AuditFigure key='audit' />, <BuildFigure key='build' />, <MonitorFigure key='monitor' />]

/**
 * Working together, as a ruled schedule rather than three pricing cards.
 *
 * Audit, build and retainer read left to right in the order I recommend taking
 * them, as three columns under one rule that draws in as the section arrives.
 * Every column carries the same rows (when, name, price, who it is for, the
 * document you are left with, what is included), aligned across the three
 * through subgrid, so a reader compares along a row instead of hunting inside
 * cards. The build, which the page leads towards, is marked by an accent rule
 * rather than an inverted card.
 *
 * In the drafting-sheet language of About, Services and Process (Studio
 * Okafor benchmark, 2026-11-08) but unnumbered: numbered sheets stay with
 * those three. The homepage and /services show it the same way, on the
 * light page (the homepage's dark band was dropped 2026-11-09).
 */
export function EngagementSection() {
  const { ref, inView } = useInView<HTMLOListElement>(0.12)
  const contactHref = useContactHref()

  return (
    <section id='engagement' className={`${SECTION_ANCHOR} eng`}>
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
          blurb='I recommend the audit first, then a build for what it finds, then a retainer to keep it running. Start wherever you are.'
        />

        <ol ref={ref} className='eng-cols' data-in={inView || undefined}>
          {ENGAGEMENTS.map((tier, index) => (
            <li
              key={tier.name}
              className='eng-col'
              data-featured={tier.featured || undefined}
              style={{ '--i': index } as CSSProperties}
            >
              <p className='eng-when'>
                <span>{tier.duration}</span>
                {tier.start && <span className='eng-start'>Recommended start</span>}
              </p>

              <h3 className='eng-name' style={{ fontFamily: DISPLAY_FONT }}>
                {tier.name}
              </h3>

              <p className='eng-price'>
                <strong style={{ fontFamily: DISPLAY_FONT }}>{tier.pricing}</strong>
                <span>{tier.pricingNote}</span>
              </p>

              <p className='eng-for'>{tier.forWhen}</p>

              <div className='eng-fig' data-on={inView || undefined} aria-hidden='true'>
                {FIGURES[index]}
              </div>

              <ul className='eng-includes'>
                {tier.includes.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className='eng-outcome'>
                <span>You leave with</span>
                {tier.outcome}
              </p>
            </li>
          ))}
        </ol>

        <div className='eng-close'>
          <p>
            Every engagement starts with a free 30-minute call. What is included and the price are agreed in writing
            before any build starts.
          </p>
          <Cta href={contactHref}>Book a free call</Cta>
        </div>
      </div>
    </section>
  )
}
