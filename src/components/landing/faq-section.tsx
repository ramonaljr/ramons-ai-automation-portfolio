'use client'

import { useState } from 'react'

import './faq.css'

import { OPEN_CHAT_EVENT, useChatAvailable } from '@/components/landing/chat-widget'
import { CONTAINER, Cta, SECTION_ANCHOR, useContactHref } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { SheetPlus } from '@/components/landing/sheet'
import { FAQS, PROFILE } from '@/lib/portfolio'

/**
 * Questions, as a ruled list beside a standing intro.
 *
 * In the drafting-sheet language of About, Services and Process (Studio
 * Okafor benchmark, 2026-11-08), unnumbered: each question is a hairline row
 * with the sheets' plus, and opens in place by animating its grid row from
 * 0fr to 1fr, so no height is measured. One answer is open at a time, and the
 * first starts open so the list never reads as bare.
 *
 * Rows open on click, tap or Enter only. They used to open on hover, which
 * moved every row below the pointer as it crossed the list.
 *
 * Answers are in Ramon's voice, with his face beside them, so the list reads
 * as replies rather than a policy page.
 *
 * `essentialOnly` is the homepage's version: the four questions most likely to
 * stop a booking, just above the contact form, with a link to the rest on
 * /services. The full list and its FAQPage markup live there.
 */
export function FaqSection({ essentialOnly = false }: { essentialOnly?: boolean }) {
  const [openIndex, setOpenIndex] = useState(0)
  const items = essentialOnly ? FAQS.filter(item => item.essential) : FAQS
  const chatAvailable = useChatAvailable()
  const contactHref = useContactHref()

  return (
    <section id='faq' className={`${SECTION_ANCHOR} faq`}>
      <div className={CONTAINER}>
        <div className='faq-grid'>
          <div className='faq-intro'>
            <SectionIntro
              margin=''
              title='Questions.'
              titleClassName='mt-6 text-[clamp(3.5rem,7vw,7rem)] leading-[0.9]'
              blurb='Clear answers about access, ownership, reliability and what happens after handover.'
            />
            <Cta href={contactHref} className='mt-8 self-start'>
              Book a free call
            </Cta>
          </div>

          <div className='faq-index'>
            <ol className='faq-rows'>
              {items.map((item, index) => {
                const open = openIndex === index

                return (
                  <li key={item.question} className='faq-row' data-open={open || undefined}>
                    <h3>
                      <button
                        type='button'
                        id={`faq-q-${index}`}
                        className='faq-q'
                        aria-expanded={open}
                        aria-controls={`faq-a-${index}`}
                        onClick={() => setOpenIndex(current => (current === index ? -1 : index))}
                      >
                        <span>{item.question}</span>
                        <SheetPlus />
                      </button>
                    </h3>

                    <div id={`faq-a-${index}`} role='region' aria-labelledby={`faq-q-${index}`} className='faq-a'>
                      <div>
                        <div className='faq-reply'>
                          <img src='/images/landing/ramon-avatar.webp' alt='' width={96} height={96} loading='lazy' />
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>

            {essentialOnly && (
              <a href='/services#faq' className='faq-all'>
                All {FAQS.length} questions
              </a>
            )}

            {/* Points to email while the assistant is unreachable, rather than
                opening a chat that can only say so. */}
            <div className='faq-more'>
              {chatAvailable === false ? (
                <>
                  <p>
                    <strong>Still have a question?</strong> Email me and I&apos;ll answer it directly, usually within
                    one business day.
                  </p>
                  <a href={`mailto:${PROFILE.email}`}>Email me</a>
                </>
              ) : (
                <>
                  <p>
                    <strong>Still have a question?</strong> My assistant can walk you through the services and how a
                    project runs.
                  </p>
                  <button type='button' onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
                    Ask my assistant
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
