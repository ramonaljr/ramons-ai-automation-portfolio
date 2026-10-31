'use client'

import { useEffect, useRef, useState } from 'react'

import { motion, useScroll, useTransform } from 'motion/react'

import { Download, Play } from 'lucide-react'

import { GreetingWord } from '@/components/landing/greeting-word'
import { IntroVideoDialog } from '@/components/landing/intro-video'
import { ICON_STROKE, READABLE, usePrefersReducedMotion } from '@/components/landing/motion'
import { EXPERIENCE, financeYears, PROFILE } from '@/lib/portfolio'
import { introStep } from '@/components/landing/section-intro'
import { ExperienceJourney } from '@/components/landing/experience-section'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

/**
 * The career in one line per role, oldest first, read from the same data as the
 * full history below so the two cannot disagree.
 */
const CAREER = [...EXPERIENCE].reverse().map(role => ({
  year: role.period.split(' - ')[0].trim(),
  label: role.short
}))

const FOCUS = [
  {
    label: 'I build',
    copy: 'Automated workflows, AI assistants, and connections between the apps your business already uses.'
  },
  {
    label: 'Best fit',
    copy: 'Any team losing time to repetitive admin, disconnected tools and manual handoffs, in finance, sales, support or operations.'
  },
  {
    label: 'You get',
    copy: 'A tested system, failure alerts, documentation and a practical handover.'
  }
] as const

