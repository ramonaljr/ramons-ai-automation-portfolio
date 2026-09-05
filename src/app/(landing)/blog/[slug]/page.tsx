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
import { abs, SITE_URL } from '@/lib/site'
import { PROFILE } from '@/lib/portfolio'
import { blogPostingLd, breadcrumbLd, graph, postUrl } from '@/lib/seo'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return {}

  const { metadata: m } = post
  const url = postUrl(m.slug)

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': abs('/blog/rss.xml') }
    },

    // Tags are the post's own subject terms. Kept narrow — the site-wide
    // keyword list already covers the practice, and repeating it here would
    // make every article look like it is about the same thing.
    keywords: m.tags,
    authors: [{ name: PROFILE.name, url: SITE_URL }],
    category: m.category,

    // Without these a shared link falls back to the site-wide card, so every
    // article looks identical in a feed. `type: 'article'` is what lets a
    // crawler read the dates and byline below rather than treating the page
    // as a generic website.
    openGraph: {
      type: 'article',
      title: m.title,
      description: m.description,
      url,
      siteName: PROFILE.name,
      publishedTime: m.publishedAt,
      modifiedTime: m.updatedAt ?? m.publishedAt,
      authors: [PROFILE.name],
      section: m.category,
      tags: m.tags

      // No `images` here on purpose: opengraph-image.tsx in this segment
      // supplies og:image and twitter:image with the content-hashed URL Next
      // actually serves. Setting them here overrode that with an unhashed path
      // that 404s.
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description
    }
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
    <section className='border-rule border-t px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-ink-3 font-mono text-[12px] tracking-[0.28em]'>KEEP READING</p>
            <h2
              className='text-ink mt-4 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-light tracking-tight'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              More writing
            </h2>
          </div>

          <a
            href='/blog'
            className='border-rule text-ink-3 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[12px] tracking-wide transition-all'
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
                className='group border-rule bg-surface hover:border-rule hover:bg-surface-raised flex h-full flex-col rounded-2xl border p-6 transition-all duration-300'
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  {post.category && (
                    <span className='border-rule text-ink-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px]'>
                      {post.category}
                    </span>
                  )}
                  {post.readingTime && <span className='text-ink-3 font-mono text-[11px]'>{post.readingTime}</span>}
                </div>

                <h3
                  className='text-ink mt-5 text-[19px] leading-snug font-light tracking-tight'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {post.title ?? post.slug}
                </h3>

                {post.description && (
                  <p className='text-ink-3 mt-3 line-clamp-3 text-[13px] leading-relaxed'>{post.description}</p>
                )}

                <span className='text-ink-3 group-hover:text-ink mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[12px] tracking-wide transition-colors'>
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

  // One script carrying both nodes: the article itself, and the trail that
  // lets a search result render Home › Blog › title instead of a bare URL.
  const jsonLd = graph(
    blogPostingLd(metadata, content),
    breadcrumbLd([
      { name: 'Home', url: SITE_URL },
      { name: 'Writing', url: abs('/blog') },
      { name: metadata.title ?? metadata.slug, url: postUrl(metadata.slug) }
    ])
  )

  return (
    <div className={PAGE}>
      <SiteNav />

      {/* `article` rather than a bare div, so the byline, dates and body below
          are scoped to one authored work. */}
      <article>
        <header className='px-6 pt-36 pb-16 md:px-12 lg:px-20 lg:pt-44'>
          <div className={CONTAINER}>
            <a
              href='/blog'
              className='text-ink-3 hover:text-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] transition-colors'
            >
              <span aria-hidden='true'>←</span>
              ALL ARTICLES
            </a>

            <div className='mt-12 flex flex-wrap items-center gap-x-5 gap-y-3'>
              <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
                <span className='bg-ink/25 h-px w-8' />
                {metadata.category?.toUpperCase() ?? 'WRITING'}
              </span>
              {metadata.tags?.map(tag => (
                <span
                  key={tag}
                  className='border-rule text-ink-3 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide'
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className='text-ink mt-7 max-w-[20ch] text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[1.02] font-light tracking-tight'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {metadata.title}
            </h1>

            {metadata.description && (
              <p className='text-ink-3 mt-7 max-w-2xl text-[16px] leading-relaxed'>{metadata.description}</p>
            )}

            {/* rel=author and a real <time datetime> — the visible date is
              formatted for a reader, the attribute for a crawler. */}
            <div className='border-rule text-ink-3 mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-6 font-mono text-[11px] tracking-[0.18em]'>
              <a href='/#about' rel='author' className='hover:text-ink transition-colors'>
                {PROFILE.name.toUpperCase()}
              </a>
              {published && <time dateTime={metadata.publishedAt}>{published.toUpperCase()}</time>}
              {metadata.readingTime && <span>{metadata.readingTime.toUpperCase()}</span>}
            </div>

            {metadata.coverImage && (
              <Reveal className='mt-14' threshold={0.05}>
                <div className='border-rule bg-surface-raised rounded-2xl border p-3'>
                  {/* Decorative: it is an abstract cover sitting directly under an
                    h1 that already says the title, so repeating the title as
                    alt only makes a screen reader read it twice. */}
                  <img src={metadata.coverImage} alt='' aria-hidden='true' className='w-full rounded-xl' />
                </div>
              </Reveal>
            )}
          </div>
        </header>

        {/* The reading zone stays on plain cream — behind body copy the
            constellation field competes with the text. It picks up again below
            the article, where the content is card-based. */}
        <section className='border-rule border-t px-6 py-24 md:px-12 lg:px-20'>
          <div className='mx-auto max-w-[1080px]'>
            <div className='grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20'>
              <ReadingRail headings={headings} contentId='post-content' />
              <div id='post-content' className='max-w-[70ch] min-w-0'>
                <MDXContent source={content} />
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* Browsing zone — outside the article: these are other works, and
          scoping them inside this one would attribute them to it. */}
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

      <ChatWidget />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}

export default BlogPostPage
