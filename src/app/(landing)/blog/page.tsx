import type { Metadata } from 'next'

import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { ArrowRight, CONTAINER, DISPLAY_FONT, PAGE, Reveal } from '@/components/landing/motion'

import { getPosts } from '@/lib/posts'
import { abs } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on AI automation — n8n, Zapier and Make, LLM integrations, and lessons from building workflows that run in production.',
  alternates: { canonical: abs('/blog') }
}

const formatDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const BlogPage = async () => {
  const posts = await getPosts()

  return (
    <div className={PAGE}>
      <SiteNav />

      <header className='px-6 pt-36 pb-20 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-ink-3'>
            <span className='h-px w-8 bg-ink/25' />
            WRITING
          </span>

          <h1
            className='mt-7 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-light tracking-tight text-ink'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Notes on automation
          </h1>

          <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-ink-3'>
            Working notes on n8n, Zapier and Make — architecture decisions, failure modes, and what actually holds up in
            production.
          </p>

          {posts.length > 0 && (
            <p className='mt-10 border-t border-rule pt-6 font-mono text-[11px] tracking-[0.2em] text-ink-3'>
              {String(posts.length).padStart(2, '0')} {posts.length === 1 ? 'ARTICLE' : 'ARTICLES'}
            </p>
          )}
        </div>
      </header>

      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
            <div className={CONTAINER}>
              {posts.length === 0 ? (
                <div className='rounded-2xl border border-dashed border-rule px-6 py-20 text-center'>
                  <p className='text-2xl font-light tracking-tight text-ink' style={{ fontFamily: DISPLAY_FONT }}>
                    Nothing published yet.
                  </p>
                  <p className='mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-ink-3'>
                    The first post is in progress. Until then, the case studies go into detail on how each automation
                    was built.
                  </p>
                  <a
                    href='/#portfolio'
                    className='mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[12px] tracking-wide text-ground transition-colors hover:bg-ink/90'
                  >
                    Read the case studies
                    <ArrowRight />
                  </a>
                </div>
              ) : (
                <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                  {posts.map((post, i) => (
                    <Reveal key={post.slug} delay={(i % 3) * 90}>
                      <article className='group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface transition-all duration-300 hover:border-rule hover:bg-surface-raised'>
                        {post.coverImage && (
                          <a href={`/blog/${post.slug}`} className='block border-b border-rule bg-surface-raised'>
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
                              <span className='rounded-full border border-rule px-3.5 py-1.5 font-mono text-[11px] text-ink-2'>
                                {post.category}
                              </span>
                            )}
                            {formatDate(post.publishedAt) && (
                              <span className='font-mono text-[11px] text-ink-3'>
                                {formatDate(post.publishedAt)}
                              </span>
                            )}
                          </div>

                          <h2
                            className='mt-5 text-[20px] leading-snug font-light tracking-tight text-ink'
                            style={{ fontFamily: DISPLAY_FONT }}
                          >
                            <a href={`/blog/${post.slug}`} className='transition-colors hover:text-ink'>
                              {post.title ?? post.slug}
                            </a>
                          </h2>

                          {post.description && (
                            <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-3'>
                              {post.description}
                            </p>
                          )}

                          <div className='mt-auto flex items-center justify-between gap-3 pt-6'>
                            <a
                              href={`/blog/${post.slug}`}
                              className='inline-flex items-center gap-2 font-mono text-[12px] tracking-wide text-ink-3 transition-colors hover:text-ink'
                            >
                              READ ARTICLE
                              <ArrowRight />
                            </a>
                            {post.readingTime && (
                              <span className='font-mono text-[11px] text-ink-3'>{post.readingTime}</span>
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
    </div>
  )
}

export default BlogPage
