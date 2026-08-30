"use client"

import { useCallback, useState } from "react"

import { IntroAnimation } from "@/components/landing/intro-animation"
import { SiteNav } from "@/components/landing/site-nav"
import { SiteFooter } from "@/components/landing/site-footer"
import { CtaSection } from "@/components/landing/cta-section"
import { HeroSection } from "@/components/landing/hero-section"
import { IntroSection } from "@/components/landing/intro-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { PixelIcon } from "@/components/landing/pixel-icon"
import { ToolStackSection } from "@/components/landing/tool-stack-section"
import { ExperienceSection } from "@/components/landing/experience-section"
import { ContactSection } from "@/components/landing/contact-section"
import { ArticlesSection } from "@/components/landing/articles-section"
import { ChatWidget } from "@/components/landing/chat-widget"
import { ParticleField } from "@/components/landing/particle-field"
import { ArrowIcon, CONTAINER, DISPLAY_FONT, PAGE, SECTION, rise, TextReveal, useInView } from "@/components/landing/motion"

import type { CaseStudyMetadata } from "@/lib/case-studies"
import type { PostMetadata } from "@/lib/posts"
import { ENGAGEMENTS, PLATFORMS, PRINCIPLES, PROCESS, SERVICES } from "@/lib/portfolio"

// ── Shared primitives ────────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] tracking-widest font-sans text-black/68 bg-black/[0.04]">
      {children}
    </span>
  )
}

function SectionHead({
  tag, title, blurb,
}: {
  tag: string
  title: React.ReactNode
  blurb?: string
}) {
  const { ref, inView } = useInView(0.2)

  return (
    <div ref={ref} className="mb-16" style={rise(inView)}>
      <Tag>{tag}</Tag>
      <TextReveal
        as="h2"
        delay={80}
        className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
      >
        <span style={{ fontFamily: DISPLAY_FONT }}>{title}</span>
      </TextReveal>
      {blurb && <p className="mt-5 text-[15px] leading-relaxed text-black/72 max-w-xl">{blurb}</p>}
    </div>
  )
}

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS: ("platform" | "agents" | "workflow" | "integrations" | "pricing")[] = [
  "agents", "workflow", "platform", "integrations", "pricing",
]

