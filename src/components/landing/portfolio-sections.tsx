'use client'

import { useCallback, useState } from 'react'

import { IntroAnimation } from '@/components/landing/intro-animation'
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { HeroSection } from '@/components/landing/hero-section'
import { IntroSection } from '@/components/landing/intro-section'
import { ProblemsSection } from '@/components/landing/problems-section'
import { SectionIntro } from '@/components/landing/section-intro'
import { ProjectsSection } from '@/components/landing/projects-section'
import { PrinciplesSection } from '@/components/landing/principles-section'
import { PixelIcon } from '@/components/landing/pixel-icon'
import { ToolStackSection } from '@/components/landing/tool-stack-section'
import { ExperienceSection } from '@/components/landing/experience-section'
import { ContactSection } from '@/components/landing/contact-section'
import { ArticlesSection } from '@/components/landing/articles-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import {
  ArrowIcon,
  CONTAINER,
  Cta,
  DISPLAY_FONT,
  PAGE,
  READABLE,
  SECTION,
  SECTION_ANCHOR,
  SECTION_CONT,
  rise,
  sweep,
  SWEEP_STEP,
  useInView
} from '@/components/landing/motion'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import type { PostMetadata } from '@/lib/posts'
import { ENGAGEMENTS, PLATFORMS, PROCESS, SERVICES } from '@/lib/portfolio'

// ── Shared primitives ────────────────────────────────────────────────────────

/**
 * Kept as a thin alias so these four call sites read the same as before. The
 * cascade itself lives in SectionIntro, shared with the sections that do not
 * route through here.
 */
function SectionHead({ tag, title, blurb }: { tag: string; title: React.ReactNode; blurb?: string }) {
  return <SectionIntro tag={tag} title={title} blurb={blurb} />
}

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS: ('platform' | 'agents' | 'workflow' | 'integrations' | 'pricing')[] = [
  'agents',
  'workflow',
  'platform',
  'integrations',
  'pricing'
]

