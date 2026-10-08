import type { CaseStudyMetadata } from '@/lib/case-studies'

/**
 * The photographed setting each system was built for. Kept here rather than in
 * the section component because the dialog shows the same three views, and two
 * copies of this map would drift the first time a project is added.
 */
export const WORK_SCENES: Record<string, string> = {
  'ai-appointment-setter': '/images/landing/work-scenes/ai-voice-receptionist.webp',
  'ai-prospecting-apollo': '/images/landing/work-scenes/rag-knowledge-base.webp',
  'ai-invoice-processing-approval': '/images/landing/work-scenes/invoice-processing-gl-reconciliation.webp',
  'solar-lead-scoring-follow-up': '/images/landing/work-scenes/lead-routing-and-crm-enrichment.webp',
  'hotel-employee-onboarding': '/images/landing/work-scenes/zero-touch-client-onboarding.webp'
}

/**
 * Each project's accent, used for its eyebrow, outcome figure and the ring on
 * its selected thumbnail, on the card and in the dialog alike. Hues are
 * unchanged from the original set; lightness is solved so every tone clears
 * 4.5:1 on the white panel at 12px. The previous values ran 3.2–4.1:1, so the
 * THE CHALLENGE / THE SYSTEM labels failed AA on all six projects, not just
 * some. Chroma is trimmed only where the darker lightness pushed a hue out of
 * sRGB gamut.
 */
export const WORK_TONES: Record<string, string> = {
  'hr-evaluation-assistant': 'oklch(0.55 0.12 300)',
  'ai-appointment-setter': 'oklch(0.571 0.13 326)',
  'ai-prospecting-apollo': 'oklch(0.562 0.13 274)',
  'ai-invoice-processing-approval': 'oklch(0.572 0.14 24)',
  'solar-lead-scoring-follow-up': 'oklch(0.562 0.12 68)',
  'hotel-employee-onboarding': 'oklch(0.538 0.095 218)',
  'ai-unpaid-invoice-reminders': 'oklch(0.542 0.11 158)'
}

export type WorkView = {
  key: 'canvas' | 'map' | 'interface' | 'scene'
  label: string
  src: string
  alt: string

  /** A canvas drawn light, whose thumbnail should not be inverted. */
  light?: boolean

  /**
   * What the card shows in place of `src`. A full process map scaled to a
   * 410px card set its labels at about 3px; the card file keeps one row per
   * stage with its name and apps, and the dialog still opens the full map.
   */
  cardSrc?: string
}

/**
 * Three views per project, and deliberately three *kinds* of view rather than
 * three screenshots: the canvas that proves it was built, the interface a
 * client actually touches, and the setting it runs in.
 *
 * Canvas leads, and is therefore what both the card and the dialog open on. A
 * tidy desk proves nothing a stock library could not sell you; the canvas is
 * the only one of the three a competitor cannot reproduce.
 *
 * A project missing an asset simply shows fewer views — the array is built
 * from what exists rather than assuming all three always will.
 */
export function workViews(cs: CaseStudyMetadata): WorkView[] {
  const platform = cs.platform ?? 'Workflow'
  const name = cs.title ?? cs.slug
  const mockup = cs.heroImage ?? cs.image
  const scene = WORK_SCENES[cs.slug]

  const candidates: (WorkView | null)[] = [
    // Only an SVG canvas can run; a raster process map is shown as a picture.
    cs.workflowImage
      ? {
          key: cs.workflowImage.endsWith('.svg') ? 'canvas' : 'map',
          label: cs.canvasLabel ?? `${platform} canvas`,
          light: cs.canvasTheme === 'light',
          src: cs.workflowImage,
          cardSrc: cs.workflowImage.endsWith('-map.svg') ? cs.workflowImage.replace(/-map\.svg$/, '-card.svg') : undefined,
          alt: `${cs.canvasLabel ?? `${platform} workflow canvas`} for ${name}`
        }
      : null,
    mockup
      ? {
          key: 'interface',
          label: cs.heroLabel ?? 'Interface',
          src: mockup,
          alt: cs.heroLabel ? `${cs.heroLabel} of ${name}` : `Interface mockup for ${name}`
        }
      : null,
    scene ? { key: 'scene', label: 'Scene', src: scene, alt: `Working environment for ${name}` } : null
  ]

  return candidates.filter((view): view is WorkView => view !== null)
}
