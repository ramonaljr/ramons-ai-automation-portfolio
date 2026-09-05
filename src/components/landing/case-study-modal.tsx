'use client'

import { useEffect } from 'react'

import type { CaseStudyMetadata } from '@/lib/case-studies'

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

function Ico({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={d} />
    </svg>
  )
}

function VideoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <polygon points='23 7 16 12 23 17 23 7' />
      <rect x='1' y='5' width='15' height='14' rx='2' ry='2' />
    </svg>
  )
}

function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
      />
    </svg>
  )
}

const P = {
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  arrow: 'M4 12h14M13 6l6 6-6 6',
  close: 'M6 18L18 6M6 6l12 12',
  external: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3'
}

export function CaseStudyModal({ study, onClose }: { study: CaseStudyMetadata | null; onClose: () => void }) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!study) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [study, onClose])

  if (!study) return null

  const leadImage = study.workflowImage || study.heroImage || study.image

  return (
    <div
      className='bg-ink/60 animate-in fade-in fixed inset-0 z-[200] flex items-center justify-center p-3 backdrop-blur-sm duration-200 sm:p-5 md:p-8'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-case-study-title'
    >
      <div
        className='bg-surface-raised border-rule animate-in zoom-in-95 relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border shadow-2xl duration-200'
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Top Header (Fixed inside modal) ────────────────────────── */}
        <div className='border-rule bg-surface-raised relative border-b px-6 pt-6 pr-16 pb-5 sm:px-8 sm:pt-8'>
          {/* Tags */}
          <div className='mb-3 flex flex-wrap items-center gap-2'>
            <span className='text-ink-3 font-mono text-[11px] tracking-[0.2em] uppercase'>CASE STUDY</span>
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
                <Ico d={P.bolt} size={11} />
                {study.speed}
              </span>
            )}
            {study.sample && <span className='badge badge-accent'>SAMPLE</span>}
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
          {leadImage && (
            <div className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'>
              <div className='border-rule text-ink-3 mb-3 flex items-center justify-between gap-3 border-b pb-3 font-mono text-[11px] tracking-wide'>
                <span>WORKFLOW ARCHITECTURE</span>
                {study.stepCount && <span>{study.stepCount} STAGES</span>}
              </div>

              <div className='bg-ground flex items-center justify-center overflow-hidden rounded-xl'>
                <img
                  src={leadImage}
                  alt={`Workflow diagram for ${study.title}`}
                  className='h-auto max-h-[480px] w-full object-contain'
                />
              </div>

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
                <div className='rounded-2xl border border-rose-500/15 bg-rose-500/4 p-5 sm:p-6'>
                  <p className='font-mono text-[11px] font-medium tracking-[0.2em] text-rose-800/80 uppercase'>
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
          <div className='flex flex-wrap items-center gap-2'>
            <a
              href={study.videoUrl || `/case-study/${study.slug}`}
              target={study.videoUrl ? '_blank' : undefined}
              rel={study.videoUrl ? 'noopener noreferrer' : undefined}
              className='border-rule-strong bg-ink/3 text-meta text-ink hover:bg-ink/90 hover:text-ground inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-mono tracking-wide transition-all'
            >
              <VideoIcon size={13} />
              Walkthrough
            </a>

            <a
              href={study.repoUrl || 'https://github.com/ramonaljr'}
              target='_blank'
              rel='noopener noreferrer'
              className='border-rule-strong bg-ink/3 text-meta text-ink hover:bg-ink/90 hover:text-ground inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-mono tracking-wide transition-all'
            >
              <GitHubIcon size={13} />
              Source
            </a>
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
    </div>
  )
}
