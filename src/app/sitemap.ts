import type { MetadataRoute } from 'next'

import { getCaseStudies } from '@/lib/case-studies'
import { getPosts } from '@/lib/posts'
import { abs } from '@/lib/site'
import { SERVICES } from '@/lib/portfolio'

/**
 * The sitemap previously listed URLs and nothing else.
 *
 * `lastModified` is what lets a crawler skip pages it has already seen, so a
 * new post is picked up sooner rather than competing with twenty unchanged
 * pages for the same crawl budget. `priority` is relative within this site
 * only — it says which pages matter here, not how this site ranks against
 * others. Dates come from the content's own frontmatter, so they stay honest
 * instead of every URL claiming it changed at build time.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudies, posts] = await Promise.all([getCaseStudies(), getPosts()])

  const newest = (dates: (string | undefined)[]) => {
    const valid = dates
      .filter(Boolean)
      .map(d => new Date(d as string))
      .filter(d => !Number.isNaN(d.getTime()))

    return valid.length ? new Date(Math.max(...valid.map(d => d.getTime()))) : undefined
  }

  const postDate = (p: { publishedAt?: string; updatedAt?: string }) => newest([p.updatedAt, p.publishedAt])

  return [
    { url: abs(''), changeFrequency: 'monthly', priority: 1 },
    { url: abs('/contact'), changeFrequency: 'yearly', priority: 0.8 },

    // The index changes whenever its newest post does.
    {
      url: abs('/blog'),
      lastModified: newest(posts.flatMap(p => [p.updatedAt, p.publishedAt])),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    ...SERVICES.map(service => ({
      url: abs(`/services/${service.slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.8
    })),
    ...posts.map(post => ({
      url: abs(`/blog/${post.slug}`),
      lastModified: postDate(post),
      changeFrequency: 'yearly' as const,
      priority: 0.6
    })),
    ...caseStudies.map(caseStudy => ({
      url: abs(`/case-study/${caseStudy.slug}`),
      lastModified: caseStudy.publishedAt ? new Date(caseStudy.publishedAt) : undefined,
      changeFrequency: 'yearly' as const,

      // Sample builds are illustrative, so they should not outrank delivered
      // work when a crawler is deciding what matters on this site.
      priority: caseStudy.sample ? 0.4 : 0.7
    }))
  ]
}
