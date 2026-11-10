import type { Mood, Pose, Who } from '@/components/landing/film/cast'

/**
 * What the robots say, and the rules every film's talk keeps
 * (docs/plans/2026-11-10-two-worlds-films.md, "Limits"). Kept apart from the
 * band that draws it (talk-band.tsx), so the rules run in tests without the
 * app.
 */

export type Line = {
  who: Who
  text: string

  /** How the speaker looks while saying it. */
  mood?: Mood

  /** How the listener takes it. */
  hears?: Mood

  /** The speaker's pose, if not the usual raised hand. */
  pose?: Pose
}

export const NAMES: Record<Who, string> = { dennice: 'Dennice', leo: 'Leo' }

/** At most this many lines a film, and words a line (the end line, the case study's own sentence, aside). */
export const MAX_LINES = 22
export const MAX_WORDS = 9

/** How long a line stays up: long enough to read, never a flash. */
export const holdFor = (line: Line) => Math.max(2000, 1500 + 32 * line.text.length)

/** A line as reduced-motion text: `Dennice: So the phone now has a voice agent.` */
export const asWords = (line: Line) => `${NAMES[line.who]}: ${line.text}`

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length
