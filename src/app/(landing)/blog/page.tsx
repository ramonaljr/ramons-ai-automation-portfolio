import type { Metadata } from 'next'

import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { ArrowRight, CONTAINER, DISPLAY_FONT, PAGE, Reveal } from '@/components/landing/motion'

import { getPosts } from '@/lib/posts'
import { abs, SITE_URL } from '@/lib/site'
import { blogIndexLd, breadcrumbLd, graph, socialImage } from '@/lib/seo'

const INDEX_TITLE = 'Notes on automation'

const INDEX_DESCRIPTION =
  'Working notes on AI automation — n8n, Zapier and Make, LLM and RAG integrations, error handling, and what actually holds up in production.'

export const metadata: Metadata = {
  // "Blog" told a search result nothing. The title template appends the name,
  // so this reads as "Notes on automation - Ramon Vallejera Jr." in a SERP.
  title: INDEX_TITLE,
  description: INDEX_DESCRIPTION,
  keywords: ['n8n', 'Zapier', 'Make.com', 'workflow automation', 'RAG', 'AI agents', 'error handling'],
  alternates: {
    canonical: abs('/blog'),

    // Advertises the feed, so readers and aggregators find it without being
    // pointed at the URL.
    types: { 'application/rss+xml': abs('/blog/rss.xml') }
  },
  openGraph: {
    type: 'website',
    title: INDEX_TITLE,
    description: INDEX_DESCRIPTION,
    url: abs('/blog'),
    images: [{ url: socialImage(), width: 1200, height: 630, alt: INDEX_TITLE }]
  },
  twitter: {
    card: 'summary_large_image',
    title: INDEX_TITLE,
    description: INDEX_DESCRIPTION,
    images: [socialImage()]
  }
}

const formatDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const BlogPage = async () => {
  const posts = await getPosts()

  const jsonLd = graph(
    blogIndexLd(posts),
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Writing', url: abs('/blog') }
    ])
  )

  return (
    <div className={PAGE}>
      <SiteNav />

      <header className='px-6 pt-36 pb-20 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
            <span className='bg-ink/25 h-px w-8' />
            WRITING
          </span>

          <h1
            className='text-ink mt-7 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-light tracking-tight'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Notes on automation
          </h1>

          <p className='text-ink-3 mt-7 max-w-2xl text-[16px] leading-relaxed'>
            Working notes on n8n, Zapier and Make — architecture decisions, failure modes, and what actually holds up in
            production.
          </p>

          {posts.length > 0 && (
            <p className='border-rule text-ink-3 mt-10 border-t pt-6 font-mono text-[11px] tracking-[0.2em]'>
              {String(posts.length).padStart(2, '0')} {posts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
            </p>
          )}
        </div>
      </header>

      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              {posts.length === 0 ? (
                <div className='border-rule rounded-2xl border border-dashed px-6 py-20 text-center'>
                  <p className='text-ink text-2xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                    Nothing published yet.
                  </p>
                  <p className='text-ink-3 mx-auto mt-4 max-w-md text-[14px] leading-relaxed'>
                    The first post is in progress. Until then, the case studies go into detail on how each automation
                    was built.
                  </p>
                  <a
                    href='/#portfolio'
                    className='bg-ink text-ground hover:bg-ink/90 mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] tracking-wide transition-colors'
                  >
                    Read the case studies
                    <ArrowRight />
                  </a>
                </div>
              ) : (
                <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                  {posts.map((post, i) => (
                    <Reveal key={post.slug} delay={(i % 3) * 90}>
                      <article className='group border-rule bg-surface hover:border-rule hover:bg-surface-raised flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300'>
                        {post.coverImage && (
                          <a href={`/blog/${post.slug}`} className='border-rule bg-surface-raised block border-b'>
                            <img
                              src={post.coverImage}
                              alt=''
                              aria-hidden='true'
                              width={1200}
                              height={750}
                              loading='lazy'
                              className='h-[190px] w-full object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.02]'
                            />
                          </a>
                        )}

                        <div className='flex flex-1 flex-col p-6'>
                          <div className='flex flex-wrap items-center justify-between gap-3'>
                            {post.category && (
                              <span className='border-rule text-ink-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px]'>
                                {post.category}
                              </span>
                            )}
                            {formatDate(post.publishedAt) && (
                              <time dateTime={post.publishedAt} className='text-ink-3 font-mono text-[11px]'>
                                {formatDate(post.publishedAt)}
                              </time>
                            )}
                          </div>

                          <h2
                            className='text-ink mt-5 text-[20px] leading-snug font-light tracking-tight'
                            style={{ fontFamily: DISPLAY_FONT }}
                          >
                            <a href={`/blog/${post.slug}`} className='hover:text-ink transition-colors'>
                              {post.title ?? post.slug}
                            </a>
                          </h2>

                          {post.description && (
                            <p className='text-ink-3 mt-3 line-clamp-3 text-[13px] leading-relaxed'>
                              {post.description}
                            </p>
                          )}

                          <div className='mt-auto flex items-center justify-between gap-3 pt-6'>
                            <a
                              href={`/blog/${post.slug}`}
                              className='text-ink-3 hover:text-ink inline-flex items-center gap-2 font-mono text-[12px] tracking-wide transition-colors'
                            >
                              READ ARTICLE
                              <ArrowRight />
                            </a>
                            {post.readingTime && (
                              <span className='text-ink-3 font-mono text-[11px]'>{post.readingTime}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>

          <CtaSection />
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

export default BlogPage
