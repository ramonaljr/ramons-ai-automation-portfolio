'use client'

import { useEffect, useState, useRef } from 'react'

import { HERO_STATS } from '@/lib/portfolio'
import { CountUp, Cta, ParallaxLayer } from '@/components/landing/motion'
import { PetalField } from '@/components/landing/petal-field'

/**
 * The rotating word names something the reader recognises.
 *
 * This has been through three sets. It started as ['automate', 'reconcile',
 * 'integrate', 'scale'] — the services on offer, which any automation
 * freelancer could claim. It became the failure modes prevented ('quietly',
 * 'under load', 'on a retry'), which differentiated but put the two most
 * technical words on the page in its largest type: a buyer who is not an
 * engineer does not know what failing "on a retry" means.
 *
 * These are the jobs themselves, in the words the person paying for the work
 * already uses. The headline reads "Save hours every week by automating
 * invoicing" and stays true for every option.
 *
 * Terminal on its line, as always: BlurWord is inline-block, so anything after
 * it shifts every 2.5s as the word length changes.
 */
const words = ['invoicing', 'approvals', 'reporting', 'data entry']

// Headline face — matches the IBM Plex Sans used by the sections below,
// so the grafted hero and the page it sits on read as one design.
const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

// Settled color once a letter's illumination pass has finished.
const INK = '#2A2724'

// A single-hue heat ramp, not a rainbow.
//
// This was magenta → violet → cyan → orange: four unrelated hues, which is the
// most recognizable "AI-generated site" signature there is, and none of them
// belonged to the page's own warm palette. The word now warms from ink to the
// site's terracotta accent at its center and cools back — the letters still
// illuminate as they land, but in one color the rest of the page also speaks.
const gradientColors = ['#4A3F36', '#8C4E2A', '#B4652F', '#8C4E2A', '#4A3F36']

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split('')
  const STAGGER = 45 // ms between each letter
  const DURATION = 500 // blur+opacity fade duration per letter
  const GRADIENT_HOLD = STAGGER * letters.length + DURATION + 200

  const [letterStates, setLetterStates] = useState<{ opacity: number; blur: number }[]>(
    letters.map(() => ({ opacity: 0, blur: 20 }))
  )

  const [showGradient, setShowGradient] = useState(true)
  const framesRef = useRef<number[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // reset
    framesRef.current.forEach(cancelAnimationFrame)
    timersRef.current.forEach(clearTimeout)
    framesRef.current = []
    timersRef.current = []

    setLetterStates(letters.map(() => ({ opacity: 0, blur: 20 })))
    setShowGradient(true)

    // stagger each letter
    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        const start = performance.now()

        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1)
          const eased = 1 - Math.pow(1 - progress, 3)

          setLetterStates(prev => {
            const next = [...prev]

            next[i] = { opacity: eased, blur: 20 * (1 - eased) }

            return next
          })

          if (progress < 1) {
            const id = requestAnimationFrame(tick)

            framesRef.current.push(id)
          }
        }

        const id = requestAnimationFrame(tick)

        framesRef.current.push(id)
      }, i * STAGGER)

      timersRef.current.push(t)
    })

    // remove gradient once all letters are settled
    const gt = setTimeout(() => setShowGradient(false), GRADIENT_HOLD)

    timersRef.current.push(gt)

    return () => {
      framesRef.current.forEach(cancelAnimationFrame)
      timersRef.current.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return (
    <>
      {letters.map((char, i) => {
        const colorIndex = (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1)
        const lower = Math.floor(colorIndex)
        const upper = Math.min(lower + 1, gradientColors.length - 1)
        const t = colorIndex - lower

        // Interpolate hex colors
        const hex2rgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)

          return [r, g, b]
        }

        const [r1, g1, b1] = hex2rgb(gradientColors[lower])
        const [r2, g2, b2] = hex2rgb(gradientColors[upper])
        const r = Math.round(r1 + (r2 - r1) * t)
        const g = Math.round(g1 + (g2 - g1) * t)
        const b = Math.round(b1 + (b2 - b1) * t)

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',

              // Each letter is its own inline-block, and an inline-block whose
              // only content is whitespace collapses to zero width — which
              // rendered "on a retry" with words run together. `pre` holds the space.
              whiteSpace: 'pre',
              opacity: letterStates[i]?.opacity ?? 0,
              filter: `blur(${letterStates[i]?.blur ?? 20}px)`,
              color: showGradient ? `rgb(${r},${g},${b})` : INK,
              transition: 'color 0.4s ease'
            }}
          >
            {char}
          </span>
        )
      })}
    </>
  )
}

/**
 * `ready` lets the page gate the reveal on the intro animation finishing,
 * preserving the original choreography. Defaults to self-revealing on mount.
 */
