"use client"

import { useEffect, useRef, useState } from "react"

import type { CaseStudyMetadata } from "@/lib/case-studies"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

const TABS = ["Workflow Screenshot", "Logic & Steps", "Impact & Metrics", "Fail-Safes"] as const

type Tab = (typeof TABS)[number]

function Ico({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const P = {
  close: "M18 6L6 18M6 6l12 12",
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  layers: "M12 2l9 5-9 5-9-5 9-5zM3 17l9 5 9-5M3 12l9 5 9-5",
  trend: "M3 17l6-6 4 4 7-7M21 8V4h-4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  flow: "M4 6h6M4 18h6M14 12h6M10 6a2 2 0 104 0 2 2 0 10-4 0M10 18a2 2 0 104 0 2 2 0 10-4 0M4 12a2 2 0 104 0 2 2 0 10-4 0",
  play: "M6 4l14 8-14 8V4z",
  git: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0019.9 5a4.9 4.9 0 00-.1-3.6s-1.2-.3-3.9 1.5a13.4 13.4 0 00-7 0C6.2 1.1 5 1.4 5 1.4A4.9 4.9 0 004.9 5 5.2 5.2 0 003.5 8.8c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 00-.9 2.5V22",
  arrow: "M4 12h14M13 6l6 6-6 6",
}

const TAB_ICON: Record<Tab, string> = {
  "Workflow Screenshot": P.flow,
  "Logic & Steps": P.layers,
  "Impact & Metrics": P.trend,
  "Fail-Safes": P.shield,
}

export function ProjectModal({ cs, onClose }: { cs: CaseStudyMetadata; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Workflow Screenshot")
  const [zoom, setZoom] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape to close, and lock the page behind the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }

    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow

    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const label = (t: Tab) => (t === "Logic & Steps" && cs.stepCount ? `${t} (${cs.stepCount})` : t)

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={cs.title}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />

      <div
        ref={panelRef}
        className="relative w-full max-w-4xl my-auto rounded-2xl border border-black/[0.09] bg-[#F5F4F0] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="p-7 sm:p-9 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {cs.platform && (
                <span className="rounded-full border border-black/15 bg-black/[0.04] px-3 py-1 font-mono text-[11px] tracking-wide text-black/70">
                  {cs.platform}
                </span>
              )}
              {cs.categories?.map(c => (
                <span key={c} className="rounded-full border border-black/10 px-3 py-1 font-mono text-[11px] tracking-wide text-black/60">
                  {c}
                </span>
              ))}
              {cs.sample && (
                <span className="rounded-full border border-amber-600/30 bg-amber-500/[0.08] px-3 py-1 font-mono text-[10px] tracking-widest text-amber-700/80">
                  SAMPLE
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/60 transition-all hover:border-black/25 hover:text-black"
            >
              <Ico d={P.close} size={15} />
            </button>
          </div>

          <h2
            className="mt-5 text-[clamp(1.5rem,3vw,2.15rem)] font-light leading-tight tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {cs.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-black/55">{cs.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-y border-black/[0.07] px-7 sm:px-9">
          {TABS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-[13px] transition-colors ${
                tab === t
                  ? "border-[#111] text-[#111]"
                  : "border-transparent text-black/55 hover:text-black/70"
              }`}
            >
              <Ico d={TAB_ICON[t]} />
              {label(t)}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="p-7 sm:p-9">
          {tab === "Workflow Screenshot" && (
            <>
              <div className="relative overflow-hidden rounded-xl border border-black/[0.07] bg-white">
                <button
                  type="button"
                  onClick={() => setZoom(z => !z)}
                  className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/90 px-3 py-2 font-mono text-[11px] tracking-wide text-black/60 backdrop-blur transition-all hover:border-black/25 hover:text-black"
                >
                  <Ico d={P.expand} size={13} />
                  {zoom ? "COLLAPSE" : "EXPAND VIEW"}
                </button>
                <div className={zoom ? "max-h-none overflow-auto" : "max-h-[380px] overflow-hidden"}>
                  {cs.workflowImage && (
                    <img
                      src={cs.workflowImage}
                      width={1400}
                      height={900}
                      loading="lazy"
                      alt={`Workflow canvas for ${cs.title}`}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1.6fr_1fr]">
                <div className="rounded-xl border border-black/[0.07] bg-white/60 p-5">
                  <p className="font-mono text-[10px] tracking-widest text-black/55">
                    WORKFLOW LOGIC SUMMARY
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-black/65">{cs.logicSummary}</p>
                </div>
                {cs.keyOutcome && (
                  <div className="rounded-xl border border-emerald-600/20 bg-emerald-500/[0.06] p-5">
                    <p className="font-mono text-[10px] tracking-widest text-emerald-800/60">KEY OUTCOME</p>
                    <p
                      className="mt-2 text-3xl font-light text-emerald-800"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {cs.keyOutcome.value}
                    </p>
                    <p className="mt-1 text-[13px] text-emerald-900/55">{cs.keyOutcome.label}</p>
                  </div>
                )}
              </div>

              {cs.integrations && (
                <>
                  <p className="mt-6 font-mono text-[10px] tracking-widest text-black/55">
                    ACTIVE INTEGRATIONS IN WORKFLOW:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cs.integrations.map(i => (
                      <span key={i} className="rounded-lg border border-black/[0.09] bg-white px-3.5 py-2 font-mono text-[12px] text-black/60">
                        {i}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "Logic & Steps" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-rose-600/15 bg-rose-500/[0.04] p-6">
                <p className="font-mono text-[11px] tracking-widest text-rose-800/70">OPERATIONAL PROBLEM</p>
                <p className="mt-3 text-[14px] leading-relaxed text-black/65">{cs.problem}</p>
              </div>
              <div className="rounded-xl border border-emerald-600/20 bg-emerald-500/[0.05] p-6">
                <p className="font-mono text-[11px] tracking-widest text-emerald-800/70">ENGINEERED SOLUTION</p>
                <p className="mt-3 text-[14px] leading-relaxed text-black/65">{cs.solution}</p>
              </div>
            </div>
          )}

          {tab === "Impact & Metrics" && (
            <>
              <div className="rounded-xl border border-emerald-600/20 bg-emerald-500/[0.06] p-6 sm:p-7">
                <p className="font-mono text-[11px] tracking-widest text-emerald-800/70">PRIMARY HIGHLIGHT</p>
                <p
                  className="mt-3 text-xl font-medium leading-snug text-[#111]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {cs.impactHighlight}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-black/55">{cs.impactHighlightDesc}</p>
              </div>

              {cs.roi && (
                <>
                  <p className="mt-7 font-mono text-[10px] tracking-widest text-black/55">QUANTIFIED ROI:</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {cs.roi.map(r => (
                      <div key={r.label} className="rounded-xl border border-black/[0.07] bg-white/60 p-6 text-center">
                        <p
                          className="text-3xl font-light text-[#111]"
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {r.value}
                        </p>
                        <p className="mt-2 text-[12px] text-black/60">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "Fail-Safes" && (
            <>
              <div className="rounded-xl border border-emerald-600/20 bg-emerald-500/[0.05] p-6 sm:p-7">
                <p className="flex items-center gap-2.5 text-[15px] font-medium text-[#111]">
                  <span className="text-emerald-700"><Ico d={P.shield} size={17} /></span>
                  {cs.failsafeHeadline}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-black/55">{cs.failsafeDesc}</p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {cs.failsafes?.map(f => (
                  <div key={f.title} className="rounded-xl border border-black/[0.07] bg-white/60 p-6">
                    <p className="font-mono text-[13px] text-emerald-800/80">{f.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-black/55">{f.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.07] p-7 sm:px-9">
          <p className="font-mono text-[12px] text-black/55">
            Platform: <span className="text-black/70">{cs.platform ?? "—"}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {cs.videoUrl ? (
              <a
                href={cs.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/12 px-4 py-2.5 text-[12px] text-black/65 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black"
              >
                <Ico d={P.play} size={12} />
                Live video walkthrough
              </a>
            ) : (
              <span
                className="inline-flex cursor-default items-center gap-2 rounded-full border border-dashed border-black/12 px-4 py-2.5 text-[12px] text-black/62"
                title="Add videoUrl to this case study's frontmatter to enable"
              >
                <Ico d={P.play} size={12} />
                Walkthrough soon
              </span>
            )}

            {cs.repoUrl ? (
              <a
                href={cs.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/12 px-4 py-2.5 text-[12px] text-black/65 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black"
              >
                <Ico d={P.git} size={13} />
                View GitHub
              </a>
            ) : (
              <span
                className="inline-flex cursor-default items-center gap-2 rounded-full border border-dashed border-black/12 px-4 py-2.5 text-[12px] text-black/62"
                title="Add repoUrl to this case study's frontmatter to enable"
              >
                <Ico d={P.git} size={13} />
                Repo soon
              </span>
            )}

            <a
              href={`/case-study/${cs.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/12 px-4 py-2.5 text-[12px] text-black/65 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black"
            >
              Read full case study
              <Ico d={P.arrow} size={13} />
            </a>

            <a
              href="/contact"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#111] px-5 py-2.5 text-[12px] tracking-wide text-white transition-colors hover:bg-black"
            >
              Build similar architecture
              <Ico d={P.arrow} size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
