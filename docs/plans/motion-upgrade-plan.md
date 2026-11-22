# Motion upgrade plan: intro, handover and site motion

Written 2026-11-11 from a motion audit of the landing page. Two sessions execute
it in order: **Opus first (Part A), then Sonnet (Part B)**. Ramon commits,
merges and pushes after both are done.

## Read this first (both sessions)

- **You are executing, not re-auditing.** The findings below were measured. Do
  not re-derive them; verify your own changes instead.
- **Do only your part.** Opus does Part A and stops. Sonnet does Part B and stops.
- **Do not commit, merge or push.** Ramon does that himself after Part B.
  Work on a branch named `motion-upgrade` (create it from `main` if it does not
  exist; Sonnet continues on the same branch). Leave changes uncommitted.
- **Do not touch** `src/components/landing/case-study-modal.tsx` (Ramon has an
  uncommitted edit there) or any untracked file you did not create.
- When you finish, fill in your section of the **Status log** at the bottom of
  this file. The next session reads it.

### Guardrails that apply to every change

- Phones (below 768px) and reduced-motion readers skip the intro. Keep it that
  way: the phone skip exists for Largest Contentful Paint.
- GSAP owns the hero entrance and section headings only. Ordinary content stays
  on the CSS `rise`/`sweep` helpers in `src/components/landing/motion.tsx`.
- Animate `transform` and `opacity`. The one allowed exception is the
  backdrop blur in A3, desktop only, and only if it holds frame rate.
- React Compiler lint is on: no new manual `useCallback`/`useMemo`, no
  render-time counters.
- Tailwind `delay-*` classes break GSAP tweens (they set `transition-delay` on
  everything). Use the existing `hero-delay-*` classes or GSAP positions.
- Do not run Prettier on `src/app/globals.css` (it reflows the whole file) or
  on `.mdx`. Edit by hand.
- Turbopack serves stale CSS after `globals.css` edits: run `rm -rf .next`
  before judging a CSS change.
- If Ramon has a dev server running, reuse it. Otherwise use the
  `portfolio-dev` preview config (port 3847). Do production builds in a
  detached worktree, not in this checkout.
- Verify visually before calling anything done: capture frames of the thing
  you changed. Editing source is not evidence.

## Baseline (measured, desktop 1440×900, dev server, first visit)

| Moment | Time from navigation |
|---|---|
| First paint (glass up) | 0.40s |
| Monogram starts drawing (CSS) | 0.51s |
| Tagline, name and tool flow start (GSAP) | 0.99s |
| Name landed | 1.99s |
| Copy leaves | 2.64s |
| Hero headline starts | 3.01s |
| Glass removed | 3.59s |
| "Book a free call" fully visible | 3.90s |
| Portrait fully open | 4.39s |

Scroll performance is already good (no frame over 26ms across the whole page
at 1,400px/s; 6 CSS animations running at once). Do not spend effort on
scroll performance.

To re-measure: clear `sessionStorage['rv-intro-seen']`, reload, and sample
computed styles per animation frame (`.intro-eyebrow-text` opacity,
`.intro-name` opacity, `.intro-glass` opacity, `[data-hero="title"]` and
`[data-hero="actions"]` opacity, presence of `.intro-overlay`). The browser
tab must be visible or `requestAnimationFrame` will not fire.

---

## Part A: Opus. The intro and the handover

Goal: the opening should look clearly better, not just tidier. One continuous
move from the intro into the hero, with nothing fading out and back in.

Files: `src/components/landing/intro-animation.tsx`,
`src/components/landing/hero-section.tsx`,
`src/components/landing/site-nav.tsx`, `src/components/landing/gsap.ts`
(to register Flip if used), and the intro block of `src/app/globals.css`
(roughly lines 259–560, plus the rotating-word underline near 1025–1045).

### A1. One clock

Problem: the monogram draws from first paint in CSS (`intro-mark-draw`), while
the tagline, name and tool flow wait for hydration and GSAP. The logo sits
alone on the glass for about half a second on dev, longer on a slow network.

