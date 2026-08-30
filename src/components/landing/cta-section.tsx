'use client'

import { ArrowIcon, CONTAINER, DISPLAY_FONT, rise, useInView } from '@/components/landing/motion'
import { PROFILE } from '@/lib/portfolio'

/**
 * Closing panel. Shared by the landing page and the article pages so every
 * route ends on the same glass-and-cream treatment.
 */
export function CtaSection({
  title = <>What are you still<br />doing by hand?</>,
  blurb = 'Tell me the process that eats your week. I will tell you whether it is worth automating, and on which platform.'
}: {
  title?: React.ReactNode
  blurb?: string
}) {
  const { ref, inView } = useInView(0.15)

  return (
    <section className='relative overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
      {/* Glass panels, anchored bottom-centre — the template's own footer
          treatment. Light by design; it fades up into the cream page. */}
      { }
      <img
        src='/images/landing/footer.png'
        alt=''
        aria-hidden='true'
        className='pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom select-none'
        style={{ opacity: 0.85 }}
      />

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
          className='text-[clamp(2rem,5vw,4rem)] leading-[1.05] font-light tracking-tight text-[#111]'
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h2>
        <p className='mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-black/55'>{blurb}</p>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
          <a
            href='/contact'
            className='group inline-flex items-center gap-3 rounded-full bg-[#111] py-2 pr-2 pl-6 text-[13px] tracking-wide text-white transition-colors hover:bg-black'
          >
            START A CONVERSATION
            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
              <ArrowIcon />
            </span>
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            className='inline-flex items-center rounded-full border border-black/12 px-5 py-3 text-[12px] tracking-wide text-black/65 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black'
          >
            {PROFILE.email}
          </a>
        </div>
      </div>
    </section>
  )
}
