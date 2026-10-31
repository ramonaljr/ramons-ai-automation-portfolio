'use client'

import { useState, type CSSProperties } from 'react'

import Image from 'next/image'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { CaseStudyModal } from '@/components/landing/case-study-modal'
import { workLabel } from '@/components/landing/projects-section'
import { useInView, usePrefersReducedMotion } from '@/components/landing/motion'
import { orderWork, WORK_TONES } from '@/lib/work-views'

/**
 * The work, one scroll below the promise.
 *
 * Selected Work sits about ten screens down, behind the story and the
 * biography, so a visitor deciding in the first few seconds never met a single
 * project. This strip shows every system as a thumbnail of its real build and
 * opens the same dialog the full cards do, so nothing here is a second,
 * thinner version of the case study. The full section keeps its place; the
 * strip only points at it.
 */
export function WorkStrip({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.2)
  const reduced = usePrefersReducedMotion()
  const [selected, setSelected] = useState<CaseStudyMetadata | null>(null)
  const shown = orderWork(caseStudies)

  return (
    <section aria-labelledby='work-strip-title' className='work-strip'>
      <div className='work-strip-inner mx-auto max-w-390 px-6 md:px-12 lg:px-20 2xl:max-w-440'>
        <div className='work-strip-head'>
          <p id='work-strip-title' className='eyebrow'>
            Selected work
          </p>
          <a href='#portfolio' className='work-strip-all'>
            See all {shown.length} systems
          </a>
        </div>

        <ul ref={ref} className='work-strip-list' data-visible={inView}>
          {shown.map((cs, index) => (
            <li
              key={cs.slug}
              style={
                {
                  '--work-tone': WORK_TONES[cs.slug] ?? 'var(--accent)',
                  '--strip-delay': reduced ? '0ms' : `${index * 60}ms`
                } as CSSProperties
              }
            >
              <button type='button' className='work-strip-item' aria-haspopup='dialog' onClick={() => setSelected(cs)}>
                <span className='work-strip-thumb'>
                  {/* Shown at about 170px (240px on the widest screens); the
                      source is up to 1,700px wide, so it is resized to fit. */}
                  {(cs.heroImage ?? cs.image) && (
                    <Image
                      src={(cs.heroImage ?? cs.image)!}
                      alt=''
                      width={1176}
                      height={735}
                      sizes='(min-width: 1536px) 240px, 180px'
                    />
                  )}
                </span>
                <span className='work-strip-label'>{workLabel(cs)}</span>
                {cs.keyOutcome && (
                  <span className='work-strip-outcome'>
                    <strong>{cs.keyOutcome.value}</strong> {cs.keyOutcome.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <CaseStudyModal key={selected?.slug ?? 'closed'} study={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
