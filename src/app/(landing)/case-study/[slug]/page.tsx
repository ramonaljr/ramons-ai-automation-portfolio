import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Component Imports
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { ArrowRight, CONTAINER, DISPLAY_FONT, PAGE, Reveal } from '@/components/landing/motion'
import MDXContent from '@/components/mdx-content'
import { ReadingRail } from '@/components/shared/prose/reading-rail'

// Data Imports
import { getCaseStudyBySlug, getCaseStudies, type CaseStudyMetadata } from '@/lib/case-studies'
import { extractHeadings } from '@/lib/extract-headings'
import { abs } from '@/lib/site'

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies()

  return caseStudies.map(caseStudy => ({ slug: caseStudy.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = await getCaseStudyBySlug(slug)

  if (!caseStudy) {
    return {}
  }

  const { metadata } = caseStudy

  return {
    title: `Case Study: ${metadata.title}`,
    description: metadata.description,
    alternates: { canonical: abs(`/case-study/${metadata.slug}`) }
  }
}

export const dynamicParams = false

// ── Page furniture ───────────────────────────────────────────────────────────

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-black/55'>
    <span className='h-px w-8 bg-black/25' />
    {children}
  </span>
)

const Chip = ({ children, tone = 'quiet' }: { children: React.ReactNode; tone?: 'quiet' | 'solid' | 'warn' }) => {
  const tones = {
    quiet: 'border-black/10 text-black/60',
    solid: 'border-black/15 bg-black/[0.04] text-black/70',
    warn: 'border-amber-600/30 bg-amber-500/[0.08] text-amber-700/80'
  }

  return (
    <span className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  )
}

/** Two case studies to read next, in the Selected Work card language. */
const OtherWork = ({ items }: { items: CaseStudyMetadata[] }) => {
  if (!items.length) return null

  return (
    <section className='border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='font-mono text-[12px] tracking-[0.28em] text-black/50'>KEEP READING</p>
            <h2
              className='mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight text-[#111]'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Other builds
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
          {items.map((cs, i) => (
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
                    {cs.platform && <Chip tone='solid'>{cs.platform}</Chip>}
                    {cs.speed && <span className='font-mono text-[11px] text-black/50'>{cs.speed}</span>}
                  </div>

                  <h3
                    className='mt-4 text-[20px] leading-snug font-light tracking-tight text-[#111]'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.title}
                  </h3>

                  <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-black/62'>{cs.description}</p>

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
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CaseStudyDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const caseStudies = await getCaseStudies()
  const caseStudy = await getCaseStudyBySlug(slug)

  if (!caseStudy) {
    notFound()
  }

  const { metadata, content } = caseStudy

  const otherCaseStudies = caseStudies.filter(item => item.slug !== slug).slice(0, 2)
  const headings = extractHeadings(content)

  // Outcome first, mechanism second: the hero mock-up shows what the client
  // ends up looking at, and the workflow canvas below it shows how that gets
  // produced. `image` is the fallback for entries with no mock-up drawn yet.
  const leadImage = metadata.heroImage ?? metadata.image

  const facts = [
    { label: 'Organisation', value: metadata.organisation },
    { label: 'Role', value: metadata.role },
    { label: 'Duration', value: metadata.duration },
    { label: 'Platform', value: metadata.platform }
  ].filter(fact => fact.value)

  const pageUrl = abs(`/case-study/${metadata.slug}`)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: `Case Study: ${metadata.title}`,
        description: metadata.description,
        url: pageUrl
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: metadata.title, item: pageUrl }
        ]
      }
    ]
  }

  return (
    <div className={PAGE}>
      <SiteNav />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className='px-6 pt-36 pb-20 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <a
            href='/#portfolio'
            className='inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-black/50 transition-colors hover:text-black'
          >
            <span aria-hidden='true'>←</span>
            SELECTED WORK
          </a>

          <div className='mt-12 flex flex-wrap items-center gap-x-5 gap-y-3'>
            <Eyebrow>CASE STUDY</Eyebrow>
            {metadata.platform && <Chip tone='solid'>{metadata.platform}</Chip>}
            {metadata.categories?.map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
            {metadata.sample && <Chip tone='warn'>SAMPLE</Chip>}
          </div>

          <h1
            className='mt-7 max-w-[19ch] text-[clamp(2.1rem,5.2vw,4.5rem)] leading-[1.02] font-light tracking-tight text-[#111]'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {metadata.title}
          </h1>

          {metadata.description && (
            <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-black/62'>{metadata.description}</p>
          )}

          {/* Facts strip */}
          {facts.length > 0 && (
            <dl className='mt-14 grid grid-cols-2 gap-y-8 border-t border-black/[0.07] pt-8 sm:grid-cols-4'>
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className='font-mono text-[11px] tracking-[0.2em] text-black/45'>{fact.label.toUpperCase()}</dt>
                  <dd className='mt-2 text-[15px] text-black/75'>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {metadata.tools && metadata.tools.length > 0 && (
            <div className='mt-10'>
              <p className='font-mono text-[11px] tracking-[0.2em] text-black/45'>STACK</p>
              <div className='mt-3 flex flex-wrap gap-1.5'>
                {metadata.tools.map(tool => (
                  <span
                    key={tool}
                    className='rounded-md border border-black/[0.08] bg-black/[0.02] px-2.5 py-1 font-mono text-[11px] text-black/62'
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {leadImage && (
            <Reveal className='mt-14' threshold={0.05}>
              <figure>
                <div className='rounded-2xl border border-black/[0.07] bg-white p-3'>
                  <img
                    src={leadImage}
                    alt={`What the team sees when ${metadata.title} runs`}
                    className='w-full rounded-xl'
                  />
                </div>
                <figcaption className='mt-3 font-mono text-[11px] tracking-[0.18em] text-black/45'>
                  WHAT THE TEAM SEES
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </header>

      {/* The reading zone stays on plain cream. On the landing the constellation
          field only ever sits behind white cards; behind body copy it competes
          with the text, so it picks up again below the article. */}
      <>
        {/* The mechanism behind the mock-up above */}
        {metadata.workflowImage && (
          <section className='border-t border-black/[0.06] px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='font-mono text-[12px] tracking-[0.28em] text-black/50'>THE WORKFLOW</p>
              {metadata.logicSummary && (
                <p
                  className='mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight text-[#111]'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.logicSummary}
                </p>
              )}

              <Reveal className='mt-10' threshold={0.05}>
                <figure>
                  <div className='rounded-2xl border border-black/[0.07] bg-white p-3'>
                    <img
                      src={metadata.workflowImage}
                      alt={`Workflow canvas for ${metadata.title}`}
                      loading='lazy'
                      className='w-full rounded-xl'
                    />
                  </div>
                  <figcaption className='mt-3 font-mono text-[11px] tracking-[0.18em] text-black/45'>
                    {metadata.platform ? `${metadata.platform.toUpperCase()} CANVAS` : 'WORKFLOW CANVAS'}
                    {metadata.stepCount ? ` · ${metadata.stepCount} STAGES` : ''}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>
        )}

        <section className='border-t border-black/[0.06] px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-[1080px]'>
            <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
              <ReadingRail headings={headings} contentId='case-study-content' />
              <div id='case-study-content' className='max-w-[70ch] min-w-0'>
                <MDXContent source={content} />
              </div>
            </div>
          </div>
        </section>

        {/* Browsing zone — card-based, so the field reads as texture here */}
        <div className='relative'>
          <ParticleField />

          <div className='relative z-10'>
            <OtherWork items={otherCaseStudies} />
            <CtaSection />
            <SiteFooter />
          </div>
        </div>
      </>

      <ChatWidget />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}

export default CaseStudyDetailsPage
