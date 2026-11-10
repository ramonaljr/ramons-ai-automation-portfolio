'use client'

import '../scenes/look.css'
import './film.css'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Maximize2, Pause, Play, RotateCcw, X } from 'lucide-react'

import { Stage, useReducedMotion, type Act, type Layout } from '@/components/stageshow/kit'

/** What a part's script waits with, so the film's play/pause holds it. */
export type Cue = { wait: (ms: number) => Promise<void> }

/** One part of a film; `chip` is its chapter chip's label. */
export type FilmPart<S> = {
  chip: string

  /** Scene state where the part starts: the end of the part before, so playing straight through never jumps. */
  start: S

  /** The part's one frame under reduced motion, shown with `words` as text. */
  still: S
  words: string[]

  /** About how long the part runs, in ms, for the chip's progress bar. */
  ms: number
  run: (a: Act<S>, cue: Cue) => Promise<void>
}

export type FilmDef<S> = {
  title: string

  /** The stage's design size: landscape, the same on every screen. */
  size: { width: number; height: number }
  parts: FilmPart<S>[]
  render: (s: S, layout: Layout) => ReactNode
}

/**
 * Runs a film's parts in order on one stage, so playing straight through is
 * one continuous script. Jumping to a chapter restarts the stage at that
 * part's start. Pausing holds the script at its next wait (every wait is cut
 * into short slices) and freezes the scene's CSS animations; transitions
 * already under way finish.
 */
class Reel<S> {
  paused = false

  /** The part a fresh run starts from: the chapter jumped to, or the part showing when the stage last stopped. */
  at = 0

  constructor(
    private parts: FilmPart<S>[],
    private onPart: (i: number) => void,
    private onEnd: () => void
  ) {}

  jump(i: number) {
    this.at = i
    this.paused = false
  }

  hold(on: boolean) {
    this.paused = on
  }

  wait = async (a: Act<S>, ms: number) => {
    let left = ms

    while (left > 0) {
      const slice = Math.min(left, 80)

      await a.wait(slice)

      if (!this.paused) left -= slice
    }
  }

  script = async (a: Act<S>) => {
    const from = this.at
    const cue: Cue = { wait: ms => this.wait(a, ms) }

    // A run can start mid-film (a chapter, or back on screen), so it sets its own start
    await a.snap(this.parts[from]!.start)
    await this.wait(a, 350)

    for (let i = from; i < this.parts.length; i++) {
      this.at = i
      this.onPart(i)
      a.mark(`part-${i + 1}`)
      await this.parts[i]!.run(a, cue)
    }

    a.mark('film-end')
    this.onEnd()
  }
}

/** A phone: a touch screen whose short side is a phone's. */
const isPhone = () =>
  typeof window !== 'undefined' &&
  matchMedia('(pointer: coarse)').matches &&
  Math.min(window.screen.width, window.screen.height) < 520

/** Screen orientation locking, where a browser has it (Android Chrome, in full screen). */
type Lockable = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> }

