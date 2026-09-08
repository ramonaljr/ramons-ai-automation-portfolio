'use client'

import { useState } from 'react'

import { CONTAINER, SECTION, useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { TESTIMONIALS } from '@/lib/portfolio'

/**
 * An expanding testimonial rail inspired by the supplied Aura reference.
 * Drafts are rendered only while no approved quotes exist and remain labelled
 * at section, card and attribution level so they cannot pass as endorsements.
 */
function Testimonials({ shown, placeholderOnly }: { shown: typeof TESTIMONIALS; placeholderOnly: boolean }) {
  const { ref, inView } = useInView(0.1)
  const [activeIndex, setActiveIndex] = useState(0)

  const move = (direction: -1 | 1) => {
    setActiveIndex(current => (current + direction + shown.length) % shown.length)
  }

  return (
    <section id='testimonials' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag={placeholderOnly ? 'TESTIMONIALS · LAYOUT PREVIEW' : 'IN THEIR WORDS'}
          title={placeholderOnly ? 'Client feedback will live here.' : 'What it was like to work together.'}
          blurb={
            placeholderOnly
              ? 'This chapter is being prepared. The accordion below shows the intended format—not real endorsements.'
              : 'From the people who had to run the thing after handover.'
          }
        />

        {placeholderOnly && (
          <p className='border-rule text-fine text-ink-3 mb-8 rounded-xl border border-dashed px-5 py-4'>
            <span className='text-ink font-mono'>PLACEHOLDER CONTENT.</span> No client quote is being claimed here.
            These panels will be replaced with approved feedback before this chapter is presented as social proof.
          </p>
        )}

        <div
          ref={ref}
          className='testimonial-accordion'
          role='group'
          aria-label='Client feedback'
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)' }}
        >
          {shown.map((testimonial, index) => {
            const active = activeIndex === index

            return (
              <button
                key={`${testimonial.name}-${index}`}
                id={`testimonial-tab-${index}`}
                type='button'
                aria-pressed={active}
                className='testimonial-accordion-card'
                data-active={active ? 'true' : 'false'}
                onClick={() => setActiveIndex(index)}
                onKeyDown={event => {
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    event.preventDefault()
                    move(1)
                  }

                  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    event.preventDefault()
                    move(-1)
                  }
                }}
              >
                <span className='testimonial-accordion-number'>{String(index + 1).padStart(2, '0')}</span>
                <span className='testimonial-accordion-closed' aria-hidden={active}>
                  <span>{testimonial.draft ? 'PLACEHOLDER' : testimonial.company || testimonial.role}</span>
                  <strong>{testimonial.name}</strong>
                </span>
                <span
                  className='testimonial-accordion-open'
                  aria-hidden={!active}
                >
                  <span className='testimonial-placeholder-flag'>
                    {testimonial.draft ? 'PLACEHOLDER — NOT A REAL QUOTE' : 'CLIENT FEEDBACK'}
                  </span>
                  <span className='testimonial-quote-mark' aria-hidden='true'>“</span>
                  <span className='testimonial-accordion-quote'>{testimonial.quote}</span>
                  <span className='testimonial-accordion-meta'>
                    <strong>{testimonial.name}</strong>
                    <span>
                      {testimonial.role}
                      {testimonial.company ? ` · ${testimonial.company}` : ''}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const published = TESTIMONIALS.filter(testimonial => !testimonial.draft)
  const placeholderOnly = published.length === 0
  const shown = placeholderOnly ? TESTIMONIALS : published

  return <Testimonials shown={shown} placeholderOnly={placeholderOnly} />
}
