# Two Worlds Films Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the pilot film (AI Appointment Setter) so the hand-drawn robots discuss and explain the build for the whole film, in front of the clean Stageshow build, then roll the same pattern out to the other nine films.

**Architecture:** Two visual worlds on one stage. People and the problem are drawn in the Storify films' boiling ink (ported from `docs/storify-films/engine-core.js` to SVG); the build is the clean Stageshow scene that already exists. The robots stand in a band along the foot of the stage for the entire film and carry every word as speech bubbles, which replace the captions.

**Tech Stack:** Next.js, React, TypeScript, SVG, CSS animations, the Stageshow kit in `src/components/stageshow/kit`. No new dependencies; tests run with `npx -y tsx --test`.

---

## What changed from `docs/stageshow-film-plans.md`

Ramon, 2026-11-10:

1. **Direction: Two Worlds.** Drawn means people and the problem. Clean means the build.
2. **The robots discuss and explain for the entire film**, as they do in the hand-drawn films, not only in the opening. This **overrides the rule "No narrator character"** in `docs/stageshow-film-plans.md`. Speech bubbles replace captions.

Still settled and unchanged: silent, 60 to 90 seconds, live in the dialog, facts only from the case study's `.mdx` and `docs/process-diagrams/diagrams.json`, the five parts, reduced-motion stills.

## The design

### The stage

```
┌──────────────────────────────────────────────┐
│                                              │
│   THE BUILD (clean Stageshow)                │
│   app cards  ⇄  process map                  │
│   a drawn token carries the case along it    │
│                                              │
├┄┄┄┄┄┄┄┄┄┄┄┄┄┄ inked edge ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤
│  🤖 owner     ( one speech bubble )   case 🤖 │  ← the band: paper, boiling ink
└──────────────────────────────────────────────┘
```

- **One landscape layout, on every screen** (Ramon, 2026-11-10). The stage is 16:9 on desktop and on phones alike; there is no separate phone layout. The pilot's `size.compact` goes.
- **The band** replaces the caption row: about 132 px tall at the stage's design width, with full robots, on every screen.
- **On a phone held upright** the 16:9 stage is only about 360 px wide, so the film plays small there and offers **Rotate for full size**: pressing play opens the film full screen, and turning the phone fills the screen with it (Task 10).
- **Type is sized for a phone on its side:** bubble text is at least 22 px at the 1040 px design width, which is about 14 px on a 660 px wide landscape phone.
- **One bubble at a time**, its tail pointing at the speaker. The listener turns to face the speaker and reacts with a mood (`normal`, `puzzled`, `happy`).
- The band is on screen in parts 2 to 5. Part 1 (Before) fills the whole stage with the drawn world.

### The roles

| Role | Who it is | What it says |
|---|---|---|
| **Owner** | The person whose job this was (Dennice at the front desk) | Explains each step. Every factual line is theirs. |
| **Case** | The person whose case drives the tour (Leo, the caller) | Speaks their own lines in the case, and asks what a visitor would ask: "What if 2:00 is taken?" |
| **Third** (some films) | The approver or manager who enters at their lane | One or two lines when the build reaches them, then stays. |

The pattern is **question, then answer**: the case asks, the owner answers with the step's fact while the build shows it. The owner never claims anything the `.mdx` doesn't.

### The six moves

1. **Before, in ink.** The whole stage is paper and boiling line: the desk, the phone, the missed calls.
2. **The line settles.** As the case arrives, the drawn props stop boiling and crossfade into the real app cards; the paper shrinks to the band. The robots stay drawn.
3. **The discussion.** Parts 2 to 4 are the robots talking while the build runs.
4. **The drawn token.** A small inked token (the call, the invoice, the CV) moves along the lit path on the process map.
5. **The marker.** One terracotta hand-drawn circle or underline draws itself onto the clean UI at the film's key moment. Two per film at most.
6. **The end, in ink.** The paper rises back over the stage for the outcome sentence and "Run it yourself below", said by the robots.

### Limits

- **Length stays 60 to 90 seconds.** Bubbles ride on beats that already exist (one bubble where a caption was), so talk adds no time. Budget: **22 lines at most per film, 9 words at most per line.** If a film feels rushed, cut lines; the length does not grow (Ramon, 2026-11-10).
- **A line holds for** `1500 + 32 × characters` ms, 2000 ms at least.
- **Reduced motion:** ink holds on frame 0, each part shows one still, and its lines appear as text in the form `Name: line`.
- **Pause** freezes the boil, as it freezes every CSS animation on the stage.

