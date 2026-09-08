'use client'

import { useState } from 'react'

import { CONTAINER, Cta, SECTION_ANCHOR } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

const FAQS = [
  {
    question: 'Will my business data remain private?',
    answer:
      'Yes. I work inside accounts and systems you control, request only the access the workflow needs, and support self-hosted setups when sensitive data should stay in your environment.'
  },
  {
    question: 'What access will you need?',
    answer:
      'Usually a test account, sample records and limited access to the tools being connected. We agree on access before the build, and production credentials stay in your own password or secrets manager.'
  },
  {
    question: 'Who owns and maintains the automation?',
    answer:
      'You do. The finished workflow runs in your accounts and includes documentation, a recorded handover and clear instructions for the person who maintains it next.'
  },
  {
    question: 'What happens if a workflow fails?',
    answer:
      'Important workflows include failure alerts, safe retry rules and a human review step where a wrong decision would be costly. Failures are surfaced instead of disappearing silently.'
  },
  {
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
                <div key={item.question} className='faq-reference-item' data-open={open ? 'true' : 'false'}>
                  <button
                    type='button'
                    className='faq-reference-question'
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenIndex(current => (current === index ? -1 : index))}
                  >
                    <span>{item.question}</span>
                    <span className='faq-reference-toggle' aria-hidden='true'>{open ? '−' : '+'}</span>
                  </button>
                  <div id={`faq-answer-${index}`} className='faq-reference-answer' aria-hidden={!open}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
