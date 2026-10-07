'use client'

import { useState } from 'react'

import { CONTAINER, SECTION, useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { TESTIMONIALS } from '@/lib/portfolio'

/** An expanding testimonial rail inspired by the supplied Aura reference. Approved quotes only. */
function Testimonials({ shown }: { shown: typeof TESTIMONIALS }) {
  const { ref, inView } = useInView(0.1)
  const [activeIndex, setActiveIndex] = useState(0)

  const move = (direction: -1 | 1) => {
    setActiveIndex(current => (current + direction + shown.length) % shown.length)
  }

  return (
    <section id='testimonials' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='IN THEIR WORDS'
          title='What it was like to work together.'
          blurb='From the people who had to run the thing after handover.'
        />

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
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
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
                  <span>{testimonial.company || testimonial.role}</span>
                  <strong>{testimonial.name}</strong>
                </span>
                <span className='testimonial-accordion-open' aria-hidden={!active}>
                  <span className='testimonial-placeholder-flag'>CLIENT FEEDBACK</span>
                  <span className='testimonial-quote-mark' aria-hidden='true'>
                    “
                  </span>
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

/**
 * Hidden until at least one approved quote exists: drafts never render, so
 * the page shows no testimonials section rather than a labelled preview.
 * Publishing a quote in TESTIMONIALS brings the section back.
 */
export function TestimonialsSection() {
  const published = TESTIMONIALS.filter(testimonial => !testimonial.draft)

  if (published.length === 0) return null

  return <Testimonials shown={published} />
}
