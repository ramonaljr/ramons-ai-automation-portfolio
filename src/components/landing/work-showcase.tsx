'use client'

import { useState } from 'react'

import dynamic from 'next/dynamic'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { Ico, P, VideoIcon } from '@/components/landing/work-icons'
import { filmOf, workViews, type WorkView } from '@/lib/work-views'
import { WorkCanvas } from '@/components/landing/work-canvas'
import { MagnifierLens, useMagnifier } from '@/components/landing/magnifier'
import { ViewStage } from '@/components/landing/view-stage'
import { WorkFullscreen } from '@/components/landing/work-fullscreen'
import { hasLiveFilm } from '@/components/landing/film/live-films'

/** A case study's live film (a Stageshow scene): client-only, fetched when the Film toggle is first pressed. */
const LiveFilm = dynamic(() => import('@/components/landing/film/live-film').then(m => m.LiveFilm), {
  ssr: false
})

/** Whether a project has a film to show, live or MP4. */
export const hasShowcaseFilm = (study: CaseStudyMetadata) => Boolean(filmOf(study) || hasLiveFilm(study.slug))

/**
 * The film and the workflow, sharing one frame: the case study dialog's top
 * block, and the same block on the full case study page.
 *
 * The film leads wherever there is one; the toggle switches the frame to the
 * project's views (process map and build), which carry the magnifying lens and
 * a full-screen button. `showFilm` is the caller's, so the dialog's footer
 * "Walkthrough" link can switch back to the film.
 *
 * `place` keeps the canvas's SVG ids apart from any other copy of the same
 * project mounted at once (the dialog over a page, or the full-screen layer).
 */
export function WorkShowcase({
  study,
  showFilm,
  onShowFilm,
  reduced,
  place,
  frameClassName = 'work-dialog-frame'
}: {
  study: CaseStudyMetadata
  showFilm: boolean
  onShowFilm: (on: boolean) => void
  reduced: boolean
  place: string
  frameClassName?: string
}) {
  /** The views fitted to the whole window, over this frame. */
  const [fullscreen, setFullscreen] = useState(false)
  const { frameRef, lensRef, artRef, move: moveLens, hide: hideLens } = useMagnifier()

  /**
   * Which of the project's views is showing. Stored with the project it
   * belongs to and compared during render rather than reset from an effect: a
   * new project then opens on its first view without a second render pass,
   * which is also the only form the React Compiler accepts here.
   */
  const [picked, setPicked] = useState<{ slug: string; index: number }>({ slug: '', index: 0 })
  const viewIndex = picked.slug === study.slug ? picked.index : 0

  const views = workViews(study)
  const view = views[Math.min(viewIndex, views.length - 1)]
  const film = filmOf(study)

  // A live film replaces the MP4; the MP4 stays for the Walkthrough link.
  const liveSlug = hasLiveFilm(study.slug) ? study.slug : null
  const hasFilm = Boolean(film || liveSlug)
  const filmOn = hasFilm && showFilm

  /**
   * The n8n builds are screenshots of its dark editor (the Make and Zapier
   * ones are light). The site cursor takes its ink from what it is over
   * (custom-cursor.tsx), so over these it drew dark on dark and vanished;
   * `data-tone='dark'` turns it over, as on the interactive demo's canvas.
   */
  const darkBuild = study.platform === 'n8n'

  const viewOf = (where: string) => (item: WorkView) =>
    item.key === 'canvas' ? (
      <WorkCanvas
        src={item.src}
        label={item.alt}
        idSuffix={`${study.slug}-${place}-${where}`}
        run={1}
        reduced={reduced}
        lead={0.2}
      />
    ) : (
      <img
        src={item.src}
        alt={item.alt}
        className='work-card-image'
        data-tone={item.key === 'interface' && darkBuild ? 'dark' : undefined}
      />
    )

  const toggle = (on: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs tracking-wide transition-colors ${
      on ? 'border-ink bg-ink text-ground' : 'border-rule text-ink-2 hover:border-rule-strong hover:text-ink'
    }`

  return (
    <div className='space-y-3'>
      {hasFilm && (
        <div className='flex flex-wrap gap-2' role='group' aria-label='Show the film or the workflow'>
          <button type='button' aria-pressed={filmOn} className={toggle(filmOn)} onClick={() => onShowFilm(true)}>
            <VideoIcon size={12} />
            Film
          </button>
          <button type='button' aria-pressed={!filmOn} className={toggle(!filmOn)} onClick={() => onShowFilm(false)}>
            Workflow
          </button>
        </div>
      )}

      {filmOn && liveSlug && (
        <div className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'>
          <div className='border-rule text-ink-3 mb-3 flex items-center justify-between gap-3 border-b pb-3 font-mono text-xs tracking-wide uppercase'>
            <span>Animated explainer</span>
            <span className='hidden sm:inline'>Words on screen, no sound</span>
          </div>
          <LiveFilm slug={liveSlug} />
        </div>
      )}

      {filmOn && !liveSlug && film && (
        <div className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'>
          <div className='border-rule text-ink-3 mb-3 flex items-center justify-between gap-3 border-b pb-3 font-mono text-xs tracking-wide uppercase'>
            <span>Animated explainer</span>
            <span className='hidden sm:inline'>Words on screen, music only</span>
          </div>
          <video
            key={film}
            src={film}
            poster={study.videoPoster}
            controls
            autoPlay
            playsInline
            preload='metadata'
            aria-label={`Animated explainer film: ${study.title ?? study.slug}`}
            className='aspect-video w-full rounded-xl bg-[#F1E9D8]'
          />
        </div>
      )}

      {!filmOn && view && (
        <div className='border-rule bg-surface-raised rounded-2xl border p-3 shadow-sm sm:p-4'>
          <div className='border-rule text-ink-3 mb-3 flex items-center justify-between gap-3 border-b pb-3 font-mono text-xs tracking-wide uppercase'>
            <span>{view.label}</span>
            <span className='flex items-center gap-4'>
              {/* Stage count describes the canvas, so it goes when the canvas does. */}
              {view.key === 'canvas' && study.stepCount && <span>{study.stepCount} STAGES</span>}
              <button
                type='button'
                onClick={() => setFullscreen(true)}
                aria-haspopup='dialog'
                className='border-rule text-ink-2 hover:border-rule-strong hover:text-ink inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 tracking-wide normal-case transition-colors'
              >
                <Ico d={P.expand} size={12} />
                Full screen
              </button>
            </span>
          </div>

          {/* One frame for every view, so the magnifying lens measures
              whichever one is showing. */}
          <div
            ref={frameRef}
            className={`work-magnify ${frameClassName} relative overflow-hidden rounded-xl`}
            onPointerMove={moveLens}
            onPointerLeave={hideLens}
          >
            <ViewStage
              views={views}
              index={viewIndex}
              onSelect={index => setPicked({ slug: study.slug, index })}
              reduced={reduced}
              label={study.title ?? study.slug}
              renderView={viewOf('frame')}
            />

            <MagnifierLens lensRef={lensRef} artRef={artRef} />
          </div>

          {study.logicSummary && (
            <div className='border-rule text-ink-2 mt-3 flex items-center gap-2 border-t pt-3 font-mono text-[12px]'>
              <span className='text-ink-4'>FLOW:</span>
              <span className='truncate'>{study.logicSummary}</span>
            </div>
          )}

          {fullscreen && (
            <WorkFullscreen
              views={views}
              index={viewIndex}
              onSelect={index => setPicked({ slug: study.slug, index })}
              renderView={viewOf('fullscreen')}
              reduced={reduced}
              label={study.title ?? study.slug}
              onClose={() => setFullscreen(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
