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
    <section className='border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='font-mono text-[12px] tracking-[0.28em] text-black/50'>KEEP READING</p>
            <h2
              className='mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight text-[#111]'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              More writing
            </h2>
          </div>

          <a
            href='/blog'
            className='inline-flex shrink-0 items-center gap-2 rounded-full border border-black/12 px-5 py-2.5 text-[12px] tracking-wide text-black/62 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black'
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
                className='group flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white/50 p-6 transition-all duration-300 hover:border-black/12 hover:bg-white'
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  {post.category && (
                    <span className='rounded-full border border-black/12 px-3.5 py-1.5 font-mono text-[11px] text-black/70'>
                      {post.category}
                    </span>
                  )}
                  {post.readingTime && (
                    <span className='font-mono text-[11px] text-black/45'>{post.readingTime}</span>
                  )}
                </div>

                <h3
                  className='mt-5 text-[19px] leading-snug font-light tracking-tight text-[#111]'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {post.title ?? post.slug}
                </h3>

                {post.description && (
                  <p className='mt-3 line-clamp-3 text-[13px] leading-relaxed text-black/62'>{post.description}</p>
                )}

                <span className='mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide text-black/62 transition-colors group-hover:text-black'>
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
            className='inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-black/50 transition-colors hover:text-black'
          >
            <span aria-hidden='true'>←</span>
            ALL ARTICLES
          </a>

          <div className='mt-12 flex flex-wrap items-center gap-x-5 gap-y-3'>
            <span className='inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em] text-black/55'>
              <span className='h-px w-8 bg-black/25' />
              {metadata.category?.toUpperCase() ?? 'WRITING'}
            </span>
            {metadata.tags?.map(tag => (
              <span
                key={tag}
                className='rounded-full border border-black/10 px-3 py-1 font-mono text-[11px] tracking-wide text-black/60'
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className='mt-7 max-w-[20ch] text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[1.02] font-light tracking-tight text-[#111]'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {metadata.title}
          </h1>

          {metadata.description && (
            <p className='mt-7 max-w-2xl text-[16px] leading-relaxed text-black/62'>{metadata.description}</p>
          )}

          <div className='mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-black/[0.07] pt-6 font-mono text-[11px] tracking-[0.18em] text-black/45'>
            <span>RAMON VALLEJERA JR.</span>
            {published && <span>{published.toUpperCase()}</span>}
            {metadata.readingTime && <span>{metadata.readingTime.toUpperCase()}</span>}
          </div>

          {metadata.coverImage && (
            <Reveal className='mt-14' threshold={0.05}>
              <div className='rounded-2xl border border-black/[0.07] bg-white p-3'>
                <img src={metadata.coverImage} alt={metadata.title ?? ''} className='w-full rounded-xl' />
              </div>
            </Reveal>
          )}
        </div>
      </header>

      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          <section className='border-t border-black/[0.06] px-6 py-24 md:px-12 lg:px-20'>
            <div className='mx-auto max-w-[1080px]'>
              <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
                <ReadingRail headings={headings} contentId='post-content' />
                <div id='post-content' className='min-w-0 max-w-[70ch]'>
                  <MDXContent source={content} />
                </div>
              </div>
            </div>
          </section>

          <MoreWriting items={morePosts} />
          <CtaSection
            title={<>Got a process<br />worth automating?</>}
            blurb='If something here maps onto a workflow you are running by hand, tell me about it and I will say what it would take.'
          />
          <SiteFooter />
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}

export default BlogPostPage
