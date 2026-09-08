'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { HERO_STATS } from '@/lib/portfolio'
import { CountUp, Cta, usePrefersReducedMotion } from '@/components/landing/motion'
import { SaasFlowField } from '@/components/landing/saas-flow-field'
import { PetalField } from '@/components/landing/petal-field'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'
const ROTATING_WORK = ['data entry.', 'capturing new leads.', 'routine follow-ups.', 'recurring reports.']

/**
 * `ready` lets the page gate the reveal on the intro animation finishing,
 * preserving the original choreography. Defaults to self-revealing on mount.
 */
export function HeroSection({ ready }: { ready?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // Flip in a frame callback rather than synchronously, so the browser paints
    // the pre-transition state first and the CSS transition actually runs.
    const raf = requestAnimationFrame(() => setMounted(true))

    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (reduced) return

    const interval = window.setInterval(() => {
      setWordIndex(current => (current + 1) % ROTATING_WORK.length)
    }, 2800)

    return () => window.clearInterval(interval)
  }, [reduced])

  const isVisible = ready ?? mounted

  return (
    <section className='bg-ground relative flex min-h-dvh flex-col justify-center overflow-hidden'>
      <SaasFlowField />
      <PetalField className='z-4' />

      <div className='relative z-10 mx-auto flex w-full max-w-390 flex-1 flex-col justify-center px-6 pt-32 pb-10 md:px-12 lg:px-20 2xl:max-w-440'>
        <div className='koisei-hero-copy w-full max-w-[62rem] text-left lg:max-w-[58%]'>
          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className='inline-flex items-center gap-3'>
              <span className='bg-ink/25 h-px w-8' />
              <span className='eyebrow'>Less admin · faster follow-up · more time</span>
            </span>
          </div>

          <h1
            aria-label='Let automation handle data entry, capturing new leads, routine follow-ups, and recurring reports.'
            className={`display-xl text-ink text-left text-[clamp(3.25rem,6.4vw,7rem)] leading-[0.88] font-light transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ fontFamily: DISPLAY_FONT }}
          >
            <span className='block'>Let automation handle</span>
            <span className='hero-word-shell hero-rotating-line relative block min-h-[1.04em] overflow-hidden italic' aria-hidden='true'>
              <AnimatePresence initial={false} mode='wait'>
                <motion.span
                  key={ROTATING_WORK[wordIndex]}
                  initial={reduced ? false : { opacity: 0, y: '42%', filter: 'blur(14px)' }}
                  animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
                  exit={reduced ? undefined : { opacity: 0, y: '-35%', filter: 'blur(12px)' }}
                  transition={{ duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
                  className='hero-outcome absolute inset-x-0 top-0 block'
                >
                  {ROTATING_WORK[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Supporting line + actions. The hero previously ran headline →
              stats with no call to action anywhere above the fold, so the
              first thing a visitor could act on was ten sections down. */}
          <p
            className={`text-lead text-ink-2 mt-9 max-w-[53ch] transition-all delay-200 duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            I connect the tools you already use so information goes where it needs to, new customers get a faster
            response, and your team gets hours back every week.
          </p>

          <div
            className={`mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 transition-all delay-300 duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <Cta href='#contact'>Find what to automate</Cta>
            <Cta href='#portfolio' tone='secondary'>
              See examples
            </Cta>
          </div>
        </div>
      </div>

      {/* Stats. Previously `absolute bottom-12`, which on a short viewport put
          them straight through the headline. In flow, the hero simply grows. */}
      <div
        className={`relative z-30 mx-auto w-full max-w-390 px-6 pb-14 transition-all delay-500 duration-700 md:px-12 lg:px-20 2xl:max-w-440 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className='border-rule flex flex-wrap items-start justify-center gap-x-12 gap-y-8 border-t pt-8 lg:gap-x-20'>
          {HERO_STATS.map(stat => (
            <div key={stat.label} className='flex flex-col gap-1.5'>
              <span
                data-countup
                className='display-md text-ink text-3xl font-light lg:text-[2.5rem]'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                <CountUp start={isVisible}>{stat.value}</CountUp>
              </span>
              <span className='text-meta text-ink-3 max-w-[18ch]'>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* A tonal fade joins the hero to the routed system below. Keeping this
          blur-free lets the petal-to-packet morph remain crisp in Chromium. */}
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 z-20'
        style={{
          height: '30%',
          background:
            'linear-gradient(to top, var(--ground) 0%, color-mix(in oklch, var(--ground) 85%, transparent) 35%,' +
            ' color-mix(in oklch, var(--ground) 40%, transparent) 65%, transparent 100%)'
        }}
      />
    </section>
  )
}
