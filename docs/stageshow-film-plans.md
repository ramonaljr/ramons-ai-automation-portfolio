# Stageshow film plans: all 10 case studies

A plan, not yet built. It replaces each case study's hand-drawn Storify film
(`public/films/<slug>.mp4`, about 3½ minutes, a robot narrator touring every
lane) with a **fused film** made in Stageshow: the short product-style clip and
the build walkthrough in one piece, in the site's own look.

## The idea in one line

**One real case drives the tour.** The film follows one call, invoice, lead or
new hire through the build. Each time the case needs a part of the build, the
camera pulls back to the process map, lights that lane, steps through the
steps it uses with a one-line caption each, then returns to the app screens
where the result lands. The visitor learns the build by watching it handle
something, not by being shown seventeen boxes in a row.

## Rules for every film

- **Facts come only from the case study's `.mdx`** and its process map's
  data in `docs/process-diagrams/diagrams.json` (the lanes and numbered
  steps). No measured results, no client names, nothing the build doesn't
  do. The ledger is re-checked against the `.mdx` when each film is built.
  The Storify scripts' captions are a starting point for wording only.
- **The site's look:** the scene kit in `src/components/stageshow/kit`, cool
  greys, Satoshi type, terracotta accent; app screens drawn as clean cards
  (Gmail, Calendar, Slack, Sheets, Airtable…) with their real marks from
  `kit/brands` and `scenes/tool-mark.tsx`.
- **No narrator character.** Short captions carry the words (Dennice and the
  others go). Captions work with the sound off, which is how most people
  watch.
- **60 to 90 seconds**, in five parts:
  1. **Before** (about 8 s): the pain as a screen, not a story. A missed-call
     log, an inbox of `scan001.pdf`s, a lead waiting three hours.
  2. **The case arrives** (about 6 s): the clip's opening. A call rings, an
     invoice lands, a form is sent.
  3. **Through the build** (40 to 60 s): the case moves through the lanes it
     really uses, each lit on the process map as it goes. The step numbers
     match the map in the case study.
  4. **The other paths** (about 8 s): a quick pass over the lanes this case
     didn't use (moving a booking, the dispute route, the error lane), so the
     whole build has been seen.
  5. **End frame** (about 4 s): the outcome in words, the same sentence as
     the case study's `impactHighlight`, and "Run it yourself below", which
     points to the runnable demo already in the dialog.
- **Reduced motion:** a still per part, with the captions as text.

## Where it goes

- **On the site: live, not a video file.** The dialog's **Film** toggle
  (`case-study-modal.tsx`, the `<video>` under "Animated explainer") plays
  the scene instead of the MP4: sharp at any size, a fraction of the
  download, and a changed fact is a code edit rather than a re-render. It
  gets play/pause, the five parts as chapter chips to jump between, and
  starts only on a click, as the video does now.
- **Off the site: rendered to MP4.** The same scene captured through the
  playground's `film.mjs`: 16:9 for YouTube and the **Walkthrough** link,
  and a 4:5 cut of parts 2 and 3 for LinkedIn.
- **Not a copy of the runnable demo.** The demo below the film lets visitors
  run the workflow on its canvas; the film tells the story around it.

## Built once, used by all ten

| Piece | What it is |
|---|---|
| `FilmStage` | Plays a film's parts in order, with chapter chips, play/pause and the reduced-motion stills. |
| `LaneMap` | The process map in the case study's design: lanes, numbered steps, a lit path, a step card with its caption. |
| Camera moves | App screens ⇄ map, using the kit's `Camera`. |
| App cards | Gmail message and inbox, Calendar day, Slack message with buttons, Sheets/Airtable row, QuickBooks bill, Drive file, a web form, a phone call. Each built once and shared. |
| Lane data | Read from `docs/process-diagrams/diagrams.json`, which already generates each case study's card and map SVGs (`build.cjs`). The film reads the same file, so a changed step changes the map, the card and the film together, with no copy to keep in step. |

---

