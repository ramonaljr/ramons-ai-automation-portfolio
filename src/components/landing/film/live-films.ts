/**
 * The case studies whose film is built as a live Stageshow scene. Kept apart
 * from the films themselves so the dialog can ask without loading them;
 * live-film.tsx maps each to its scene.
 */
export const LIVE_FILMS = ['ai-appointment-setter', 'ai-invoice-processing-approval', 'ai-unpaid-invoice-reminders', 'order-stock-check', 'solar-lead-scoring-follow-up', 'ai-prospecting-apollo', 'airtable-crm-lead-engagement', 'hr-evaluation-assistant', 'hotel-employee-onboarding', 'gmail-attachment-filing'] as const

export type LiveFilmSlug = (typeof LIVE_FILMS)[number]

/**
 * The live films the dialog plays in place of the MP4: all ten (Ramon,
 * 2026-11-10). Take a slug out to put its dialog back on the hand-drawn MP4,
 * which stays in public/films for the Walkthrough link either way.
 */
const SHOWN: readonly LiveFilmSlug[] = [...LIVE_FILMS]

export const hasLiveFilm = (slug: string): slug is LiveFilmSlug => (SHOWN as readonly string[]).includes(slug)
