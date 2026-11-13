'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'

import dynamic from 'next/dynamic'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { CONTAINER, DISPLAY_FONT, Reveal, usePrefersReducedMotion } from '@/components/landing/motion'
import { WorkShowcase } from '@/components/landing/work-showcase'
import { SupportDemoChat } from '@/components/landing/support-demo-chat'
import { ToolMark } from '@/components/landing/tool-stack-section'
import { toolNamed } from '@/lib/portfolio'
import { hasDemo } from '@/lib/demos'
import { WORK_TONES } from '@/lib/work-views'

/** The live build: client-only, and only fetched on a page that has one. */
const WorkflowDemo = dynamic(() => import('@/components/landing/demo/n8n-demo').then(m => m.WorkflowDemo), {
  ssr: false
})

const SECTION = 'border-rule border-t px-6 py-20 md:px-12 lg:px-20'

const Label = ({ children, accent }: { children: ReactNode; accent?: boolean }) => (
  <p
    className={`font-mono text-xs font-medium tracking-[0.2em] uppercase ${accent ? 'text-accent' : 'text-ink-3'}`}
  >
    {children}
  </p>
)

/**
 * The full case study page above its long read, in the landing dialog's order
 * so a project reads the same whichever way it was opened: the film and the
 * workflow, the outcome, the problem and what was built, the tools, what
 * happens when it breaks, and the build itself to run. The page adds what the
 * dialog has no room for: the live agent (Fernhill) and, after this, the
 * article.
 */
export function CaseStudyBody({ study }: { study: CaseStudyMetadata }) {
  const reduced = usePrefersReducedMotion()

  /** Film first, as in the dialog; the toggle switches the frame to the workflow. */
  const [showFilm, setShowFilm] = useState(true)

  const roi = study.roi ?? []
  const failsafes = study.failsafes ?? []
  const tools = study.integrations ?? study.tools ?? []

  return (
    <div style={{ '--work-tone': WORK_TONES[study.slug] ?? 'var(--accent)' } as CSSProperties}>
      {/* 1. Film and workflow, sharing one frame */}
      <section className='px-6 pb-20 md:px-12 lg:px-20'>
        <div className={CONTAINER}>
          <WorkShowcase
            study={study}
            showFilm={showFilm}
            onShowFilm={setShowFilm}
            reduced={reduced}
            place='page'
            frameClassName='work-dialog-frame work-page-frame'
          />
        </div>
      </section>

      {/* 2–5. The summary a reader scans before deciding to read on */}
      <section className={SECTION}>
        <div className={`${CONTAINER} space-y-16`}>
          {(roi.length > 0 || study.impactHighlight) && (
            <div>
              <Label>Key outcomes &amp; impact</Label>
              {study.impactHighlight && (
                <div className='mt-4 max-w-3xl'>
                  <p
                    className='text-ink text-[clamp(1.35rem,2.4vw,2rem)] leading-snug font-light tracking-tight'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {study.impactHighlight}
                  </p>
                  {study.impactHighlightDesc && (
                    <p className='text-ink-2 mt-3 text-[15px] leading-relaxed'>{study.impactHighlightDesc}</p>
                  )}
                </div>
              )}
              {roi.length > 0 && (
                <div className='mt-8 grid gap-4 sm:grid-cols-3'>
                  {roi.map((r, i) => (
                    <Reveal key={r.label} delay={i * 90} className='h-full'>
                      <div className='border-rule bg-surface-raised h-full rounded-2xl border p-6 shadow-sm'>
                        <p
                          className='text-ink text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-light'
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {r.value}
                        </p>
                        <p className='text-ink-3 mt-2 font-mono text-[11px] tracking-[0.12em] uppercase'>{r.label}</p>
                        {r.desc && (
                          <p className='text-ink-2 border-rule mt-4 border-t pt-4 text-[14px] leading-relaxed'>
                            {r.desc}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          )}

          {(study.problem || study.solution) && (
            <div className='grid gap-5 md:grid-cols-2'>
              {study.problem && (
                <Reveal className='h-full'>
                  <div className='border-rule bg-ink/3 h-full rounded-2xl border p-7'>
                    <Label>The problem</Label>
                    <p className='text-ink-2 mt-4 text-[15px] leading-relaxed'>{study.problem}</p>
                  </div>
                </Reveal>
              )}
              {study.solution && (
                <Reveal className='h-full' delay={90}>
                  <div className='bg-surface h-full rounded-2xl border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] p-7'>
                    <Label accent>What I built</Label>
                    <p className='text-ink-2 mt-4 text-[15px] leading-relaxed'>{study.solution}</p>
                  </div>
                </Reveal>
              )}
            </div>
          )}

          {tools.length > 0 && (
            <div>
              <Label>Tools used</Label>
              <div className='mt-4 flex flex-wrap gap-2'>
                {tools.map(tool => (
                  <span
                    key={tool}
                    className='work-tool-chip border-rule bg-surface-raised text-ink-2 inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-[12px] shadow-xs'
                  >
                    <ToolMark tool={toolNamed(tool)} size={13} />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {failsafes.length > 0 && (
            <Reveal>
              <div className='border-rule bg-surface-raised rounded-2xl border p-7 shadow-sm'>
                <Label accent>When something goes wrong</Label>
                {study.failsafeHeadline && (
                  <p
                    className='text-ink mt-4 max-w-3xl text-[clamp(1.15rem,1.9vw,1.5rem)] leading-snug font-light tracking-tight'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {study.failsafeHeadline}
                  </p>
                )}
                {study.failsafeDesc && (
                  <p className='text-ink-2 mt-3 max-w-2xl text-[14.5px] leading-relaxed'>{study.failsafeDesc}</p>
                )}
                <div className='border-rule mt-6 grid gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-2'>
                  {failsafes.map(f => (
                    <div key={f.title} className='text-[14px]'>
                      <span className='text-ink mb-1 block font-mono font-medium'>{f.title}</span>
                      <span className='text-ink-3 block leading-relaxed'>{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* 6. The build itself, runnable, at the page's full width. */}
      {hasDemo(study.slug) && (
        <section id='demo' className={SECTION}>
          <div className={CONTAINER}>
            <WorkflowDemo
              slug={study.slug}
              platform={study.platform ?? 'workflow'}
              fallback={study.heroImage ?? study.image ?? ''}
              alt={`${study.title} build`}
              reduced={reduced}
            />
          </div>
        </section>
      )}

      {/* 7. The real agent, live: after the simulated run, the visitor talks to it. */}
      {study.liveChat && (
        <section id='try-it' className={SECTION}>
          <div className={CONTAINER}>
            <Label accent>Try it live</Label>
            <p
              className='text-ink mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              The demo above replays a run on sample data. Here you message the real agent, as a customer would on
              WhatsApp. It answers from the store policies and the sample orders.
            </p>
            <Reveal className='mt-10' threshold={0.05}>
              <SupportDemoChat />
            </Reveal>
          </div>
        </section>
      )}
    </div>
  )
}
