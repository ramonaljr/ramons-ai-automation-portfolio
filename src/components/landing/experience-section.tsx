'use client'

import { useEffect, useRef, useState } from 'react'

import { EXPERIENCE } from '@/lib/portfolio'
import { SectionIntro } from '@/components/landing/section-intro'

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

export function ExperienceSection() {
  const { ref, inView } = useInView(0.06)

  return (
    <section id='experience' className='saas-section border-rule border-t px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <SectionIntro
          tag='EXPERIENCE'
          title={
            <>
              Ten years in the
              <br />
              processes I now automate.
            </>
          }
          blurb='I did AP, reconciliation and month-end close by hand before I automated any of it. That is why the workflows I build match how a business actually runs, rather than how a process diagram says it should.'
        />

        {/* Timeline */}
        <div ref={ref} className='relative'>
          {/* Spine — hidden on mobile where the rail would have nothing to align to */}
          <span
            aria-hidden='true'
            className='bg-rule absolute top-2 bottom-2 left-[7px] hidden w-px origin-top md:block'
            style={{
              transform: inView ? 'scaleY(1)' : 'scaleY(0)',
              opacity: inView ? 1 : 0,
              transition: 'transform 1.4s cubic-bezier(0.16,1,0.3,1) 120ms, opacity .4s ease 120ms'
            }}
          />

          <ol className='space-y-4'>
            {EXPERIENCE.map((r, i) => (
              <li
                key={r.index}
                className='relative md:pl-12'
                style={{
                  opacity: inView ? 1 : 0,
                  filter: inView ? 'blur(0px)' : 'blur(14px)',
                  transform: inView ? 'translate3d(0,0,0) scale(1)' : 'translate3d(-38px,28px,0) scale(.975)',
                  transition:
                    `opacity 1s cubic-bezier(0.16,1,0.3,1) ${120 + i * 170}ms, ` +
                    `filter 1s cubic-bezier(0.16,1,0.3,1) ${120 + i * 170}ms, ` +
                    `transform 1s cubic-bezier(0.16,1,0.3,1) ${120 + i * 170}ms`
                }}
              >
                {/* Node */}
                <span
                  aria-hidden='true'
                  className='experience-node border-ground absolute top-8 left-0 hidden h-[15px] w-[15px] rounded-full border-2 md:block'
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'scale(1)' : 'scale(0)',
                    transition: `opacity .45s ease ${280 + i * 170}ms, transform .55s cubic-bezier(0.16,1,0.3,1) ${280 + i * 170}ms`
                  }}
                />

                <article className='experience-card border-rule bg-surface hover:bg-surface-raised hover:border-rule rounded-2xl border p-7 transition-all duration-300 lg:p-8'>
                  <div className='mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-2'>
                    <span className='text-ink-2 font-mono text-[12px]'>{r.index}</span>
                    <span className='text-ink-2 font-mono text-[12px] tracking-wide'>{r.period}</span>
                    {r.status && <span className='badge badge-accent'>{r.status.toUpperCase()}</span>}
                  </div>

                  <h3
                    className='text-ink text-xl font-light tracking-tight lg:text-2xl'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {r.role}
                  </h3>
                  <p className='text-ink-2 mt-1 text-[14px]'>{r.company}</p>

                  <p className='text-ink-2 mt-5 text-[14px] leading-snug'>{r.achievement}</p>
                  <p className='text-ink-2 mt-3 max-w-3xl text-[14px] leading-relaxed'>{r.description}</p>

                  <div className='mt-5 flex flex-wrap gap-1.5'>
                    {r.stack.map(t => (
                      <span
                        key={t}
                        className='border-rule bg-ink/2 text-ink-2 rounded-md border px-2.5 py-1 text-[12px]'
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
