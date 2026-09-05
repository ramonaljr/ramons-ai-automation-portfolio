import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'

export type Post = {
  metadata: PostMetadata
  content: string
}

export type PostMetadata = {
  slug: string
  title?: string
  description?: string
  publishedAt?: string
  readingTime?: string
  tags?: string[]
  draft?: boolean
  category?: string
  coverImage?: string

  /**
   * Last substantive edit, as YYYY-MM-DD. Feeds `dateModified` in the article
   * structured data and `lastModified` in the sitemap; both fall back to
   * `publishedAt`, so an untouched post is correctly reported as never revised.
   */
  updatedAt?: string

  /** Seed content awaiting the author's own pass. */
  needsReview?: boolean
}

const rootDirectory = path.join(process.cwd(), 'src', 'content', 'blog')

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(rootDirectory, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

    const { data, content } = matter(fileContent)

    return { metadata: { ...data, slug, readingTime: readingTimeFor(content) }, content }
  } catch {
    return null
  }
}

/**
 * Reading time, measured rather than declared.
 *
 * The frontmatter carried hand-written values that were about four times the
 * real length — "6 min read" on a 294-word post. Harmless as decoration;
 * not harmless once it is published as `timeRequired` in article structured
 * data, where an overstatement is a claim to a search engine. Deriving it
 * means it stays true as a post grows.
 *
 * 200 wpm is the usual prose figure. Fenced code is excluded: it is scanned,
 * not read, and counting it inflates technical posts the most.
 */
function readingTimeFor(body: string): string {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return `${Math.max(1, Math.round(words / 200))} min read`
}

export async function getPostMetadata(filepath: string): Promise<PostMetadata> {
  const slug = filepath.replace(/\.mdx$/, '')

  try {
    const fileContent = fs.readFileSync(path.join(rootDirectory, filepath), { encoding: 'utf8' })
    const { data, content } = matter(fileContent)

    return { ...data, slug, readingTime: readingTimeFor(content) }
  } catch (error) {
    console.error(`Error fetching metadata for ${filepath}:`, error)

    return { slug }
  }
}

/**
 * Returns published posts, newest first. Missing directory is a valid state —
 * the blog ships before the first post does, so callers get [] rather than a throw.
 */
export async function getPosts(limit?: number): Promise<PostMetadata[]> {
  try {
    if (!fs.existsSync(rootDirectory)) {
      return []
    }

    const files = fs.readdirSync(rootDirectory).filter(f => f.endsWith('.mdx'))
    const posts = await Promise.all(files.map(file => getPostMetadata(file)))

    const published = posts
      .filter(p => !p.draft)
      .sort((a, b) => (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '') ? 1 : -1))

    return limit ? published.slice(0, limit) : published
  } catch (error) {
    console.error('Error fetching posts:', error)

    return []
  }
}
