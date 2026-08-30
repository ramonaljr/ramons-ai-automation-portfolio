"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { ProjectModal } from "@/components/landing/project-modal"
import type { CaseStudyMetadata } from "@/lib/case-studies"

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

const P = {
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  arrow: "M4 12h14M13 6l6 6-6 6",
}

function useInView(threshold = 0.1) {
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
        <span key={t} className="rounded-md border border-black/[0.08] bg-black/[0.02] px-2.5 py-1 font-mono text-[11px] text-black/50">
          {t}
        </span>
      ))}
    </div>
  )
}

function SampleBadge() {
  return (
    <span
      className="rounded border border-amber-600/25 bg-amber-500/[0.07] px-2 py-0.5 font-mono text-[10px] tracking-widest text-amber-700/70"
      title="Illustrative example, not a delivered client engagement"
    >
      SAMPLE
    </span>
  )
}

export function ProjectsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView(0.05)
  const [filter, setFilter] = useState<Filter>("ALL")
  const [open, setOpen] = useState<CaseStudyMetadata | null>(null)

  const shown = useMemo(() => caseStudies.filter(cs => matches(cs, filter)), [caseStudies, filter])
  const featured = shown.find(cs => cs.featured) ?? shown[0]
  const rest = shown.filter(cs => cs.slug !== featured?.slug)

  const count = String(caseStudies.length).padStart(2, "0")

  return (
    <section id="portfolio" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className={CONTAINER}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[12px] tracking-[0.25em] text-black/35">SELECTED</p>
            <h2
              className="mt-2 text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.95] tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              WORK
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-black/50">
              A selection of AI automation systems and production workflows built to eliminate
              repetitive tasks, connect business tools, and improve operational efficiency.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 font-mono text-[11px] tracking-wide text-black/55">
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
                    className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-all ${
                      active
                        ? "border-black/25 bg-[#111] text-white"
                        : n === 0
                          ? "border-black/[0.06] text-black/20"
                          : "border-black/10 text-black/50 hover:border-black/25 hover:text-black"
                    }`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-black/[0.07]" />

        {/* ── Featured ───────────────────────────────────────────────────── */}
        <div ref={ref} className="mt-12">
          {featured && (
            <article
              className="group grid overflow-hidden rounded-2xl border border-black/[0.07] bg-white/50 transition-all duration-300 hover:border-black/12 hover:bg-white lg:grid-cols-[1.25fr_1fr]"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color .3s, background-color .3s",
              }}
            >
              {/* Canvas */}
              <div className="relative border-b border-black/[0.07] bg-white p-4 lg:border-b-0 lg:border-r">
                {featured.workflowImage && (
                  <img
                    src={featured.workflowImage}
                    alt={`Workflow canvas for ${featured.title}`}
                    className="w-full rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setOpen(featured)}
                  className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 font-mono text-[11px] tracking-wide text-black/60 backdrop-blur transition-all hover:border-black/25 hover:text-black"
                >
                  <Ico d={P.expand} size={12} />
                  INSPECT NODES
                </button>
              </div>

              {/* Detail */}
              <div className="flex flex-col p-7 lg:p-9">
                <div className="flex flex-wrap items-center gap-2">
                  {featured.platform && (
                    <span className="rounded-full border border-black/15 bg-black/[0.04] px-3 py-1 font-mono text-[11px] text-black/70">
                      {featured.platform}
                    </span>
                  )}
                  {featured.categories?.map(c => (
                    <span key={c} className="rounded-full border border-black/10 px-3 py-1 font-mono text-[11px] text-black/45">
                      {c}
                    </span>
                  ))}
                  <span className="ml-auto rounded border border-amber-600/30 bg-amber-500/[0.08] px-2.5 py-1 font-mono text-[10px] tracking-widest text-amber-700/80">
                    FEATURED
                  </span>
                </div>

                <h3
                  className="mt-6 text-2xl font-light leading-snug tracking-tight text-[#111] lg:text-[32px]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {featured.title}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-black/55">{featured.description}</p>
                {featured.sample && <div className="mt-4"><SampleBadge /></div>}

                <div className="mt-auto pt-8">
                  <Chips items={featured.tools} />
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-6">
                    {featured.speed && (
                      <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/20 bg-emerald-500/[0.07] px-3 py-2 font-mono text-[12px] text-emerald-800/80">
                        <Ico d={P.bolt} size={12} />
                        {featured.speed}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpen(featured)}
                      className="inline-flex items-center gap-2 font-mono text-[12px] tracking-wide text-black/60 transition-colors hover:text-black"
                    >
                      VIEW FULL WORKFLOW
                      <Ico d={P.arrow} size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* ── Grid ─────────────────────────────────────────────────────── */}
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((cs, i) => (
              <article
                key={cs.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white/50 transition-all duration-300 hover:border-black/12 hover:bg-white"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, border-color .3s, background-color .3s`,
                }}
              >
                <div className="border-b border-black/[0.07] bg-white p-3">
                  {cs.workflowImage && (
                    <img
                      src={cs.workflowImage}
                      alt=""
                      aria-hidden="true"
                      className="h-[150px] w-full rounded object-cover object-left-top"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {cs.platform && (
                      <span className="rounded-full border border-black/15 bg-black/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-black/65">
                        {cs.platform}
                      </span>
                    )}
                    {cs.speed && (
                      <span className="font-mono text-[10px] text-black/35">{cs.speed}</span>
                    )}
                    {cs.sample && <SampleBadge />}
                  </div>

                  <h3
                    className="mt-4 text-[19px] font-light leading-snug tracking-tight text-[#111]"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-black/50">
                    {cs.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => setOpen(cs)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[12px] tracking-wide text-white transition-colors hover:bg-black"
                    >
                      View workflow
                      <Ico d={P.arrow} size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {shown.length === 0 && (
            <p className="py-16 text-center text-[14px] text-black/40">
              Nothing built on this platform yet.
            </p>
          )}
        </div>
      </div>

      {open && <ProjectModal cs={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
