'use client'

import { TENURES } from '@/lib/portfolio'
import { useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'
const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

/**
 * How many roles precede each tenure, so the reveal cascade is staggered across
 * the flat list rather than restarting inside every group — the markup is
 * nested but it should read as one sequence. Derived at module scope: `TENURES`
 * is static, and a counter mutated during render is not.
 */
const TENURE_OFFSETS = TENURES.reduce<number[]>(
  (offsets, tenure) => [...offsets, offsets[offsets.length - 1] + tenure.roles.length],
  [0]
)

const ROLE_COUNT = TENURE_OFFSETS[TENURE_OFFSETS.length - 1]

export function ExperienceSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.06)

  return (
    <section id='experience' className='saas-section border-rule border-t px-6 py-20 md:px-12 md:py-32 lg:px-20'>
      <div className={CONTAINER}>
        <div className='experience-layout'>
          <div className='experience-intro'>
            <SectionIntro
              tag='EXPERIENCE'
              title='Ten years inside the work I now automate.'
              blurb='I did AP, reconciliation and month-end close by hand before I automated any of it. That is why the workflows I build match how a business actually runs, rather than how a process diagram says it should.'
              margin=''
              titleClassName='mt-5 text-[clamp(1.9rem,3.2vw,3.4rem)]'
            />
          </div>

          <div ref={ref} className='experience-history relative'>
            <p className='experience-history-label'>
              ROLE HISTORY <span>01 — {String(ROLE_COUNT).padStart(2, '0')}</span>
            </p>

            <div className='experience-tenures'>
              {TENURES.map((tenure, tenureIndex) => (
                <section key={tenure.company} className='experience-tenure' aria-label={tenure.company}>
                  <header className='experience-tenure-head'>
                    <span
                      aria-hidden='true'
                      className='experience-tenure-rule'
                      style={{
                        transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 1s cubic-bezier(0.16,1,0.3,1) 120ms'
                      }}
                    />
                    <h3 className='experience-tenure-company'>{tenure.company}</h3>
                    <span className='experience-tenure-span'>{tenure.span}</span>
                  </header>

                  <ol className='experience-roles'>
                    {tenure.roles.map((role, roleIndex) => {
                      const delay = 120 + (TENURE_OFFSETS[tenureIndex] + roleIndex) * 130

                      return (
                        <li
                          key={role.index}
                          className='experience-role'
                          style={{
                            opacity: inView ? 1 : 0,
                            transform: inView ? 'translate3d(0,0,0)' : 'translate3d(-20px,18px,0)',
                            transition:
                              `opacity .9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, ` +
                              `transform .9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
                          }}
                        >
                          <div className='experience-role-meta'>
                            <span className='experience-role-index'>{role.index}</span>
                            <span className='experience-role-period'>{role.period}</span>
                            {role.arrangement && (
                              <span className='experience-role-arrangement'>{role.arrangement}</span>
                            )}
                          </div>

                          <div className='experience-role-body'>
                            <h4 className='experience-role-title' style={{ fontFamily: DISPLAY_FONT }}>
                              {role.role}
                            </h4>

                            <p className='experience-role-achievement'>{role.achievement}</p>
                            <p className='experience-role-description'>{role.description}</p>

                            <ul className='experience-role-stack'>
                              {role.stack.map(item => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              ))}

              {/* The chronology is only half the argument. This turns four
                  finance roles into the reason the rest of the page exists,
                  and hands the reader back to the work. */}
              <p
                className='experience-thesis'
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(14px)',
                  transition: `opacity .9s cubic-bezier(0.16,1,0.3,1) ${120 + ROLE_COUNT * 130}ms, transform .9s cubic-bezier(0.16,1,0.3,1) ${120 + ROLE_COUNT * 130}ms`
                }}
              >
                Every system on this page began as something on that list. <a href='#portfolio'>See what they became</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
