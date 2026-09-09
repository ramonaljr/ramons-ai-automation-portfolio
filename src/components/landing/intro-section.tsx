'use client'

import { useEffect, useRef, useState } from 'react'

import { motion, useScroll, useTransform } from 'motion/react'

import { GreetingWord } from '@/components/landing/greeting-word'
import { READABLE, usePrefersReducedMotion } from '@/components/landing/motion'
import { PROFILE } from '@/lib/portfolio'
import { SectionIntro, introStep } from '@/components/landing/section-intro'

const DISPLAY_FONT = 'var(--font-editorial), Georgia, serif'

const CONTACT = [
  { label: 'Email', value: 'ramonvallejerajr@gmail.com', href: 'mailto:ramonvallejerajr@gmail.com' },
  { label: 'Location', value: 'Philippines — working across time zones', href: null },
  { label: 'Availability', value: 'Open to new projects', href: null }
] as const

// Matches the Tag used by the other sections on this page.

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

export function IntroSection() {
  const { ref, inView } = useInView(0.1)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [54, -42])
  const portraitRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-1.8, 0, 1.2])
  const timelineY = useTransform(scrollYProgress, [0.12, 0.88], ['0%', 'calc(100% - 12px)'])

  const reveal = (delay: number) => ({
    opacity: inView ? 1 : 0,
    filter: inView ? 'blur(0px)' : 'blur(14px)',
    transform: inView ? 'translateY(0px)' : 'translateY(20px)',
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
  })

  return (
    <section
      id='about'
      className='about-cinema saas-section border-rule relative overflow-hidden border-t px-6 py-32 md:px-12 lg:px-20'
    >
      {/* The bio is a two-column block that tops out around 1120px — a wider
          prose column would overrun a comfortable line length. Centring it
          keeps the leftover width as balanced margins instead of a single
          dead strip down the right of wide screens. */}
      <div className='about-cinema-word' aria-hidden='true'>
        OPERATOR
      </div>
      <div className='about-cinema-line' aria-hidden='true' />

      <div ref={ref} className='relative z-2 mx-auto max-w-[1240px]'>
        {/* ── Section header ─────────────────────────────────────────────── */}
        <SectionIntro tag='ABOUT' margin='mb-16' />

        <div className='saas-about-panel grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20'>
          {/* ── Left: the introduction ──────────────────────────────────── */}
          <div className={READABLE}>
            <div style={introStep(inView, reducedMotion, { delay: 120, y: 40, blur: 14, duration: 1.15 })}>
              <h2
                className='text-ink text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-light tracking-tight'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                <GreetingWord className='text-ink-3' />
                <span className='text-ink-3'>, I&apos;m</span>
                <br />
                Ramon A. Vallejera, Jr.
              </h2>
              <p className='text-ink-2 mt-4 text-xl font-light sm:text-2xl' style={{ fontFamily: DISPLAY_FONT }}>
                AI Automation Specialist
                <span className='text-ink-3'> · MBA</span>
              </p>
            </div>

            <div className='mt-8 max-w-[58ch] space-y-5' style={reveal(140)}>
              <p className='about-cinema-lead' style={{ fontFamily: DISPLAY_FONT }}>
                I spent a decade inside the work I now automate.
              </p>
              <p className='text-ink-2 text-base leading-[1.7]'>
                I handled invoices, reconciliations, approvals, reporting and month-end close by hand. That experience
                taught me where work really slows down—and which checks cannot be skipped.
              </p>
              <p className='text-ink-2 text-base leading-[1.7]'>
                Today I connect the tools companies already use so intake, follow-ups, paperwork and reporting move on
                their own. Every system includes human review where it matters, failure alerts and a clear handover.
              </p>
            </div>

            {/* ── Contact rows ──────────────────────────────────────────── */}
            <div className='mt-10 space-y-3' style={reveal(220)}>
              {CONTACT.map(c => (
                <div key={c.label} className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                  <span className='text-ink-2 w-24 shrink-0 font-mono text-[12px] tracking-widest'>
                    {c.label.toUpperCase()}
                  </span>
                  {c.href ? (
                    <a
                      href={c.href}
                      className='text-ink-2 hover:text-ink border-rule hover:border-rule-strong border-b text-sm transition-colors'
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className='text-ink-2 text-sm'>{c.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* ── CTA + socials ─────────────────────────────────────────── */}
            <div className='mt-10 flex flex-wrap items-center gap-4' style={reveal(300)}>
              <a
                href='#contact'
                className='group bg-ink text-ground hover:bg-ink/90 inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-[14px] tracking-wide transition-colors'
              >
                Book a workflow audit
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
                  <svg width='13' height='13' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
                    <path
                      d='M3 11L11 3M11 3H5M11 3V9'
                      stroke='currentColor'
                      strokeWidth='1.6'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
              </a>

              <a
                href={PROFILE.cv}
                download
                className='border-rule-strong text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[13px] tracking-wide transition-all'
              >
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <path d='M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2' />
                </svg>
                DOWNLOAD CV
              </a>

              <div className='flex items-center gap-2'>
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

          {/* ── Right: portrait ──────────────────────────────────────────── */}
          <motion.div
            className='about-cinema-visual w-full'
            style={reducedMotion ? reveal(180) : { ...reveal(180), y: portraitY, rotate: portraitRotate }}
          >
            <div className='about-cinema-timeline' aria-hidden='true'>
              <span className='about-era about-era-manual'>2015 · MANUAL OPERATIONS</span>
              <span className='about-era about-era-system'>2026 · AUTOMATED SYSTEMS</span>
              <span className='about-timeline-track'>
                <motion.i style={reducedMotion ? undefined : { y: timelineY }} />
              </span>
            </div>

            <div className='relative'>
              {/* The portrait keeps Ramon's identity and pose while the warm
                  editorial workspace carries the page's autumn atmosphere. */}
              <div
                className='saas-portrait-frame about-film-frame bg-surface-raised border-rule overflow-hidden rounded-2xl border'
                data-visible={inView}
              >
                <div className='about-film-meta' aria-hidden='true'>
                  <span>RA · 01</span>
                  <span>BUSINESS × AUTOMATION</span>
                </div>
                <img
                  src='/images/landing/ramon-portrait-autumn.webp'
                  alt='Ramon A. Vallejera, Jr.'
                  width={1120}
                  height={1400}
                  className='h-auto w-full object-cover'
                />
                <div className='about-film-scan' aria-hidden='true' />
              </div>

              {/* Availability chip */}
              <div className='bg-surface-raised border-rule absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm'>
                <span className='relative flex h-1.5 w-1.5'>
                  <span className='absolute -inset-1 animate-[pulse-dot_2s_ease-in-out_infinite] rounded-full bg-emerald-500/30' />
                  <span className='relative h-1.5 w-1.5 rounded-full bg-emerald-500' />
                </span>
                <span className='text-ink-2 font-mono text-[11px] tracking-widest'>AVAILABLE</span>
              </div>
            </div>

            {/* Credentials strip */}
            <div
              className='about-credential-strip divide-rule border-rule bg-surface mt-6 grid grid-cols-3 divide-x overflow-hidden rounded-xl border'
              data-visible={inView}
            >
              {[
                { value: 'AP · GL', label: 'closed by hand for a decade' },
                { value: 'MBA', label: 'business strategy' },
                { value: 'n8n', label: 'cloud + self-hosted' }
              ].map(s => (
                <div key={s.label} className='px-3 py-4 text-center'>
                  <div className='text-ink text-lg font-light' style={{ fontFamily: DISPLAY_FONT }}>
                    {s.value}
                  </div>
                  <div className='text-ink-2 mt-1 text-[11px] leading-tight'>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
