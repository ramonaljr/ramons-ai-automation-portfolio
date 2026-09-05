'use client'

import { CONTAINER, DISPLAY_FONT, SECTION, sweep, useInView } from '@/components/landing/motion'
import { SectionIntro } from '@/components/landing/section-intro'
import { TESTIMONIALS } from '@/lib/portfolio'

/**
 * The one beat where somebody other than Ramon speaks.
 *
 * Every other claim on this page is his own assertion, which is the single
 * largest gap in the story — a reader who believes the principles section still
 * has nobody but the author telling them it is true. This sits immediately
 * before the offer, so the last thing read before the ask is corroboration.
 *
 * Draft entries never render. The section returns null when nothing survives
 * the filter, exactly as ArticlesSection does with an empty post list, so the
 * page simply does not carry a testimonials beat until a real quote exists.
 * That is deliberate: a placeholder quote on a live page is a fabricated
 * endorsement, whatever the intent behind it.
 *
 * Uncarded, like the rest of the page's list surfaces. Quotes in cards read as
 * marketing furniture; set as type on the ground they read as things people
 * said.
 */
export function TestimonialsSection() {
  const { ref, inView } = useInView(0.1)
  const shown = TESTIMONIALS.filter(t => !t.draft)

  if (!shown.length) return null

  return (
    <section id='testimonials' className={SECTION}>
      <div className={CONTAINER}>
        <SectionIntro
          tag='IN THEIR WORDS'
          title='What it was like to work together.'
          blurb='From the people who had to run the thing after handover.'
        />

        <div ref={ref} className='border-rule grid gap-x-12 gap-y-12 border-t pt-12 md:grid-cols-2 lg:grid-cols-3'>
          {shown.map((t, i) => (
            <figure key={`${t.name}-${i}`} style={sweep(inView, i)}>
              <blockquote
                className='text-ink text-[1.05rem] leading-relaxed font-light lg:text-[1.15rem]'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {t.quote}
              </blockquote>

              <figcaption className='border-rule mt-6 flex items-center gap-3 border-t pt-5'>
                {t.avatar && (
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