function ServicesSection() {
  const { ref, inView } = useInView(0.12)

  const cardAnim = (i: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(36px)',
    filter: inView ? 'blur(0px)' : 'blur(10px)',
    transition: `opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, filter 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, border-color 0.3s, background-color 0.3s`
  })

  return (
    <section id='services' className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag='SERVICES'
          title={
            <>
              What I automate
              <br />
              across your business.
            </>
          }
          blurb='Five ways I take manual work out of a business — from intake and onboarding through approvals, reporting and reconciliation. Every engagement ends with a documented workflow your team can run without me.'
        />

        <div ref={ref} className='grid gap-x-5 gap-y-5 pt-4 sm:grid-cols-2 lg:grid-cols-3'>
          {SERVICES.map((s, i) => (
            <div
              key={s.slug}
              className='group lift-hover border-rule bg-surface hover:border-rule-strong hover:bg-surface-raised relative flex flex-col rounded-2xl border p-7'
              style={cardAnim(i)}
            >
              {/* Icon sits inline at the top-left rather than as a medallion
                  straddling the card edge. The medallion forced the whole card
                  to centre-align under it — which is what put ragged-left body
                  copy in every one of these. */}
              <span className='border-rule bg-ground group-hover:border-rule-strong flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300'>
                <PixelIcon type={SERVICE_ICONS[i] ?? 'platform'} size={28} />
              </span>

              <h3
                className='display-md text-ink mt-6 text-xl leading-snug font-light'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {s.title}
              </h3>

              <p className='text-fine text-ink-2 mt-3 flex-1'>{s.description}</p>

              <div className='mt-5 flex flex-wrap gap-1.5'>
                {s.tools.slice(0, 3).map(t => (
                  <span key={t} className='border-rule bg-ink/2 text-meta text-ink-3 rounded-md border px-2.5 py-1'>
                    {t}
                  </span>
                ))}
              </div>

              {/* A quiet link, not a filled pill. Five ink pills in one grid
                  gave the section five equal shouts and no hierarchy — the
                  card itself is the affordance, so the link only has to name
                  the destination. */}
              <a
                href={`/services/${s.slug}`}
                className='text-fine text-ink mt-6 inline-flex items-center gap-2 self-start border-t border-transparent pt-1 transition-colors'
              >
                <span className='bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:bg-[length:100%_1px]'>
                  View service
                </span>
                <span className='transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1'>
                  <ArrowIcon />
                </span>
              </a>
            </div>
          ))}

          {/* Sixth cell balances the grid and routes to contact. It carries the
              section's one filled CTA, which is now the only one in the grid. */}
          <div
            className='border-rule bg-ink/2.5 flex flex-col justify-center rounded-2xl border p-7'
            style={cardAnim(SERVICES.length)}
          >
            <p className='display-md text-ink text-xl leading-snug font-light' style={{ fontFamily: DISPLAY_FONT }}>
              Not sure which you need?
            </p>
            <p className='text-fine text-ink-2 mt-3 max-w-[30ch]'>
              Describe the process that eats your week and I will tell you where it fits.
            </p>
            <Cta href='/contact' className='mt-6 self-start'>
              Ask me
            </Cta>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Platforms ────────────────────────────────────────────────────────────────

function PlatformsSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id='platforms' className={SECTION_CONT}>
      <div className={CONTAINER}>
        <SectionHead
          tag='PLATFORMS'
          title={
            <>
              The right tool
              <br />
              for the job.
            </>
          }
          blurb='I build in all three. Which one you should use depends on your data, your volume, and who has to maintain it afterwards.'
        />

        <div ref={ref} className='grid gap-5 md:grid-cols-3'>
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                p.primary
                  ? 'border-rule-strong bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]'
                  : 'border-rule bg-surface hover:bg-surface-raised hover:border-rule'
              }`}
              style={sweep(inView, i)}
            >
              {p.primary && (
                <span className='text-ground bg-ink absolute top-6 right-6 rounded px-2 py-1 font-mono text-[11px] tracking-widest'>
                  PRIMARY
                </span>
              )}

              <h3 className='text-ink text-3xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                {p.name}
              </h3>
              <p className='text-ink-2 mt-2 text-sm leading-relaxed'>{p.tagline}</p>

              <ul className='mt-6 space-y-2.5'>
                {p.bestFor.map(b => (
                  <li key={b} className='text-ink-2 flex items-start gap-2.5 text-[14px] leading-snug'>
                    <span className='bg-ink/30 mt-[7px] h-1 w-1 shrink-0 rounded-full' />
                    {b}
                  </li>
                ))}
              </ul>

              <p className='border-rule text-ink-2 mt-6 border-t pt-5 text-[13px] leading-relaxed italic'>{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Process ──────────────────────────────────────────────────────────────────

function ProcessSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id='process' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='PROCESS'
          variant='mono'
          margin='mb-20'
          titleClassName='mt-4 text-[clamp(2.25rem,5vw,4rem)]'
          title='How I build automation'
          blurb={<span className='font-mono'>From business problem to a working automation system.</span>}
        />

        {/* Steps */}
        <div ref={ref} className='grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4'>
          {PROCESS.map((p, i) => (
            <div key={p.step} className={READABLE} style={sweep(inView, i)}>
              {/* Numeral with the rail running to the next step */}
              <div className='flex items-center gap-3'>
                <span className='text-ink text-[42px] leading-none font-light' style={{ fontFamily: DISPLAY_FONT }}>
                  {p.step}
                </span>
                {i < PROCESS.length - 1 && (
                  <span className='hidden flex-1 items-center gap-2 lg:flex' aria-hidden='true'>
                    <span className='bg-ink/25 h-1.5 w-1.5 shrink-0 rounded-full' />
                    <span className='bg-ink/12 h-px flex-1' />
                  </span>
                )}
              </div>

              <h3 className='text-ink mt-7 font-mono text-[14px] font-semibold tracking-[0.18em]'>{p.label}</h3>

              <p className='text-ink mt-3.5 text-[14px] leading-snug font-medium'>{p.summary}</p>

              <p className='text-ink-2 mt-3 text-[13.5px] leading-relaxed'>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing prompt */}
        <div
          className='border-rule bg-surface mt-24 rounded-2xl border px-6 py-14 text-center'
          style={rise(inView, PROCESS.length * SWEEP_STEP)}
        >
          <p className='text-ink-2 font-mono text-[14px] tracking-[0.18em]'>HAVE A PROCESS THAT FEELS TOO MANUAL?</p>
          <a
            href='/#contact'
            className='bg-ink text-ground hover:bg-ink/90 mt-7 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 font-mono text-[13px] tracking-[0.14em] transition-colors'
          >
            Book a workflow audit
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Principles ───────────────────────────────────────────────────────────────

// ── Engagement ───────────────────────────────────────────────────────────────

function EngagementSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id='engagement' className={SECTION_ANCHOR}>
      <div className={CONTAINER}>
        <SectionHead
          tag='WORKING TOGETHER'
          title={
            <>
              Three ways
              <br />
              to start.
            </>
          }
          blurb='Scope and timeline are fixed up front. Pricing depends on systems involved and volume — tell me what you are dealing with and I will quote it.'
        />

        <div ref={ref} className='grid gap-5 md:grid-cols-3'>
          {ENGAGEMENTS.map((e, i) => (
            <div
              key={e.name}
              className={`flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                e.featured
                  ? 'border-rule-strong bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]'
                  : 'border-rule bg-surface hover:bg-surface-raised hover:border-rule'
              }`}
              style={sweep(inView, i)}
            >
              <span className='text-ink-2 font-mono text-[12px] tracking-widest'>{e.duration.toUpperCase()}</span>
              <h3 className='text-ink mt-3 text-2xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                {e.name}
              </h3>
              <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{e.summary}</p>

              <ul className='mt-6 flex-1 space-y-2.5'>
                {e.includes.map(it => (
                  <li key={it} className='text-ink-2 flex items-start gap-2.5 text-[14px] leading-snug'>
                    <span className='bg-ink/30 mt-[7px] h-1 w-1 shrink-0 rounded-full' />
                    {it}
                  </li>
                ))}
              </ul>

              <a
                href='/contact'
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] tracking-wide transition-colors ${
                  e.featured
                    ? 'bg-ink text-ground hover:bg-ink/90'
                    : 'border-rule text-ink-2 hover:text-ink hover:border-rule-strong hover:bg-ink/3 border'
                }`}
              >
                {e.cta}
                <ArrowIcon />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PortfolioSections({ caseStudies, posts }: { caseStudies: CaseStudyMetadata[]; posts: PostMetadata[] }) {
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  return (
    <div id='top' className={PAGE}>
      <IntroAnimation onDone={handleIntroDone} />
      <SiteNav />

      <HeroSection ready={heroReady} />

      {/* Everything from About down sits over the constellation field. The
          wrapper is the positioning context; the canvas is sticky inside it so
          one viewport of pixels covers the whole scroll range. */}
      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          {/* The reader's problem before Ramon's biography. About used to sit
              here, which opened the page on a stranger's CV. */}
          <ProblemsSection caseStudies={caseStudies} />
          <IntroSection />
          <ServicesSection />
          <PlatformsSection />
          <ProjectsSection caseStudies={caseStudies} />
          <ProcessSection />
          <ToolStackSection />
          <PrinciplesSection />
          <ExperienceSection />
          <ArticlesSection posts={posts} />
          <EngagementSection />
          <ContactSection />
          <CtaSection />
          <SiteFooter />
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