Do: move the *entrance* of the tagline rules, tagline text, name words and tool
flow to CSS animations that start at first paint, on the same beat as the
monogram. GSAP then owns only the tool-flow run, the exit and the handover.
Take care that GSAP reads the CSS end state correctly when it takes over (see
the existing `y: 0` note on `.intro-word`).

Done when: there is no measurable gap between the monogram starting and the
copy starting, with JavaScript throttled.

### A2. The headline must land on its first word

Problem: the rotating-word `setInterval` in `hero-section.tsx` starts on mount,
not when the intro ends. At 3.2s it swaps to "chasing leads." exactly as the
hero entrance runs (about 3.0s), so first-time visitors never see "data entry."
arrive, and the swap collides with the line rise. The underline loop
(`hero-word-underline`, 2.5s) is out of phase with the rotation (3.2s).

Do: start the rotation only after the hero entrance timeline completes. Tie the
underline to the word change (restart it per word) so the two stay in phase.
Pause the rotation while the hero is off screen or the tab is hidden; it
currently re-renders the hero every 3.2s for the whole session. Fix the stale
"2.5s" comment in `CountUp` in `motion.tsx` if the number changes.

Done when: every first visit lands on "data entry." and holds it for a full
beat before the first swap.

### A3. The handover (the main visual upgrade)

Agreed with Ramon: **carry the tagline**.

Current state: the monogram flies to the nav mark (keep this). Everything else
fades out upward. The tagline "Better systems. More human work." fades out
centred and then fades back in 0.4s later as the hero eyebrow on the left. The
name fades out while the same name already sits in the nav.

Do, as one choreographed move:

1. **Tagline travels.** The intro tagline moves from the centre to the hero
   eyebrow's position and becomes it (GSAP Flip, or measured
   `getBoundingClientRect` deltas like the monogram already uses). The hero's
   own eyebrow must not also fade in: there is only ever one tagline on screen.
   Match size, tracking and colour on arrival so the swap is invisible. Measure
   at flight time, not at mount, as the monogram does.
2. **Focus pull.** The glass currently tweens opacity while the blur stays at
   22px, which reads as a cross-fade. Resolve the blur toward zero as the
   tagline travels, so the page comes into focus. Desktop only. Measure frame
   times; if animating `backdrop-filter` drops frames, fall back to two stacked
   glass layers (heavy and light blur) cross-faded.
3. **A payoff for the tool flow.** The Gmail → n8n → Slack run takes 0.84s on
   36px tiles and vanishes 0.36s after Slack lights. Give the finished run a
   short hold (about 0.25s) and a clear "done" beat, and consider letting the
   pulse leave Slack and become the hero eyebrow's rule (`[data-hero-rule]`)
   as the tagline lands, so the work visibly flows into the page. Use
   judgement on scale; it should read at a glance, not dominate.
4. **The name.** It should not fade out over a nav that already shows it.
   Either carry it to the nav wordmark alongside the monogram, or hide the nav
   wordmark until the intro name has left and let it take over, the way the
   nav mark already does.
5. **Overlap, do not queue.** Start the hero entrance as the tagline lands so
   the CTA is fully visible by about 3.0s from navigation (currently 3.9s).

Keep: skip-on-input (it seeks to `clear` and speeds up), the once-per-tab
`rv-intro-seen` behaviour, the 8s CSS failsafe, the fallback path when the nav
mark is hidden, and `revertOnUpdate` cleanup. Update the header comment in
`intro-animation.tsx`; it still says "under two seconds".

Constraints on content: no platform names in the H1 (tool logos in the intro
flow are fine and stay). The title is "AI Automation Specialist".

Done when: recorded frames of the handover show no element fading out and
reappearing; the tagline, monogram and name each have one continuous path; the
CTA is fully visible by about 3.0s; no frame over 34ms during the handover;
skip, reduced motion, phone and returning-visitor paths still behave as before.

### A4. Verify and hand over

- Capture before/after frames of the full intro at 1440×900 and at 1024×768
  (portrait column appears at 1024).
- Re-run the baseline measurement and record the new numbers in the Status log.
- Run `pnpm lint` and `pnpm check-types`.
- Do not start Part B. Fill in the Status log and stop.

---

## Part B: Sonnet. Consistency and hardening (after Part A)

Read Opus's Status log first. Do not rework anything in Part A. These changes
should be invisible when done right: same look, one system underneath.

