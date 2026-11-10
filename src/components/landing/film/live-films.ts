/**
 * The case studies whose film is built as a live Stageshow scene. Kept apart
 * from the films themselves so the dialog can ask without loading them;
 * live-film.tsx maps each to its scene.
 */
export const LIVE_FILMS = ['ai-appointment-setter', 'ai-invoice-processing-approval', 'ai-unpaid-invoice-reminders', 'order-stock-check', 'solar-lead-scoring-follow-up', 'ai-prospecting-apollo', 'airtable-crm-lead-engagement', 'hr-evaluation-assistant'] as const

export type LiveFilmSlug = (typeof LIVE_FILMS)[number]

/**
 * The live films the dialog plays in place of the MP4. Empty for now: the
 * hand-drawn films stay on all ten case studies (Ramon, 2026-11-10). Add a
 * slug here to switch its dialog over.
 */
const SHOWN: readonly LiveFilmSlug[] = []

export const hasLiveFilm = (slug: string): slug is LiveFilmSlug => (SHOWN as readonly string[]).includes(slug)
