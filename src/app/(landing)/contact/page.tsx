import type { Metadata } from 'next'

// Component Imports
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { ArrowRight, CONTAINER, DISPLAY_FONT, PAGE, Reveal } from '@/components/landing/motion'
import ContactForm from '@/components/contact/contact-form/contact-form'

// Data Imports
import { getCaseStudies } from '@/lib/case-studies'
import { PRINCIPLES, PROFILE, SERVICES } from '@/lib/portfolio'
import { abs, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell me the process that eats your week — what happens today, who does it, and how often. I will tell you whether it is worth automating and on which platform.',
  alternates: { canonical: abs('/contact') }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${abs('/contact')}#webpage`,
      name: 'Contact',
      description: 'Get in touch about an automation build.',
      url: abs('/contact'),
      isPartOf: { '@id': `${SITE_URL}#website` },
      about: { '@id': `${SITE_URL}#person` }
    }
  ]
}

// ── Furniture ────────────────────────────────────────────────────────────────

const SectionHead = ({ tag, title, blurb }: { tag: string; title: string; blurb?: string }) => (
  <div className='mb-14'>
    <p className='font-mono text-[12px] tracking-[0.28em] text-black/50'>{tag}</p>
    <h2
      className='mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight text-[#111]'
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {title}
    </h2>
    {blurb && <p className='mt-5 max-w-xl text-[15px] leading-relaxed text-black/62'>{blurb}</p>}
  </div>
)