export function HeroSection({ ready }: { ready?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    // Flip in a frame callback rather than synchronously, so the browser paints
    // the pre-transition state first and the CSS transition actually runs.
    const raf = requestAnimationFrame(() => setMounted(true))

    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const isVisible = ready ?? mounted

  return (
    <section className='bg-ground relative flex min-h-dvh flex-col justify-center overflow-hidden'>
      {/* Background video, graded into the palette.
          It was running `saturate(1.35)` — boosting the footage's pink toward
          the loudest thing on the page, in a hue the rest of the site never
          uses. Pulling saturation down and adding a trace of sepia lands it in
          the same warm neutral family as the ground, so it reads as atmosphere
          behind the headline instead of a photograph competing with it. */}
      <div className='absolute inset-0 z-0'>
        <ParallaxLayer className='absolute inset-0' speed={0.15} direction='down'>
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden='true'
            className='hero-drift h-full w-full object-cover opacity-[0.62]'
            style={{
              // Pushed right of centre: the trunk was landing in the same optical
              // column as the headline's right edge and competing with it.
              objectPosition: '72% center',
              filter: 'saturate(0.42) sepia(0.22) brightness(1.04) contrast(1.06)'
            }}
          >
            <source src='/video/hero-compute.mp4' type='video/mp4' />
          </video>
        </ParallaxLayer>
        {/* The veils stay put: they are what guarantees the headline a clean
            ground, so they must not drift out from under it. */}
        <div className='from-ground via-ground/82 to-ground/10 absolute inset-0 bg-linear-to-r' />
        <div className='from-ground/60 to-ground/85 absolute inset-0 bg-linear-to-b via-transparent' />
      </div>

      {/* Architectural grid. Two repeating-linear-gradients rather than the 20
          absolutely-positioned divs this used to be — same drawing, no DOM, and
          it scales with the viewport instead of snapping to hardcoded percents.
          Masked to fade toward the right so it never competes with the video. */}
      <ParallaxLayer className='pointer-events-none absolute inset-0 z-2' speed={0.06} direction='up'>
        <div
          className='h-full w-full'
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, oklch(0.28 0.014 70 / 0.055) 0 1px, transparent 1px 8.333%),' +
              'repeating-linear-gradient(to bottom, oklch(0.28 0.014 70 / 0.055) 0 1px, transparent 1px 12.5%)',
            maskImage: 'linear-gradient(105deg, black 0%, black 42%, transparent 78%)',
            WebkitMaskImage: 'linear-gradient(105deg, black 0%, black 42%, transparent 78%)'
          }}
        />
      </ParallaxLayer>

      {/* Petals fall through the hero and settle into the constellation the
          rest of the page is drawn in — see PetalField for why. */}
      <PetalField className='z-3' />

      <div className='relative z-10 mx-auto flex w-full max-w-390 flex-1 flex-col justify-center px-6 pt-36 pb-10 md:px-12 lg:px-20 2xl:max-w-440'>
        <div className='lg:max-w-[62%]'>
          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className='inline-flex items-center gap-3'>
              <span className='bg-ink/25 h-px w-8' />
              <span className='eyebrow'>n8n · Zapier · Make</span>
            </span>
          </div>

          {/* Main headline — the reader's question, not the service on offer.
              This led with "n8n, Zapier and Make." above "Workflows that
              automate", which only lands on someone already shopping for a
              platform. The buyer here is an ops or finance lead who knows
              their week is being eaten and has not yet decided the answer is a
              workflow tool, so the platform names moved to the eyebrow and the
              supporting line, where they still carry the search terms.

              Three lines rather than two, because the rotating word has to be
              the last thing on its line. `BlurWord` is inline-block, so any
              text after it shifts horizontally every 2.5s as the word length
              changes ("doing" against "reconciling" is six characters). No
              nowrap anywhere: every line is short enough now to survive 375px
              intact, and wrapping is the safety net if a longer word is added. */}
          <h1
            className={`display-xl text-ink text-left text-[clamp(2.5rem,5.4vw,6rem)] leading-[0.94] font-light transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ fontFamily: DISPLAY_FONT }}
          >
            <span className='block'>Save hours every week</span>
            <span className='block'>by automating</span>
            <span className='block'>
              <span className='relative inline-block'>
                <BlurWord word={words[wordIndex]} trigger={wordIndex} />
              </span>
            </span>
          </h1>

          {/* Supporting line + actions. The hero previously ran headline →
              stats with no call to action anywhere above the fold, so the
              first thing a visitor could act on was ten sections down. */}
          <p
            className={`text-lead text-ink-2 mt-8 max-w-[52ch] transition-all delay-200 duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            Forms, approvals, reports, invoices, and copying data between apps &mdash; handled automatically, with
            alerts if anything breaks, and written down so your team can run it without me.
          </p>

          <div
            className={`mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 transition-all delay-300 duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <Cta href='#contact'>Book a workflow audit</Cta>
            <Cta href='#portfolio' tone='secondary'>
              See the work
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
        <div className='border-rule flex flex-wrap items-start gap-x-12 gap-y-8 border-t pt-8 lg:gap-x-20'>
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

      {/* Progressive blur + cream gradient rising from the bottom, so the hero
          melts into the sections below instead of cutting hard. Mirrors the
          treatment the Agentic template uses on its own hero. */}
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 z-20'
        style={{
          height: '30%',
          background:
            'linear-gradient(to top, var(--ground) 0%, color-mix(in oklch, var(--ground) 85%, transparent) 35%,' +
            ' color-mix(in oklch, var(--ground) 40%, transparent) 65%, transparent 100%)'
        }}
      />
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 z-20'
        style={{
          height: '14%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
        }}
      />
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 z-20'
        style={{
          height: '26%',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
        }}
      />
    </section>
  )
}
