import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { CtaSection } from '@/components/landing/cta-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { ArrowRight, CONTAINER, DISPLAY_FONT, PAGE, Reveal } from '@/components/landing/motion'
import MDXContent from '@/components/mdx-content'
import { ReadingRail } from '@/components/shared/prose/reading-rail'

import { getPostBySlug, getPosts, type PostMetadata } from '@/lib/posts'
import { extractHeadings } from '@/lib/extract-headings'
import { abs } from '@/lib/site'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    alternates: { canonical: abs(`/blog/${post.metadata.slug}`) }
  }
}

export const dynamicParams = false

const formatDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Up to three more posts, in the landing page's article card language. */
const MoreWriting = ({ items }: { items: PostMetadata[] }) => {
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
              More writing
            </h2>
          </div>

          <a
            href='/blog'
            className='inline-flex shrink-0 items-center gap-2 rounded-full border border-rule px-5 py-2.5 text-[12px] tracking-wide text-ink-3 transition-all hover:border-rule-strong hover:bg-ink/3 hover:text-ink'
          >
            All articles
            <ArrowRight />
          </a>
        </div>

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {items.map((post, i) => (
            <Reveal key={post.slug} delay={i * 90}>
              <a
                href={`/blog/${post.slug}`}
                className='group flex h-full flex-col rounded-2xl border border-rule bg-surface p-6 transition-all duration-300 hover:border-rule hover:bg-surface-raised'
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  {post.category && (
                    <span className='rounded-full border border-rule px-3.5 py-1.5 font-mono text-[11px] text-ink-2'>
                      {post.category}
                    </span>
                  )}
                  {post.readingTime && <span className='font-mono text-[11px] text-ink-3'>{post.readingTime}</span>}
                </div>

                <h3
                  className='mt-5 text-[19px] leading-snug font-light tracking-tight text-ink'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {post.title ?? post.slug}
                </h3>

                {post.description && (
                  <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-3'>{post.description}</p>
                )}

                <span className='mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide text-ink-3 transition-colors group-hover:text-ink'>
                  READ ARTICLE
                  <ArrowRight />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const BlogPostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { metadata, content } = post

  const posts = await getPosts()
  const morePosts = posts.filter(item => item.slug !== slug).slice(0, 3)
  const headings = extractHeadings(content)

  const published = formatDate(metadata.publishedAt)

  return (
    <div className={PAGE}>
      <SiteNav />

      <header className='px-6 pt-36 pb-16 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <a
            href='/blog'
            className='inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-ink-3 transition-colors hover:text-ink'
          >
            <span aria-hidden='true'>←</span>
            ALL ARTICLES
          </a>

          <div className='mt-12 flex flex-wrap items-center gap-x-5 gap-y-3'>
            <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-ink-3'>
              <span className='h-px w-8 bg-ink/25' />
              {metadata.category?.toUpperCase() ?? 'WRITING'}
            </span>
            {metadata.tags?.map(tag => (
              <span
                key={tag}
                className='rounded-full border border-rule px-3 py-1 font-mono text-[11px] tracking-wide text-ink-3'
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className='mt-7 max-w-[20ch] text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[1.02] font-light tracking-tight text-ink'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {metadata.title}
          </h1>

          {metadata.description && (
            <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-ink-3'>{metadata.description}</p>
          )}

          <div className='mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-6 font-mono text-[11px] tracking-[0.18em] text-ink-3'>
            <span>RAMON VALLEJERA JR.</span>
            {published && <span>{published.toUpperCase()}</span>}
            {metadata.readingTime && <span>{metadata.readingTime.toUpperCase()}</span>}
          </div>

          {metadata.coverImage && (
            <Reveal className='mt-14' threshold={0.05}>
              <div className='rounded-2xl border border-rule bg-surface-raised p-3'>
                <img src={metadata.coverImage} alt={metadata.title ?? ''} className='w-full rounded-xl' />
              </div>
            </Reveal>
          )}
        </div>
      </header>

      {/* The reading zone stays on plain cream — behind body copy the
          constellation field competes with the text. It picks up again below
          the article, where the content is card-based. */}
      <>
        <section className='border-t border-rule px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-[1080px]'>
            <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
              <ReadingRail headings={headings} contentId='post-content' />
              <div id='post-content' className='max-w-[70ch] min-w-0'>
                <MDXContent source={content} />
              </div>
            </div>
          </div>
        </section>

        {/* Browsing zone — card-based, so the field reads as texture here */}
        <div className='relative'>
          <ParticleField />

          <div className='relative z-10'>
            <MoreWriting items={morePosts} />
            <CtaSection
              title={
                <>
                  Got a process
                  <br />
                  worth automating?
                </>
              }
              blurb='If something here maps onto a workflow you are running by hand, tell me about it and I will say what it would take.'
            />
            <SiteFooter />
          </div>
        </div>
      </>

      <ChatWidget />
    </div>
  )
}

export default BlogPostPage