const ContactUsPage = async () => {
  const caseStudies = await getCaseStudies(2)

  return (
    <div className={PAGE}>
      <SiteNav />

      {/* ── Hero and form ───────────────────────────────────────────────── */}
      <header className='px-6 pt-36 pb-24 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-black/55'>
            <span className='h-px w-8 bg-black/25' />
            CONTACT
          </span>

          <h1
            className='mt-7 max-w-[16ch] text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.02] font-light tracking-tight text-[#111]'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Tell me what eats your week.
          </h1>

          <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-black/62'>
            Describe the process as it runs today — what happens, who does it, how often. I will tell you whether it is
            worth automating, which platform fits, and roughly what it takes.
          </p>

          <div className='mt-16 grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:gap-8'>
            {/* Form */}
            <div className='rounded-2xl border border-black/[0.07] bg-white/50 p-7 sm:p-9'>
              <ContactForm />
            </div>

            {/* Details rail */}
            <div className='flex flex-col gap-5'>
              <div className='rounded-2xl border border-black/[0.07] bg-white/50 p-7 sm:p-9'>
                <span className='inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 font-mono text-[11px] tracking-wide text-black/55'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  AVAILABLE FOR NEW WORK
                </span>

                <p
                  className='mt-7 text-[22px] leading-snug font-light tracking-tight text-[#111]'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {PROFILE.name}
                </p>
                <p className='mt-2 text-[13px] text-black/55'>
                  {PROFILE.title} · {PROFILE.location}
                </p>

                <dl className='mt-8 space-y-5 border-t border-black/[0.07] pt-7'>
                  <div>
                    <dt className='font-mono text-[11px] tracking-[0.18em] text-black/45'>EMAIL</dt>
                    <dd className='mt-1.5'>
                      <a
                        href={`mailto:${PROFILE.email}`}
                        className='text-[14px] text-[#111] underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black'
                      >
                        {PROFILE.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className='font-mono text-[11px] tracking-[0.18em] text-black/45'>TYPICAL REPLY</dt>
                    <dd className='mt-1.5 text-[14px] text-black/70'>Within one business day</dd>
                  </div>
                  <div>
                    <dt className='font-mono text-[11px] tracking-[0.18em] text-black/45'>FIRST STEP</dt>
                    <dd className='mt-1.5 text-[14px] text-black/70'>
                      A free 30-minute workflow audit — no deck, just your process on a call
                    </dd>
                  </div>
                </dl>

                <div className='mt-8 flex flex-wrap gap-2 border-t border-black/[0.07] pt-7'>
                  {PROFILE.socials.map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-full border border-black/10 px-3.5 py-2 text-[11px] text-black/55 transition-all hover:border-black/25 hover:bg-black/[0.03] hover:text-black'
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className='rounded-2xl border border-dashed border-black/12 p-7 sm:p-9'>
                <p className='font-mono text-[11px] tracking-[0.18em] text-black/45'>NOT SURE YET?</p>
                <p className='mt-4 text-[14px] leading-relaxed text-black/62'>
                  Send the rough version. Half of what I build starts as one sentence about a spreadsheet somebody
                  updates by hand every Monday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          {/* ── Recent work ───────────────────────────────────────────────── */}
          {caseStudies.length > 0 && (
            <section className='border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
              <div className={CONTAINER}>
                <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
                  <div>
                    <p className='font-mono text-[12px] tracking-[0.28em] text-black/50'>RECENT WORK</p>
                    <h2
                      className='mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight text-[#111]'
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      What this looks like
                    </h2>
                  </div>

                  <a
                    href='/#portfolio'
                    className='inline-flex shrink-0 items-center gap-2 rounded-full border border-black/12 px-5 py-2.5 text-[12px] tracking-wide text-black/62 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black'
                  >
                    All work
                    <ArrowRight />
                  </a>
                </div>

                <div className='grid gap-5 md:grid-cols-2'>
                  {caseStudies.map((cs, i) => (
                    <Reveal key={cs.slug} delay={i * 90}>
                      <a
                        href={`/case-study/${cs.slug}`}
                        className='group flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white/50 transition-all duration-300 hover:border-black/12 hover:bg-white'
                      >
                        {cs.workflowImage && (
                          <div className='border-b border-black/[0.07] bg-white p-3'>
                            <img
                              src={cs.workflowImage}
                              alt=''
                              aria-hidden='true'
                              width={1400}
                              height={900}
                              loading='lazy'
                              className='h-[160px] w-full rounded object-cover object-left-top'
                            />
                          </div>
                        )}

                        <div className='flex flex-1 flex-col p-6'>
                          <div className='flex flex-wrap items-center gap-2'>
                            {cs.platform && (
                              <span className='rounded-full border border-black/15 bg-black/[0.04] px-3 py-1 font-mono text-[11px] text-black/70'>
                                {cs.platform}
                              </span>
                            )}
                            {cs.speed && <span className='font-mono text-[11px] text-black/50'>{cs.speed}</span>}
                          </div>

                          <h3
                            className='mt-4 text-[20px] leading-snug font-light tracking-tight text-[#111]'
                            style={{ fontFamily: DISPLAY_FONT }}
                          >
                            {cs.title}
                          </h3>

                          <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-black/62'>
                            {cs.description}
                          </p>

                          <span className='mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide text-black/62 transition-colors group-hover:text-black'>
                            READ CASE STUDY
                            <ArrowRight />
                          </span>
                        </div>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Services ──────────────────────────────────────────────────── */}
          <section className='border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <SectionHead
                tag='WHAT I DO'
                title='Five ways I can help'
                blurb='Pick the closest fit in the form above, or describe the problem and I will place it.'
              />

              <div className='border-t border-black/[0.07]'>
                {SERVICES.map((s, i) => (
                  <Reveal key={s.slug} delay={i * 60}>
                    <a
                      href={`/services/${s.slug}`}
                      className='group flex flex-col gap-4 border-b border-black/[0.07] py-8 transition-colors hover:bg-black/[0.02] sm:flex-row sm:items-center sm:gap-10'
                    >
                      <span className='font-mono text-[12px] text-black/35 sm:w-12'>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className='flex-1'>
                        <h3
                          className='text-[20px] leading-snug font-light tracking-tight text-[#111]'
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {s.title}
                        </h3>
                        <p className='mt-2 max-w-2xl text-[13.5px] leading-relaxed text-black/62'>{s.description}</p>
                      </div>

                      <span className='font-mono text-[11px] tracking-wide whitespace-nowrap text-black/45 sm:w-28 sm:text-right'>
                        {s.duration}
                      </span>

                      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/12 text-black/45 transition-all group-hover:border-black/30 group-hover:text-black'>
                        <ArrowRight />
                      </span>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── Principles ────────────────────────────────────────────────── */}
          <section className='border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <SectionHead
                tag='HOW I BUILD'
                title='Reliability is the feature'
                blurb='An automation that silently does the wrong thing is worse than no automation. Three rules I do not bend.'
              />

              <div className='grid gap-5 lg:grid-cols-3'>
                {PRINCIPLES.map((p, i) => (
                  <Reveal key={p.n} delay={i * 100} className='h-full'>
                    <div className='h-full rounded-2xl border border-black/[0.07] bg-white/50 p-8 transition-all duration-300 hover:border-black/12 hover:bg-white'>
                      <span className='font-mono text-[11px] text-black/62'>{p.n}</span>
                      <h3
                        className='mt-4 text-xl leading-snug font-light tracking-tight text-[#111]'
                        style={{ fontFamily: DISPLAY_FONT }}
                      >
                        {p.title}
                      </h3>
                      <p className='mt-2 text-[12px] leading-relaxed text-black/55'>{p.sub}</p>
                      <p className='mt-5 border-t border-black/[0.07] pt-5 text-[14px] leading-relaxed text-black/55'>
                        {p.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <SiteFooter />
        </div>
      </div>

      <ChatWidget />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}

export default ContactUsPage