### B1. Motion tokens

Problem: four reveal vocabularies (`rise` 22px/0.7s, `sweep` 34px/0.8s,
`introStep` 12–16px, SplitText line rise 1s) and 10 distinct cubic-beziers.
`cubic-bezier(0.25, 0.8, 0.25, 1)` appears 15 times with no token. Springs are
defined ad hoc per file.

Do: define the easing set (`--ease-entrance`, `--ease-exit`, `--ease-standard`
already exist at the top of `globals.css`), a short duration ladder, and named
springs in `src/components/landing/tokens.ts` / `motion.tsx`. Replace raw
literals with tokens where the value is the same or near enough that the swap
is not visible. Where a literal is deliberately different (overshoot
`0.34, 1.56, 0.64, 1`, the footer signature), keep it and name it. Two rules
near lines 2759 and 2839 use `var(--ease-out)`, which is Tailwind's default
and not one of the site's tokens; move them to a site token.

Done when: no raw cubic-bezier remains outside the token block and the named
exceptions, and before/after screenshots of each section match.

### B2. Harden the section-heading reveal

File: `src/components/landing/section-intro.tsx` (`useHeadingReveal`).

Problem: every heading is split at mount, before fonts are guaranteed loaded
and without `autoSplit`, so line masks can be measured against the fallback
font. Headings are `opacity: 0` inline until GSAP runs, so a failed script
leaves every H2 invisible.

Do: split after `document.fonts.ready` (or use SplitText `autoSplit` with
`onSplit`; check the GSAP docs for the installed 3.15 API). Add a CSS failsafe
so headings become visible without JavaScript, in the spirit of the intro's
`intro-failsafe`.

Done when: headings are visible with JavaScript blocked, and line breaks are
correct on a cold load with fonts throttled.

### B3. Idle work

- `greeting-word.tsx`: the timer runs under reduced motion and off screen.
  Pause it in both cases.
- `will-change`: 59 elements hold it permanently. Keep it only on elements
  that are actually animating (for example via the existing `data-offscreen`
  flag or the in-view state). Target under 15 at rest.

### B4. Verify and hand back

- `rm -rf .next`, then check each section visually at 1440 and 390 wide.
- Run `pnpm lint` and `pnpm check-types`.
- Fill in the Status log and stop. Ramon commits, merges to `main` and pushes.

---

## Out of scope for both parts

- Route transitions between pages.
- The ten case-study films and the process/service scenes (not audited).
- The story section's scroll spring (deliberately slow; leave it).
- Scroll performance.

## Status log

### Part A (Opus)

- Status: done, uncommitted on `motion-upgrade` (2026-11-11).
- Files changed: `src/components/landing/intro-animation.tsx`,
  `src/components/landing/hero-section.tsx`, `src/app/globals.css` (intro
  block and the rotating-word underline only), `src/components/landing/motion.tsx`
  (the stale "2.5s" comment in `CountUp` now says 3.2s). `site-nav.tsx` and
  `gsap.ts` were not needed: the flights use measured deltas, not Flip, and the
  nav wordmark is hidden from the intro by `visibility`.
- New timings. Measured on **production builds** (`next build` + `next start`
  in a detached worktree) at 1440×900, first visit, three runs each, so both
  columns are like for like. The plan's Baseline table above was taken on the
  dev server, so its absolute numbers are higher.

  | Moment | Before (main, prod) | After (prod) |
  |---|---|---|
  | First paint (glass up) | 0.21–0.48s | 0.18–0.26s |
  | Monogram starts drawing | 0.30–0.52s | 0.31–0.36s |
  | Tagline, name and tool flow start | 0.36–0.53s (GSAP, after hydration) | 0.26–0.33s (CSS, same frame as the monogram or earlier) |
  | Name landed | 0.99–1.10s | 0.92–0.97s |
  | Handover starts (copy used to leave; now the blur starts resolving) | 2.27–2.38s | 1.80–1.91s |
  | Hero headline starts | 2.38–2.49s | 1.93–2.04s |
  | Name lands in nav wordmark | n/a (faded out) | 2.58–2.69s |
  | Tagline lands as hero eyebrow | n/a (faded out and back in) | 2.64–2.74s |
  | "Book a free call" fully visible | 3.78–3.89s | **2.78–2.88s** |
  | Glass removed | 2.96–3.07s | 2.99–3.09s |
  | Portrait fully open | 3.78–3.89s | 3.31–3.42s |
  | First word swap | 3.85–3.97s (collided with the entrance) | 6.74–6.84s ("data entry." holds a full 3.2s beat after landing) |

