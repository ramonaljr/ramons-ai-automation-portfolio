'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import dynamic from 'next/dynamic'
import { createPortal } from 'react-dom'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { GitHubIcon, Ico, linkOf, P, VideoIcon, WorkLink } from '@/components/landing/work-icons'
import {
  DISPLAY_FONT,
  rise,
  sweep,
  SWEEP_STEP_DENSE,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { WORK_TONES } from '@/lib/work-views'
import { hasShowcaseFilm, WorkShowcase } from '@/components/landing/work-showcase'
import { ToolMark } from '@/components/landing/tool-stack-section'
import { toolNamed } from '@/lib/portfolio'
import { hasDemo } from '@/lib/demos'

/** The live build: client-only, and only fetched when a project with one is opened. */
const WorkflowDemo = dynamic(() => import('@/components/landing/demo/n8n-demo').then(m => m.WorkflowDemo), {
  ssr: false
})

/** A block that folds to nothing: grid rows animate where height cannot. */
const FOLD = 'grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none'

/**
 * The landing page's scroll entrance, for the dialog body.
 *
 * `useInView` observes against the viewport, and an IntersectionObserver
 * clips its target by every scrolling ancestor on the way up, so a block
 * below the fold of the dialog's own scroller still waits until it is
 * scrolled into view there. Render-prop so a block can stagger its children
 * off one observer instead of giving each card its own.
 */
function InView({ className, children }: { className?: string; children: (inView: boolean) => ReactNode }) {
  const { ref, inView } = useInView()

  return (
    <div ref={ref} className={className}>
      {children(inView)}
    </div>
  )
}

/** Everything inside the dialog a keyboard can land on, in document order. */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function CaseStudyModal({
  study,
  onClose
}: {
  study: CaseStudyMetadata | null

  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  /**
   * Film or workflow in the top frame: the film leads wherever there is one,
   * and plays as the dialog opens, with the workflow a click away. The parent
   * keys the dialog by project, so this starts fresh on every open.
   */
  const [showFilm, setShowFilm] = useState(true)

  const reduced = usePrefersReducedMotion()

  /**
   * The header folds down to the title once the body scrolls, so the tags and
   * description stop taking a fifth of the screen from the content. It folds
   * past 64px and opens again only near the top: the gap keeps it from
   * flickering when the reader stops right at the line.
   */
  const [compact, setCompact] = useState(false)

  const onBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop

    if (top > 64) setCompact(true)
    else if (top < 8) setCompact(false)
  }

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

    // The panel fills the window: tell the page under it to stop animating
    // (particle-field.tsx, .field-aura in globals.css). It cannot be seen, and
    // drawing it every frame made the dialog lag as it opened.
    document.documentElement.setAttribute('data-covered', '')
    window.addEventListener('keydown', handleKeyDown)

    // The panel itself takes focus rather than the close button, so a screen
    // reader reads the dialog's label before offering a way out of it.
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      document.documentElement.removeAttribute('data-covered')
      window.removeEventListener('keydown', handleKeyDown)
      opener?.focus?.()
    }
  }, [study, onClose])

  if (!study) return null

  const hasFilm = hasShowcaseFilm(study)

  // Read once here: the blocks below render inside an <InView> callback, where
  // TypeScript no longer carries the `study.roi &&` check into the closure.
  const roi = study.roi ?? []
  const failsafes = study.failsafes ?? []

  // Scroll on the next frame: the film replacing the canvas changes the
  // layout, and a scroll started before that commit is cancelled by it.
  const watch = () => {
    setShowFilm(true)
    requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }))
  }

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

  // No backdrop blur: the panel fills the window, so it would never show, and
  // under a live film Chrome re-blurred the whole page on every repaint of the
  // film's ink, eight a second, flashing the page through on a Mac.
  return createPortal(
    <div
      className='bg-ink/60 animate-in fade-in fixed inset-0 z-[200] flex items-center justify-center duration-200'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-case-study-title'
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{ '--work-tone': WORK_TONES[study.slug] ?? 'var(--accent)' } as React.CSSProperties}
        className='bg-surface-raised animate-in zoom-in-95 relative flex h-full w-full flex-col overflow-hidden duration-200 focus:outline-none'
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Top Header (Fixed inside modal) ────────────────────────── */}
        <div
          className={`border-rule bg-surface-raised relative border-b px-[max(1.5rem,calc((100%-90rem)/2))] transition-[padding] duration-300 motion-reduce:transition-none sm:px-[max(2rem,calc((100%-90rem)/2))] ${
            compact ? 'py-3 sm:py-3.5' : 'pt-6 pb-5 sm:pt-8'
          }`}
        >
          {/* Tags: folded away with the description once the body scrolls. */}
          <div
            className={`${FOLD} ${compact ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`}
            aria-hidden={compact || undefined}
          >
            <div className='min-h-0 overflow-hidden'>
              <div className='mb-3 flex flex-wrap items-center gap-2 pr-12'>
                {/* One label, not a claim and its own contradiction: this said
                "CASE STUDY" while a SAMPLE badge sat three chips along. */}
                <span className='text-ink-3 font-mono text-xs tracking-[0.2em] uppercase'>
                  {study.sample ? 'Demo project' : study.sampleClient ? 'Sample client build' : 'Case study'}
                </span>
                {study.platform && (
                  <span className='border-rule-strong bg-ink/4 text-ink-2 rounded-full border px-2.5 py-0.5 font-mono text-xs'>
                    {study.platform}
                  </span>
                )}
                {study.categories?.map(c => (
                  <span key={c} className='border-rule text-ink-2 rounded-full border px-2.5 py-0.5 font-mono text-xs'>
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
            </div>
          </div>

          {/* Title */}
          <h2
            id='modal-case-study-title'
            className={`text-ink pr-12 leading-snug font-light tracking-tight transition-[font-size] duration-300 motion-reduce:transition-none ${
              compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl lg:text-[34px]'
            }`}
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {study.title}
          </h2>

          {/* Description */}
          {study.description && (
            <div className={`${FOLD} ${compact ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`}>
              <div className='min-h-0 overflow-hidden'>
                <p className='text-ink-2 mt-2 max-w-2xl text-[14.5px] leading-relaxed'>{study.description}</p>
              </div>
            </div>
          )}

          {/* Close button (top right) */}
          <button
            type='button'
            onClick={onClose}
            aria-label='Close dialog'
            className={`border-rule bg-ink/3 text-ink-2 hover:text-ink hover:bg-ink/8 hover:border-rule-strong absolute right-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all sm:right-7 ${
              compact ? 'top-1/2 -translate-y-1/2' : 'top-5 sm:top-7'
            }`}
          >
            <Ico d={P.close} size={15} />
          </button>
        </div>

        {/* ── Scrollable Body Content ──────────────────────────────────────── */}
        <div
          ref={bodyRef}
          onScroll={onBodyScroll}
          className='flex-1 space-y-8 overflow-y-auto bg-[#FAF9F6] px-[max(1.5rem,calc((100%-90rem)/2))] py-6 sm:px-[max(2rem,calc((100%-90rem)/2))] sm:py-8'
        >
          {/* 1. The film and the workflow, sharing the top frame (work-showcase.tsx). */}
          <WorkShowcase study={study} showFilm={showFilm} onShowFilm={setShowFilm} reduced={reduced} place='dialog' />

          {/* 2. ROI & Key Metrics. The outcome is said in words first, and
              each figure carries a line on what it means for the business:
              a bare "3" or "15 min" tells a reader nothing on its own. */}
          {roi.length > 0 && (
            <InView>
              {inView => (
                <>
                  <p className='text-ink-3 mb-3 font-mono text-xs tracking-[0.2em] uppercase' style={rise(inView)}>
                    KEY OUTCOMES &amp; IMPACT
                  </p>
                  {study.impactHighlight && (
                    <div className='mb-5 max-w-3xl' style={rise(inView, 90)}>
                      <p
                        className='text-ink text-xl leading-snug font-light tracking-tight sm:text-2xl'
                        style={{ fontFamily: DISPLAY_FONT }}
                      >
                        {study.impactHighlight}
                      </p>
                      {study.impactHighlightDesc && (
                        <p className='text-ink-2 mt-2 text-[14.5px] leading-relaxed'>{study.impactHighlightDesc}</p>
                      )}
                    </div>
                  )}
                  <div className='grid gap-3 sm:grid-cols-3'>
                    {roi.map((r, idx) => (
                      <div
                        key={idx}
                        className='border-rule bg-surface-raised rounded-xl border p-5 shadow-sm'
                        style={sweep(inView, idx + 1)}
                      >
                        <div className='text-ink text-2xl font-light sm:text-3xl' style={{ fontFamily: DISPLAY_FONT }}>
                          {r.value}
                        </div>
                        <div className='text-ink-3 mt-1 font-mono text-[11px] tracking-[0.12em] uppercase'>
                          {r.label}
                        </div>
                        {r.desc && (
                          <p className='text-ink-2 border-rule mt-3 border-t pt-3 text-[13.5px] leading-relaxed'>
                            {r.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </InView>
          )}

          {/* 3. The Problem & What I Built */}
          {(study.problem || study.solution) && (
            <InView className='grid gap-4 sm:grid-cols-2'>
              {inView => (
                <>
                  {study.problem && (
                    <div className='border-rule bg-ink/3 rounded-2xl border p-5 sm:p-6' style={sweep(inView, 0)}>
                      <p className='text-ink-2 font-mono text-xs font-medium tracking-[0.2em] uppercase'>THE PROBLEM</p>
                      <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{study.problem}</p>
                    </div>
                  )}

                  {study.solution && (
                    <div
                      className='bg-surface rounded-2xl border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] p-5 sm:p-6'
                      style={sweep(inView, study.problem ? 1 : 0)}
                    >
                      <p className='text-accent font-mono text-xs font-medium tracking-[0.2em] uppercase'>
                        WHAT I BUILT
                      </p>
                      <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{study.solution}</p>
                    </div>
                  )}
                </>
              )}
            </InView>
          )}

          {/* 4. Active Integrations & Tech Stack */}
          {(study.integrations || study.tools) && (
            <InView>
              {inView => (
                <>
                  <p className='text-ink-3 mb-3 font-mono text-xs tracking-[0.2em] uppercase' style={rise(inView)}>
                    TOOLS USED
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {(study.integrations || study.tools)?.map((tool, i) => (
                      <span
                        key={tool}
                        style={sweep(inView, i, SWEEP_STEP_DENSE, 18)}
                        className='work-tool-chip border-rule bg-surface-raised text-ink-2 inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-[12px] shadow-xs'
                      >
                        <ToolMark tool={toolNamed(tool)} size={13} />
                        {tool}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </InView>
          )}

          {/* 5. Fail-safes & Resilience */}
          {failsafes.length > 0 && (
            <InView>
              {inView => (
                <div
                  className='border-rule bg-surface-raised rounded-2xl border p-5 shadow-sm sm:p-6'
                  style={rise(inView)}
                >
                  <p className='text-accent mb-2 font-mono text-xs font-medium tracking-[0.2em] uppercase'>
                    WHEN SOMETHING GOES WRONG
                  </p>
                  {study.failsafeDesc && <p className='text-ink-2 mb-4 text-[13.5px]'>{study.failsafeDesc}</p>}
                  <div className='border-rule grid gap-3 border-t pt-2 sm:grid-cols-2'>
                    {failsafes.map((f, i) => (
                      <div key={i} className='text-[13px]'>
                        <span className='text-ink mb-1 block font-mono font-medium'>{f.title}</span>
                        <span className='text-ink-3 block leading-relaxed'>{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </InView>
          )}

          {/* 6. The build itself, runnable. Its own section rather than a view
              in the gallery above: there it shared a 14:9 frame with the
              screenshots and every node name was too small to read. The
              gallery keeps the screenshot; this gets the dialog's full width.
              The demo renders its own section, and the results under it
              (what the run leaves in Gmail, Slack, Airtable...). */}
          {hasDemo(study.slug) && (
            <WorkflowDemo
              slug={study.slug}
              platform={study.platform ?? 'workflow'}
              fallback={study.heroImage ?? study.image ?? ''}
              alt={`${study.title} build`}
              reduced={reduced}
            />
          )}
        </div>

        {/* ── Modal Pinned Footer Actions ──────────────────────────────────── */}
        <div className='border-rule bg-surface-raised flex flex-wrap items-center justify-between gap-3 border-t px-[max(1.5rem,calc((100%-90rem)/2))] py-4 sm:px-[max(2rem,calc((100%-90rem)/2))]'>
          {/* These pointed somewhere plausible when empty — "Walkthrough" led
              to the case-study page and "Source" to a GitHub profile rather
              than a repo, so both promised something that did not exist. They
              now sit inert until the frontmatter carries a real URL. A film
              hosted here plays in the dialog instead of opening a tab. */}
          <div className='flex flex-wrap items-center gap-2'>
            {hasFilm ? (
              <WorkLink label='Walkthrough' icon={<VideoIcon size={13} />} onClick={watch} />
            ) : (
              <WorkLink href={linkOf(study.videoUrl)} label='Walkthrough' icon={<VideoIcon size={13} />} />
            )}
            <WorkLink href={linkOf(study.repoUrl)} label='Source' icon={<GitHubIcon size={13} />} />
          </div>

          {/* On a phone this row takes the full width, one line each: the
              link's long label wrapped to two lines beside a two-line button. */}
          <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start'>
            <a
              href={`/case-study/${study.slug}`}
              className='text-fine text-ink-3 hover:text-ink inline-flex items-center gap-1.5 font-mono whitespace-nowrap transition-colors'
            >
              <span className='sm:hidden'>Full case study</span>
              <span className='hidden sm:inline'>Read full case study</span>
              <Ico d={P.external} size={12} />
            </a>

            <a
              href='/#contact'
              className='bg-ink text-meta text-ground hover:bg-ink/90 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono tracking-wide whitespace-nowrap transition-colors'
            >
              Book a free call
              <Ico d={P.arrow} size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