## 1. AI Appointment Setter · `ai-appointment-setter` · n8n, pilot

- **The case:** the clip, already being made: an after-hours call, "Can I come
  in tomorrow at 2?", 2:00 is taken, three open half hours offered, the caller
  takes 2:30, it's booked and logged.
- **Through the build:** On the call (1) → Get slots (2–4: read the calendar,
  check the rules, list open times) → Book slots (5–10: details present,
  convert to Central time, **check again right before booking**, create the
  event, log in Airtable) → Call results (17).
- **Other paths:** Update slots (11–13, nothing moves unless the new time is
  free) and Cancel slots (14–16).
- **Watch for:** never say "booked" when a time is refused; all-day calendar
  entries don't block a time (both are rules in the live workflow).

## 2. AI Invoice Processing & Approval · `ai-invoice-processing-approval` · n8n

- **The case:** a construction supplier's invoice PDF arrives by email.
- **Through the build:** Receive & de-duplicate (1–4: text pulled from the PDF,
  checked against the invoice log) → Read & check (5–9: AI reads it, is it
  sure, find the purchase order, fixed rules flag any issue) → Approve & post
  (10–15: the budget owner approves in Slack, the bill goes to QuickBooks after
  retention, the log is saved, the email marked read).
- **Other paths:** AI unsure or a rule flags it, and the error lane.

## 3. AI Prospecting with Apollo · `ai-prospecting-apollo` · n8n

- **The case:** a prospecting request sent through the form.
- **Through the build:** Find & score (1–6: Apollo search, people already known
  are skipped, enrich, score by fixed rules) → Research & queue (7–11: the
  company website fetched, AI drafts an email grounded in it, saved to the
  sheet, a review digest in Slack) → Approved → Pipedrive (12–15: every 15
  minutes, org and deal created, marked as in the CRM).
- **Make clear:** nothing is sent automatically. A person approves first.

## 4. AI Unpaid Invoice Reminders · `ai-unpaid-invoice-reminders` · n8n

- **The case:** the 8:00 daily check finds an overdue invoice.
- **Through the build:** Daily check (1–5: QuickBooks, Pipedrive and the
  collection state, policy rules decide who to remind) → Write & send (6–9:
  AI writes the reminder, Gmail sends it, contact saved) → Read customer
  replies (10–12) → Act on the reply (13–15).
- **The turn:** the customer replies that they dispute it. The dispute
  **stops every reminder until a person clears it**: the film's key moment.
- **Other paths:** a promised payment date saved instead, and the owner alert
  past 30 days.

## 5. Client Pipeline Emails · `airtable-crm-lead-engagement` · Zapier

- **The case:** a client card is moved to Quoted on the Airtable board.
- **Through the build:** Catch the stage change (1–5: handled once, the stage
  claimed, Paths picks the route) → No Response & Quoted follow-ups (9–13:
  follow-up email, wait 2 days, still Quoted, one nudge).
- **Then the same card moves on:** to Approved (14–15: AI-written welcome
  email) and Ready to Start (6–8: Drive folder and content task).
- **Other paths:** the error lane (18–22: wait 15 minutes, retry once, then an
  alert email).

## 6. Gmail Attachment Filing · `gmail-attachment-filing` · Make

- **The case:** a client emails `scan001.pdf` and it's labelled To File.
- **Through the build:** Find new attachments (1–4: every 15 minutes, real
  attachments only) → Name it with AI (5–6: Gemini gives it a short,
  descriptive name) → File and log (7–8: Drive folder, Sheets row) → Confirm
  once (9–11: one receipt to the sender listing every file).
- **The moment to land:** `scan001.pdf` becoming a name you could find.
- **Other paths:** the error lane (12–14: retried up to 3 times, 15 minutes
  apart).

## 7. New Employee Onboarding · `hotel-employee-onboarding` · n8n