- Decisions made:
  - **A1.** Rules, tagline, name words (staggered by a `--i` custom property)
    and the flow now rise from CSS keyframes on the monogram's clock. GSAP
    reads how far the entrance already is from the overlay's own
    `intro-failsafe` animation clock, so the tool run starts at the same
    moment of the entrance however late hydration lands. At the handover GSAP
    sets `animation: none` on those elements and pins their end states inline
    first, because a running CSS animation outranks GSAP's inline styles.
    Note: the tool run itself is still GSAP, so on a very slow hydration it
    starts late, but the copy no longer waits.
  - **Layout change in the intro: the tagline now sits under the name**
    (monogram, name, tagline, flow). With the tagline above, the name had to
    climb through the tagline's path on its way to the nav, and it is too wide
    to pass beside it; staggering them instead left the name parked over the
    rising headline. In this order nothing crosses. Ramon approved keeping it
    under the name (2026-11-11); do not move it back.
  - **Tagline carry.** The intro tagline flies (measured at flight time) to
    the hero eyebrow's text and lands on it with matching size (scaled by
    font-size ratio, from its left edge), tracking and colour. The hero
    eyebrow is gated by `data-carried` on `[data-hero="eyebrow"]` ("flying"
    hides its text; "landed" shows it), and the hero entrance skips the
    eyebrow and its rule when it sees `data-carried`. An attribute, not inline
    style, because the intro's GSAP context reverts its inline styles on
    unmount.
  - **Name.** Carried to the nav wordmark (width-fitted, since the weights and
    tracking differ), with the suffix's accent fading to ink on the way. The
    nav wordmark is hidden with `visibility` until it lands (its CSS opacity
    transition would smear a GSAP opacity tween). Where the nav has no
    wordmark (768–1023px, or the tightened pill) the name lifts out as before.
    Monogram and name share `power3.inOut` so they leave the centre early.
  - **Focus pull.** The glass's `backdrop-filter` tweens from 22px to 0 while
    its tint lifts a beat later. Kept the single layer: on uncontended runs
    the handover's worst frame was 25–33ms, and the long frames on the other
    runs were page-load contention, not the blur (see Not done), so the
    two-layer fallback was not needed.
  - **Flow payoff.** The run is a little faster (0.3s legs), then holds 0.25s,
    the three tiles lift together and one accent ring closes around the run
    (`.intro-flow-done`). A spark (`.intro-spark`) leaves Slack, crosses to the
    hero eyebrow's left end and draws `[data-hero-rule]` as the tagline lands.
  - **Overlap.** The hero is released during the run's hold (the release costs
    one long frame from React plus SplitText, so it is spent while nothing
    moves), and its entrance waits `HANDOVER_LEAD` (0.38s) so the headline
    rises as the tagline travels. The CTA no longer waits for the copy to
    settle.
  - **A2.** Rotation and underline start from a `landed` state the hero
    timeline sets as its lines arrive (immediately on phones and reduced
    motion). The underline is now a real element re-keyed per word, running
    one draw per 3.2s beat (`--beat`), so it cannot drift from the rotation.
    The interval pauses while the hero is off screen (IntersectionObserver)
    or the tab is hidden.
  - **Returning visitors.** The intro now also bails out on the
    `data-intro-seen` attribute set by the pre-paint script. Without it the
    first client render armed the carry for one frame and the hero then skipped
    its own eyebrow fade.
- Paths checked on the production build: skip (keypress at 0.7s: overlay gone,
  hero in, seen flag written), returning visitor (no glass, eyebrow and rule
  animate with the hero as before), rotation (holds, swaps, pauses while
  scrolled away, resumes), 900px tablet (name lifts out, nav has no wordmark),
  390px phone (no intro, CSS hero, underline runs), reduced motion (no intro,
  static underline). No frame in the handover showed two taglines or none
  (sampled every animation frame).
