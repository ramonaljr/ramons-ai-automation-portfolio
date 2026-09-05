'use client'

import { ArrowIcon, CONTAINER, DISPLAY_FONT, ParallaxLayer, rise, useInView } from '@/components/landing/motion'
import { PROFILE } from '@/lib/portfolio'

/**
 * Closing panel. Shared by the landing page and the article pages so every
 * route ends on the same glass-and-cream treatment.
 */
export function CtaSection({
  title = (
    <>
      What are you still
      <br />
      doing by hand?
    </>
  ),
  blurb = 'Tell me the process that eats your week. I will tell you whether it is worth automating, and on which platform.',
  contactHref = '/#contact'
}: {
  title?: React.ReactNode
  blurb?: string

  /** Landing passes the bare hash; article pages take the default. */
  contactHref?: string
}) {
  const { ref, inView } = useInView(0.15)

  return (
    <section className='border-rule relative overflow-hidden border-t px-6 py-32 md:px-12 lg:px-20'>
      {/* Glass panels anchored bottom-centre, graded into the palette.
          The source art is a cool pastel spectrum — lavender, mint, peach —
          which made the page's most important conversion surface the only
          place a rainbow appears, and put the same multi-hue signature here
          that the hero headline used to carry. Desaturating and warming it
          keeps the refracted-glass geometry, which is the part worth having,
          and drops the colour story that never belonged. */}
      <ParallaxLayer className='pointer-events-none absolute inset-0' speed={0.12} direction='up'>
        <img
          src='/images/landing/footer.png'
          alt=''
          aria-hidden='true'
          className='absolute bottom-0 left-0 w-full object-cover object-bottom select-none'
          style={{ opacity: 0.55, filter: 'saturate(0.2) sepia(0.32) brightness(1.04) contrast(1.04)' }}
        />
      </ParallaxLayer>

      {/* Progressive blur from the bottom */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          maskImage: 'linear-gradient(to top, transparent 0%, black 55%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 55%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)'
        }}
      />

      {/* Colour fade back to the page ground */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)'
        }}
      />

      <div ref={ref} className={`relative z-10 ${CONTAINER} text-center`} style={rise(inView)}>
        <h2
          className='text-ink text-[clamp(2rem,5vw,4rem)] leading-[1.05] font-light tracking-tight'
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h2>
        <p className='text-ink-2 mx-auto mt-6 max-w-lg text-[15px] leading-relaxed'>{blurb}</p>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
          <a
            href={contactHref}
            className='group bg-ink text-ground hover:bg-ink/90 inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-[14px] tracking-wide transition-colors'
          >
            Book a workflow audit
            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
              <ArrowIcon />
            </span>
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            className='border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex items-center rounded-full border px-5 py-3 text-[13px] tracking-wide transition-all'
          >
            {PROFILE.email}
          </a>
        </div>
      </div>
    </section>
  )
}
