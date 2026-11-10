# Rehearsal: AI Appointment Setter (film 1, Two Worlds)

Filmed on 2026-11-10 with the Stageshow rehearsal gate (`scripts/film.mjs --gate`),
against the local review page that mounts the film alone.

## Length

76.4 s, inside the 60 to 90 s target. The five parts run for a fixed time each:
Before 11.2 s, The call 7.4 s, Through the build 38.8 s, Other paths 10 s,
The result 9 s. The talk fits inside them (`lines.test.ts` keeps it under 70 s).

## Widths filmed

- 1040 px (desktop, the stage at 1.05)
- 660 px (a phone on its side, the stage at 0.65)
- 1040 px with reduced motion: the ink holds still, and every line reads as
  "Name: line" under its chapter
- In the case-study dialog, in a real browser:
  - desktop 1280×800: inline 16:9; full screen fills the window at
    1252×704; Escape leaves full screen, keeps the dialog open and pauses
  - phone on its side 740×360: the same

## Fixed in rehearsal

- A robot saying two lines in a row kept its bubble; only the words change.
- The band bubbles crossfade in place, and only bubbles over the paper rise in.
- Leo fades in over most of his walk, not before it.
- The riding token crossfades between lanes, rather than unmounting in one lane
  and mounting in the next.
- The token sits on whole pixels (24×14).
- The plates run well past the frame, so no sliver of gutter shows on a phone.
- The marker fades in as it draws.
- The end button is centred by layout in an even box.
- A talking robot's bob eases out when it stops, instead of snapping back
  (`@property` on the bob's phase and height).
- Full screen from the dialog: the dialog's zoom-in transform and blur pinned
  the fixed player inside the dialog. While the film is full screen, its holders
  drop their transform and filter (`:has(.fm[data-full])`).

## Left as they are

- **`rb-eye` jumps.** The blink. Intentional.
- **The cards and lane map shared with the pilot** (unchanged by this work):
  - badges "On call" and "Ended" lopsided by 4 px
  - `fc-free` dashed edges crawling as their box grows
  - `fl-step` and `fl-lane__n` stepping in their box
  - kit overrides on the phone frame
- **`handoff shift` on `svg` (the lane map's step icons), up to 5 px.** It shows
  only around camera moves, while the gate leaves camera contents out. It is
  most likely the gate pairing icons across the gap, not a visible snap.
  Not proven either way.
- **`scale: 1.05` at 1040.** The review page lets the stage grow; the dialog
  holds it nearer its design size.

## Not covered

- The gate's status is "inconclusive" at both widths: about 400 sampling gaps
  over 36 ms each, so motion inside those gaps was not judged. It needs a
  person to watch the film.
- No real phone. Phones were emulated (viewport, touch, mobile).
- The settle (paper dropping to the band) was checked by eye, not with
  `--at settle` at 50 ms.
