'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { CONTAINER, DISPLAY_FONT, SECTION, usePrefersReducedMotion } from '@/components/landing/motion'
import { PRINCIPLES } from '@/lib/portfolio'

const AUTO_PLAY_DURATION = 6500

const slideVariants = {
  enter: (direction: number) => ({ y: direction > 0 ? '-10%' : '10%', opacity: 0, scale: 0.985 }),
  center: { y: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? '10%' : '-10%', opacity: 0, scale: 0.985 })
}

function ProcessMap() {
  return (
    <div className='build-map' aria-hidden='true'>
      <div className='build-map-path' />
      {['INPUT', 'RULES', 'EDGE CASES', 'MAP'].map((label, index) => (
        <div key={label} className='build-map-node' style={{ '--map-index': index } as CSSProperties}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{label}</strong>
        </div>
      ))}
      <i className='build-map-packet' />
    </div>
  )
}

function IntelligenceMap() {
  return (
    <div className='build-intelligence' aria-hidden='true'>
      <div className='build-intelligence-source build-intelligence-source-a'><span>NUMBERS</span><strong>FIXED RULES</strong></div>
      <div className='build-intelligence-source build-intelligence-source-b'><span>DOCUMENT</span><strong>AI READ</strong></div>
      <div className='build-intelligence-lines'><i /><i /></div>
      <div className='build-intelligence-result'><i /><span>CHECKED</span><strong>100.00</strong></div>
    </div>
  )
}

function GuardMap() {
  return (
    <div className='build-guard' aria-hidden='true'>
      <div className='build-guard-core'><span>HUMAN</span><strong>REVIEW</strong></div>
      {[
        ['01', 'ERROR CHECK', 'READY'],
        ['02', 'HUMAN REVIEW', 'ACTIVE'],
        ['03', 'TEAM ALERT', 'ARMED']
      ].map(([number, label, state], index) => (
        <div key={number} className={`build-guard-event build-guard-event-${index + 1}`}>
          <span>{number}</span><strong>{label}</strong><i>{state}</i>
        </div>
      ))}
    </div>
  )
}

function ActiveVisual({ index }: { index: number }) {
  if (index === 0) return <ProcessMap />
  if (index === 1) return <IntelligenceMap />

  return <GuardMap />
}

export function PrinciplesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()

  const select = useCallback((nextIndex: number) => {
    setActiveIndex(current => {
      if (current === nextIndex) return current
      setDirection(nextIndex > current ? 1 : -1)

      return nextIndex
    })
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setActiveIndex(current => (current + 1) % PRINCIPLES.length)
  }, [])

  const previous = useCallback(() => {
    setDirection(-1)
    setActiveIndex(current => (current - 1 + PRINCIPLES.length) % PRINCIPLES.length)
  }, [])

  useEffect(() => {
    if (paused || reduced) return
    const timer = window.setInterval(next, AUTO_PLAY_DURATION)

    return () => window.clearInterval(timer)
  }, [next, paused, reduced])

  const active = PRINCIPLES[activeIndex]

  return (
    <section id='principles' className={`${SECTION} build-tabs-section`}>
      <div className={CONTAINER}>
        <div className='grid items-start gap-12 lg:grid-cols-12 lg:gap-16'>
          <div className='order-2 flex flex-col justify-center lg:order-1 lg:col-span-5 lg:pt-5'>
            <div className='mb-10'>
              <p className='eyebrow'>HOW I BUILD</p>
              <h2 className='mt-5 max-w-[11ch] text-[clamp(2.8rem,5.5vw,5.8rem)] leading-[0.92] font-light tracking-[-0.05em]' style={{ fontFamily: DISPLAY_FONT }}>
                Systems that keep working.
              </h2>
              <p className='text-body mt-6 max-w-[31rem]'>Three controls I design into every financial and operational workflow before it goes live.</p>
            </div>

            <div className='build-tabs-list' role='tablist' aria-label='How I build reliable automation'>
              {PRINCIPLES.map((principle, index) => {
                const isActive = index === activeIndex

                return (
                  <button
                    key={principle.n}
                    id={`build-tab-${index}`}
                    type='button'
                    role='tab'
                    aria-selected={isActive}
                    aria-controls='build-tab-panel'
                    onClick={() => select(index)}
                    className='build-tab'
                    data-active={isActive ? 'true' : 'false'}
                  >
                    <span className='build-tab-progress' aria-hidden='true'>
                      {isActive && !paused && !reduced && (
                        <motion.i
                          key={`${activeIndex}-${paused}`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: AUTO_PLAY_DURATION / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                    <span className='build-tab-number'>/{principle.n}</span>
                    <span className='min-w-0 flex-1'>
                      <strong>{principle.title}</strong>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: reduced ? 0 : 0.35 }}
                            className='build-tab-description'
                          >
                            {principle.sub}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='order-1 lg:order-2 lg:col-span-7'>
            <div className='build-gallery' onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <AnimatePresence initial={false} custom={direction} mode='wait'>
                <motion.div
                  id='build-tab-panel'
                  key={activeIndex}
                  role='tabpanel'
                  aria-labelledby={`build-tab-${activeIndex}`}
                  custom={direction}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={reduced ? { duration: 0 } : { duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
                  className='build-gallery-panel'
                  onClick={next}
                >
                  <div className='build-gallery-topline'><span>CONTROL / {active.n}</span><span>PRODUCTION STANDARD</span></div>
                  <ActiveVisual index={activeIndex} />
                  <div className='build-gallery-caption'>
                    <span>{active.n}</span>
                    <div>
                      <h3 style={{ fontFamily: DISPLAY_FONT }}>{active.title}</h3>
                      <p>{active.body}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className='build-gallery-controls'>
                <button type='button' onClick={event => { event.stopPropagation(); previous() }} aria-label='Previous principle'>←</button>
                <button type='button' onClick={event => { event.stopPropagation(); next() }} aria-label='Next principle'>→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
