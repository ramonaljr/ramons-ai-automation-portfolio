'use client'

import { useEffect, useState, useRef } from 'react'

const words = ['automate', 'delegate', 'execute', 'scale']

// Headline face — matches the IBM Plex Sans used by the sections below,
// so the grafted hero and the page it sits on read as one design.
const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

// Settled colour once a letter's gradient pass has finished. The dark original
// resolved to white; on the cream ground it resolves to the page's ink.
const INK = '#111'

// Retuned for a light ground. The dark template used pastels (#eca8d6, #a78bfa,
// #67e8f9, #fbbf24) chosen to glow against black — on #F5F4F0 they wash out to
// near-invisible, so these are the deeper, more saturated cousins.
const gradientColors = ['#c026a3', '#6d28d9', '#0e7490', '#c2620a', '#c026a3']

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

        // lerp hex colours
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
    <section className='relative flex min-h-screen flex-col items-start justify-center overflow-hidden bg-[#F5F4F0]'>
      {/* Background video — dark footage, dialled back and warmed so it reads
          as a soft backdrop on cream rather than a black hole. */}
      <div className='absolute inset-0 z-0'>
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden='true'
          className='h-full w-full object-cover object-center opacity-[0.78]'
          style={{ filter: 'saturate(1.35) brightness(1.06) contrast(1.02)' }}
        >
          <source src='/video/hero-compute.mp4' type='video/mp4' />
        </video>
        {/* Cream veil from the left so the headline always has a clean ground */}
        <div className='absolute inset-0 bg-gradient-to-r from-[#F5F4F0] via-[#F5F4F0]/70 to-[#F5F4F0]/5' />
        <div className='absolute inset-0 bg-gradient-to-b from-[#F5F4F0]/60 via-transparent to-[#F5F4F0]/85' />
      </div>

      {/* Subtle grid lines — inverted from white/10 to ink for the light ground */}
      <div className='pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-40'>
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className='absolute h-px bg-black/[0.06]'
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className='absolute w-px bg-black/[0.06]'
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className='relative z-10 mx-auto w-full max-w-[1560px] px-6 py-32 md:px-12 lg:px-20 lg:py-40 2xl:max-w-[1760px]'>
        <div className='lg:max-w-[55%]'>
          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className='inline-flex items-center gap-3 font-mono text-sm text-black/50'>
              <span className='h-px w-8 bg-black/25' />
              Autonomous AI agents for distributed computing
            </span>
          </div>

          {/* Main headline */}
          <div className='mb-12'>
            <h1
              className={`text-left text-[clamp(2rem,6vw,7rem)] leading-[0.92] font-light tracking-tight text-[#111] transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ fontFamily: DISPLAY_FONT }}
            >
              <span className='block whitespace-nowrap'>Distributed compute,</span>
              <span className='block whitespace-nowrap'>
                agents that{' '}
                <span className='relative inline-block'>
                  <BlurWord word={words[wordIndex]} trigger={wordIndex} />
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Stats — 3 metrics static, no auto-scroll */}
      <div
        className={`absolute right-0 bottom-12 left-0 z-30 px-6 transition-all delay-500 duration-700 md:px-12 lg:px-20 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className='mx-auto flex max-w-[1400px] items-start gap-10 lg:gap-20 2xl:max-w-[1600px]'>
          {[
            { value: '3500+', label: 'autonomous agents active' },
            { value: '99.7%', label: 'distributed uptime' },
            { value: '<50ms', label: 'execution latency' }
          ].map(stat => (
            <div key={stat.label} className='flex flex-col gap-2'>
              <span
                className='text-3xl font-light tracking-tight text-[#111] lg:text-4xl'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {stat.value}
              </span>
              <span className='text-xs leading-tight text-black/45'>{stat.label}</span>
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
            'linear-gradient(to top, #F5F4F0 0%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.4) 65%, transparent 100%)'
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
