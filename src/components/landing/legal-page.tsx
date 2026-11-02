import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { ChatWidget } from '@/components/landing/chat-widget'
import { PageScene } from '@/components/landing/page-scene'
import { CONTAINER, DISPLAY_FONT, PAGE } from '@/components/landing/motion'
import MDXContent from '@/components/mdx-content'
import { ReadingRail } from '@/components/shared/prose/reading-rail'
import { extractHeadings } from '@/lib/extract-headings'
import { PROFILE } from '@/lib/portfolio'

/**
 * Shared frame for /privacy and /terms. The body is Markdown rendered by the
 * blog's MDXContent, so legal copy gets the same type, rules and contents rail
 * as an article without a second set of prose styles to keep in step.
 *
 * Kept as a string in a .tsx file rather than an .mdx file on purpose: prettier
 * rewrites .mdx in ways that break it, and nothing else reads these pages.
 */
export function LegalPage({
  label,
  title,
  intro,
  updated,
  body
}: {
  label: string
  title: string
  intro: string

  /** ISO date the text last changed. Shown to readers and used for the sitemap. */
  updated: string
  body: string
}) {
  const headings = extractHeadings(body)

  const updatedLabel = new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })

  return (
    <div className={PAGE}>
      <SiteNav />

      <article>
        <header className='relative isolate px-6 pt-36 pb-16 md:px-12 lg:px-20 lg:pt-44'>
          <PageScene />

          <div className={CONTAINER}>
            <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
              {label}
            </span>

            <h1
              data-leaf-clear
              className='text-ink mt-7 max-w-[18ch] text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[1.02] font-light tracking-tight'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {title}
            </h1>

            <p className='text-ink-3 mt-7 max-w-2xl text-[16px] leading-relaxed'>{intro}</p>

            <div className='border-rule text-ink-3 mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-6 font-mono text-[11px] tracking-[0.18em]'>
              <span>{PROFILE.name.toUpperCase()}</span>
              <time dateTime={updated}>LAST UPDATED {updatedLabel.toUpperCase()}</time>
            </div>
          </div>
        </header>

        <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-[1080px]'>
            <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
              <ReadingRail headings={headings} contentId='legal-content' />
              <div id='legal-content' className='max-w-[70ch] min-w-0'>
                <MDXContent source={body} />
              </div>
            </div>
          </div>
        </section>
      </article>

      <SiteFooter />
      <ChatWidget />
    </div>
  )
}
