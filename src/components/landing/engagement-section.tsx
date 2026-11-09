'use client'

import type { ComponentType, CSSProperties } from 'react'

import './engagement.css'

import { CONTAINER, Cta, DISPLAY_FONT, SECTION_ANCHOR, useContactHref, useInView } from '@/components/landing/motion'
import { ENGAGEMENT_SCENES as SCENES } from '@/components/landing/scenes/engagement-scenes'
import type { SceneProps } from '@/components/landing/scenes/scene'
import { SceneFrame } from '@/components/landing/scenes/scene-frame'
import { useTurns } from '@/components/landing/scenes/use-turns'
import { SectionIntro } from '@/components/landing/section-intro'

import { ENGAGEMENTS } from '@/lib/portfolio'

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
  const { turn, round } = useTurns(ref, SCENES.length, inView)
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

              <div className='eng-fig' aria-hidden='true'>
                <SceneFrame ratio={520 / 460}>
                  {SCENES[index] && (
                    <EngagementScene
                      key={index === turn ? `turn-${round}` : 'still'}
                      scene={SCENES[index]}
                      playing={index === turn}
                    />
                  )}
                </SceneFrame>
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

/** A column's scene: its turn when `playing`, otherwise its payoff, held. */
function EngagementScene({ scene: Scene, playing }: { scene: ComponentType<SceneProps>; playing: boolean }) {
  return <Scene mode={playing ? 'turn' : 'still'} />
}