function useInView(threshold = 0.15) {
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

export function IntroSection({ systemCount }: { systemCount: number }) {
  const { ref, inView } = useInView(0.1)
  const [videoOpen, setVideoOpen] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [54, -42])
  const portraitRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-1.8, 0, 1.2])

  const reveal = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(16px)',
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
  })

  const proof = [
    {
      value: `${financeYears()}+ yrs`,
      label: 'in finance & accounting'
    },
    { value: PROFILE.credential, label: 'business strategy' },
    { value: String(systemCount), label: 'systems built' }
  ]

  return (
    <section
      id='about'
      className='about-cinema saas-section border-rule relative overflow-clip border-t px-6 py-16 md:px-12 md:py-24 lg:px-20'
    >
      <div ref={ref} className='relative z-2 mx-auto max-w-[1240px]'>
        {/* Three areas rather than two columns, so phones can put the face
            straight after the name: heading, then portrait and proof, then the
            story. On wide screens the portrait column spans both left rows. */}
        <div className='saas-about-panel grid gap-x-20 gap-y-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-y-10'>
          {/* ── Heading ─────────────────────────────────────────────────── */}
          <div className={`${READABLE} lg:col-start-1 lg:row-start-1`}>
            <div style={introStep(inView, reducedMotion, { delay: 60, y: 16, duration: 0.7 })}>
              <h2
                className='text-ink text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-light tracking-tight'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                <GreetingWord className='text-ink-3' />
                <span className='text-ink-3'>, I&apos;m</span>
                <br />
                {PROFILE.name}
              </h2>
              <p className='text-ink-2 mt-4 text-xl font-light sm:text-2xl' style={{ fontFamily: DISPLAY_FONT }}>
                {PROFILE.title}
                <span className='text-ink-3'> for {PROFILE.audience}</span>
              </p>
            </div>
          </div>

          {/* ── Portrait, proof and career snapshot ─────────────────────── */}
          <motion.div
            className='about-cinema-visual w-full lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start'
            style={reducedMotion ? reveal(180) : { ...reveal(180), y: portraitY, rotate: portraitRotate }}
          >
            {/* The casual, smiling portrait; the hero carries the office one,
                and the same photo twice would read as filler. It doubles as
                the cover of the intro video, which opens in a pop-up. */}
            <div
              className='saas-portrait-frame about-film-frame bg-surface-raised border-rule overflow-hidden rounded-2xl border'
              data-visible={inView}
            >
              <button
                type='button'
                onClick={() => setVideoOpen(true)}
                aria-label={`Play intro video, ${PROFILE.introVideo.length}`}
                className='about-video-cover group block w-full cursor-pointer'
              >
                <img
                  src='/images/landing/ramon-portrait-casual.webp'
                  alt={PROFILE.name}
                  width={880}
                  height={1100}
                  loading='lazy'
                  className='h-auto w-full object-cover'
                />
                <span className='about-video-play' aria-hidden='true'>
                  <span className='about-video-play-icon'>
                    <Play size={18} strokeWidth={ICON_STROKE} fill='currentColor' />
                  </span>
                  <span>Watch my intro</span>
                  <span className='text-ink-3'>{PROFILE.introVideo.length}</span>
                </span>
              </button>
              <div className='about-film-scan' aria-hidden='true' />
            </div>
            <IntroVideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} />

            <dl
              className='about-credential-strip divide-rule border-rule bg-surface mt-5 grid grid-cols-3 divide-x overflow-hidden rounded-xl border'
              data-visible={inView}
            >
              {proof.map(item => (
                <div key={item.label} className='flex flex-col-reverse justify-end px-3 py-4 text-center'>
                  <dt className='text-ink-2 mt-1 text-xs leading-tight'>{item.label}</dt>
                  <dd className='text-ink text-xl font-light' style={{ fontFamily: DISPLAY_FONT }}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className='border-rule bg-surface mt-5 rounded-xl border px-5 py-4' style={reveal(260)}>
              <p className='text-ink text-sm font-medium'>Career so far</p>
              <ol className='about-career mt-3'>
                {CAREER.map(step => (
                  <li key={step.year}>
                    <span className='about-career-year'>{step.year}</span>
                    <span>{step.label}</span>
                  </li>
                ))}
                <li className='about-career-now'>
                  <span className='about-career-year'>Now</span>
                  <span>Automation systems for {PROFILE.audience}</span>
                </li>
              </ol>
              <a href='#experience' className='about-career-link'>
                Full career history
              </a>
            </div>
          </motion.div>

          {/* ── The story ───────────────────────────────────────────────── */}
          <div className={`${READABLE} lg:col-start-1 lg:row-start-2`}>
            <div className='max-w-[58ch] space-y-5' style={reveal(140)}>
              <p className='about-cinema-lead' style={{ fontFamily: DISPLAY_FONT }}>
                I spent a decade inside the work I now automate.
              </p>
              <p className='text-ink-2 text-base leading-[1.7]'>
                Supplier invoices and tax filings, project cost checks, a 10-person month-end close, then forecasting: I
                did that work by hand for over ten years. It taught me where work really slows down, and which checks
                cannot be skipped. Those habits carry over to the routine work of any team, not only finance.
              </p>
              <p className='text-ink-2 text-base leading-[1.7]'>
                Now I connect the tools a business already uses so requests, lead follow-ups, support tickets, paperwork
                and reporting move on their own, whether the team sits in finance, sales, support or operations. Human
                review stays where it matters, with failure alerts and a clear handover.
              </p>
            </div>

            {/* A compact buyer's summary in one block, not three cards: enough
                to place the work without repeating Services or Experience. */}
            <dl className='border-rule bg-surface divide-rule mt-10 divide-y rounded-xl border' style={reveal(190)}>
              {FOCUS.map(item => (
                <div key={item.label} className='grid gap-1 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4'>
                  <dt className='text-ink text-sm font-medium sm:pt-0.5'>{item.label}</dt>
                  <dd className='text-ink-2 text-sm leading-relaxed'>{item.copy}</dd>
                </div>
              ))}
            </dl>

            {/* Status, CV and socials. The email lives in Contact and the
                footer; no "Book a free call" here either, since About leads
                into the career history rather than out to a form. */}
            <p className='text-ink-2 mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm' style={reveal(220)}>
              <span className='about-status-dot' aria-hidden='true' />
              <span className='text-ink'>Open to new projects</span>
              <span className='text-ink-3' aria-hidden='true'>
                ·
              </span>
              <span>{PROFILE.location}, working across time zones</span>
            </p>

            <div className='mt-6 flex flex-wrap items-center gap-4' style={reveal(300)}>
              <a
                href={PROFILE.cv}
                download
                className='border-rule-strong text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[13px] transition-all'
              >
                <Download size={14} strokeWidth={ICON_STROKE} aria-hidden='true' />
                Download CV
              </a>

              <div className='flex flex-wrap items-center gap-2'>
                {PROFILE.socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong hover:bg-ink/3 rounded-full border px-4 py-2.5 text-[12px] tracking-wide transition-all'
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExperienceJourney />
    </section>
  )
}
