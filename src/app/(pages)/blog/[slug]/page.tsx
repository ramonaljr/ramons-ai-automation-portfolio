import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ChevronLeftIcon } from 'lucide-react'

import MDXContent from '@/components/mdx-content'
import { Badge } from '@/components/ui/badge'

import { getPostBySlug, getPosts } from '@/lib/posts'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.metadata.slug}`
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

const BlogPostPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { metadata, content } = post

  return (
    <article className='px-4 py-16 sm:px-6 lg:px-10.5 lg:py-24'>
      <Link
        href='/blog'
        className='text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-1 text-sm transition-colors'
      >
        <ChevronLeftIcon className='size-4' />
        All posts
      </Link>

      <header className='space-y-4'>
        <div className='flex flex-wrap items-center gap-3'>
          {formatDate(metadata.publishedAt) && (
            <span className='text-muted-foreground font-mono text-xs'>
              {formatDate(metadata.publishedAt)}
            </span>
          )}
          {metadata.readingTime && (
            <span className='text-muted-foreground font-mono text-xs'>{metadata.readingTime}</span>
          )}
          {metadata.tags?.map(tag => (
            <Badge key={tag} variant='outline' className='text-xs'>
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
          {metadata.title}
        </h1>
        {metadata.description && (
          <p className='text-muted-foreground max-w-2xl text-base sm:text-lg'>
            {metadata.description}
          </p>
        )}
      </header>

      <div className='mt-14'>
        <MDXContent source={content} />
      </div>
    </article>
  )
}

export default BlogPostPage
