"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { IntroAnimation } from "@/components/landing/intro-animation"
import { MobileNav } from "@/components/landing/mobile-nav"
import { HeroSection } from "@/components/landing/hero-section"
import { IntroSection } from "@/components/landing/intro-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { PixelIcon } from "@/components/landing/pixel-icon"
import { ToolStackSection } from "@/components/landing/tool-stack-section"
import { ExperienceSection } from "@/components/landing/experience-section"
import { ContactSection } from "@/components/landing/contact-section"
import { ArticlesSection } from "@/components/landing/articles-section"
import { ChatWidget } from "@/components/landing/chat-widget"

import type { CaseStudyMetadata } from "@/lib/case-studies"
import type { PostMetadata } from "@/lib/posts"
import { ENGAGEMENTS, PLATFORMS, PRINCIPLES, PROCESS, PROFILE, SERVICES } from "@/lib/portfolio"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"
const SECTION = "py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]"

// ── Shared primitives ────────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/55 bg-black/[0.04]">
      {children}
    </span>
  )
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

function rise(inView: boolean, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(22px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  }
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
      <h2
        className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {title}
      </h2>
      {blurb && <p className="mt-5 text-[15px] leading-relaxed text-black/62 max-w-xl">{blurb}</p>}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
          title={<>What I build<br />for operators.</>}
          blurb="Five ways I remove manual work from a business. Every engagement ends with a documented workflow your team can run without me."
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

              <p className="mt-3 text-[13px] leading-relaxed text-black/62 flex-1">
                {s.description}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {s.tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md border border-black/[0.08] bg-black/[0.02] text-[10px] text-black/60">
                    {t}
                  </span>
                ))}
              </div>

              <a
                href={`/services/${s.slug}`}
                className="mt-7 inline-flex items-center justify-center gap-2 self-center pl-5 pr-4 py-2.5 rounded-full bg-[#111] text-white text-[12px] tracking-wide hover:bg-black transition-colors"
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
            <p className="mt-3 text-[13px] leading-relaxed text-black/60 max-w-[22ch]">
              Describe the process that eats your week and I will tell you where it fits.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/12 text-[12px] tracking-wide text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
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
                <span className="absolute top-6 right-6 text-[10px] tracking-widest font-mono text-white bg-[#111] rounded px-2 py-1">
                  PRIMARY
                </span>
              )}

              <h3
                className="text-3xl font-light tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.name}
              </h3>
              <p className="mt-2 text-sm text-black/62 leading-relaxed">{p.tagline}</p>

              <ul className="mt-6 space-y-2.5">
                {p.bestFor.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-[13px] text-black/60 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-black/30 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <p className="mt-6 pt-5 border-t border-black/[0.07] text-[12px] leading-relaxed text-black/55 italic">
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
          <p className="font-mono text-[12px] tracking-[0.28em] text-black/55">PROCESS</p>
          <h2
            className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            How I build automation
          </h2>
          <p className="mt-5 font-mono text-[14px] leading-relaxed text-black/60">
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

              <h3 className="mt-7 font-mono text-[13px] font-semibold tracking-[0.18em] text-[#111]">
                {p.label}
              </h3>

              <p className="mt-3.5 text-[14px] font-medium leading-snug text-black/80">
                {p.summary}
              </p>

              <p className="mt-3 text-[13.5px] leading-relaxed text-black/62">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Closing prompt */}
        <div
          className="mt-24 rounded-2xl border border-black/[0.09] bg-white/40 px-6 py-14 text-center"
          style={rise(inView, PROCESS.length * 110)}
        >
          <p className="font-mono text-[13px] tracking-[0.18em] text-black/55">
            HAVE A PROCESS THAT FEELS TOO MANUAL?
          </p>
          <a
            href="/#contact"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#111] px-7 py-3.5 font-mono text-[12px] tracking-[0.14em] text-white transition-colors hover:bg-black"
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
              <span className="text-[11px] font-mono text-black/62">{p.n}</span>
              <h3
                className="mt-4 text-xl font-light leading-snug tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {p.title}
              </h3>
              <p className="mt-2 text-[12px] text-black/55 leading-relaxed">{p.sub}</p>
              <p className="mt-5 pt-5 border-t border-black/[0.07] text-[14px] leading-relaxed text-black/55">
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
              <span className="text-[11px] tracking-widest font-mono text-black/55">
                {e.duration.toUpperCase()}
              </span>
              <h3
                className="mt-3 text-2xl font-light tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {e.name}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-black/62">{e.summary}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {e.includes.map(it => (
                  <li key={it} className="flex items-start gap-2.5 text-[13px] text-black/60 leading-snug">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-black/30 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[12px] tracking-wide transition-colors ${
                  e.featured
                    ? "bg-[#111] text-white hover:bg-black"
                    : "border border-black/12 text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03]"
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

// ── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection() {
  const { ref, inView } = useInView(0.15)

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
      {/* Glass panels, anchored bottom-centre — the template's own footer
          treatment. Light by design; it fades up into the cream page. */}
      { }
      <img
        src="/images/landing/footer.png"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
        style={{ opacity: 0.85 }}
      />

      {/* Progressive blur from the bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
          WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      />

      {/* Colour fade back to the page ground */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
        }}
      />

      <div ref={ref} className={`relative z-10 ${CONTAINER} text-center`} style={rise(inView)}>
        <h2
          className="text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] tracking-tight text-[#111]"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          What are you still<br />doing by hand?
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-black/55 max-w-lg mx-auto">
          Tell me the process that eats your week. I will tell you whether it is worth automating,
          and on which platform.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/contact"
            className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#111] text-white text-[13px] tracking-wide hover:bg-black transition-colors"
          >
            START A CONVERSATION
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
              <ArrowIcon />
            </span>
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            className="inline-flex items-center px-5 py-3 rounded-full border border-black/12 text-[12px] tracking-wide text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
          >
            {PROFILE.email}
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Platforms", href: "#platforms" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Experience", href: "#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

function SiteFooter() {
  return (
    <footer className="py-12 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className={CONTAINER}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="font-pixel text-xs tracking-[0.25em] text-black/70">
              {PROFILE.shortName.toUpperCase()}
            </p>
            <p className="mt-2 text-[13px] text-black/60">
              {PROFILE.title} · {PROFILE.location}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-3 gap-y-1">
            {FOOTER_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-md px-2 py-1.5 text-[12px] text-black/62 transition-colors hover:bg-black/[0.04] hover:text-black"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex gap-2">
            {PROFILE.socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-full border border-black/10 text-[11px] text-black/55 hover:text-black hover:border-black/25 hover:bg-black/[0.03] transition-all"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 pt-6 border-t border-black/[0.06] text-[11px] text-black/62">
          © {new Date().getFullYear()} {PROFILE.name}. Built with n8n, Zapier and Make in mind.
        </p>
      </div>
    </footer>
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
    <div id="top" className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav />

      <HeroSection ready={heroReady} />
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
      <ChatWidget />
    </div>
  )
}
