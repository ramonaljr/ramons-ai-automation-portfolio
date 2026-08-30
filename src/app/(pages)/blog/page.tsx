import Link from 'next/link'
import type { Metadata } from 'next'

import Eyebrow from '@/components/shared/eyebrow/eyebrow'
import { Badge } from '@/components/ui/badge'

import { getPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on AI automation — n8n, Zapier and Make, LLM integrations, and lessons from building workflows that run in production.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog`
  }
}

const formatDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const BlogPage = async () => {
  const posts = await getPosts()

  return (
    <section className='px-4 py-16 sm:px-6 lg:px-10.5 lg:py-24'>
      <div className='space-y-4'>
        <Eyebrow>Blog</Eyebrow>
        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
          Notes on automation
        </h1>
        <p className='text-muted-foreground max-w-2xl text-base sm:text-lg'>
          Working notes on n8n, Zapier and Make — architecture decisions, failure modes, and what
          actually holds up in production.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className='mt-14 rounded-2xl border border-dashed p-10 text-center sm:p-16'>
          <p className='text-lg font-medium'>No posts yet.</p>
          <p className='text-muted-foreground mx-auto mt-2 max-w-md text-sm'>
            First one is in progress. In the meantime, the case studies go into detail on how each
            automation was built.
          </p>
          <Link
            href='/#portfolio'
            className='bg-primary text-primary-foreground mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-opacity hover:opacity-90'
          >
            Read the case studies
          </Link>
        </div>
      ) : (
        <ul className='divide-border mt-14 divide-y border-t'>
          {posts.map(post => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className='group flex flex-col gap-2 py-7'>
                <div className='flex flex-wrap items-center gap-3'>
                  {formatDate(post.publishedAt) && (
                    <span className='text-muted-foreground font-mono text-xs'>
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.readingTime && (
                    <span className='text-muted-foreground font-mono text-xs'>
                      {post.readingTime}
                    </span>
                  )}
                  {post.tags?.map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className='group-hover:text-accent text-xl font-semibold tracking-tight transition-colors sm:text-2xl'>
                  {post.title ?? post.slug}
                </h2>
                {post.description && (
                  <p className='text-muted-foreground max-w-2xl text-sm sm:text-base'>
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BlogPage
