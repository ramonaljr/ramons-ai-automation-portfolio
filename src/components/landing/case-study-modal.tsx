"use client"

import { useEffect } from "react"
import type { CaseStudyMetadata } from "@/lib/case-studies"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

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
  close: "M6 18L18 6M6 6l12 12",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
}

export function CaseStudyModal({
  study,
  onClose,
}: {
  study: CaseStudyMetadata | null
  onClose: () => void
}) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!study) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [study, onClose])

  if (!study) return null

  const leadImage = study.workflowImage || study.heroImage || study.image

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-case-study-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-black/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Top Header (Fixed inside modal) ────────────────────────── */}
        <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8 border-b border-black/[0.07] bg-white pr-16">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-black/55">
              CASE STUDY
            </span>
            {study.platform && (
              <span className="rounded-full border border-black/15 bg-black/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-black/75">
                {study.platform}
              </span>
            )}
            {study.categories?.map(c => (
              <span key={c} className="rounded-full border border-black/10 px-2.5 py-0.5 font-mono text-[11px] text-black/70">
                {c}
              </span>
            ))}
            {study.speed && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-500/[0.08] px-2.5 py-0.5 font-mono text-[11px] text-emerald-800/85">
                <Ico d={P.bolt} size={11} />
                {study.speed}
              </span>
            )}
            {study.sample && (
              <span className="rounded border border-amber-600/30 bg-amber-500/[0.08] px-2 py-0.5 font-mono text-[10px] tracking-widest text-amber-700/80">
                SAMPLE
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id="modal-case-study-title"
            className="text-2xl sm:text-3xl lg:text-[34px] font-light leading-snug tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {study.title}
          </h2>

          {/* Description */}
          {study.description && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-black/70 max-w-2xl">
              {study.description}
            </p>
          )}

          {/* Close button (top right) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 w-9 h-9 rounded-full border border-black/12 bg-black/[0.03] text-black/70 hover:text-black hover:bg-black/[0.08] hover:border-black/25 flex items-center justify-center transition-all cursor-pointer"
          >
            <Ico d={P.close} size={15} />
          </button>
        </div>

        {/* ── Scrollable Body Content ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-8 bg-[#FAF9F6]">
          {/* 1. Workflow Canvas Frame */}
          {leadImage && (
            <div className="rounded-2xl border border-black/[0.08] bg-white p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-black/[0.06] text-black/60 font-mono text-[11px] tracking-wide">
                <span>WORKFLOW ARCHITECTURE</span>
                {study.stepCount && <span>{study.stepCount} STAGES</span>}
              </div>

              <div className="overflow-hidden rounded-xl bg-[#F5F4F0] flex items-center justify-center">
                <img
                  src={leadImage}
                  alt={`Workflow diagram for ${study.title}`}
                  className="w-full h-auto object-contain max-h-[480px]"
                />
              </div>

              {study.logicSummary && (
                <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center gap-2 font-mono text-[12px] text-black/70">
                  <span className="text-black/40">FLOW:</span>
                  <span className="truncate">{study.logicSummary}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. ROI & Key Metrics */}
          {study.roi && study.roi.length > 0 && (
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-black/50 mb-3 uppercase">
                KEY OUTCOMES &amp; IMPACT
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {study.roi.map((r, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-black/[0.07] bg-white p-4 text-center shadow-sm"
                  >
                    <div
                      className="text-2xl sm:text-3xl font-light text-[#111]"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {r.value}
                    </div>
                    <div className="mt-1 text-[12px] text-black/65 font-sans leading-tight">
                      {r.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. The Problem & What I Built */}
          {(study.problem || study.solution) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {study.problem && (
                <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-5 sm:p-6">
                  <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-rose-800/80 font-medium">
                    THE PROBLEM
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-black/75">
                    {study.problem}
                  </p>
                </div>
              )}

              {study.solution && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6">
                  <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-emerald-800/80 font-medium">
                    WHAT I BUILT (THE SOLUTION)
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-black/75">
                    {study.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Active Integrations & Tech Stack */}
          {(study.integrations || study.tools) && (
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-black/50 mb-3 uppercase">
                ACTIVE INTEGRATIONS &amp; STACK
              </p>
              <div className="flex flex-wrap gap-2">
                {(study.integrations || study.tools)?.map(tool => (
                  <span
                    key={tool}
                    className="rounded-lg border border-black/[0.08] bg-white px-3.5 py-1.5 font-mono text-[12px] text-black/75 shadow-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Fail-safes & Resilience */}
          {study.failsafes && study.failsafes.length > 0 && (
            <div className="rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6 shadow-sm">
              <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-800/85 font-medium uppercase mb-2">
                SYSTEM RESILIENCE &amp; ERROR HANDLING
              </p>
              {study.failsafeDesc && (
                <p className="text-[13.5px] text-black/70 mb-4">{study.failsafeDesc}</p>
              )}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-black/[0.06]">
                {study.failsafes.map((f, i) => (
                  <div key={i} className="text-[13px]">
                    <span className="font-mono text-black/85 font-medium block mb-1">
                      {f.title}
                    </span>
                    <span className="text-black/65 leading-relaxed block">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Pinned Footer Actions ──────────────────────────────────── */}
        <div className="px-6 py-4 sm:px-8 border-t border-black/[0.08] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {study.videoUrl ? (
              <a
                href={study.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/[0.03] px-4 py-2.5 font-mono text-[12px] tracking-wide text-black/80 hover:bg-black hover:text-white transition-all"
              >
                <VideoIcon size={13} />
                Live Video Walkthrough
              </a>
            ) : null}

            <a
              href={study.repoUrl || "https://github.com/ramonaljr"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/[0.03] px-4 py-2.5 font-mono text-[12px] tracking-wide text-black/80 hover:bg-black hover:text-white transition-all"
            >
              <GitHubIcon size={13} />
              View Github
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/case-study/${study.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-mono text-black/60 hover:text-black transition-colors"
            >
              Full Page Read
              <Ico d={P.external} size={12} />
            </a>

            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 font-mono text-[12.5px] tracking-wide text-white transition-colors hover:bg-black"
            >
              Hire Me For This
              <Ico d={P.arrow} size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
