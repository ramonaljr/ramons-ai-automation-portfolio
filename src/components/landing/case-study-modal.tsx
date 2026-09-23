'use client'

import { useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

import { motion } from 'motion/react'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { GitHubIcon, Ico, linkOf, P, VideoIcon, WorkLink } from '@/components/landing/work-icons'
import { usePrefersReducedMotion } from '@/components/landing/motion'
import { THUMB_VARIANTS, thumbTransition, WORK_TONES, workViews } from '@/lib/work-views'
import { WorkCanvas } from '@/components/landing/work-canvas'

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

/** Everything inside the dialog a keyboard can land on, in document order. */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function CaseStudyModal({ study, onClose }: { study: CaseStudyMetadata | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  /**
   * Which of the project's views the dialog is showing. The cards carry the
   * same strip, so opening one and finding a single fixed image would read as
   * the dialog having less to show than the card that opened it.
   *
   * The selection is stored with the project it belongs to and compared during
   * render, rather than reset from an effect: a new project then opens on its
   * canvas without a second render pass, which is also the only form the React
   * Compiler accepts here.
   */
  const [picked, setPicked] = useState<{ slug: string; index: number }>({ slug: '', index: 0 })
  const viewIndex = picked.slug === study?.slug ? picked.index : 0

  /**
   * Scroll lock, Escape, and the focus contract a dialog owes a keyboard.
   *
   * `aria-modal` tells assistive tech to ignore the page behind, but it moves
   * nothing: without this, focus stayed on the card that opened the dialog, Tab
   * walked the page underneath it, and a screen reader was never told the
   * dialog had appeared. So focus moves in on open, cycles inside while open,
   * and returns to whatever opened it on close.
   */
  useEffect(() => {
    if (!study) return

    const opener = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()

        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current

      if (!panel) return

      const stops = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        el => el.offsetParent !== null || el === document.activeElement
      )

      if (stops.length === 0) {
        e.preventDefault()

        return
      }

      const first = stops[0]
      const last = stops[stops.length - 1]

      // Wrap at both ends, and pull focus back in if it has escaped the panel.
      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const prevOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    // The panel itself takes focus rather than the close button, so a screen
    // reader reads the dialog's label before offering a way out of it.
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
      opener?.focus?.()
    }
  }, [study, onClose])

  if (!study) return null

  const views = workViews(study)
  const view = views[Math.min(viewIndex, views.length - 1)]

  /**
   * Portalled to `document.body` rather than rendered in place.
   *
   * This modal is mounted inside `.blossom-story-root`, which carries `isolate`
   * and so opens a stacking context at `z-10`. Inside it, `z-[200]` only ranks
   * against its siblings — the fixed nav at `z-50` belongs to the page's root
   * context and painted straight over the dialog. A portal takes the dialog out
   * to the root context, where its z-index means what it says.
   */
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className='bg-ink/60 animate-in fade-in fixed inset-0 z-[200] flex items-center justify-center p-3 backdrop-blur-sm duration-200 sm:p-5 md:p-8'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-case-study-title'
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{ '--work-tone': WORK_TONES[study.slug] ?? 'var(--accent)' } as React.CSSProperties}
        className='bg-surface-raised border-rule animate-in zoom-in-95 relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border shadow-2xl duration-200 focus:outline-none'
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Top Header (Fixed inside modal) ────────────────────────── */}
        <div className='border-rule bg-surface-raised relative border-b px-6 pt-6 pr-16 pb-5 sm:px-8 sm:pt-8'>
          {/* Tags */}
          <div className='mb-3 flex flex-wrap items-center gap-2'>
            {/* One label, not a claim and its own contradiction: this said
                "CASE STUDY" while a SAMPLE badge sat three chips along. */}
            <span className='text-ink-3 font-mono text-[11px] tracking-[0.2em] uppercase'>
              {study.sample ? 'Architecture lab' : 'Case study'}
            </span>
            {study.platform && (
              <span className='border-rule-strong bg-ink/4 text-ink-2 rounded-full border px-2.5 py-0.5 font-mono text-[11px]'>
                {study.platform}
              </span>
            )}
            {study.categories?.map(c => (
              <span key={c} className='border-rule text-ink-2 rounded-full border px-2.5 py-0.5 font-mono text-[11px]'>
                {c}
              </span>
            ))}
            {study.speed && (
              <span className='badge badge-accent'>
                <Ico d={study.speedKind === 'throughput' ? P.stack : P.bolt} size={11} />
                {study.speed}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id='modal-case-study-title'
            className='text-ink text-2xl leading-snug font-light tracking-tight sm:text-3xl lg:text-[34px]'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {study.title}
          </h2>

          {/* Description */}
          {study.description && (
            <p className='text-ink-2 mt-2 max-w-2xl text-[14.5px] leading-relaxed'>{study.description}</p>
          )}

          {/* Close button (top right) */}
          <button
            type='button'
            onClick={onClose}
            aria-label='Close dialog'
            className='border-rule bg-ink/3 text-ink-2 hover:text-ink hover:bg-ink/8 hover:border-rule-strong absolute top-5 right-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all sm:top-7 sm:right-7'
          >
            <Ico d={P.close} size={15} />
          </button>
        </div>

        {/* ── Scrollable Body Content ──────────────────────────────────────── */}
        <div className='flex-1 space-y-8 overflow-y-auto bg-[#FAF9F6] px-6 py-6 sm:px-8 sm:py-8'>
          {/* 1. Workflow Canvas Frame */}
          {view && (
            <div className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'>
              <div className='border-rule text-ink-3 mb-3 flex items-center justify-between gap-3 border-b pb-3 font-mono text-[11px] tracking-wide uppercase'>
                <span>{view.label}</span>
                {/* Stage count describes the canvas, so it goes when the canvas does. */}
                {view.key === 'canvas' && study.stepCount && <span>{study.stepCount} STAGES</span>}
              </div>

              {/* The canvas runs here too, dark like the card that opened it,
                  so the dialog never shows less than the card did. */}
              {view.key === 'canvas' ? (
                <div className='work-dialog-canvas overflow-hidden rounded-xl'>
                  <WorkCanvas
                    src={view.src}
                    label={view.alt}
                    idSuffix={`${study.slug}-dialog`}
                    run={1}
                    reduced={reduced}
                    lead={0.2}
                  />
                </div>
              ) : (
                <div className='bg-ground flex items-center justify-center overflow-hidden rounded-xl'>
                  <img
                    key={view.key}
                    src={view.src}
                    alt={view.alt}
                    className='h-auto max-h-[400px] w-full object-contain'
                  />
                </div>
              )}

              {views.length > 1 && (
                <div className='work-card-views mt-3' role='group' aria-label={`Views of ${study.title ?? study.slug}`}>
                  {views.map((item, index) => (
                    <motion.button
                      key={item.key}
                      type='button'
                      className='work-card-view'
                      data-view={item.key}
                      aria-pressed={index === viewIndex}
                      aria-label={`Show ${item.label}`}
                      initial={false}
                      animate={index === viewIndex ? 'active' : 'inactive'}
                      variants={THUMB_VARIANTS}
                      transition={thumbTransition(reduced)}
                      onClick={() => setPicked({ slug: study.slug, index })}
                    >
                      <img src={item.src} alt='' aria-hidden='true' width={280} height={175} loading='lazy' />
                    </motion.button>
                  ))}
                </div>
              )}

              {study.logicSummary && (
                <div className='border-rule text-ink-2 mt-3 flex items-center gap-2 border-t pt-3 font-mono text-[12px]'>
                  <span className='text-ink-4'>FLOW:</span>
                  <span className='truncate'>{study.logicSummary}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. ROI & Key Metrics */}
          {study.roi && study.roi.length > 0 && (
            <div>
              <p className='text-ink-4 mb-3 font-mono text-[11px] tracking-[0.2em] uppercase'>
                KEY OUTCOMES &amp; IMPACT
              </p>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {study.roi.map((r, idx) => (
                  <div key={idx} className='border-rule bg-surface-raised rounded-xl border p-4 text-center shadow-sm'>
                    <div className='text-ink text-2xl font-light sm:text-3xl' style={{ fontFamily: DISPLAY_FONT }}>
                      {r.value}
                    </div>
                    <div className='text-ink-3 mt-1 font-sans text-[12px] leading-tight'>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. The Problem & What I Built */}
          {(study.problem || study.solution) && (
            <div className='grid gap-4 sm:grid-cols-2'>
              {study.problem && (
                <div className='border-rule bg-ink/3 rounded-2xl border p-5 sm:p-6'>
                  <p className='text-ink-2 font-mono text-[11px] font-medium tracking-[0.2em] uppercase'>
                    THE PROBLEM
                  </p>
                  <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{study.problem}</p>
                </div>
              )}

              {study.solution && (
                <div className='rounded-2xl border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] bg-[color-mix(in_oklch,var(--accent)_5%,transparent)] p-5 sm:p-6'>
                  <p className='text-accent font-mono text-[11px] font-medium tracking-[0.2em] uppercase'>
                    WHAT I BUILT (THE SOLUTION)
                  </p>
                  <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{study.solution}</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Active Integrations & Tech Stack */}
          {(study.integrations || study.tools) && (
            <div>
              <p className='text-ink-4 mb-3 font-mono text-[11px] tracking-[0.2em] uppercase'>
                ACTIVE INTEGRATIONS &amp; STACK
              </p>
              <div className='flex flex-wrap gap-2'>
                {(study.integrations || study.tools)?.map(tool => (
                  <span
                    key={tool}
                    className='border-rule bg-surface-raised text-ink-2 rounded-lg border px-3.5 py-1.5 font-mono text-[12px] shadow-xs'
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Fail-safes & Resilience */}
          {study.failsafes && study.failsafes.length > 0 && (
            <div className='border-rule bg-surface-raised rounded-2xl border p-5 shadow-sm sm:p-6'>
              <p className='text-accent mb-2 font-mono text-[11px] font-medium tracking-[0.2em] uppercase'>
                SYSTEM RESILIENCE &amp; ERROR HANDLING
              </p>
              {study.failsafeDesc && <p className='text-ink-2 mb-4 text-[13.5px]'>{study.failsafeDesc}</p>}
              <div className='border-rule grid gap-3 border-t pt-2 sm:grid-cols-2'>
                {study.failsafes.map((f, i) => (
                  <div key={i} className='text-[13px]'>
                    <span className='text-ink mb-1 block font-mono font-medium'>{f.title}</span>
                    <span className='text-ink-3 block leading-relaxed'>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Pinned Footer Actions ──────────────────────────────────── */}
        <div className='border-rule bg-surface-raised flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 sm:px-8'>
          {/* These pointed somewhere plausible when empty — "Walkthrough" led
              to the case-study page and "Source" to a GitHub profile rather
              than a repo, so both promised something that did not exist. They
              now sit inert until the frontmatter carries a real URL. */}
          <div className='flex flex-wrap items-center gap-2'>
            <WorkLink href={linkOf(study.videoUrl)} label='Walkthrough' icon={<VideoIcon size={13} />} />
            <WorkLink href={linkOf(study.repoUrl)} label='Source' icon={<GitHubIcon size={13} />} />
          </div>

          <div className='flex items-center gap-3'>
            <a
              href={`/case-study/${study.slug}`}
              className='text-fine text-ink-3 hover:text-ink inline-flex items-center gap-1.5 font-mono transition-colors'
            >
              Read full case study
              <Ico d={P.external} size={12} />
            </a>

            <a
              href='/#contact'
              className='bg-ink text-meta text-ground hover:bg-ink/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono tracking-wide transition-colors'
            >
              Book a workflow audit
              <Ico d={P.arrow} size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
