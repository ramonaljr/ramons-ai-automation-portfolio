"use client"

import { useCallback, useState } from "react"

import { IntroAnimation } from "@/components/landing/intro-animation"
import { SiteNav } from "@/components/landing/site-nav"
import { SiteFooter } from "@/components/landing/site-footer"
import { CtaSection } from "@/components/landing/cta-section"
import { HeroSection } from "@/components/landing/hero-section"
import { IntroSection } from "@/components/landing/intro-section"
import { SectionIntro } from "@/components/landing/section-intro"
import { ProjectsSection } from "@/components/landing/projects-section"
import { PixelIcon } from "@/components/landing/pixel-icon"
import { ToolStackSection } from "@/components/landing/tool-stack-section"
import { ExperienceSection } from "@/components/landing/experience-section"
import { ContactSection } from "@/components/landing/contact-section"
import { ArticlesSection } from "@/components/landing/articles-section"
import { ChatWidget } from "@/components/landing/chat-widget"
import { ParticleField } from "@/components/landing/particle-field"
import { ArrowIcon, CONTAINER, Cta, DISPLAY_FONT, PAGE, READABLE, SECTION, SECTION_ANCHOR, SECTION_CONT, rise, sweep, SWEEP_STEP, useInView } from "@/components/landing/motion"

import type { CaseStudyMetadata } from "@/lib/case-studies"
import type { PostMetadata } from "@/lib/posts"
import { ENGAGEMENTS, PLATFORMS, PRINCIPLES, PROCESS, SERVICES } from "@/lib/portfolio"

// ── Shared primitives ────────────────────────────────────────────────────────


/**
 * Kept as a thin alias so these four call sites read the same as before. The
 * cascade itself lives in SectionIntro, shared with the sections that do not
 * route through here.
 */
function SectionHead({
  tag, title, blurb,
}: {
  tag: string
  title: React.ReactNode
  blurb?: string
}) {
  return <SectionIntro tag={tag} title={title} blurb={blurb} />
}

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS: ("platform" | "agents" | "workflow" | "integrations" | "pricing")[] = [
  "agents", "workflow", "platform", "integrations", "pricing",
]

