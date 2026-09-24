'use client'

import { useState } from 'react'

import { CONTAINER, Cta, SECTION_ANCHOR } from '@/components/landing/motion'
import { OPEN_CHAT_EVENT } from '@/components/landing/chat-widget'
import { SectionIntro } from '@/components/landing/section-intro'

/** Line icons, one per question, so a scanning reader finds theirs by shape. */
const FAQ_ICONS: Record<string, string> = {
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
  key: 'M15 7a4 4 0 11-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0115 7zM16 9h.01',
  handshake: 'M3 12l4-4 5 3 3-2 6 5M7 8l-4 4 5 5 2-1 2 2 2-1 2 1 4-4',
  bell: 'M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0',
  tools: 'M14 6a4 4 0 00-5 5l-6 6 3 3 6-6a4 4 0 005-5l-3 3-3-3 3-3z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z'
}

const FAQS = [
  {
    icon: 'lock',
    question: 'Will my business data remain private?',
    answer:
      'Yes. I work inside accounts and systems you control, request only the access the workflow needs, and support self-hosted setups when sensitive data should stay in your environment.'
  },
  {
    icon: 'key',
    question: 'What access will you need?',
    answer:
      'Usually a test account, sample records and limited access to the tools being connected. We agree on access before the build, and production credentials stay in your own password or secrets manager.'
  },
  {
    icon: 'handshake',
    question: 'Who owns and maintains the automation?',
    answer:
      'You do. The finished workflow runs in your accounts and includes documentation, a recorded handover and clear instructions for the person who maintains it next.'
  },
  {
    icon: 'bell',
    question: 'What happens if a workflow fails?',
    answer:
      'Important workflows include failure alerts, safe retry rules and a human review step where a wrong decision would be costly. Failures are surfaced instead of disappearing silently.'
  },
  {
    icon: 'tools',
    question: 'Which platform will you build on?',
    answer:
      'Usually n8n: it handles sensitive data in your own environment, branching logic and custom steps, and higher volumes without paying per task. Zapier suits simple handoffs between familiar apps, especially if your team already uses it. Make fits visual, multi-route processes that reshape larger sets of data. GoHighLevel is the choice when the CRM, pipelines and campaigns are the centre of the work. I recommend one after the audit, based on your tools, volume and who maintains it afterwards.'
  },
  {
    icon: 'clock',
    question: 'How long does a typical project take?',
    answer:
      'A focused workflow usually takes one to four weeks after the process and access are clear. An initial audit takes one week and gives you a prioritized plan before committing to a build.'
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id='faq' className={`${SECTION_ANCHOR} faq-reference-section`}>
      <div className={CONTAINER}>
        <div className='faq-reference-shell'>
          <div className='faq-reference-intro'>
            <SectionIntro
              tag='BEFORE WE START'
              margin=''
              title='Questions.'
              titleClassName='mt-6 text-[clamp(3.5rem,7vw,7rem)] leading-[0.9]'
              blurb='Clear answers about access, ownership, reliability and what happens after handover.'
            />
            <Cta href='#contact' className='mt-8 self-start'>
              Ask about your workflow
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
                      <svg
                        className='faq-question-icon'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.6'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden='true'
                      >
                        <path d={FAQ_ICONS[item.icon]} />
                      </svg>
                      {item.question}
                    </span>
                    <span className='faq-reference-toggle' aria-hidden='true'>{open ? '−' : '+'}</span>
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

            <div className='faq-ask'>
              <p>
                <strong>Still have a question?</strong> The assistant can walk you through the services and how a
                project runs.
              </p>
              <button type='button' onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
                Ask the assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