function ServicesSection() {
  const { ref, inView } = useInView(0.05)

  return (
    <section id="services" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag="OUR SERVICES"
          title={<>What I automate<br />across your business.</>}
          blurb="Five ways I take manual work out of a business — from intake and onboarding through approvals, reporting and reconciliation. Every engagement ends with a documented workflow your team can run without me."
        />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-16 pt-10">
          {SERVICES.map((s, i) => (
            <div
              key={s.slug}
              className="group relative flex flex-col rounded-2xl border border-black/[0.07] bg-white/50 px-7 pt-14 pb-8 text-center transition-all duration-300 hover:bg-white hover:border-black/12"
              style={rise(inView, i * 80)}
            >
              {/* Icon medallion, straddling the top edge like the reference */}
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-[#F5F4F0] border border-black/10 flex items-center justify-center transition-colors duration-300 group-hover:border-black/25">
                <PixelIcon type={SERVICE_ICONS[i] ?? "platform"} size={30} />
              </span>

              <h3
                className="text-xl font-light tracking-tight text-[#111] leading-snug"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {s.title}
              </h3>

              <p className="mt-3 text-[14px] leading-relaxed text-black/72 flex-1">
                {s.description}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {s.tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md border border-black/[0.08] bg-black/[0.02] text-[11px] text-black/70">
                    {t}
                  </span>
                ))}
              </div>

              <a
                href={`/services/${s.slug}`}
                className="mt-7 inline-flex items-center justify-center gap-2 self-center pl-5 pr-4 py-2.5 rounded-full bg-[#111] text-white text-[13px] tracking-wide hover:bg-black transition-colors"
              >
                View Services
                <ArrowIcon />
              </a>
            </div>
          ))}

          {/* Sixth cell balances the 3-column grid and routes to contact */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/12 px-7 py-12 text-center"
            style={rise(inView, SERVICES.length * 80)}
          >
            <p
              className="text-lg font-light tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Not sure which<br />you need?
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-black/70 max-w-[22ch]">
              Describe the process that eats your week and I will tell you where it fits.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/12 text-[13px] tracking-wide text-black/72 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
            >
              Ask me
              <ArrowIcon />
            </a>
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
    <section id="platforms" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag="PLATFORMS"
          title={<>The right tool<br />for the job.</>}
          blurb="I build in all three. Which one you should use depends on your data, your volume, and who has to maintain it afterwards."
        />

        <div ref={ref} className="grid md:grid-cols-3 gap-5">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                p.primary
                  ? "border-black/15 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]"
                  : "border-black/[0.07] bg-white/50 hover:bg-white hover:border-black/12"
              }`}
              style={rise(inView, i * 100)}
            >
              {p.primary && (
                <span className="absolute top-6 right-6 text-[11px] tracking-widest font-mono text-white bg-[#111] rounded px-2 py-1">
                  PRIMARY
                </span>
              )}

              <h3
                className="text-3xl font-light tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-black/72 leading-relaxed">{p.tagline}</p>

              <ul className="mt-6 space-y-2.5">
                {p.bestFor.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-[14px] text-black/70 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-black/30 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <p className="mt-6 pt-5 border-t border-black/[0.07] text-[13px] leading-relaxed text-black/68 italic">
                {p.note}
              </p>
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
    <section id="process" className={SECTION}>
      <div className={CONTAINER}>

        {/* Header — mono eyebrow and subtitle, matching the reference */}
        <div className="mb-20">
          <p className="font-mono text-[13px] tracking-[0.28em] text-black/68">PROCESS</p>
          <h2
            className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            How I build automation
          </h2>
          <p className="mt-5 font-mono text-[14px] leading-relaxed text-black/70">
            From business problem to a working automation system.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <div key={p.step} style={rise(inView, i * 110)}>

              {/* Numeral with the rail running to the next step */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[42px] leading-none font-light text-[#111]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {p.step}
                </span>
                {i < PROCESS.length - 1 && (
                  <span className="hidden lg:flex flex-1 items-center gap-2" aria-hidden="true">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/25" />
                    <span className="h-px flex-1 bg-black/[0.12]" />
                  </span>
                )}
              </div>

              <h3 className="mt-7 font-mono text-[14px] font-semibold tracking-[0.18em] text-[#111]">
                {p.label}
              </h3>

              <p className="mt-3.5 text-[14px] font-medium leading-snug text-black/80">
                {p.summary}
              </p>

              <p className="mt-3 text-[13.5px] leading-relaxed text-black/72">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing prompt */}
        <div
          className="mt-24 rounded-2xl border border-black/[0.09] bg-white/40 px-6 py-14 text-center"
          style={rise(inView, PROCESS.length * 110)}
        >
          <p className="font-mono text-[14px] tracking-[0.18em] text-black/68">
            HAVE A PROCESS THAT FEELS TOO MANUAL?
          </p>
          <a
            href="/#contact"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#111] px-7 py-3.5 font-mono text-[13px] tracking-[0.14em] text-white transition-colors hover:bg-black"
          >
            LET&apos;S AUTOMATE IT
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Principles ───────────────────────────────────────────────────────────────

function PrinciplesSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id="principles" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag="HOW I BUILD"
          title={<>Reliability is<br />the feature.</>}
          blurb="An automation that silently does the wrong thing is worse than no automation. Three rules I do not bend."
        />

        <div ref={ref} className="grid lg:grid-cols-3 gap-5">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.n}
              className="rounded-2xl border border-black/[0.07] bg-white/50 p-8 hover:bg-white hover:border-black/12 transition-all duration-300"
              style={rise(inView, i * 100)}
            >
              <span className="text-[12px] font-mono text-black/72">{p.n}</span>
              <h3
                className="mt-4 text-xl font-light leading-snug tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.title}
              </h3>
              <p className="mt-2 text-[13px] text-black/68 leading-relaxed">{p.sub}</p>
              <p className="mt-5 pt-5 border-t border-black/[0.07] text-[14px] leading-relaxed text-black/68">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Engagement ───────────────────────────────────────────────────────────────

function EngagementSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id="engagement" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag="WORKING TOGETHER"
          title={<>Three ways<br />to start.</>}
          blurb="Scope and timeline are fixed up front. Pricing depends on systems involved and volume — tell me what you are dealing with and I will quote it."
        />

        <div ref={ref} className="grid md:grid-cols-3 gap-5">
          {ENGAGEMENTS.map((e, i) => (
            <div
              key={e.name}
              className={`flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                e.featured
                  ? "border-black/15 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]"
                  : "border-black/[0.07] bg-white/50 hover:bg-white hover:border-black/12"
              }`}
              style={rise(inView, i * 100)}
            >
              <span className="text-[12px] tracking-widest font-mono text-black/68">
                {e.duration.toUpperCase()}
              </span>
              <h3
                className="mt-3 text-2xl font-light tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {e.name}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-black/72">{e.summary}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {e.includes.map(it => (
                  <li key={it} className="flex items-start gap-2.5 text-[14px] text-black/70 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-black/30 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[13px] tracking-wide transition-colors ${
                  e.featured
                    ? "bg-[#111] text-white hover:bg-black"
                    : "border border-black/12 text-black/72 hover:text-black hover:border-black/30 hover:bg-black/[0.03]"
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

export function PortfolioSections({
  caseStudies,
  posts,
}: {
  caseStudies: CaseStudyMetadata[]
  posts: PostMetadata[]
}) {
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  return (
    <div id="top" className={PAGE}>
      <IntroAnimation onDone={handleIntroDone} />
      <SiteNav />

      <HeroSection ready={heroReady} />

      {/* Everything from About down sits over the constellation field. The
          wrapper is the positioning context; the canvas is sticky inside it so
          one viewport of pixels covers the whole scroll range. */}
      <div className="relative">
        <ParticleField />

        <div className="relative z-10">
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
