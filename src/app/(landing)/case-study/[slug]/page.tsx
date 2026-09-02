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
  <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
    <span className='bg-ink/25 h-px w-8' />
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
    <section className='border-rule border-t px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>KEEP READING</p>
            <h2
              className='text-ink mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Other builds
            </h2>
          </div>

          <a
            href='/#portfolio'
            className='border-rule text-ink-3 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[12px] tracking-wide transition-all'
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
                className='group border-rule bg-surface hover:border-rule hover:bg-surface-raised flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300'
              >
                {cs.workflowImage && (
                  <div className='border-rule bg-surface-raised border-b p-3'>
                    <img
                      src={cs.workflowImage}
                      alt=''
                      aria-hidden='true'
                      width={1400}
                      height={900}
                      loading='lazy'
                      className='h-40 w-full rounded object-cover object-top-left'
                    />
                  </div>
                )}

                <div className='flex flex-1 flex-col p-6'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {cs.platform && <Chip tone='solid'>{cs.platform}</Chip>}
                    {cs.speed && <span className='text-ink-3 font-mono text-[11px]'>{cs.speed}</span>}
                  </div>

                  <h3
                    className='text-ink mt-4 text-[20px] leading-snug font-light tracking-tight'
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {cs.title}
                  </h3>

                  <p className='text-ink-3 mt-3 line-clamp-3 text-[13px] leading-relaxed'>{cs.description}</p>

                  <span className='text-ink-3 group-hover:text-ink mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide transition-colors'>
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
            className='text-ink-3 hover:text-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] transition-colors'
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
            className='text-ink mt-7 max-w-[19ch] text-[clamp(2.1rem,5.2vw,4.5rem)] leading-[1.02] font-light tracking-tight'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {metadata.title}
          </h1>

          {metadata.description && (
            <p className='text-ink-3 mt-7 max-w-2xl text-[16px] leading-relaxed'>{metadata.description}</p>
          )}

          {/* Facts strip */}
          {facts.length > 0 && (
            <dl className='border-rule mt-14 grid grid-cols-2 gap-y-8 border-t pt-8 sm:grid-cols-4'>
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className='text-ink-3 font-mono text-[11px] tracking-[0.2em]'>{fact.label.toUpperCase()}</dt>
                  <dd className='text-ink-2 mt-2 text-[15px]'>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {metadata.tools && metadata.tools.length > 0 && (
            <div className='mt-10'>
              <p className='text-ink-3 font-mono text-[11px] tracking-[0.2em]'>STACK</p>
              <div className='mt-3 flex flex-wrap gap-1.5'>
                {metadata.tools.map(tool => (
                  <span
                    key={tool}
                    className='border-rule bg-ink/2 text-ink-3 rounded-md border px-2.5 py-1 font-mono text-[11px]'
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
                <div className='border-rule bg-surface-raised rounded-2xl border p-3'>
                  <img
                    src={leadImage}
                    alt={`What the team sees when ${metadata.title} runs`}
                    className='w-full rounded-xl'
                  />
                </div>
                <figcaption className='text-ink-3 mt-3 font-mono text-[11px] tracking-[0.18em]'>
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
          <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>THE WORKFLOW</p>
              {metadata.logicSummary && (
                <p
                  className='text-ink mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.logicSummary}
                </p>
              )}

              <Reveal className='mt-10' threshold={0.05}>
                <figure>
                  <div className='border-rule bg-surface-raised rounded-2xl border p-3'>
                    <img
                      src={metadata.workflowImage}
                      alt={`Workflow canvas for ${metadata.title}`}
                      loading='lazy'
                      className='w-full rounded-xl'
                    />
                  </div>
                  <figcaption className='text-ink-3 mt-3 font-mono text-[11px] tracking-[0.18em]'>
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
          <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>OUTCOME</p>

              {metadata.impactHighlight && (
                <p
                  className='text-ink mt-4 max-w-3xl text-[clamp(1.35rem,2.4vw,2rem)] leading-snug font-light tracking-tight'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.impactHighlight}
                </p>
              )}
              {metadata.impactHighlightDesc && (
                <p className='text-ink-2 mt-4 max-w-2xl text-[15px] leading-relaxed'>{metadata.impactHighlightDesc}</p>
              )}

              {metadata.roi && metadata.roi.length > 0 && (
                <div className='mt-12 grid gap-4 sm:grid-cols-3'>
                  {metadata.roi.map((r, i) => (
                    <Reveal key={r.label} delay={i * 90}>
                      <div className='border-rule bg-surface rounded-2xl border p-8 text-center'>
                        <p
                          className='text-ink text-[clamp(2rem,4vw,2.75rem)] leading-none font-light'
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {r.value}
                        </p>
                        <p className='text-ink-3 mt-3 text-[13px]'>{r.label}</p>
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
          <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>IN SHORT</p>
              <div className='mt-10 grid gap-5 md:grid-cols-2'>
                {metadata.problem && (
                  <div className='border-rule bg-ink/2.5 rounded-2xl border p-8'>
                    <p className='eyebrow'>THE PROBLEM</p>
                    <p className='text-ink-2 mt-4 text-[15px] leading-relaxed'>{metadata.problem}</p>
                  </div>
                )}
                {metadata.solution && (
                  <div className='rounded-2xl border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] bg-[color-mix(in_oklch,var(--accent)_5%,transparent)] p-8'>
                    <p className='eyebrow text-accent'>WHAT I BUILT</p>
                    <p className='text-ink-2 mt-4 text-[15px] leading-relaxed'>{metadata.solution}</p>
                  </div>
                )}
              </div>

              {metadata.integrations && metadata.integrations.length > 0 && (
                <>
                  <p className='text-ink-3 mt-14 font-mono text-[12px] tracking-[0.18em]'>ACTIVE INTEGRATIONS</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {metadata.integrations.map(i => (
                      <span
                        key={i}
                        className='border-rule bg-surface-raised text-ink-2 rounded-lg border px-4 py-2.5 font-mono text-[13px]'
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

        <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-270'>
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
          <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>WHEN IT BREAKS</p>

              {metadata.failsafeHeadline && (
                <p
                  className='text-ink mt-4 max-w-3xl text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-light tracking-tight'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {metadata.failsafeHeadline}
                </p>
              )}
              {metadata.failsafeDesc && (
                <p className='text-ink-2 mt-4 max-w-2xl text-[15px] leading-relaxed'>{metadata.failsafeDesc}</p>
              )}

              {metadata.failsafes && metadata.failsafes.length > 0 && (
                <div className='mt-10 grid gap-5 md:grid-cols-2'>
                  {metadata.failsafes.map((f, i) => (
                    <Reveal key={f.title} delay={i * 90}>
                      <div className='border-rule bg-surface rounded-2xl border p-8'>
                        <p className='text-fine text-accent font-mono'>{f.title}</p>
                        <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>{f.desc}</p>
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