- Anything Sonnet must not touch or should know:
  - Leave the intro/handover timing constants alone (`RUN_*`, `FLIGHT`,
    `RELEASE_LEAD`, `BRAND_EASE` in intro-animation.tsx; `HANDOVER_LEAD`,
    `ROTATE_MS` in hero-section.tsx). `RELEASE_LEAD`, the 0.22s "done" beat
    and `HANDOVER_LEAD` are tuned together.
  - Intro literals that B1 may want to tokenise: `cubic-bezier(0.87, 0, 0.13, 1)`
    on `.intro-eyebrow-rule` is GSAP's `expo.inOut`, kept so the CSS entrance
    matches the old GSAP one exactly. Name it rather than swap it.
  - `.hero-word-underline` replaced `.hero-word-shell::after`; there are two
    rules for it in globals.css (the base and a later override that thins it
    to 1px), as there were for the pseudo-element.
  - `.intro-flow-done`, `.intro-spark` and the `[data-carried]` rules are new
    and load-bearing.
  - `pnpm lint` (bare `eslint`) fails before linting anything: "could not find
    plugin import" for `import/newline-after-import`. That was already the case
    and is unrelated to Part A; `pnpm exec eslint src` is clean.
  - `pnpm check-types` fails only in `case-study-modal.tsx` (Ramon's
    uncommitted edit: `study.roi` / `study.failsafes` possibly undefined). The
    production build of the committed modal plus these changes type-checks
    clean.
- Not done / not verified:
  - **Frame budget is met on quiet runs, not on every run.** On the final
    build, 4 of 8 runs had no frame over 34ms in the handover (worst 25–33ms).
    The other 4 had one or two 40–158ms frames, on loads
    where the handover started earlier and page assets (hero scenery WebPs,
    the hero video, tool SVGs, the chat fetch) finished inside it. Their
    long-animation-frame entries show under 15ms of script, so it is load
    contention, not the tweens. The machine's load average was 43–77 during
    verification (Chrome and the desktop app), so treat all frame times as
    noisy. Worth a re-measure on a quiet machine.
  - A1 was not tested with DevTools CPU throttling. By construction the copy
    no longer depends on JavaScript, and measured copy start equals the
    monogram's start.
  - The name-to-wordmark swap shows a faint double image for about 0.12s
    (light flying name fading over the medium-weight wordmark). It reads as a
    soft hand-off. Shorten the fade in intro-animation.tsx if it bothers you.
  - Frame sheets (before vs after, 1440 and 1024) and the measuring scripts
    are in `.playwright-mcp/motion/` (git-ignored).

### Part B (Sonnet)

- Status: done, uncommitted on `motion-upgrade` (2026-11-11), on top of Part A.
- Files changed:
  - **B1 tokens:** `src/app/globals.css` (token block; every raw curve replaced),
    `src/components/landing/tokens.ts` (new `EASE_CSS`, `EASE_ENTRANCE`,
    `EASE_STAGE`, `DURATION`, `pillSpring`, `scrollSprings`; the three springs
    that lived in motion.tsx moved here), `motion.tsx` (re-exports them, `rise`
    and `sweep` use them, Tailwind `ease-[cubic-bezier(0.4,0,0.2,1)]` became
    `ease-standard`), `site-nav.tsx`, `story-section.tsx`, `ui/timeline.tsx`
    (springs), `contact-section.tsx`, `tool-stack-section.tsx`,
    `articles-section.tsx`, `intro-section.tsx`, `section-intro.tsx`,
    `projects-section.tsx`, `view-stage.tsx`, `hero-section.tsx`,
    `principles-section.tsx` (easing literals), `work-cards.css`.
  - **B2:** `section-intro.tsx`, plus the `.heading-reveal` block in globals.css.
  - **B3:** `greeting-word.tsx`, `section-intro.tsx` (`introStep`), `sheet.css`,
    and a `[data-offscreen]` rule in globals.css.
