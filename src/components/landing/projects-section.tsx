"use client"

import { useMemo, useState } from "react"

import type { CaseStudyMetadata } from "@/lib/case-studies"
import { SectionIntro } from "@/components/landing/section-intro"
import { CONTAINER, DISPLAY_FONT, SECTION_ANCHOR, useInView } from "@/components/landing/motion"
import { CaseStudyModal } from "@/components/landing/case-study-modal"

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

/**
 * A URL only counts if it is a non-empty string.
 *
 * Every `videoUrl` and `repoUrl` in the case-study front matter is currently
 * `''`, and the previous markup rendered the controls anyway: the video button
 * fell through to opening the case-study modal, and the GitHub link fell back
 * to the profile page. Six projects therefore advertised a walkthrough and a
 * repository and delivered neither. Controls now appear only where the thing
 * they point at exists — which also drops each card from three competing
 * actions to one.
 */
const has = (u?: string) => typeof u === "string" && u.trim().length > 0

function SampleBadge() {
  return (
    <span className="badge badge-accent" title="Illustrative example, not a delivered client engagement">
      SAMPLE
    </span>
  )
}

/**
 * Platform and category chips, in one treatment.
 *
 * `max` caps the categories shown. Cards in a row share a baseline grid, and a
 * project carrying one extra category wrapped its meta row onto a second line
 * — which pushed that card's heading about 30px below its neighbours' and made
 * the whole row look broken. The featured card passes no cap, since it owns its
 * own column and has the width to spend.
 */
function Meta({ cs, size = "sm", max }: { cs: CaseStudyMetadata; size?: "sm" | "md"; max?: number }) {
  const pad = size === "md" ? "px-3 py-1 text-fine" : "px-2.5 py-0.5 text-meta"
  const cats = max ? (cs.categories ?? []).slice(0, max) : (cs.categories ?? [])

  return (
    <>
      {cs.platform && (
        <span className={`rounded-md border border-rule-strong bg-ink/[0.04] font-mono text-ink-2 ${pad}`}>
          {cs.platform}
        </span>
      )}
      {cats.map(c => (
        <span key={c} className={`rounded-md border border-rule font-mono text-ink-3 ${pad}`}>
          {c}
        </span>
      ))}
    </>
  )
}

/**
 * The secondary links on a card.
 *
 * `relative z-10` lifts these above the stretched primary hit area, so a click
 * on an icon opens the video or the repo rather than the modal underneath.
 */
