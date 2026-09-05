/**
 * Structured-data helpers for the writing section.
 *
 * Kept out of the page components because the blog index and a post page have
 * to agree on the same author entity, the same URL shape and the same
 * breadcrumb trail — if those drift, a crawler sees two different people
 * publishing on one site.
 */

import { PROFILE } from '@/lib/portfolio'
import { abs, SITE_URL } from '@/lib/site'
import type { PostMetadata } from '@/lib/posts'

/**
 * One author entity for the whole site.
 *
 * `@id` matches the Person emitted by the landing page, so a crawler merges
 * the two into a single node rather than treating each page as a separate
 * author. Name and url are repeated rather than left as a bare reference, so
 * the markup still resolves for a crawler that only ever fetches this page.
 */
export const PERSON_ID = `${SITE_URL}#person`

export const authorNode = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: PROFILE.name,
  url: SITE_URL,
  jobTitle: PROFILE.title
} as const

/** Absolute canonical URL for a post. One definition, so nothing drifts. */
export const postUrl = (slug: string) => abs(`/blog/${slug}`)

/**
 * "6 min read" to the ISO-8601 duration schema.org expects for `timeRequired`.
 * Returns undefined rather than a malformed value when the string does not
 * carry a number — bad structured data is worse than absent structured data.
 */
export function readingTimeToDuration(readingTime?: string): string | undefined {
  const minutes = readingTime?.match(/(\d+)/)?.[1]

  return minutes ? `PT${minutes}M` : undefined
}

/** Rough word count for `wordCount`, from the raw MDX body. */
export function countWords(mdx: string): number {
  return mdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\-|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/**
 * `headline` is capped at 110 characters because Google documents that limit
 * for Article markup and truncates beyond it.
 */
const headline = (title: string) => (title.length <= 110 ? title : `${title.slice(0, 107)}…`)

/**
 * A resolvable card image for structured data and for pages that generate no
 * card of their own.
 *
 * Never the posts' `coverImage`: those are SVGs, and Facebook, LinkedIn, X and
 * Slack all reject SVG for og:image, so a shared link would preview blank.
 *
 * And never a hand-built path to a post's generated card. Next appends a
 * content hash to file-convention images — the live route is
 * `/blog/<slug>/opengraph-image-1ofxfa` and the unhashed path returns 404,
 * verified against a production build. That hash changes whenever the
 * generator is edited, so it cannot be written down. `opengraph-image.tsx`
 * injects the correct URL into og:image and twitter:image by itself; nothing
 * here should try to reproduce it.
 */
export const socialImage = () => abs('/images/og-image.png')

export function blogPostingLd(post: PostMetadata, body: string) {
  const url = postUrl(post.slug)
  const published = post.publishedAt
  const duration = readingTimeToDuration(post.readingTime)

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: headline(post.title ?? post.slug),
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [socialImage()],
    datePublished: published,

    // Falls back to the publish date rather than being omitted: a BlogPosting
    // without dateModified is treated as never updated, which is true here.
    dateModified: post.updatedAt ?? published,
    author: authorNode,
    publisher: authorNode,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
    ...(duration ? { timeRequired: duration } : {}),
    wordCount: countWords(body)
  }
}

/** Home → Blog → post. Emitted on post pages so search results show a trail. */
export function breadcrumbLd(trail: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: step.url
    }))
  }
}

/** The blog index as a Blog carrying an ordered list of its posts. */
export function blogIndexLd(posts: PostMetadata[]) {
  return {
    '@type': 'Blog',
    '@id': `${abs('/blog')}#blog`,
    name: 'Notes on automation',
    description:
      'Working notes on n8n, Zapier and Make — architecture decisions, failure modes, and what holds up in production.',
    url: abs('/blog'),
    inLanguage: 'en-US',
    author: authorNode,
    publisher: authorNode,
    blogPost: posts.map(p => ({
      '@type': 'BlogPosting',
      '@id': `${postUrl(p.slug)}#article`,
      headline: headline(p.title ?? p.slug),
      description: p.description,
      url: postUrl(p.slug),
      datePublished: p.publishedAt,
      author: { '@id': PERSON_ID }
    }))
  }
}

/** One `<script type="application/ld+json">` payload from many nodes. */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })
