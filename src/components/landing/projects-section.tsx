"use client"

import { useMemo, useState } from "react"

import type { CaseStudyMetadata } from "@/lib/case-studies"
import { SectionIntro } from "@/components/landing/section-intro"
import { useInView } from "@/components/landing/motion"
import { CaseStudyModal } from "@/components/landing/case-study-modal"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"

const FILTERS = ["ALL", "AI AGENTS", "N8N", "ZAPIER", "MAKE"] as const

type Filter = (typeof FILTERS)[number]

function Ico({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function VideoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const P = {
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  arrow: "M4 12h14M13 6l6 6-6 6",
}

/** A project matches a filter on its platform or on one of its categories. */
function matches(cs: CaseStudyMetadata, f: Filter) {
  if (f === "ALL") return true
  const platform = (cs.platform ?? "").toUpperCase()
  const cats = (cs.categories ?? []).map(c => c.toUpperCase())

  return platform === f || cats.includes(f)
}

function Chips({ items }: { items?: string[] }) {
  if (!items?.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(t => (
        <span key={t} className="rounded-md border border-rule bg-ink/[0.02] px-2.5 py-1 font-mono text-[12px] text-ink-2">
          {t}
        </span>
      ))}
    </div>
  )
}

function SampleBadge() {
  return (
    <span
      className="badge badge-accent"
      title="Illustrative example, not a delivered client engagement"
    >
      SAMPLE
    </span>
  )
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref: featuredRef, inView: featuredInView } = useInView(0.1)
  const { ref: gridRef, inView: gridInView } = useInView(0.08)
  const [filter, setFilter] = useState<Filter>("ALL")
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyMetadata | null>(null)

  const shown = useMemo(() => caseStudies.filter(cs => matches(cs, filter)), [caseStudies, filter])
  const featured = shown.find(cs => cs.featured) ?? shown[0]
  const rest = shown.filter(cs => cs.slug !== featured?.slug)

  const count = String(caseStudies.length).padStart(2, "0")

  return (
    <section id="portfolio" className="py-32 px-6 md:px-12 lg:px-20 border-t border-rule">
      <div className={CONTAINER}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            tag="SELECTED"
            variant="mono"
            margin=""
            titleClassName="mt-2 text-[clamp(2.5rem,6vw,5rem)]"
            title="WORK"
            blurb="A selection of AI automation systems and production workflows built to eliminate repetitive tasks, connect business tools, and improve operational efficiency."
          />

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 font-mono text-[12px] tracking-wide text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {count}+ AUTOMATION PROJECTS
            </span>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
              {FILTERS.map(f => {
                const active = filter === f
                const n = caseStudies.filter(cs => matches(cs, f)).length

                return (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={n === 0}
                    onClick={() => setFilter(f)}
                    className={`rounded-full border px-4 py-2 font-mono text-[12px] tracking-wide transition-all ${
                      active
                        ? "border-rule-strong bg-ink text-ground"
                        : n === 0
                          ? "border-rule text-ink-4"
                          : "border-rule text-ink-2 hover:border-rule-strong hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-rule" />

        {/* ── Featured ───────────────────────────────────────────────────── */}
        <div ref={featuredRef} className="mt-12">
          {featured && (
            <article
              className="group grid overflow-hidden rounded-2xl border border-rule bg-surface transition-all duration-300 hover:border-rule hover:bg-surface-raised lg:grid-cols-[1.25fr_1fr]"
              style={{
                opacity: featuredInView ? 1 : 0,
                transform: featuredInView ? "translateY(0)" : "translateY(36px)",
                filter: featuredInView ? "blur(0px)" : "blur(10px)",
                transition: "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.85s cubic-bezier(0.16, 1, 0.3, 1), border-color .3s, background-color .3s",
              }}
            >
              {/* Canvas */}
              <div
                className="relative border-b border-rule bg-surface-raised p-4 lg:border-b-0 lg:border-r cursor-pointer group-hover:bg-[#fafaf8] transition-colors"
                onClick={() => setSelectedStudy(featured)}
              >
                {featured.workflowImage && (
                  <img
                    src={featured.workflowImage}
                    width={1400}
                    height={900}
                    loading="lazy"
                    alt={`Workflow canvas for ${featured.title}`}
                    className="w-full rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                )}
              </div>

              {/* Detail */}
              <div className="flex flex-col p-7 lg:p-9">
                <div className="flex flex-wrap items-center gap-2">
                  {featured.platform && (
                    <span className="rounded-full border border-rule-strong bg-ink/[0.04] px-3 py-1 font-mono text-[12px] text-ink-2">
                      {featured.platform}
                    </span>
                  )}
                  {featured.categories?.map(c => (
                    <span key={c} className="rounded-full border border-rule px-3 py-1 font-mono text-[12px] text-ink-2">
                      {c}
                    </span>
                  ))}
                  <span className="badge badge-accent ml-auto">
                    FEATURED
                  </span>
                </div>

                <h3
                  className="mt-6 text-2xl font-light leading-snug tracking-tight text-ink lg:text-[32px] cursor-pointer hover:text-ink transition-colors"
                  style={{ fontFamily: DISPLAY_FONT }}
                  onClick={() => setSelectedStudy(featured)}
                >
                  {featured.title}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{featured.description}</p>
                {featured.sample && <div className="mt-4"><SampleBadge /></div>}

                <div className="mt-auto pt-8">
                  <Chips items={featured.tools} />
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
                    {featured.speed && (
                      <span className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] bg-[color-mix(in_oklch,var(--accent)_6%,transparent)] px-3 py-2 font-mono text-[13px] text-accent">
                        <Ico d={P.bolt} size={12} />
                        {featured.speed}
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (featured.videoUrl) {
                            window.open(featured.videoUrl, "_blank")
                          } else {
                            setSelectedStudy(featured)
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2.5 font-mono text-[12px] tracking-wide text-ink-2 transition-all hover:bg-surface-raised hover:border-rule-strong hover:text-ink cursor-pointer"
                        title="Live Video Walkthrough"
                      >
                        <VideoIcon size={13} />
                        Live Video Walkthrough
                      </button>

                      <a
                        href={featured.repoUrl || "https://github.com/ramonaljr"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2.5 font-mono text-[12px] tracking-wide text-ink-2 transition-all hover:bg-surface-raised hover:border-rule-strong hover:text-ink"
                      >
                        <GitHubIcon size={13} />
                        View on GitHub
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedStudy(featured)}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-[12px] tracking-wide text-ground transition-colors hover:bg-ink/90 cursor-pointer"
                      >
                        Read case study
                        <Ico d={P.arrow} size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* ── Grid ─────────────────────────────────────────────────────── */}
          <div ref={gridRef} className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((cs, i) => (
              <article
                key={cs.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-rule bg-surface transition-all duration-300 hover:border-rule hover:bg-surface-raised"
                style={{
                  opacity: gridInView ? 1 : 0,
                  transform: gridInView ? "translateY(0)" : "translateY(36px)",
                  filter: gridInView ? "blur(0px)" : "blur(10px)",
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, border-color .3s, background-color .3s`,
                }}
              >
                <div
                  className="border-b border-rule bg-surface-raised p-3 cursor-pointer group-hover:bg-[#fafaf8] transition-colors"
                  onClick={() => setSelectedStudy(cs)}
                >
                  {cs.workflowImage && (
                    <img
                      src={cs.workflowImage}
                      width={1400}
                      height={900}
                      loading="lazy"
                      alt=""
                      aria-hidden="true"
                      className="h-[150px] w-full rounded object-cover object-left-top transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {cs.platform && (
                      <span className="rounded-full border border-rule-strong bg-ink/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-ink-2">
                        {cs.platform}
                      </span>
                    )}
                    {cs.speed && (
                      <span className="font-mono text-[11px] text-ink-2">{cs.speed}</span>
                    )}
                    {cs.sample && <SampleBadge />}
                  </div>

                  <h3
                    className="mt-4 text-[19px] font-light leading-snug tracking-tight text-ink cursor-pointer hover:text-ink transition-colors"
                    style={{ fontFamily: DISPLAY_FONT }}
                    onClick={() => setSelectedStudy(cs)}
                  >
                    {cs.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-ink-2">
                    {cs.description}
                  </p>

                  <div className="mt-auto pt-6 flex flex-col gap-2.5 border-t border-rule">
                    <button
                      type="button"
                      onClick={() => setSelectedStudy(cs)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-[12px] tracking-wide text-ground transition-colors hover:bg-ink/90 cursor-pointer"
                    >
                      Read case study
                      <Ico d={P.arrow} size={13} />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (cs.videoUrl) {
                            window.open(cs.videoUrl, "_blank")
                          } else {
                            setSelectedStudy(cs)
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rule bg-ink/[0.02] px-3 py-2 font-mono text-[11px] tracking-tight text-ink-2 transition-all hover:bg-ink/[0.05] hover:border-rule-strong hover:text-ink text-center cursor-pointer"
                        title="Live Video Walkthrough"
                      >
                        <VideoIcon size={12} />
                        <span className="truncate">Live Video</span>
                      </button>

                      <a
                        href={cs.repoUrl || "https://github.com/ramonaljr"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rule bg-ink/[0.02] px-3 py-2 font-mono text-[11px] tracking-tight text-ink-2 transition-all hover:bg-ink/[0.05] hover:border-rule-strong hover:text-ink text-center"
                        title="View GitHub Repository"
                      >
                        <GitHubIcon size={12} />
                        <span className="truncate">View on GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {shown.length === 0 && (
            <p className="py-16 text-center text-[14px] text-ink-2">
              Nothing built on this platform yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Case Study Detail Modal ─────────────────────────────────────── */}
      <CaseStudyModal
        study={selectedStudy}
        onClose={() => setSelectedStudy(null)}
      />
    </section>
  )
}

