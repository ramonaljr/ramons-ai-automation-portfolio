import fs from 'fs' // Comment this line if using remote fetching
import path from 'path' // Comment this line if using remote fetching

import matter from 'gray-matter'

export type CaseStudy = {
  metadata: CaseStudyMetadata
  content: string
}

export type CaseStudyMetadata = {
  slug: string
  title?: string
  description?: string
  organisation?: string
  role?: string
  duration?: string
  tools?: string[]
  publishedAt?: string
  image?: string
  heroImage?: string

  /**
   * What `heroImage` shows, when it is not an interface mock-up: a real
   * build's screenshot reads "n8n build". Labels its view on the card and in
   * the dialog, and captions it on the case study page.
   */
  heroLabel?: string
  logo?: string

  /** Illustrative example rather than a delivered engagement. */
  sample?: boolean

  /**
   * A complete, working build made for a fictional client. The workflow is
   * real; the company is not, and the card and page say so.
   */
  sampleClient?: boolean

  /** Loom (or any) walkthrough video. Button is hidden until this is set. */
  videoUrl?: string

  /** Public repo for the workflow/export. Button is hidden until this is set. */
  repoUrl?: string

  // ── Fields powering the Selected Work grid and its detail modal ──────────
  /** Lead automation platform, drives the filter tabs. */
  platform?: 'n8n' | 'Zapier' | 'Make'

  /** Extra filter facets, e.g. "AI Agents", "CRM & Leads". */
  categories?: string[]

  /** Pins this project to the large card at the top of the section. */
  featured?: boolean

  /** Headline speed/scale badge, e.g. "< 90 SEC". */
  speed?: string

  /**
   * How to read `speed`. Latency is per run ("< 30 SEC"); throughput is a
   * sustained rate ("4,000+/wk"). They shared a badge and a lightning bolt,
   * so a reader comparing two projects was comparing different quantities
   * under the same glyph. Defaults to latency.
   */
  speedKind?: 'latency' | 'throughput'

  /** Workflow canvas diagram shown in the modal. */
  workflowImage?: string

  /** Names `workflowImage` when it is not the platform canvas, e.g. "Process map". */
  canvasLabel?: string

  /**
   * A canvas drawn light, like a process map, keeps its own colours instead
   * of taking the dark editor look. The SVG carries `data-light` to match.
   */
  canvasTheme?: 'light'

  /** One-line trigger-to-outcome summary. */
  logicSummary?: string
  keyOutcome?: { value: string; label: string }
  integrations?: string[]
  problem?: string
  solution?: string
  stepCount?: number
  impactHighlight?: string
  impactHighlightDesc?: string
  roi?: { value: string; label: string }[]
  failsafeHeadline?: string
  failsafeDesc?: string
  failsafes?: { title: string; desc: string }[]
}

// local content directory (comment below line if using remote fetching)
const rootDirectory = path.join(process.cwd(), 'src', 'content', 'case-studies')

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const filePath = path.join(rootDirectory, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

    const { data, content } = matter(fileContent)

    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

export async function getCaseStudies(limit?: number): Promise<CaseStudyMetadata[]> {
  try {
    const files = fs.readdirSync(rootDirectory)
    const caseStudies = await Promise.all(files.map(async (file: any) => await getCaseStudyMetadata(file)))

    // Sort case studies by published date
    const sortedCaseStudies = caseStudies.sort((a, b) => {
      if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) {
        return 1
      } else {
        return -1
      }
    })

    if (limit) {
      return sortedCaseStudies.slice(0, limit)
    }

    return sortedCaseStudies
  } catch (error) {
    console.error('Error fetching case studies:', error)

    return []
  }
}

export async function getCaseStudyMetadata(filepath: string): Promise<CaseStudyMetadata> {
  try {
    const slug = filepath.replace(/\.mdx$/, '')

    const filePath = path.join(rootDirectory, filepath)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

    const { data } = matter(fileContent)

    return { ...data, slug }
  } catch (error) {
    console.error(`Error fetching metadata for ${filepath}:`, error)

    return { slug: filepath.replace(/\.mdx$/, '') }
  }
}
