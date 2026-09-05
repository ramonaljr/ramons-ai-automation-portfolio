'use client'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import {
  ArrowRight,
  CONTAINER,
  DISPLAY_FONT,
  READABLE,
  useInView,
  usePrefersReducedMotion
} from '@/components/landing/motion'
import { introStep, SectionIntro } from '@/components/landing/section-intro'

/**
 * The first beat after the hero: the reader's week, in their own words.
 *
 * The page used to run hero → about, so a visitor met Ramon's biography before
 * anything named the problem that brought them. The only sentence written for
 * them — "What are you still doing by hand?" — sat twelve sections down, in the
 * closing panel. This is the answer to the headline's question, given as four
 * situations a reader either recognises or does not.
 *
 * Nothing here is new copy. Each line is the `problem` field of a case study,
 * compressed to scanning length in `problemShort`, so the section cannot drift
 * from the work it points at.
 *
 * Deliberately uncarded. By the time a reader reaches the bottom of this page
 * they have seen six card grids; making this a seventh would file the reader's
 * own problem alongside the services and the tooling. Rules and numerals only,
 * so it reads as a list of things gone wrong rather than a menu.
 */

/**
 * Delivered work only, flagship first.
 *
 * `sample` studies are illustrative builds, so quoting their problems here
 * would present a demo scenario as somebody's actual Tuesday. Excluding them
 * on the data rather than by hand-picking slugs means a new sample cannot
 * leak in later. `featured` then floats the flagship to the top — the same
 * signal the work section already uses — and the sort is stable, so the rest
 * hold the date order `getCaseStudies` returned them in.
 */
function leadWith(caseStudies: CaseStudyMetadata[]) {
  return caseStudies
    .filter(cs => !cs.sample && cs.problemShort)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 4)
}

export function ProblemsSection({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const { ref, inView } = useInView<HTMLOListElement>(0.06)
  const reduced = usePrefersReducedMotion()
  const shown = leadWith(caseStudies)

  // No delivered case study carries a short problem yet — say nothing rather
  // than open the page on an empty list.
  if (!shown.length) return null

  return (
    <section id='problems' className='px-6 pt-24 pb-28 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        {/* The title answers the headline directly, so the hero's question and
            this section read as one exchange rather than two openings. */}
        <SectionIntro
          tag='THE WORK I GET CALLED FOR'
          margin='mb-14'
          titleClassName='mt-6 text-[clamp(1.75rem,3vw,2.5rem)]'
          title='Usually it looks like this.'
          blurb='Four situations that became workflows. Each one now runs without anyone watching it.'
        />

        {/* One reading halo behind the whole list rather than one per row —
            four overlapping `READABLE` pseudo-elements would blur as a band. */}
        <ol ref={ref} className={`border-rule max-w-[1000px] border-t ${READABLE}`}>
          {shown.map((cs, i) => (
            <li
              key={cs.slug}
              className='border-rule border-b'
              style={introStep(inView, reduced, { delay: 120 + i * 160, y: 30, blur: 10, duration: 0.95 })}
            >
              <a
                href={`/case-study/${cs.slug}`}
                className='group grid grid-cols-[2.5rem_1fr] items-start gap-x-4 py-9 lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:gap-x-8 lg:py-11'
              >
                <span className='text-meta text-ink-3 pt-2 font-mono'>{String(i + 1).padStart(2, '0')}</span>

                <span className='min-w-0'>
                  <span
                    className='display-md text-ink block max-w-[40ch] text-[1.25rem] leading-snug font-light lg:text-[1.6rem]'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.problemShort}
                  </span>

                  <span className='text-fine text-ink-3 group-hover:text-ink-2 mt-3 block transition-colors duration-300'>
                    {cs.title}
                  </span>
                </span>

                <span className='text-fine text-ink-3 group-hover:text-ink col-span-2 mt-4 inline-flex items-center gap-2 transition-colors duration-300 lg:col-span-1 lg:mt-2 lg:justify-self-end'>
                  <span className='bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-position-[0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:bg-size-[100%_1px]'>
                    What it became
                  </span>
                  <span className='transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1'>
                    <ArrowRight size={14} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
