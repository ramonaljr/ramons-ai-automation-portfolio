import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

// Component Imports
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { CaseStudyBody } from '@/components/landing/case-study-body'
import { ParticleField } from '@/components/landing/particle-field'
import { PageScene } from '@/components/landing/page-scene'
import { ArrowRight, CONTAINER, DISPLAY_FONT, ICON_STROKE, PAGE, Reveal } from '@/components/landing/motion'
import MDXContent from '@/components/mdx-content'
import { ReadingRail } from '@/components/shared/prose/reading-rail'

// Data Imports
import { getCaseStudyBySlug, getCaseStudies, type CaseStudyMetadata } from '@/lib/case-studies'
import { extractHeadings } from '@/lib/extract-headings'
import { metaDescription, pageMetadata } from '@/lib/seo'
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

  return pageMetadata({
    title: `Case Study: ${metadata.title}`,
    description: metaDescription(metadata.description),
    path: `/case-study/${metadata.slug}`
  })
}

export const dynamicParams = false

// ── Page furniture ───────────────────────────────────────────────────────────

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>{children}</span>
)

const Chip = ({ children, tone = 'quiet' }: { children: React.ReactNode; tone?: 'quiet' | 'solid' | 'warn' }) => {
  const tones = {
    quiet: 'border-rule text-ink-3',
    solid: 'border-rule-strong bg-ink/4 text-ink-2',
    warn: 'border-[color-mix(in_oklab,var(--accent)_26%,transparent)] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)] text-accent'
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
                    Read case study
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
      <header className='relative isolate px-6 pt-36 pb-14 md:px-12 lg:px-20 lg:pt-44'>
        <PageScene leaves />
        <div className={CONTAINER}>
          <a
            href='/#portfolio'
            className='text-ink-3 hover:text-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] transition-colors'
          >
            <ArrowLeft size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
            Selected work
          </a>

          <div className='mt-12 flex flex-wrap items-center gap-x-5 gap-y-3'>
            <Eyebrow>CASE STUDY</Eyebrow>
            {metadata.platform && <Chip tone='solid'>{metadata.platform}</Chip>}
            {metadata.categories?.map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
            {metadata.sample && <Chip tone='warn'>SAMPLE</Chip>}
            {metadata.sampleClient && <Chip tone='warn'>SAMPLE CLIENT</Chip>}
          </div>

          <h1
            data-leaf-clear
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
            <dl className='border-rule mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 sm:grid-cols-4'>
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt className='text-ink-3 font-mono text-[11px] tracking-[0.2em]'>{fact.label.toUpperCase()}</dt>
                  <dd className='text-ink-2 mt-2 text-[15px]'>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

        </div>
      </header>

      {/* The reading zone stays on plain cream. On the landing the constellation
          field only ever sits behind white cards; behind body copy it competes
          with the text, so it picks up again below the article. */}
      <>
        {/* Film and workflow, outcome, problem and build, tools, fail-safes
            and the runnable demo: the landing dialog's order, so a project
            reads the same however it was opened. */}
        <CaseStudyBody study={metadata} />

        {/* The long read, for whoever wants the detail behind the summary. */}
        <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-270'>
            <p className='text-ink-3 mb-12 font-mono text-xs font-medium tracking-[0.2em] uppercase lg:pl-[280px]'>
              The full story
            </p>
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