### Film 1 script (22 lines)

Check every line against `src/content/case-studies/ai-appointment-setter.mdx` before building. Step numbers are the process map's.

| Part | Who | Line | On screen |
|---|---|---|---|
| Before | Leo | Hello? Is anyone there? | Ink. Night. The desk phone rings out; Dennice is powered off. |
| Before | Leo | No answer. I'll try another place. | Leo leaves. |
| Before | Dennice | Missed calls. All after we closed. | Morning. Dennice powers on; the missed-call list is drawn in. |
| The call | Dennice | So the phone line got a voice agent. | **The line settles.** Paper drops to the band; the call card is clean. |
| The call | Leo | Can I come in tomorrow at 2? | The call is live; the agent answers. |
| Build | Leo | Who checks the calendar? | Camera to the map, Get slots (2). The token sets off. |
| Build | Dennice | The agent asks n8n. It reads every event. | Step 3. |
| Build | Dennice | Weekday, 9 to 6 Central, and still clear? | Step 4. |
| Build | Leo | But 2:00 is taken. | **The turn.** Leo puzzled. Calendar card: 2:00 is busy. |
| Build | Dennice | So it never says "booked". It offers open times. | Three open half hours. **Marker** circles them. |
| Build | Leo | I'll take 2:30. | Leo happy. |
| Build | Leo | What if someone grabs it first? | Map, Book slots (5 to 7). |
| Build | Dennice | It checks again, right before booking. | Step 8. **Marker** underlines the step. |
| Build | Dennice | Still free. Into Google Calendar it goes. | Step 9, then the Calendar card. |
| Build | Dennice | Then the booking is saved to Airtable. | Step 10, then the Airtable card. |
| Build | Dennice | And the call's result is logged. | Call results (17). The token arrives. |
| Other paths | Leo | And if I need to move it? | Update slots (11 to 13) lit. |
| Other paths | Dennice | Nothing moves unless the new time is free. | |
| Other paths | Leo | Or cancel? | Cancel slots (14 to 16) lit. |
| Other paths | Dennice | Event deleted, record marked cancelled. | |
| End | Dennice | *(the `.mdx`'s `impactHighlight`, word for word)* | Ink returns over the stage. |
| End | Leo | Run it yourself below. | Leo points down at the demo. |

---

## Where the work happens

The pilot film lives only on branch `claude/competent-albattani-c5e978` (worktree `.claude/worktrees/competent-albattani-c5e978`), not on `main`. Build this on a new branch cut from it, so the pilot stays as it is for comparison:

```bash
git worktree add .claude/worktrees/two-worlds-film -b two-worlds-film claude/competent-albattani-c5e978
```

All paths below are inside that worktree. The film stays switched off in the dialog throughout: `SHOWN` in `src/components/landing/film/live-films.ts` stays empty until Ramon says otherwise.

Repo rule: stage files by name. Never `git add -A` or `git add .`.

---

## Phase 1: the pilot

### Task 1: The ink helper

**Files:**
- Create: `src/components/landing/film/sketch.ts`
- Test: `src/components/landing/film/sketch.test.ts`

`sketch.ts` must import nothing, so the test runs without the app.

**Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { inkFrames, inkPath, rr } from './sketch'

const box = rr(0, 0, 40, 20, 3)

test('the same seed draws the same line', () => {
  assert.equal(inkPath(box, { seed: 4 }), inkPath(box, { seed: 4 }))
})

test('a different seed draws a different line', () => {
  assert.notEqual(inkPath(box, { seed: 4 }), inkPath(box, { seed: 5 }))
})

test('three boil frames, all different', () => {
  const frames = inkFrames(box, { seed: 4 })

  assert.equal(frames.length, 3)
  assert.equal(new Set(frames).size, 3)
})

test('no point strays further than the amplitude', () => {
  const d = inkPath([[10, 10]], { seed: 9, amp: 1.5, closed: false })
  const [x, y] = d.slice(1).split(' ').map(Number)

  assert.ok(Math.abs(x! - 10) <= 1.5 && Math.abs(y! - 10) <= 1.5)
})

test('a closed line ends where it began', () => {
  const d = inkPath(box, { seed: 4 })
  const first = d.slice(1, d.indexOf('L'))

  assert.ok(d.endsWith(`L${first}Z`))
})
```

**Step 2: Run it and watch it fail**

Run: `npx -y tsx --test src/components/landing/film/sketch.test.ts`
Expected: FAIL, cannot find module `./sketch`.

**Step 3: Write the helper**

Port from `docs/storify-films/engine-core.js`: `hsh` and `jit` (line 21), the point builders `rr`, `ell`, `ln`, and the stroke loop inside `sk` (lines 28 to 34). Copy `hsh`, `rr`, `ell` and `ln` from the engine so the robots keep their shapes; the rest is:

```ts
export type Pt = readonly [number, number]

export type InkOptions = { seed?: number; amp?: number; closed?: boolean; boil?: number; pass?: number }

/** The engine's `jit`: a steady, seeded wobble for point `i`, different on each boil frame. */
export const jit = (seed: number, i: number, amp: number, boil = 0) =>
  (hsh(seed * 13.37 + i * 7.13 + boil * 3.1) - 0.5) * 2 * amp

/** One hand-drawn line through `pts`, as an SVG path. */
export function inkPath(pts: readonly Pt[], o: InkOptions = {}) {
  const { seed = 1, amp = 1.1, closed = true, boil = 0, pass = 0 } = o
  const n = pts.length
  const count = closed ? n + 1 : n
  let d = ''

  for (let i = 0; i < count; i++) {
    const p = pts[i % n]!
    const x = p[0] + jit(seed + pass * 5, i % n, amp, boil)
    const y = p[1] + jit(seed + pass * 5 + 99, i % n, amp, boil)

    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }

  return closed ? `${d}Z` : d
}

export const BOILS = [0, 1, 2] as const

/** The three frames the line boils between. */
export const inkFrames = (pts: readonly Pt[], o: InkOptions = {}) => BOILS.map(boil => inkPath(pts, { ...o, boil }))
```

**Step 4: Run it and watch it pass**

Run: `npx -y tsx --test src/components/landing/film/sketch.test.ts`
Expected: 5 tests pass.

**Step 5: Commit**

```bash
git add src/components/landing/film/sketch.ts src/components/landing/film/sketch.test.ts
git commit -m "Draw the films' ink lines from the hand-drawn engine's wobble"
```

### Task 2: The `Ink` component and its boil

**Files:**
- Create: `src/components/landing/film/ink.tsx`
- Modify: `src/components/landing/film/film.css` (append an "Ink" section)

**Step 1: The component**

```tsx
import { BOILS, inkPath, type Pt } from '@/components/landing/film/sketch'

type Props = {
  pts: readonly Pt[]
  seed: number
  amp?: number
  closed?: boolean
  /** Lines drawn over each other, as the engine does: 2 for outlines, 1 for thin limbs. */
  passes?: number
  className?: string
}

/** One inked shape: three frames of the same line, shown in turn. */
export function Ink({ pts, seed, amp, closed, passes = 2, className }: Props) {
  return (
    <g className={className ? `ink ${className}` : 'ink'}>
      {BOILS.map(boil => (
        <g key={boil} className='ink__f' data-f={boil}>
          {Array.from({ length: passes }, (_, pass) => (
            <path key={pass} d={inkPath(pts, { seed, amp, closed, boil, pass })} />
          ))}
        </g>
      ))}
    </g>
  )
}
```

Only the first pass takes the fill; later passes are stroke only (`.ink__f path + path { fill: none }`).

**Step 2: The CSS**

```css
/* ── Ink: three frames, eight a second ─────────────────────────────────── */
.ink path {
  stroke: var(--ink);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ink__f path + path {
  fill: none;
}

.ink__f {
  visibility: hidden;
  animation: ink-boil 375ms steps(1, end) infinite;
}

.ink__f[data-f='1'] {
  animation-delay: -250ms;
}

.ink__f[data-f='2'] {
  animation-delay: -125ms;
}

@keyframes ink-boil {
  0%,
  33.32% {
    visibility: visible;
  }

  33.33%,
  100% {
    visibility: hidden;
  }
}

/* Settled, or reduced motion: hold on the first frame */
[data-ink='still'] .ink__f {
  animation: none;
}

[data-ink='still'] .ink__f[data-f='0'] {
  visibility: visible;
}

@media (prefers-reduced-motion: reduce) {
  .ink__f {
    animation: none;
  }

  .ink__f[data-f='0'] {
    visibility: visible;
  }
}
```

Add `--ink`, `--paper` and the robots' body colours beside the film's other colours at the top of `film.css`, copied from the constants at the top of `engine-core.js` (`INK`, `PAPERW`, `BULB`, `WOOD`, and each robot's `c` colours in `CAST`).

**Step 3: Check it**

Run: `pnpm lint src/components/landing/film/ink.tsx` and `pnpm exec tsc --noEmit`
Expected: no errors.

**Step 4: Commit**

```bash
git add src/components/landing/film/ink.tsx src/components/landing/film/film.css
git commit -m "Boil the films' ink at eight frames a second"
```

### Task 3: The cast, in ink

**Files:**
- Modify: `src/components/landing/film/cast.tsx` (replace the flat `Robot`; keep `Say`, `DeskPhone`, `AgentTag`)
- Reference: `docs/storify-films/engine-core.js` lines 79 to about 200 (`CAST`, `drawHead`, the body drawer)

**Step 1:** Port Dennice and Leo from the engine's `CAST` and drawer to `<Ink>` shapes. Each canvas `sk(shape, {seed, fill, lw, amp, passes})` call becomes one `<Ink pts={shape} seed={…} amp={…} passes={…} />` with the fill and stroke width set by class. Each `ctx.translate` / `ctx.rotate` becomes a `<g transform>`. Keep the engine's seeds so the robots match the hand-drawn films line for line.

**Step 2:** Keep the `Robot` props the pilot already uses and add two:

```tsx
export type Mood = 'off' | 'normal' | 'puzzled' | 'happy'
export type Who = 'dennice' | 'leo'

type RobotProps = {
  who: Who
  mood: Mood
  phone?: boolean
  /** Which way the robot faces: toward whoever is speaking. */
  facing?: 'left' | 'right'
}
```

Faces stay as they are in the pilot (all moods drawn, the showing one crossfading in), but inked.

**Step 3: Check it** on the pilot's review page at 1040 and 660 px wide (a phone on its side): both robots boil, match their hand-drawn selves, and hold still under reduced motion. To find the review page, read how the pilot was shot: `git show d20d3f8` and the `REHEARSAL.md` beside the film, if there is one. The film itself is mounted through `src/components/landing/film/live-film.tsx`.

**Step 4: Commit**

```bash
git add src/components/landing/film/cast.tsx src/components/landing/film/film.css
git commit -m "Draw Dennice and Leo in ink, as in the hand-drawn films"
```

### Task 4: The discussion band

**Files:**
- Create: `src/components/landing/film/talk.tsx`
- Modify: `src/components/landing/film/film-stage.tsx` (`FilmPart.words`)
- Modify: `src/components/landing/film/film.css`

**Step 1: The types and the timing rule**, in `talk.tsx`:

```tsx
import type { Mood, Who } from '@/components/landing/film/cast'

export type Line = {
  who: Who
  text: string
  /** How the listener takes it. */
  hears?: Mood
}

export const NAMES: Record<Who, string> = { dennice: 'Dennice', leo: 'Leo' }

/** How long a line stays up: long enough to read, never a flash. */
export const holdFor = (line: Line) => Math.max(2000, 1500 + 32 * line.text.length)

/** A line as reduced-motion text: `Dennice: So the phone line got a voice agent.` */
export const asWords = (line: Line) => `${NAMES[line.who]}: ${line.text}`
```

**Step 2: A test for the two rules** in `src/components/landing/film/talk.test.ts`: `holdFor` never returns less than 2000 and grows with length; `asWords` names the speaker. Run with `npx -y tsx --test`, fail first, then pass. (`talk.tsx` imports only types from `cast.tsx`, so it runs without the app.)

**Step 3: The `Talk` component:** the band itself. Props: `cast: { who: Who; side: 'left' | 'right' }[]`, `lines: Line[]`, `at: number` (the line showing, `-1` for none). It renders the inked top edge, each robot on its side facing the speaker with the mood from `hears`, and every line as a stacked `Say` with only `at` showing, as the pilot stacks its captions (`ai-appointment-setter.tsx` line 516) so the band never changes height.

**Step 4:** In `film-stage.tsx`, `FilmPart.words` stays `string[]`; films now fill it with `lines.map(asWords)`.

**Step 5: Commit**

```bash
git add src/components/landing/film/talk.tsx src/components/landing/film/talk.test.ts src/components/landing/film/film-stage.tsx src/components/landing/film/film.css
git commit -m "Give the films a band where the robots talk"
```

### Task 5: Film 1, discussed from start to end

**Files:**
- Modify: `src/components/landing/film/films/ai-appointment-setter.tsx`

**Step 1:** Replace the `CAP` captions with `LINES: Line[]`, the 22 lines in the script table above. First open `src/content/case-studies/ai-appointment-setter.mdx` and check each line against it; copy `impactHighlight` word for word into the end line.

**Step 2:** Replace `cap: string` in the scene state `S` with `at: number`, and add one helper beside `step` and `toLane`:

```ts
/** Say line `i` and hold it while the build shows what it means. */
async function say(a: Act<S>, cue: Cue, i: number, patch: Partial<S> = {}) {
  a.put({ at: i, ...patch })
  await cue.wait(holdFor(LINES[i]!))
}
```

`toLane` and `step` take a line index where they took a caption.

**Step 3:** Rewrite the five parts' `run` scripts to the script table. Every beat the pilot already has stays (the ring, the call timer, the camera moves, the calendar and Airtable cards); each caption becomes the line beside it in the table.

**Step 4:** Render `<Talk>` where the caption was. Remove `compact` from the film's `size` and every `a.layout === 'wide'` branch in the script (`toLane`, `toApps`): there is one layout now, and the camera always moves.

**Step 5: Check the length.** Add up each part's `ms`. Expected: 60 000 to 90 000 in total. If it runs over, cut lines from Other paths first, never from the turn.

**Step 6: Commit**

```bash
git add src/components/landing/film/films/ai-appointment-setter.tsx
git commit -m "Have Dennice and Leo talk the Appointment Setter film through"
```

### Task 6: Before in ink, and the line settles

**Files:**
- Modify: `src/components/landing/film/films/ai-appointment-setter.tsx`
- Modify: `src/components/landing/film/cast.tsx` (the desk and `DeskPhone` in ink)
- Modify: `src/components/landing/film/app-cards.tsx` (an inked twin of `MissedCalls`)
- Modify: `src/components/landing/film/film.css`

**Step 1:** Add `world: 'ink' | 'build'` to the scene state. In `ink` the paper covers the whole stage; in `build` it is the band only. The paper's top edge moves with one CSS transition (about 700 ms, the kit's ease).

**Step 2:** Draw the Before props in ink: the desk and phone (`plank` in the engine, line 39), and the missed-call list as an inked card (`tag` and `hatch`, lines 49 to 56).

**Step 3: The settle,** at the first line of part 2 ("So the phone line got a voice agent."):
1. Set `data-ink='still'` on the props. The boil stops. Wait 300 ms.
2. Crossfade each inked prop into its clean card in the same place, 500 ms.
3. Drop the paper to the band (`world: 'build'`).
4. Call `a.mark('settle')`.

The robots are outside the stilled group and keep boiling.

**Step 4: Check it** frame by frame at the mark, with the playground's film script (`~/Developer/stageshow-playground/stageshow/references/rehearse.md` documents it):

```bash
node scripts/film.mjs "<review-url>" --out shots/settle.png --at settle --every 50 --count 24
```

Expected: no frame where a prop is missing or doubled, and no jump in position between the inked and clean versions.

**Step 5: Commit**

```bash
git add src/components/landing/film/films/ai-appointment-setter.tsx src/components/landing/film/cast.tsx src/components/landing/film/app-cards.tsx src/components/landing/film/film.css
git commit -m "Open the film in ink and settle it into the build"
```

### Task 7: The drawn token on the map

**Files:**
- Modify: `src/components/landing/film/lane-map.tsx`
- Modify: `src/components/landing/film/film.css`

**Step 1:** Add an optional `token?: ReactNode` prop to `LaneMap`. When set, it is drawn at the lit step and moves to the next lit step with a CSS transform transition, about 600 ms. Film 1 passes a small inked phone handset.

**Step 2:** Under reduced motion the token sits at the still's step without moving.

**Step 3: Check it:** shoot the Through the build part at 1040 and 660 px. The token must never sit on top of a step's number or caption.

**Step 4: Commit**

```bash
git add src/components/landing/film/lane-map.tsx src/components/landing/film/film.css src/components/landing/film/films/ai-appointment-setter.tsx
git commit -m "Carry the case along the process map as a drawn token"
```

### Task 8: The marker

**Files:**
- Create: `src/components/landing/film/marker.tsx`
- Modify: `src/components/landing/film/film.css`
- Modify: `src/components/landing/film/films/ai-appointment-setter.tsx`

**Step 1:** `Marker` takes `shape: 'circle' | 'underline'`, `on: boolean` and a `rect` (from the kit's `a.rect(name)`), and draws one terracotta inked path over the stage around that rect. The path has `pathLength='1'` and draws on with `stroke-dashoffset` from 1 to 0 in 450 ms. It does not boil: it is drawn once and holds.

**Step 2:** Use it twice in film 1, as in the script table: a circle round the three offered times, and an underline on step 8.

**Step 3:** Reduced motion: shown complete in the still.

**Step 4: Commit**

```bash
git add src/components/landing/film/marker.tsx src/components/landing/film/film.css src/components/landing/film/films/ai-appointment-setter.tsx
git commit -m "Mark the film's key moment with a drawn pen"
```

### Task 9: The end frame returns to ink

**Files:**
- Modify: `src/components/landing/film/films/ai-appointment-setter.tsx`

**Step 1:** In part 5, set `world: 'ink'`: the paper rises back over the stage. Dennice says the `impactHighlight` line; Leo says "Run it yourself below." and points down.

**Step 2: Commit**

```bash
git add src/components/landing/film/films/ai-appointment-setter.tsx src/components/landing/film/film.css
git commit -m "Close the film back in the drawn world"
```

### Task 10: Landscape on phones

**Files:**
- Modify: `src/components/landing/film/film-stage.tsx`
- Modify: `src/components/landing/film/film.css`

**Step 1:** Add a full-screen mode to `FilmStage`: a `full` state, a button beside play/pause, and a fixed overlay (`position: fixed; inset: 0`, the site's dark backdrop) that holds the stage scaled to fit, always 16:9. Use a CSS overlay, not the Fullscreen API alone: iPhone Safari does not allow full screen on anything but a video.

**Step 2:** On a touch screen narrower than 640 px, pressing play enters `full` at once. Where the browser allows it (Android Chrome), also call `document.documentElement.requestFullscreen()` and then `screen.orientation.lock('landscape')`; wrap both in `try`/`catch` and carry on if either is refused.

**Step 3:** While `full` and the screen is taller than it is wide (`@media (orientation: portrait)`), show one line under the stage: **Rotate your phone for full size.** It goes when the phone is turned. The film keeps playing either way.

**Step 4:** Leaving: a close button, the Escape key, and the film's end all leave `full` and release the orientation lock.

**Step 5: Check it** in the browser at 360 × 740 (upright) and 740 × 360 (on its side), with touch emulated: play opens the overlay, the hint shows only upright, the stage fills the width on its side, and close returns to the dialog with the film paused where it was.

**Step 6: Commit**

```bash
git add src/components/landing/film/film-stage.tsx src/components/landing/film/film.css
git commit -m "Play the films full screen and in landscape on phones"
```

### Task 11: The gate

Run every check the pilot passed, plus the new ones. Do not call the film done on a partial pass.

| Check | How | Pass means |
|---|---|---|
| Unit tests | `npx -y tsx --test src/components/landing/film/*.test.ts` | All pass |
| Types and lint | `pnpm exec tsc --noEmit` and `pnpm lint` | No errors |
| Whole film, wide | `film.mjs` contact sheet at 1040 px, one frame a second | Every line readable; no bubble over a robot; nothing clipped |
| Whole film, phone on its side | Same at 660 px | The same layout as wide, scaled; every line still readable |
| Phone upright | 360 × 740 with touch, by hand | Play opens full screen; the rotate hint shows; nothing clipped |
| The settle | `--at settle --every 50 --count 24` | No missing, doubled or jumping prop |
| Reduced motion | Emulate it; open each part's still | Ink still; lines listed as `Name: line` |
| Pause | Pause mid-line | The boil and the script both hold |
| Length | Sum of the parts' `ms` | 60 to 90 seconds |
| Facts | Each line against the `.mdx` | No line says more than the `.mdx` does |
| The dialog | Add the slug to `SHOWN` locally, open the case study, then **remove it again** | Plays in the real dialog; `SHOWN` is empty in the commit |

Write the results into `REHEARSAL.md` beside the film, with the widths shot and anything not covered.

### Task 12: Ramon reviews the pilot

**Stop here.** Show Ramon the film on desktop and on a phone, upright and on its side. Nothing in phase 2 starts until he approves it. Questions to put to him:

1. Is the talk the right amount, or too much for 90 seconds?
2. Are the robots close enough to the hand-drawn films?
3. Does it switch on in the dialog now (`SHOWN`), or wait for the other nine?

---

## Phase 2: after the pilot is approved

### Task 13: Update the main plan

**Files:**
- Modify: `docs/stageshow-film-plans.md`

Replace the "No narrator character" rule with the Two Worlds rules above (the stage, the roles, the six moves, the limits), and add the table below to it. Drop the 4:5 LinkedIn cut and the "still at 360 px wide" check: every film and every MP4 is 16:9 only.

### Task 14: Port the rest of the cast

**Files:**
- Modify: `src/components/landing/film/cast.tsx`
- Modify: `src/components/landing/film/talk.tsx` (`NAMES`)

Port Karan, Isa, Jeson, Myk, Unix, Samantha and Carlos from the engine's `CAST`, each as Dennice and Leo were in Task 3. This lands before the batches start, since all three batches share it.

### Task 15: Films 2 to 10, in three parallel batches

As `docs/stageshow-film-plans.md` already groups them (Money, Leads, People and files), one session and one branch per batch. Each film follows Tasks 5 to 9 and 11 with its own row here. Casts are as in each case's hand-drawn film (`docs/storify-films/films/<slug>.js`, first line).

| # | Film | Owner | Case | Third | Token | The turn | Marker lands on |
|---|---|---|---|---|---|---|---|
| 1 | AI Appointment Setter | Dennice, front desk | Leo, a caller | | The call | 2:00 is taken | Checked again right before booking |
| 2 | AI Invoice Processing & Approval | Dennice, accounts payable | *(the invoice)* | Karan, budget owner | The invoice PDF | The AI is unsure, or a rule flags it | Karan's approval in Slack |
| 3 | AI Prospecting with Apollo | Dennice, sales rep | **to be cast** | | A prospect card | People already known are skipped | Nothing is sent until a person approves |
| 4 | AI Unpaid Invoice Reminders | Dennice, collections | Isa, a customer | | The overdue invoice | Isa disputes it | Every reminder stops until a person clears it |
| 5 | Client Pipeline Emails | Dennice, agency owner | Jeson, a client | | The client card | Still Quoted after 2 days | One nudge, handled once |
| 6 | Gmail Attachment Filing | Karan, bookkeeper | Leo, a client | | `scan001.pdf` | Several files in one email | The new, findable name |
| 7 | New Employee Onboarding | Myk, HR | Unix, the new hire | | The intake form | Two check-ins due the same day | At most one email a day |
| 8 | HR Evaluation & Job Posting Assistant | Myk, hiring team | Samantha, an applicant | Carlos, the interviewer | The CV | The proposed time must be free | Confirmed free before it's booked |
| 9 | Order Stock Check | Dennice, shop owner | Samantha, a customer | | Two order slips | One order is short of stock | On hold, and the customer told why |
| 10 | Lead Scoring & Follow-Up | Dennice, sales rep | Jeson, a business owner | Karan, sales manager | The enquiry, with its clock | The 15 minutes run out | The handover to Karan |

Each turn and marker must be checked against that film's `.mdx` before its script is written; two rows (5 and 7) name a turn the film plan doesn't spell out and may need a different one.

### Task 16: Switch over, render, retire

Steps 4 and 5 of `docs/stageshow-film-plans.md`, unchanged and still paused: they start only when Ramon says so.

---

## Open questions for Ramon

1. **Film 3 has one robot.** The hand-drawn Prospecting film casts only Dennice, and a discussion needs two. Suggested: Karan as the sales manager who asks the questions, as in film 10.
2. **Film 2's case is an invoice, not a person.** Suggested: Dennice explains, Karan asks, and Karan also plays his own part when the approval reaches him.
3. **Length.** If the pilot feels rushed at 90 seconds with the talk, the choice is fewer lines or a longer film. **Settled: fewer lines** (Ramon, 2026-11-10).
