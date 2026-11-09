/**
 * The case studies whose film plays live in the dialog (a Stageshow scene)
 * instead of as an MP4. Kept apart from the films themselves so the dialog
 * can ask without loading them; live-film.tsx maps each to its scene.
 */
export const LIVE_FILMS = ['ai-appointment-setter'] as const

export type LiveFilmSlug = (typeof LIVE_FILMS)[number]

export const hasLiveFilm = (slug: string): slug is LiveFilmSlug => (LIVE_FILMS as readonly string[]).includes(slug)
