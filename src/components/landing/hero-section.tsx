'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'

import { HERO_STATS, PROFILE } from '@/lib/portfolio'
import { CountUp, Cta, usePrefersReducedMotion } from '@/components/landing/motion'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/**
 * Kept short on purpose. These set inside a clipped, absolutely-positioned
 * line, so a phrase that wraps loses its second line entirely — at 375px the
 * previous "capturing new leads." rendered as "capturing". Short phrases keep
 * the headline on one line down to 360px; `LONGEST_WORK` below is the
 * belt-and-braces guarantee for widths and fallback fonts we have not measured.
 */
const ROTATING_WORK = ['data entry.', 'new leads.', 'follow-ups.', 'reporting.']

/**
 * Reserves the line box in normal flow. The rotating word itself is absolutely
 * positioned so the outgoing and incoming words can cross-fade over each other,
 * which means it contributes no height — without this sizer the box falls back
 * to a fixed `min-height` that cannot know how the text actually wrapped.
 */
const LONGEST_WORK = ROTATING_WORK.reduce((a, b) => (b.length > a.length ? b : a))

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
    <section className='hero-autumn relative flex min-h-dvh flex-col justify-center overflow-hidden'>
      {/* No backdrop of its own: the autumn video and falling leaves behind
          the whole page show through, so the hero and the sections below share
          one scene. `.hero-autumn` only adds a wash behind the copy. */}

      <div className='relative z-10 mx-auto flex w-full max-w-390 flex-1 flex-col justify-center px-6 pt-32 pb-10 md:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-20 2xl:max-w-440'>
        <div className='koisei-hero-copy w-full max-w-[62rem] text-left lg:max-w-[58%]'>
          {/* Phones get a face too, just smaller: the portrait card below only
              appears once there is a column to put it in. */}
          <div
            className={`hero-byline mb-6 flex items-center gap-3 transition-all duration-700 lg:hidden ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <img
              src='/images/landing/ramon-portrait-autumn.webp'
              alt=''
              width={96}
              height={96}
              className='hero-byline-avatar'
            />
            <span className='text-ink-2 text-sm leading-tight'>
              <strong className='text-ink block font-medium'>{PROFILE.name}</strong>
              {PROFILE.title} · MBA
            </span>
          </div>

          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className='inline-flex items-center gap-3'>
              <span className='bg-ink/25 h-px w-8' />
              {/* Positioning in order of breadth: what I do for anyone, the
                  field I know from the inside, then the credential. */}
              <span className='eyebrow'>AI automation · Accounting &amp; finance · MBA</span>
            </span>
          </div>

          <h1
            aria-label='Let automation handle data entry, new leads, follow-ups, and reporting.'
            className={`display-xl text-ink text-left text-[clamp(3rem,6.4vw,7rem)] leading-[0.88] font-light transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ fontFamily: DISPLAY_FONT }}
          >
            <span className='block'>Let automation handle</span>
            <span
              className='hero-word-shell hero-rotating-line relative block overflow-hidden italic'
              aria-hidden='true'
            >
              <span className='invisible block'>{LONGEST_WORK}</span>
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
            I connect the tools you already use so work moves on its own, from lead follow-up to invoices and
            month-end close. Built by a former AP supervisor and accountant with an MBA.
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

        {/* People hire people: a face above the fold does trust work before a
            word is read. The warm office portrait carries the autumn palette;
            the studio portrait stays with the fuller story in About. */}
        <figure className='hero-portrait hidden lg:block' data-visible={isVisible}>
          <div className='hero-portrait-frame'>
            <img
              src='/images/landing/ramon-portrait-autumn.webp'
              alt={PROFILE.name}
              width={1120}
              height={1400}
              fetchPriority='high'
              className='hero-portrait-image'
            />
          </div>

          <span className='hero-portrait-chip'>
            <i aria-hidden='true' />
            Available for new projects
          </span>

          <figcaption className='hero-portrait-caption'>
            <strong style={{ fontFamily: DISPLAY_FONT }}>{PROFILE.name}</strong>
            <span>Automation specialist · former AP supervisor &amp; accountant · MBA</span>
          </figcaption>
        </figure>
      </div>

      {/* Stats. Previously `absolute bottom-12`, which on a short viewport put
          them straight through the headline. In flow, the hero simply grows. */}
      <div
        className={`relative z-30 mx-auto w-full max-w-390 px-6 pb-14 transition-all delay-500 duration-700 md:px-12 lg:px-20 2xl:max-w-440 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Three across at every width. Wrapping left the third figure alone
            on its own row on phones. */}
        <div className='border-rule grid grid-cols-3 items-start gap-x-4 border-t pt-8 sm:flex sm:justify-center sm:gap-x-12 lg:gap-x-20'>
          {HERO_STATS.map(stat => (
            <div key={stat.label} className='flex flex-col gap-1.5'>
              <span
                data-countup
                className='display-md text-ink text-2xl font-light sm:text-3xl lg:text-[2.5rem]'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                <CountUp start={isVisible}>{stat.value}</CountUp>
              </span>
              <span className='text-meta text-ink-3 max-w-[18ch]'>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
