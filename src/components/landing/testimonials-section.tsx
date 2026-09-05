'use client'

import { useSyncExternalStore } from 'react'

import { CONTAINER, DISPLAY_FONT, SECTION, sweep, useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { TESTIMONIALS } from '@/lib/portfolio'

/**
 * The one beat where somebody other than Ramon speaks.
 *
 * Every other claim on this page is his own assertion, which is the largest
 * remaining gap in the story — a reader who believes the principles section
 * still has nobody but the author telling them it is true. This sits
 * immediately before the offer, so the last thing read before the ask is
 * corroboration.
 *
 * ## Why drafts are gated rather than simply shown
 *
 * This site is live, and its traffic is Upwork and LinkedIn prospects. A
 * realistic quote attributed to a plausible-sounding person functions as a
 * real endorsement to anyone who lands here, whatever the intent behind
 * adding it — so drafts never render on the public page.
 *
 * They do render behind `?preview=1`, because the reason to want them is
 * legitimate: showing colleagues the section so they can react to the layout.
 * Preview entries keep realistic copy *length*, so the design can be judged
 * accurately, but carry bracketed attribution and a visible PLACEHOLDER badge
 * so nobody reviewing it can mistake one for a real quote.
 *
 * To publish: replace a draft's bracketed fields with the person's own words,
 * confirm they are happy to be named, delete its `draft` flag. The section
 * then appears on the public page carrying only that entry.
 */

/**
 * Whether the URL carries `?preview`.
 *
 * Read as an external store rather than in an effect: the server has no
 * `location`, and the repo lints against setState-in-effect. Same shape as
 * `usePrefersReducedMotion` in motion.tsx. The flag cannot change without a
 * reload, so `subscribe` is a no-op, and the snapshot is a primitive so React
 * can compare it by value.
 */
const noopSubscribe = () => () => {}

function usePreviewFlag() {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).has('preview'),
    () => false
  )
}

export function TestimonialsSection() {
  const { ref, inView } = useInView(0.1)
  const preview = usePreviewFlag()

  const published = TESTIMONIALS.filter(t => !t.draft)
  const shown = preview ? TESTIMONIALS : published

  if (!shown.length) return null

  return (
    <section id='testimonials' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='IN THEIR WORDS'
          title='What it was like to work together.'
          blurb='From the people who had to run the thing after handover.'
        />

        {preview && !published.length && (
          <p className='border-rule text-fine text-ink-3 mb-10 rounded-xl border border-dashed px-5 py-4'>
            <span className='text-ink font-mono'>PREVIEW ONLY.</span> These are placeholders, shown because the URL
            carries <code className='font-mono'>?preview</code>. The public page renders no testimonials section at all
            until a real quote replaces them.
          </p>
        )}

        <div ref={ref} className='border-rule grid gap-x-12 gap-y-12 border-t pt-12 md:grid-cols-2 lg:grid-cols-3'>
          {shown.map((t, i) => (
            <figure key={`${t.name}-${i}`} style={sweep(inView, i)}>
              {t.draft && <span className='badge badge-quiet mb-4 inline-block'>PLACEHOLDER — NOT A REAL QUOTE</span>}

              <blockquote
                className={`text-[1.05rem] leading-relaxed font-light lg:text-[1.15rem] ${
                  t.draft ? 'text-ink-3 italic' : 'text-ink'
                }`}
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {t.quote}
              </blockquote>

              <figcaption className='border-rule mt-6 flex items-center gap-3 border-t pt-5'>
                {t.avatar && !t.draft && (
                  <img
                    src={t.avatar}
                    alt=''
                    aria-hidden='true'
                    width={36}
                    height={36}
                    loading='lazy'
                    className='border-rule h-9 w-9 shrink-0 rounded-full border object-cover'
                  />
                )}
                <span className='min-w-0'>
                  <span className='text-fine text-ink block'>{t.name}</span>
                  <span className='text-meta text-ink-3 mt-0.5 block'>
                    {t.role}
                    {t.company ? ` · ${t.company}` : ''}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
