# Storify film plans: Zapier and Make projects (8 and 9)

The same rules as `docs/storify-film-plans.md` apply. Facts come only from the build and its case study. Products appear as labelled props, not logos. The fictional client name is never shown on screen. Each film follows its process map stage by stage, about 2 to 2.5 minutes long.

---

## 8. Client Pipeline Emails on Zapier · `airtable-crm-lead-engagement`

- **Platform:** Zapier (a classic Zap, 385561425, built with Paths, Delay and error handlers; the earlier Next Gen version is turned off).
- **Sample client (page only, not in the film):** Kestrel Digital, a small agency selling consulting, builds and support.
- **Type:** How it works. One lead card moves across the board, and each stage it lands on sets off its own lane.
- **Cast (2):** **Dennice**, the agency owner (protagonist). **Jeson**, a client.
- **Intro (THE JOB / THE PROBLEM / WATCH FOR):**
  - Every client moves through a pipeline board.
  - Follow-ups, folders and thank-yous depended on someone remembering.
  - Move a card, and the right next step happens on its own.

**Process map (5 stages, 58 steps on the Zapier canvas), as in `airtable-crm-lead-engagement-map.svg`:**

1. **Catch the stage change:** New or Updated Record. Stage Not Yet Handled? Claim The Stage. Set Greeting And Owner. Split Into Paths By Stage. Email Missing → Log It.
2. **Ready to Start:** Create Client Drive Folder. Create Social Media Content Task. Save Folder Link And Log.
3. **No Response & Quoted follow-ups:** Send Follow-Up Email. Log Follow-Up. Wait 2 Days. Recheck Lead Stage. Still The Same Stage? Send Nudge Email. Log Second Follow-Up.
4. **Approved, Paid and Closed:** AI Writes Welcome Email. Send Welcome Email. AI Writes Thank-You Email. Send Thank-You Email. Log Each Email.
5. **If something breaks:** Folder Or Email Step Fails. Wait 15 Minutes. Retry Once. Log It As Sent On Retry. Still Failing → Alert Email.

**Facts ledger:**

- 5 pipeline stages automated.
- 2-day wait before each nudge.
- A nudge is never sent if the lead has moved on.
- Each stage runs once per lead ("Handled Stages").
- A missing email is logged, never guessed.
- Every action is written to the lead's Pipeline Log.
- The welcome email is under 150 words, the thank-you under 170.
- The folder, nudges, welcome and thank-you retry once after 15 minutes. A first follow-up that fails alerts straight away.
- A step that still fails sends an alert email naming the client and stage.

**Beats (about 30):**

1. Dennice and the board.
2. The old way: forgotten follow-ups.
3. Overview of the whole canvas.
4. Lane 1: Jeson's card moves, and the stage is claimed.
5. Lanes 2 to 4, one per stage. Jeson reacts to the emails, and a 2-day clock appears on lane 3.
6. Lane 5: a failed send waits 15 minutes, retries once, then alerts.
7. Recap board.
8. Ending banner: "Move the card. The follow-up takes care of itself."

---

## 9. Gmail Attachment Filing on Make · `gmail-attachment-filing`

- **Platform:** Make.com (scenario "Integration Gmail", runs every 15 minutes).
- **Sample client (page only):** Ashgrove Bookkeeping, which gets receipts and statements from clients by email.
- **Type:** Before and after. From attachments saved by hand under names like `scan001.pdf`, to files named by what they are, logged, with a receipt sent back.
- **Cast (2):** **Karan**, the bookkeeper (protagonist). **Leo**, a client sending documents.
- **Intro:**
  - Clients email their receipts and statements.
  - Files were saved by hand, under names that say nothing.
  - Label the email, and the filing does itself.

**Process map (5 stages, 12 modules in Make), as in `gmail-attachment-filing-map.svg`:**

1. **Find new attachments:** Every 15 Minutes. Watch Emails Labelled To File (up to 10 per run). List Attachments. Keep Real Attachments (no Office documents, no empty parts, nothing 20 KB or smaller, such as signature logos).
2. **Name it with AI:** Upload File To Gemini. Gemini Names The File (a short, descriptive name, keeping the original extension).
3. **File and log:** Upload To Drive Folder. Add Row To Sheets Log (date, original name, new name, file type, link).
4. **Confirm once:** Gather New File Names. Any Files Saved? Send Receipt To Sender (each file as "new name (sent as old name)").
5. **If something breaks:** Gemini Or Drive Step Fails. Wait 15 Minutes. Retry Up To 3 Times.

**Facts ledger:**

- Runs every 15 minutes.
- Up to 10 emails per run.
- Files over 20 KB only.
- No Office documents.
- The original extension is kept.
- 5 columns logged per file.
- 1 receipt per email.
- 3 retries.

**Beats (about 24):**

1. Karan and the inbox.
2. Before: a folder of `scan001.pdf` files.
3. Leo labels his email.
4. Each stage in turn: the logo is dropped at the filter, the file gets its new name, the Sheets row is added, and Leo's receipt lands.
5. After: a tidy folder and a log.
6. Recap board.
7. Ending banner: "Label it once. It is named, filed and logged."

---

## Site changes (both projects)

- `src/content/case-studies/<slug>.mdx`, with `platform: 'Zapier'` / `'Make'`, `sampleClient: true`, and no `repoUrl`.
- Hero "build" image:
  - Zapier: the classic Zap canvas, zoomed to fit, all six paths visible.
  - Make: a screenshot of the scenario editor.
- Card and map SVGs are generated from new `docs/process-diagrams/diagrams.json` entries.
- Each project gets a film (`public/films/<slug>.mp4` and a `.jpg` poster).
- The Selected Work grid goes from 7 cards to 9.
