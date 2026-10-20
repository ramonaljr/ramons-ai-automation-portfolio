'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowRight, Clock, User } from 'lucide-react'

import type { PostMetadata } from '@/lib/posts'
import { SectionIntro } from '@/components/landing/section-intro'

import { DISPLAY_FONT, ICON_STROKE } from '@/components/landing/motion'

const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true)
      },
      { threshold }
    )

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

const formatDate = (v?: string) => {
  if (!v) return null
  const d = new Date(v)

  if (Number.isNaN(d.getTime())) return null

  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function ArticlesSection({ posts }: { posts: PostMetadata[] }) {
  const { ref, inView } = useInView(0.06)

  // Nothing to show yet — render nothing rather than an empty shelf.
  if (!posts.length) return null

  return (
    <section id='articles' className='saas-section border-rule border-t px-6 py-32 md:px-12 lg:px-20'>
      <div className={CONTAINER}>
        <div className='mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <SectionIntro
            tag='WRITING'
            variant='mono'
            margin=''
            titleClassName='mt-4 text-[clamp(2rem,4vw,3.25rem)]'
            title={'Notes on building automation that doesn\u2019t break'}
          />

          <a
            href='/blog'
            className='border-rule text-ink-2 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] tracking-wide transition-all'
          >
            All articles
            <ArrowRight size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
          </a>
        </div>

        <div ref={ref} className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {posts.slice(0, 3).map((post, i) => (
            <article
              key={post.slug}
              className='group border-rule bg-surface hover:border-rule hover:bg-surface-raised flex flex-col overflow-hidden rounded-2xl border transition-all duration-300'
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(22px)',
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, border-color .3s, background-color .3s`
              }}
            >
              <a href={`/blog/${post.slug}`} className='border-rule bg-surface-raised block border-b'>
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt=''
                    aria-hidden='true'
                    width={1200}
                    height={750}
                    loading='lazy'
                    className='h-[190px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]'
                  />
                )}
              </a>

              <div className='flex flex-1 flex-col p-6'>
                <div className='text-ink-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]'>
                  <span className='inline-flex items-center gap-1.5'>
                    <User size={12} strokeWidth={ICON_STROKE} aria-hidden='true' />
                    Ramon
                  </span>
                  {post.readingTime && (
                    <span className='inline-flex items-center gap-1.5'>
                      <Clock size={12} strokeWidth={ICON_STROKE} aria-hidden='true' />
                      {post.readingTime}
                    </span>
                  )}
                </div>

                <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
                  {post.category && (
                    <span className='border-rule text-ink-2 rounded-full border px-3.5 py-1.5 font-mono text-[12px]'>
                      {post.category}
                    </span>
                  )}
                  {formatDate(post.publishedAt) && (
                    <span className='text-ink-3 font-mono text-[12px]'>{formatDate(post.publishedAt)}</span>
                  )}
                </div>

                <h3
                  className='text-ink mt-5 text-[20px] leading-snug font-light tracking-tight'
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  <a href={`/blog/${post.slug}`} className='hover:text-ink transition-colors'>
                    {post.title}
                  </a>
                </h3>

                {post.description && (
                  <p className='text-ink-2 mt-3 line-clamp-3 text-[14px] leading-relaxed'>{post.description}</p>
                )}

                <div className='mt-auto pt-6'>
                  <a
                    href={`/blog/${post.slug}`}
                    className='text-ink-2 hover:text-ink inline-flex items-center gap-2 font-mono text-[13px] tracking-wide transition-colors'
                  >
                    Read article
                    <ArrowRight size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
