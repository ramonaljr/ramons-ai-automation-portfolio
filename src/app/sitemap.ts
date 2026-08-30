import type { MetadataRoute } from 'next'

import { getCaseStudies } from '@/lib/case-studies'
import { getPosts } from '@/lib/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseStudies = await getCaseStudies()
  const posts = await getPosts()

  const routes = [
    '' /* This is equivalent to / */,
    '/contact',
    '/blog',
    ...posts.map(post => `/blog/${post.slug}`),
    ...caseStudies.map(caseStudy => `/case-study/${caseStudy.slug}`)
  ]

  return routes.map(route => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${route}`
  }))
}
