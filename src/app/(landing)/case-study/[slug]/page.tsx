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
  <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-ink-3'>
    <span className='h-px w-8 bg-ink/25' />
    {children}
  </span>
)

const Chip = ({ children, tone = 'quiet' }: { children: React.ReactNode; tone?: 'quiet' | 'solid' | 'warn' }) => {
  const tones = {
    quiet: 'border-rule text-ink-3',
    solid: 'border-rule-strong bg-ink/4 text-ink-2',
    warn: 'border-[color-mix(in_oklch,var(--accent)_26%,transparent)] bg-[color-mix(in_oklch,var(--accent)_9%,transparent)] text-accent'
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
    <section className='border-t border-rule px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='font-mono text-[12px] tracking-[0.28em] text-ink-3'>KEEP READING</p>
            <h2
              className='mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight text-ink'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Other builds
            </h2>
          </div>

          <a
            href='/#portfolio'
            className='inline-flex shrink-0 items-center gap-2 rounded-full border border-rule px-5 py-2.5 text-[12px] tracking-wide text-ink-3 transition-all hover:border-rule-strong hover:bg-ink/3 hover:text-ink'
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
                className='group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface transition-all duration-300 hover:border-rule hover:bg-surface-raised'
              >
                {cs.workflowImage && (
                  <div className='border-b border-rule bg-surface-raised p-3'>
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
                    {cs.speed && <span className='font-mono text-[11px] text-ink-3'>{cs.speed}</span>}
                  </div>

                  <h3
                    className='mt-4 text-[20px] leading-snug font-light tracking-tight text-ink'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.title}
                  </h3>

                  <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-3'>{cs.description}</p>

                  <span className='mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide text-ink-3 transition-colors group-hover:text-ink'>
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
            className='inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-ink-3 transition-colors hover:text-ink'
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
            className='mt-7 max-w-[19ch] text-[clamp(2.1rem,5.2vw,4.5rem)] leading-[1.02] font-light tracking-tight text-ink'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {metadata.title}
          </h1>

          {metadata.description && (
            <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-ink-3'>{metadata.description}</p>
          )}

          {/* Facts strip */}
          {facts.length > 0 && (
            <dl className='mt-14 grid grid-cols-2 gap-y-8 border-t border-rule pt-8 sm:grid-cols-4'>
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className='font-mono text-[11px] tracking-[0.2em] text-ink-3'>{fact.label.toUpperCase()}</dt>
                  <dd className='mt-2 text-[15px] text-ink-2'>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {metadata.tools && metadata.tools.length > 0 && (
            <div className='mt-10'>
              <p className='font-mono text-[11px] tracking-[0.2em] text-ink-3'>STACK</p>
              <div className='mt-3 flex flex-wrap gap-1.5'>
                {metadata.tools.map(tool => (
                  <span
                    key={tool}
                    className='rounded-md border border-rule bg-ink/2 px-2.5 py-1 font-mono text-[11px] text-ink-3'
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
                <div className='rounded-2xl border border-rule bg-surface-raised p-3'>
                  <img
                    src={leadImage}
                    alt={`What the team sees when ${metadata.title} runs`}
                    className='w-full rounded-xl'
                  />
                </div>
                <figcaption className='mt-3 font-mono text-[11px] tracking-[0.18em] text-ink-3'>
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
          <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='font-mono text-[12px] tracking-[0.28em] text-ink-3'>THE WORKFLOW</p>
              {metadata.logicSummary && (
                <p
                  className='mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight text-ink'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.logicSummary}
                </p>
              )}

              <Reveal className='mt-10' threshold={0.05}>
                <figure>
                  <div className='rounded-2xl border border-rule bg-surface-raised p-3'>
                    <img
                      src={metadata.workflowImage}
                      alt={`Workflow canvas for ${metadata.title}`}
                      loading='lazy'
                      className='w-full rounded-xl'
                    />
                  </div>
                  <figcaption className='mt-3 font-mono text-[11px] tracking-[0.18em] text-ink-3'>
                    {metadata.platform ? `${metadata.platform.toUpperCase()} CANVAS` : 'WORKFLOW CANVAS'}
                    {metadata.stepCount ? ` · ${metadata.stepCount} STAGES` : ''}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </section>
        )}

        {/* ── Outcome ─────────────────────────────────────────────────────
            Figures first: these are the fields a reader scans for, and prose
            is the wrong shape for them. The article below tells the story. */}
        {(metadata.impactHighlight || metadata.roi) && (
          <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='font-mono text-[12px] tracking-[0.28em] text-ink-3'>OUTCOME</p>

              {metadata.impactHighlight && (
                <p
                  className='mt-4 max-w-3xl text-[clamp(1.35rem,2.4vw,2rem)] leading-snug font-light tracking-tight text-ink'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.impactHighlight}
                </p>
              )}
              {metadata.impactHighlightDesc && (
                <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2'>
                  {metadata.impactHighlightDesc}
                </p>
              )}

              {metadata.roi && metadata.roi.length > 0 && (
                <div className='mt-12 grid gap-4 sm:grid-cols-3'>
                  {metadata.roi.map((r, i) => (
                    <Reveal key={r.label} delay={i * 90}>
                      <div className='rounded-2xl border border-rule bg-surface p-8 text-center'>
                        <p
                          className='text-[clamp(2rem,4vw,2.75rem)] leading-none font-light text-ink'
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {r.value}
                        </p>
                        <p className='mt-3 text-[13px] text-ink-3'>{r.label}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Problem / Solution ──────────────────────────────────────────
            A scannable summary ahead of the long read, so someone deciding
            whether to read at all can get the shape of it in two paragraphs. */}
        {(metadata.problem || metadata.solution) && (
          <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='font-mono text-[12px] tracking-[0.28em] text-ink-3'>IN SHORT</p>
              <div className='mt-10 grid gap-5 md:grid-cols-2'>
                {metadata.problem && (
                  <div className='rounded-2xl border border-rule bg-ink/[0.025] p-8'>
                    <p className='eyebrow'>THE PROBLEM</p>
                    <p className='mt-4 text-[15px] leading-relaxed text-ink-2'>{metadata.problem}</p>
                  </div>
                )}
                {metadata.solution && (
                  <div className='rounded-2xl border-[color-mix(in_oklch,var(--accent)_22%,transparent)] border bg-[color-mix(in_oklch,var(--accent)_5%,transparent)] p-8'>
                    <p className='eyebrow text-accent'>WHAT I BUILT</p>
                    <p className='mt-4 text-[15px] leading-relaxed text-ink-2'>{metadata.solution}</p>
                  </div>
                )}
              </div>

              {metadata.integrations && metadata.integrations.length > 0 && (
                <>
                  <p className='mt-14 font-mono text-[12px] tracking-[0.18em] text-ink-3'>
                    ACTIVE INTEGRATIONS
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {metadata.integrations.map(i => (
                      <span
                        key={i}
                        className='rounded-lg border border-rule bg-surface-raised px-4 py-2.5 font-mono text-[13px] text-ink-2'
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-[1080px]'>
            <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
              <ReadingRail headings={headings} contentId='case-study-content' />
              <div id='case-study-content' className='max-w-[70ch] min-w-0'>
                <MDXContent source={content} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Fail-safes ──────────────────────────────────────────────────
            After the article rather than before it: this is the answer to
            "what happens when it breaks", which only lands once the reader
            knows what "it" is. */}
        {(metadata.failsafeHeadline || metadata.failsafes) && (
          <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='font-mono text-[12px] tracking-[0.28em] text-ink-3'>WHEN IT BREAKS</p>

              {metadata.failsafeHeadline && (
                <p
                  className='mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight text-ink'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.failsafeHeadline}
                </p>
              )}
              {metadata.failsafeDesc && (
                <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2'>
                  {metadata.failsafeDesc}
                </p>
              )}

              {metadata.failsafes && metadata.failsafes.length > 0 && (
                <div className='mt-10 grid gap-5 md:grid-cols-2'>
                  {metadata.failsafes.map((f, i) => (
                    <Reveal key={f.title} delay={i * 90}>
                      <div className='rounded-2xl border border-rule bg-surface p-8'>
                        <p className='font-mono text-fine text-accent'>{f.title}</p>
                        <p className='mt-3 text-[14px] leading-relaxed text-ink-2'>{f.desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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
