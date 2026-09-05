import { ImageResponse } from 'next/og'

import { getPostBySlug, getPosts } from '@/lib/posts'
import { PROFILE } from '@/lib/portfolio'

/**
 * The social card for a post, rendered at build time.
 *
 * Necessary rather than decorative: the posts' `coverImage` files are SVGs,
 * and every major unfurler — Facebook, LinkedIn, X, Slack — refuses SVG for
 * og:image. Pointing the card at one produces a blank preview everywhere the
 * link is shared. This emits a real PNG at the size those crawlers expect.
 *
 * Deliberately typographic: no network fetches for fonts or art, so a build
 * cannot fail or hang on a remote asset. The palette matches the site's cream
 * ground and ink so a shared link looks like the page it opens.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Article by Ramon A. Vallejera, Jr.'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map(post => ({ slug: post.slug }))
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  const title = post?.metadata.title ?? 'Writing'
  const category = post?.metadata.category?.toUpperCase() ?? 'WRITING'
  const readingTime = post?.metadata.readingTime ?? ''

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#F5F4F0',
        padding: '72px 80px',
        fontFamily: 'sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 2, backgroundColor: '#B4652F' }} />
        <div style={{ fontSize: 22, letterSpacing: 6, color: '#6B635B' }}>{category}</div>
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: title.length > 60 ? 62 : 76,
          lineHeight: 1.08,
          color: '#2A2724',
          letterSpacing: -2,
          maxWidth: 1000
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid #D9D5CD',
          paddingTop: 28
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 28, color: '#2A2724' }}>{PROFILE.name}</div>
          <div style={{ fontSize: 21, color: '#6B635B' }}>{PROFILE.title}</div>
        </div>
        <div style={{ fontSize: 21, color: '#6B635B' }}>{readingTime}</div>
      </div>
    </div>,
    size
  )
}