export function FilmStage<S extends object>({ def }: { def: FilmDef<S> }) {
  const reduced = useReducedMotion()
  const [part, setPart] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)

  // Full screen: the player over the whole page, landscape. On a phone the
  // film waits behind a cover until someone asks for it full screen.
  const [full, setFull] = useState(false)
  const [cover, setCover] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Bumped to restart the stage: a chapter jump or a replay
  const [run, setRun] = useState(0)

  const [reel] = useState(
    () =>
      new Reel<S>(
        def.parts,
        i => setPart(i),
        () => setEnded(true)
      )
  )

  useEffect(() => {
    if (!isPhone()) return

    reel.hold(true)
    setPaused(true)
    setCover(true)
  }, [reel])

  const pause = () => {
    reel.hold(true)
    setPaused(true)
  }

  const enterFull = async () => {
    setFull(true)

    // Native full screen and a landscape lock where allowed; the overlay works without either
    try {
      await root.current?.requestFullscreen?.()
      await (screen.orientation as Lockable).lock?.('landscape')
    } catch {
      // Refused (iPhone has neither for a page): the overlay and the rotate hint carry it
    }
  }

  const leaveFull = () => {
    setFull(false)
    screen.orientation?.unlock?.()

    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
  }

  // Escape, or leaving native full screen another way, closes it; the film holds where it was
  useEffect(() => {
    if (!full) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return

      // Only the film's full screen closes, not the dialog under it
      e.stopPropagation()
      e.preventDefault()
      leaveFull()
      pause()
    }

    const onChange = () => {
      if (!document.fullscreenElement) {
        setFull(false)
        pause()
      }
    }

    window.addEventListener('keydown', onKey, true)
    document.addEventListener('fullscreenchange', onChange)

    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('fullscreenchange', onChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full])

  // The film's end leaves full screen
  useEffect(() => {
    if (ended && full) leaveFull()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended])

  const playFrom = (i: number) => {
    reel.jump(i)
    setPart(i)
    setPaused(false)
    setEnded(false)
    setCover(false)
    setRun(r => r + 1)
  }

  const togglePlay = () => {
    if (ended) return playFrom(0)

    reel.hold(!paused)
    setPaused(!paused)
  }

  const start = () => {
    void enterFull()
    setCover(false)
    reel.hold(false)
    setPaused(false)
  }

  if (reduced) return <FilmStills def={def} />

  const { size } = def

  return (
    <div ref={root} className='fm' data-paused={paused || undefined} data-full={full || undefined}>
      <div className='fm-screen ps' data-ss-fill=''>
        <Stage<S>
          key={run}
          width={size.width}
          height={size.height}
          greys='cool'
          initial={def.parts[part]!.start}
          script={reel.script}
          play='once'
        >
          {(s, _rect, layout) => def.render(s, layout)}
        </Stage>

        {cover && (
          <button type='button' className='fm-cover' onClick={start}>
            <span className='fm-cover__play' aria-hidden='true'>
              <Play size={20} strokeWidth={1.75} />
            </span>
            Play full screen
          </button>
        )}
      </div>

      {full && <p className='fm-rotate'>Rotate your phone for full size.</p>}

      <div className='fm-controls'>
        <button
          type='button'
          className='fm-play'
          onClick={cover ? start : togglePlay}
          aria-label={ended ? 'Play the film again' : paused ? 'Play the film' : 'Pause the film'}
        >
          {ended ? (
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden='true' />
          ) : paused ? (
            <Play size={14} strokeWidth={1.75} aria-hidden='true' />
          ) : (
            <Pause size={14} strokeWidth={1.75} aria-hidden='true' />
          )}
        </button>

        <ol className='fm-chips' aria-label='Chapters'>
          {def.parts.map((p, i) => {
            const state = ended || i < part ? 'done' : i === part ? 'now' : 'next'

            return (
              <li key={p.chip}>
                <button
                  type='button'
                  className='fm-chip'
                  data-state={state}
                  aria-current={i === part && !ended ? 'step' : undefined}
                  onClick={() => playFrom(i)}
                >
                  <span className='fm-chip__label'>{p.chip}</span>
                  <span
                    key={state === 'now' ? `${run}-${i}` : state}
                    className='fm-chip__fill'
                    style={state === 'now' ? { animationDuration: `${p.ms}ms` } : undefined}
                    aria-hidden='true'
                  />
                </button>
              </li>
            )
          })}
        </ol>

        <button
          type='button'
          className='fm-play fm-full'
          onClick={() => {
            if (full) {
              leaveFull()
              pause()
            } else {
              void enterFull()
            }
          }}
          aria-label={full ? 'Close full screen' : 'Watch full screen'}
        >
          {full ? (
            <X size={14} strokeWidth={1.75} aria-hidden='true' />
          ) : (
            <Maximize2 size={14} strokeWidth={1.75} aria-hidden='true' />
          )}
        </button>
      </div>
    </div>
  )
}

/** Reduced motion: each part's one frame, with its captions as text. */
function FilmStills<S extends object>({ def }: { def: FilmDef<S> }) {
  const { size } = def

  return (
    <ol className='fm-stills' aria-label={`${def.title}, in five frames`}>
      {def.parts.map(p => (
        <li key={p.chip} className='fm-still'>
          <div className='fm-screen ps' data-ss-fill=''>
            <Stage<S> width={size.width} height={size.height} greys='cool' poster={p.still}>
              {(s, _rect, layout) => def.render(s, layout)}
            </Stage>
          </div>
          <div className='fm-still__words'>
            <p className='fm-still__chip'>{p.chip}</p>
            {p.words.map(w => (
              <p key={w}>{w}</p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}