- Exceptions kept as named literals (all in the token block at the top of
  globals.css, each with a comment on what it is for): `--ease-overshoot`
  `0.34, 1.56, 0.64, 1` (workflow pins and lifts), `--ease-signature`
  `0.55, 0.1, 0.25, 1` (footer pen), `--ease-emphasis` `0.87, 0, 0.13, 1`
  (GSAP's expo.inOut, for the intro's CSS rules), `--ease-in-out`
  `0.65, 0, 0.35, 1` (workflow canvas draw). `--ease-out` (Tailwind's default,
  used by the two rules at the old lines 2759/2839) became `--ease-settle`,
  the same value, so those two rules look identical. In TypeScript,
  `EASE_STAGE` `0.76, 0, 0.24, 1` (panels crossing the whole stage) is kept
  distinct from the entrance curve.
  - After this, `globals.css` has no `cubic-bezier` outside the token block.
- Near-enough swaps (the only ones that could differ): `principles-section`
  used `0.23, 1, 0.32, 1` at 0.42s and now uses the entrance curve
  (`0.16, 1, 0.3, 1`); both are steep ease-outs. Everything else swapped
  byte-identical values. The plan's "`0.25, 0.8, 0.25, 1` 15 times" is not in
  `globals.css`: that curve lives in `scenes/scenes.css` and the stageshow kit.
- **B1 scope, deliberately not touched** (the plan puts the scenes and films out
  of scope, and the stageshow kit is a separate library with its own
  vocabulary): `scenes/*.css`, `film/film.css`, `demo/n8n-demo.css`, and
  everything under `components/stageshow/`. About 100 raw curves remain there,
  most of them `0.22, 1, 0.36, 1` and `0.25, 0.8, 0.25, 1`.
- B2 detail: headings now use SplitText `autoSplit` with `onSplit` returning
  the tween, so they re-split when the display face finishes loading or the
  width changes (the installed 3.15 listens to `document.fonts` `loadingdone`).
  The inline `opacity: 0` is now the `.heading-reveal` class, which shows the
  heading at once under `@media (scripting: none)` and after 5s otherwise (a
  CSS animation, like the intro's). Reduced motion is unchanged.
- B3 detail: `will-change` went from 59 elements at rest to 14 (1440×900, top
  of the page, after the intro) and 15 mid-scroll. What is left is the fixed
  scenery layers (video, glow, foreground, parallax ranges, light shafts) and
  the cursor pair, all of which are genuinely moving. Done by dropping the
  standing hint from `introStep` (about 10 unseen blurbs and tags), moving the
  sheet preview's hint onto its `[data-on]` state, and clearing it inside
  `[data-offscreen]` sections (the flag `OffscreenLoopPause` already sets).
  The greeting word now runs its timer only while on screen with the tab
  visible, and not at all under reduced motion (it holds "Hello").
- Verified (dev server, `rm -rf .next` first): all ten tokens resolve in
  `:root`; every section at 1440 and 390 renders and its heading reveals and
  reverts to clean markup; headings are opacity 1 with JavaScript disabled;
  with every font file delayed 3.5s the split line breaks were identical to
  the undelayed run (all six headings); greeting cycles on screen, holds off
  screen, and is static under reduced motion. `pnpm exec eslint src` is clean.
  `pnpm check-types` fails only on the two errors in Ramon's uncommitted
  `case-study-modal.tsx` (unchanged from Part A).
- Not done / not verified:
  - **No before/after screenshots of each section.** I did not capture a
    "before" set, so "screenshots match" rests on the swaps being
    byte-identical (the tokens resolve to the same curve strings) plus a visual
    pass of the "after" sheets. The one visible difference to look for is
    `principles-section`'s ease (see above). Worth a glance from Ramon.
  - The font-delay test was not run against the old code, so I did not
    reproduce the original line-break bug, only confirmed it does not occur now.
  - The `[data-offscreen]` rule's saving was measured at load; the memory
    effect itself was not measured.
  - `--dur-*` CSS custom properties were tried and dropped: Tailwind only
    emits theme variables that CSS uses, and nothing did. The duration ladder
    is `DURATION` in `tokens.ts` only, and only `rise`, `sweep` and a few
    reveals use it. The many one-off durations in CSS were left alone.
  - Motion is invisible to this test pass under heavy machine load (load
    average 40-90), so nothing here says anything about frame rate.
