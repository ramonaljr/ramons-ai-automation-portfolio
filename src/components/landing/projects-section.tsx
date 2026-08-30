"use client"

import { useEffect, useRef, useState } from "react"

import { PixelIcon } from "@/components/landing/pixel-icon"
import type { CaseStudyMetadata } from "@/lib/case-studies"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
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

// ── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 2.5v9l7-4.5-7-4.5Z" fill="currentColor" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

function ProjectCard({ cs, index }: { cs: CaseStudyMetadata; index: number }) {
  const { ref, inView } = useInView()

  // Lead platform drives the badge — first tool is always the automation platform.
  const platform = cs.tools?.[0] ?? "Automation"

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-black/[0.07] bg-white/60 overflow-hidden transition-all duration-500 hover:border-black/15 hover:bg-white"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms, border-color 0.3s, background-color 0.3s`,
      }}
    >
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-0">

        {/* Copy */}
        <div className="p-7 lg:p-9 order-2 md:order-1">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#111] text-white text-[10px] tracking-widest font-mono">
              {platform.toUpperCase()}
            </span>
            {cs.duration && (
              <span className="text-[11px] tracking-wide text-black/40 font-mono">{cs.duration}</span>
            )}
            {cs.sample && (
              <span
                className="text-[10px] tracking-widest font-mono text-amber-700/70 border border-amber-600/25 bg-amber-500/[0.07] rounded px-2 py-0.5"
                title="Illustrative example, not a delivered client engagement"
              >
                SAMPLE
              </span>
            )}
          </div>

          <h3
            className="text-2xl lg:text-[28px] font-light leading-snug tracking-tight text-[#111] mb-3"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {cs.title}
          </h3>

          <p className="text-sm leading-relaxed text-black/55 mb-6 max-w-lg">{cs.description}</p>

          {cs.tools && cs.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-7">
              {cs.tools.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md border border-black/[0.08] bg-black/[0.02] text-[11px] text-black/50"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/case-study/${cs.slug}`}
              className="inline-flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-[#111] text-white text-[12px] tracking-wide hover:bg-black transition-colors"
            >
              Read case study
              <ArrowIcon />
            </a>

            {cs.videoUrl ? (
              <a
                href={cs.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 text-[12px] text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
              >
                <PlayIcon />
                Live video walkthrough
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-black/12 text-[12px] text-black/30 cursor-default"
                title="Add videoUrl to this case study's frontmatter to enable"
              >
                <PlayIcon />
                Walkthrough coming soon
              </span>
            )}

            {cs.repoUrl ? (
              <a
                href={cs.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 text-[12px] text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
              >
                <GithubIcon />
                View GitHub
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-black/12 text-[12px] text-black/30 cursor-default"
                title="Add repoUrl to this case study's frontmatter to enable"
              >
                <GithubIcon />
                Repo coming soon
              </span>
            )}
          </div>
        </div>

        {/* Visual */}
        <div className="relative order-1 md:order-2 min-h-[180px] md:min-h-full overflow-hidden bg-black/[0.03]">
          {cs.image && (
             
            <img
              src={cs.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-transparent md:from-white/80" />
        </div>
      </div>
    </div>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="portfolio" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">

        <div
          ref={ref}
          className="mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <PixelIcon type="workflow" size={40} />
          <div className="mt-4"><Tag>PORTFOLIO</Tag></div>
          <h2
            className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Automations built<br />and shipped.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-black/50 max-w-xl">
            Production pipelines across n8n, Zapier and Make — each one mapped, built against real
            edge cases, documented, and handed over.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {caseStudies.map((cs, i) => (
            <ProjectCard key={cs.slug} cs={cs} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