function ServicesSection() {
  const { ref, inView } = useInView(0.12)

  const cardAnim = (i: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(36px)",
    filter: inView ? "blur(0px)" : "blur(10px)",
    transition: `opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, filter 0.85s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, border-color 0.3s, background-color 0.3s`,
  })

  return (
    <section id="services" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHead
          tag="SERVICES"
          title={<>What I automate<br />across your business.</>}
          blurb="Five ways I take manual work out of a business — from intake and onboarding through approvals, reporting and reconciliation. Every engagement ends with a documented workflow your team can run without me."
        />

        <div ref={ref} className="grid gap-x-5 gap-y-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <div
              key={s.slug}
              className="group lift-hover relative flex flex-col rounded-2xl border border-rule bg-surface p-7 hover:border-rule-strong hover:bg-surface-raised"
              style={cardAnim(i)}
            >
              {/* Icon sits inline at the top-left rather than as a medallion
                  straddling the card edge. The medallion forced the whole card
                  to centre-align under it — which is what put ragged-left body
                  copy in every one of these. */}
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-rule bg-ground transition-colors duration-300 group-hover:border-rule-strong">
                <PixelIcon type={SERVICE_ICONS[i] ?? "platform"} size={28} />
              </span>

              <h3
                className="display-md mt-6 text-xl leading-snug font-light text-ink"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {s.title}
              </h3>

              <p className="mt-3 flex-1 text-fine text-ink-2">{s.description}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {s.tools.slice(0, 3).map(t => (
                  <span
                    key={t}
                    className="rounded-md border border-rule bg-ink/2 px-2.5 py-1 text-meta text-ink-3"
                  >
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
                className="mt-6 inline-flex items-center gap-2 self-start border-t border-transparent pt-1 text-fine text-ink transition-colors"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:bg-[length:100%_1px]">
                  View service
                </span>
                <span className="transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </a>
            </div>
          ))}

          {/* Sixth cell balances the grid and routes to contact. It carries the
              section's one filled CTA, which is now the only one in the grid. */}
          <div
            className="flex flex-col justify-center rounded-2xl border border-rule bg-ink/2.5 p-7"
            style={cardAnim(SERVICES.length)}
          >
            <p
              className="display-md text-xl leading-snug font-light text-ink"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Not sure which you need?
            </p>
            <p className="mt-3 max-w-[30ch] text-fine text-ink-2">
              Describe the process that eats your week and I will tell you where it fits.
            </p>
            <Cta href="/contact" className="mt-6 self-start">
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
    <section id="platforms" className={SECTION_CONT}>
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
                  ? "border-rule-strong bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]"
                  : "border-rule bg-surface hover:bg-surface-raised hover:border-rule"
              }`}
              style={sweep(inView, i)}
            >
              {p.primary && (
                <span className="absolute top-6 right-6 text-[11px] tracking-widest font-mono text-ground bg-ink rounded px-2 py-1">
                  PRIMARY
                </span>
              )}

              <h3
                className="text-3xl font-light tracking-tight text-ink"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">{p.tagline}</p>

              <ul className="mt-6 space-y-2.5">
                {p.bestFor.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-[14px] text-ink-2 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-ink/30 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <p className="mt-6 pt-5 border-t border-rule text-[13px] leading-relaxed text-ink-2 italic">
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

        <SectionIntro
          tag="PROCESS"
          variant="mono"
          margin="mb-20"
          titleClassName="mt-4 text-[clamp(2.25rem,5vw,4rem)]"
          title="How I build automation"
          blurb={
            <span className="font-mono">From business problem to a working automation system.</span>
          }
        />

        {/* Steps */}
        <div ref={ref} className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <div key={p.step} className={READABLE} style={sweep(inView, i)}>

              {/* Numeral with the rail running to the next step */}
              <div className="flex items-center gap-3">
                <span
                  className="text-[42px] leading-none font-light text-ink"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {p.step}
                </span>
                {i < PROCESS.length - 1 && (
                  <span className="hidden lg:flex flex-1 items-center gap-2" aria-hidden="true">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" />
                    <span className="h-px flex-1 bg-ink/12" />
                  </span>
                )}
              </div>

              <h3 className="mt-7 font-mono text-[14px] font-semibold tracking-[0.18em] text-ink">
                {p.label}
              </h3>

              <p className="mt-3.5 text-[14px] font-medium leading-snug text-ink">
                {p.summary}
              </p>

              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing prompt */}
        <div
          className="mt-24 rounded-2xl border border-rule bg-surface px-6 py-14 text-center"
          style={rise(inView, PROCESS.length * SWEEP_STEP)}
        >
          <p className="font-mono text-[14px] tracking-[0.18em] text-ink-2">
            HAVE A PROCESS THAT FEELS TOO MANUAL?
          </p>
          <a
            href="/#contact"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-mono text-[13px] tracking-[0.14em] text-ground transition-colors hover:bg-ink/90"
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

function PrinciplesSection() {
  const { ref, inView } = useInView(0.08)

  return (
    <section id="principles" className={SECTION}>
      {/* Two columns, not a stacked heading.
          Body copy has to stay near a 60-character measure to stay readable, so
          a full-width row of numeral + title + body could never reach the right
          edge of a 1400px container — it left roughly a third of the section
          empty. Moving the heading into a left rail gives that space a job: the
          claim stays on screen while the rules that support it scroll past it,
          and the list gets a column narrow enough that its measure fills it. */}
      <div className={`${CONTAINER} grid gap-x-20 gap-y-14 lg:grid-cols-[minmax(0,22rem)_1fr] 2xl:gap-x-28`}>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead
            tag="HOW I BUILD"
            title={<>Reliability is<br />the feature.</>}
            blurb="An automation that silently does the wrong thing is worse than no automation. Three rules I do not bend."
          />
        </div>

        <div ref={ref} className="border-t border-rule">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.n}
              className="group grid gap-x-10 gap-y-4 border-b border-rule py-10 md:grid-cols-[3.5rem_minmax(0,17rem)_1fr] md:py-12"
              style={sweep(inView, i)}
            >
              {/* The numeral indexes the rule; it is set at display size in the
                  faintest legible ink so it is present without ever competing
                  with the claim beside it. */}
              <span
                className="text-[2.5rem] leading-none font-light text-ink-4 transition-colors duration-500 group-hover:text-accent"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.n}
              </span>

              <div>
                <h3
                  className="display-md text-xl leading-snug font-light text-ink md:text-[1.5rem]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {p.title}
                </h3>
                <p className="mt-2.5 border-t border-rule pt-2.5 text-meta tracking-[0.02em] text-ink-3">
                  {p.sub}
                </p>
              </div>

              <p className="max-w-[60ch] text-body text-ink-2 md:pt-1">{p.body}</p>
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
    <section id="engagement" className={SECTION_ANCHOR}>
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
                  ? "border-rule-strong bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)]"
                  : "border-rule bg-surface hover:bg-surface-raised hover:border-rule"
              }`}
              style={sweep(inView, i)}
            >
              <span className="text-[12px] tracking-widest font-mono text-ink-2">
                {e.duration.toUpperCase()}
              </span>
              <h3
                className="mt-3 text-2xl font-light tracking-tight text-ink"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {e.name}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{e.summary}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {e.includes.map(it => (
                  <li key={it} className="flex items-start gap-2.5 text-[14px] text-ink-2 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-ink/30 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[13px] tracking-wide transition-colors ${
                  e.featured
                    ? "bg-ink text-ground hover:bg-ink/90"
                    : "border border-rule text-ink-2 hover:text-ink hover:border-rule-strong hover:bg-ink/3"
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
