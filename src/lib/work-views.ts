import type { CaseStudyMetadata } from '@/lib/case-studies'

/**
 * The photographed setting each system was built for. Kept here rather than in
 * the section component because the dialog shows the same three views, and two
 * copies of this map would drift the first time a project is added.
 */
export const WORK_SCENES: Record<string, string> = {
  'ai-voice-receptionist': '/images/landing/work-scenes/ai-voice-receptionist.webp',
  'invoice-processing-gl-reconciliation': '/images/landing/work-scenes/invoice-processing-gl-reconciliation.webp',
  'lead-routing-and-crm-enrichment': '/images/landing/work-scenes/lead-routing-and-crm-enrichment.webp',
  'multi-channel-order-sync': '/images/landing/work-scenes/multi-channel-order-sync.webp',
  'rag-knowledge-base': '/images/landing/work-scenes/rag-knowledge-base.webp',
  'zero-touch-client-onboarding': '/images/landing/work-scenes/zero-touch-client-onboarding.webp'
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
  'ai-voice-receptionist': 'oklch(0.571 0.13 326)',
  'invoice-processing-gl-reconciliation': 'oklch(0.572 0.14 24)',
  'lead-routing-and-crm-enrichment': 'oklch(0.562 0.12 68)',
  'multi-channel-order-sync': 'oklch(0.542 0.11 158)',
  'rag-knowledge-base': 'oklch(0.562 0.13 274)',
  'zero-touch-client-onboarding': 'oklch(0.538 0.095 218)'
}

export type WorkView = {
  key: 'canvas' | 'interface' | 'scene'
  label: string
  src: string
  alt: string
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
    cs.workflowImage
      ? {
          key: 'canvas',
          label: `${platform} canvas`,
          src: cs.workflowImage,
          alt: `${platform} workflow canvas for ${name}`
        }
      : null,
    mockup ? { key: 'interface', label: 'Interface', src: mockup, alt: `Interface mockup for ${name}` } : null,
    scene ? { key: 'scene', label: 'Scene', src: scene, alt: `Working environment for ${name}` } : null
  ]

  return candidates.filter((view): view is WorkView => view !== null)
}

/**
 * The selected thumbnail widens; the others give way.
 *
 * Expressed as flex-grow rather than the fixed 120/35px of the reference this
 * came from: the strip spans its container, and that container is 517px in a
 * desktop card, 327px on a phone and wider again inside the dialog, so fixed
 * widths would leave a gap at one size and overflow at another.
 */
export const THUMB_VARIANTS = {
  active: { flexGrow: 2.2 },
  inactive: { flexGrow: 1 }
}

/** The reference's timing, collapsed to nothing when motion is unwelcome. */
export const thumbTransition = (reduced: boolean) =>
  reduced ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' as const }