- **The case:** the intake form for one new hire.
- **Through the build:** Form & plan (1–4) → Set everything up (5–8: Drive
  folder, orientation booked, IT and manager told, welcome email) → Document
  upload (9–10) → Daily check at 8:00 (11–14: check-ins on day −7, 0, 3, 7
  and 30, **at most one email a day**).
- **Other paths:** the HR assistant (15), which answers only from company
  policy.

## 8. HR Evaluation & Job Posting Assistant · `hr-evaluation-assistant` · n8n

- **The case:** one applicant applies through the form.
- **Through the build:** Receive and filter (1–7: CV to Drive, the AI agent
  reads it against the real job posting, potential hire) → Questionnaire
  (8–10) → Personalised interview email (11–12) → Book the interview (13–16:
  a proposed time, **confirmed free** before it's booked) → Screening
  questions for the interviewer (17).
- **Other paths:** the rejected route at step 7.

## 9. Order Stock Check · `order-stock-check` · Make

- **The case:** two orders marked New in the same 15-minute run, one with
  enough stock and one without.
- **Through the build:** Find new orders (1–3: up to 10 at a time, stock looked
  up by SKU) → Route by stock (4–6) → Confirm the order (7–9: reserve,
  confirm, email) → Hold short orders (12–14: on hold, the customer told why,
  operations alerted).
- **Other paths:** Flag low stock (10–11), when the first order takes stock
  below its reorder level.

## 10. Lead Scoring & Follow-Up · `solar-lead-scoring-follow-up` · n8n

- **The case:** a website enquiry, with the 15-minute clock on screen.
- **Through the build:** Receive & reply fast (1–4: a reply in under a second)
  → Read, score & assign (5–12: AI reads the enquiry, scored out of 100 by
  fixed rules, the least-recently-assigned rep, saved, AI reply emailed, rep
  alerted in Slack) → 15-minute follow-up check (13–15: every 5 minutes,
  counted in working hours; an overdue lead goes to the sales manager).
- **The moment to land:** the clock running out and the handover.
- **Other paths:** the error lane.

---

## Order of work

1. **Wait for the clip** (the "Stageshow clip of the AI Appointment
   Setter" session). Its call loop becomes part 2 of film 1.
2. **Pilot: film 1, plus the shared pieces.** The biggest step, since
   `FilmStage`, `LaneMap`, the camera moves and the first app cards are all
   built here. **Ramon reviews the pilot before anything else is built.**
3. **Three batches of three**, grouped by the app cards they share, so each
   batch adds few new pieces:
   - **Money:** 2 Invoice approval, 4 Unpaid reminders, 9 Order stock check
     (QuickBooks, Gmail, Slack, Sheets)
   - **Leads:** 10 Lead scoring, 3 Prospecting, 5 Client pipeline (Slack,
     Airtable, Pipedrive, email)
   - **People and files:** 8 HR evaluation, 7 Onboarding, 6 Attachment filing
     (forms, Drive, Calendar, Gmail)

   Once the pilot has settled the shared pieces, the batches touch separate
   files and can run in parallel sessions.
4. **Switch the dialog over** for each film as it passes review, then render
   the MP4s (16:9 and the 4:5 LinkedIn cut).
5. **Retire the hand-drawn film** in the same change: delete
   `public/films/<slug>.mp4` and `<slug>.jpg`, point `videoUrl` at the
   Stageshow MP4 (the Walkthrough link), and drop `videoPoster`. When the last
   of the ten is replaced, remove `docs/storify-films/` and the two Storify
   plan docs; git history keeps them.
6. **Each film passes the same checks as the site's scenes:** a frame-by-frame
   film strip, a still at 360 px wide, and reduced motion.

## Decisions for Ramon

1. ~~**The hand-drawn films:** retire or keep?~~ **Retire** (Ramon,
   2026-11-10): each one goes when its replacement is live (step 5 above).
2. **Sound:** the hand-drawn films have music; a live scene is silent. Fine,
   or should the rendered MP4s get a music bed?
3. **Live in the dialog** (recommended) or an MP4 there too?
4. **Length:** 60 to 90 seconds, against 3½ minutes now.
