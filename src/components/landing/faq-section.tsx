'use client'

import { useState } from 'react'

import { Bell, Clock, Handshake, KeyRound, Lock, Wrench, type LucideIcon } from 'lucide-react'

import { CONTAINER, Cta, SECTION_ANCHOR } from '@/components/landing/motion'
import { OPEN_CHAT_EVENT, useChatAvailable } from '@/components/landing/chat-widget'
import { SectionIntro } from '@/components/landing/section-intro'
import { FAQS, PROFILE } from '@/lib/portfolio'

import { ICON_STROKE } from '@/components/landing/motion'

/** Line icons, one per question, so a scanning reader finds theirs by shape. */
const FAQ_ICONS: Record<string, LucideIcon> = {
  lock: Lock,
  key: KeyRound,
  handshake: Handshake,
  bell: Bell,
  tools: Wrench,
  clock: Clock
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const chatAvailable = useChatAvailable()

  return (
    <section id='faq' className={`${SECTION_ANCHOR} faq-reference-section`}>
      <div className={CONTAINER}>
        <div className='faq-reference-shell'>
          <div className='faq-reference-intro'>
            <SectionIntro
              margin=''
              title='Questions.'
              titleClassName='mt-6 text-[clamp(3.5rem,7vw,7rem)] leading-[0.9]'
              blurb='Clear answers about access, ownership, reliability and what happens after handover.'
            />
            <Cta href='#contact' className='mt-8 self-start'>
              Book a free call
            </Cta>
          </div>

          <div className='faq-reference-list'>
            {FAQS.map((item, index) => {
              const open = openIndex === index

              return (
                <div
                  key={item.question}
                  className='faq-reference-item'
                  data-open={open ? 'true' : 'false'}
                  onMouseEnter={() => setOpenIndex(index)}
                >
                  <button
                    type='button'
                    className='faq-reference-question'
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    onFocus={() => setOpenIndex(index)}
                    onClick={() => setOpenIndex(current => (current === index ? -1 : index))}
                  >
                    <span className='faq-question-label'>
                      {(() => {
                        const QuestionIcon = FAQ_ICONS[item.icon]

                        return (
                          <QuestionIcon
                            className='faq-question-icon'
                            size={18}
                            strokeWidth={ICON_STROKE}
                            aria-hidden='true'
                          />
                        )
                      })()}
                      {item.question}
                    </span>
                    <span className='faq-reference-toggle' aria-hidden='true'>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  {/* Answered in Ramon's voice, with his face beside it, so the
                      FAQ reads as a reply rather than a policy page. */}
                  <div id={`faq-answer-${index}`} className='faq-reference-answer' aria-hidden={!open}>
                    <div className='faq-reply'>
                      <img src='/images/landing/ramon-avatar.webp' alt='' width={96} height={96} loading='lazy' />
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Points to email while the assistant is unreachable, rather than
                opening a chat that can only say so. */}
            {chatAvailable === false ? (
              <div className='faq-ask'>
                <p>
                  <strong>Still have a question?</strong> Email me and I&apos;ll answer it directly, usually within one
                  business day.
                </p>
                <a href={`mailto:${PROFILE.email}`}>Email me</a>
              </div>
            ) : (
              <div className='faq-ask'>
                <p>
                  <strong>Still have a question?</strong> The assistant can walk you through the services and how a
                  project runs.
                </p>
                <button type='button' onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
                  Ask the assistant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