function AuxLinks({ cs }: { cs: CaseStudyMetadata }) {
  if (!has(cs.videoUrl) && !has(cs.repoUrl)) return null

  return (
    <div className="relative z-10 flex items-center gap-1">
      {has(cs.videoUrl) && (
        <a
          href={cs.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch the walkthrough for ${cs.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-rule text-ink-3 transition-colors hover:border-rule-strong hover:bg-ink/[0.04] hover:text-ink"
        >
          <VideoIcon size={13} />
        </a>
      )}
      {has(cs.repoUrl) && (
        <a
          href={cs.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Source for ${cs.title} on GitHub`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-rule text-ink-3 transition-colors hover:border-rule-strong hover:bg-ink/[0.04] hover:text-ink"
        >
          <GitHubIcon size={13} />
        </a>
      )}
    </div>
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

  return (
    <section id="portfolio" className={SECTION_ANCHOR}>
      <div className={CONTAINER}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            tag="SELECTED"
            margin=""
            titleClassName="display-xl mt-2 text-[clamp(2.5rem,6vw,5rem)]"
            title="WORK"
            blurb="A selection of AI automation systems and production workflows built to eliminate repetitive tasks, connect business tools, and improve operational efficiency."
          />

          <div className="flex flex-col items-start gap-4 lg:items-end">
            {/* The count is exact, so it is stated exactly. "06+" padded a real
                number into looking like a date and added a "+" it had not
                earned. */}
            <span className="font-mono text-meta tracking-[0.18em] text-ink-3 uppercase">
              {caseStudies.length} automation projects
            </span>

            <div className="flex flex-wrap gap-2 lg:justify-end" role="tablist" aria-label="Filter projects">
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-meta tracking-wide transition-all duration-300 ${
                      active
                        ? "border-ink bg-ink text-ground"
                        : n === 0
                          ? "cursor-default border-rule text-ink-4"
                          : "border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/[0.03] hover:text-ink"
                    }`}
                  >
                    {f}
                    {/* The count tells you what is behind a filter before you
                        spend a click finding out. */}
                    <span className={active ? "text-ground/65" : "text-ink-3"}>{n}</span>
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
              className="group relative grid overflow-hidden rounded-2xl border border-rule bg-surface transition-[border-color,background-color,box-shadow] duration-300 hover:border-rule-strong hover:bg-surface-raised lg:grid-cols-[1.25fr_1fr]"
              style={{
                opacity: featuredInView ? 1 : 0,
                transform: featuredInView ? "translateY(0)" : "translateY(36px)",
                filter: featuredInView ? "blur(0px)" : "blur(10px)",
                transition: "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.85s cubic-bezier(0.16, 1, 0.3, 1), border-color .3s, background-color .3s",
              }}
            >
              {/* The workflow canvas is the strongest asset on this site, so the
                  featured card shows it whole rather than cropped. */}
              <div className="relative border-b border-rule bg-surface-raised p-4 lg:border-b-0 lg:border-r">
                {featured.workflowImage && (
                  <img
                    src={featured.workflowImage}
                    width={1400}
                    height={900}
                    loading="lazy"
                    alt={`Workflow canvas for ${featured.title}`}
                    className="w-full rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.012]"
                  />
                )}
              </div>

              <div className="flex flex-col p-7 lg:p-9">
                <div className="flex flex-wrap items-center gap-2">
                  <Meta cs={featured} size="md" />
                  <span className="badge badge-accent ml-auto">FEATURED</span>
                </div>

                <h3
                  className="display-md mt-6 text-2xl leading-snug font-light text-ink lg:text-[2rem]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {featured.title}
                </h3>
                <p className="mt-4 text-body text-ink-2">{featured.description}</p>
                {featured.sample && <div className="mt-4"><SampleBadge /></div>}

                <div className="mt-auto pt-8">
                  <div className="flex flex-wrap gap-1.5">
                    {featured.tools?.map(t => (
                      <span key={t} className="rounded-md border border-rule bg-ink/[0.02] px-2.5 py-1 font-mono text-meta text-ink-3">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
                    {featured.speed && (
                      <span className="inline-flex items-center gap-2 font-mono text-fine text-accent">
                        <Ico d={P.bolt} size={12} />
                        {featured.speed}
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-2.5">
                      <AuxLinks cs={featured} />
                      {/* One primary action. Its ::after stretches over the
                          whole card, so the image and heading are clickable
                          without needing their own mouse-only handlers — and
                          the card becomes a single keyboard stop. */}
                      <button
                        type="button"
                        onClick={() => setSelectedStudy(featured)}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-meta tracking-wide text-ground transition-[background-color,transform] duration-300 after:absolute after:inset-0 after:content-[''] hover:bg-ink/90 active:scale-[0.98] motion-reduce:active:scale-100"
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
                className="group lift-hover relative flex flex-col overflow-hidden rounded-2xl border border-rule bg-surface hover:border-rule-strong hover:bg-surface-raised"
                style={{
                  opacity: gridInView ? 1 : 0,
                  transform: gridInView ? "translateY(0)" : "translateY(36px)",
                  filter: gridInView ? "blur(0px)" : "blur(10px)",
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 3) * 120}ms, border-color .3s, background-color .3s, box-shadow .35s`,
                }}
              >
                {/* A fixed 150px crop crippled the one asset worth showing —
                    a workflow diagram sliced from the top-left is unreadable.
                    A 16:10 box keeps the canvas legible at any card width. */}
                <div className="relative overflow-hidden border-b border-rule bg-surface-raised p-3">
                  {cs.sample && (
                    <span className="badge badge-accent absolute top-5 left-5 z-10 bg-ground/90 backdrop-blur-sm">
                      SAMPLE
                    </span>
                  )}
                  {cs.workflowImage && (
                    <img
                      src={cs.workflowImage}
                      width={1400}
                      height={900}
                      loading="lazy"
                      alt={`Workflow canvas for ${cs.title}`}
                      className="aspect-[16/10] w-full rounded object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex min-h-[1.75rem] flex-wrap items-center gap-2">
                    <Meta cs={cs} max={2} />
                    {cs.speed && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-meta text-accent">
                        <Ico d={P.bolt} size={11} />
                        {cs.speed}
                      </span>
                    )}
                  </div>

                  <h3
                    className="display-md mt-4 text-[1.2rem] leading-snug font-light text-ink"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-fine text-ink-2">{cs.description}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-rule pt-5">
                    {/* The whole card is this button's hit area; the label is a
                        quiet link because the card itself is the affordance.
                        Three stacked pills per card made the chrome louder than
                        the work it was framing. */}
                    <button
                      type="button"
                      onClick={() => setSelectedStudy(cs)}
                      className="inline-flex items-center gap-2 font-mono text-meta tracking-wide text-ink transition-colors after:absolute after:inset-0 after:content-['']"
                    >
                      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:bg-[length:100%_1px]">
                        Read case study
                      </span>
                      <span className="transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1">
                        <Ico d={P.arrow} size={13} />
                      </span>
                    </button>

                    <AuxLinks cs={cs} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {shown.length === 0 && (
            <p className="py-16 text-center text-fine text-ink-3">
              Nothing built on this platform yet.
            </p>
          )}
        </div>
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  )
}
