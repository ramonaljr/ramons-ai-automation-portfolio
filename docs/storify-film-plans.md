# Storify film plans — 7 case studies

One hand-drawn explainer film per case study, built with `/storify:storify`, rendered as MP4
(1080p, autoplay version, procedural soundtrack) and shown on each project.

**Rules that apply to every film**

- Facts come only from that case study's `.mdx`. Every number on screen is in its ledger below.
- Products (n8n, VAPI, Google Calendar, Airtable, Gmail, Slack, OpenAI, Groq, QuickBooks, Xero,
  Pipedrive, Apollo, Postgres, Google Drive/Sheets) appear only as **labelled props**: crates,
  shelves, signs, mailboxes. No logos.
- The fictional sample-client names (Braewick, Harbourline, TalentBridge, Casa Marindo, Voltara)
  are **left out**. The films are about the workflow.
- Characters' role hints are never shown on screen.
- Each film is ~2–2.5 min, 24–30 beats, and ends with a recap board plus a one-line ending banner.

**Output and placement**

- `public/films/<slug>.mp4`: web copy, compressed (target ≤ 8 MB each, ~50 MB for all seven)
- `public/films/<slug>.jpg`: poster frame
- inline `<video>` player on each case-study page, and `videoUrl` set so the **Walkthrough**
  button opens the film

Story types are spread out on purpose: 2 before-and-after, 3 how-it-works, 2 problem-and-fix.

---

## 1. AI Appointment Setter · `ai-appointment-setter`

- **Source kind:** case study
- **Type:** Before and after. The story is a change, from missed calls to a line that's always open.
- **Cast (2):** **Dennice**, the front desk, protagonist. **Leo**, a caller. The voice agent is a
  prop (a switchboard crate labelled "voice agent"), not a character.
- **Facts ledger:** 24/7 booking line open · 4 caller requests handled · 2 systems kept in step
  (Google Calendar, Airtable) · 5 n8n flows: check availability, book, reschedule, cancel,
  call results · nothing booked until details are complete and the time is confirmed free ·
  missing details → agent asks again instead of guessing · failed booking → plain explanation to
  the caller
- **Intro (THE JOB / THE PROBLEM / WATCH FOR):** Bookings come in by phone. / Calls after hours or
  at busy times go unanswered. / Watch five small flows answer every call.
- **Outline (27 beats):**
  - intro (3)
  - before · the phone desk (6): calls ring out, most callers never leave a voicemail, free
    times read aloud, bookings typed by hand, a reschedule means doing it all again, calendar and
    records drift apart (red)
  - turning point · the agent (4): the voice agent crate arrives, wired to 5 stations
  - after · any hour (7): Leo calls at night; check free times → offer alternatives → book →
    the event lands in Calendar *and* Airtable together; Leo moves it; a missing detail gets a
    question back; a call result is saved
  - result (3): board showing 24/7 · 4 requests · 2 systems in step
  - recap (4)
- **Ending (moral):** "A phone line that never sleeps, and a calendar that never disagrees with
  the records."

## 2. AI Invoice Processing & Approval · `ai-invoice-processing-approval`

- **Source kind:** case study
- **Type:** How it works. It's a 7-step pipeline, and the 3-way match is the heart of it.
- **Cast (2):** **Dennice**, accounts payable, protagonist. **Karan**, the budget owner who
  approves in Slack.
- **Facts ledger:** Gmail checked every 5 minutes · 2 duplicate checks (before and after the AI
  reads) · 3-way match: invoice, PO and delivery record · AI less than 80% sure → a person
  confirms · amounts within 2% of the PO and delivery record · retention held · lien waiver
  attached · approval waits up to 2 days · bills added to QuickBooks at the amount to pay after
  retention · 100% of invoices logged · missing vendors never guessed
- **Intro (THE SYSTEM / THE MYSTERY / WATCH HOW):** Construction invoices arrive by email. /
  Progress payments make it easy to pay twice, or pay too much. / Watch each invoice get checked
  before anyone approves it.
- **Outline (28 beats):**
  - intro (3)
  - overview (3): the mailbox, 7 stations on a dashed line, QuickBooks crate at the end
  - stage 1 · pick up (2): every 5 minutes, PDFs in
  - stage 2 · duplicates (3): the re-sent invoice is caught (puff)
  - stage 3 · AI reads (3): billing figures extracted; under 80% sure → Dennice confirms
  - stage 4 · 3-way match (4): invoice, PO and delivery record side by side; within 2%,
    retention, lien waiver (each one ticks)
  - stage 5 · approval (3): clean → Karan; with issues → AP; waits up to 2 days
  - stage 6 · post & log (3): bill into QuickBooks after retention, logged
  - recap (4)
- **Ending (key takeaway):** "Every bill is checked against the paperwork, and a person says yes
  before it's paid."

## 3. AI Prospecting with Apollo · `ai-prospecting-apollo`

- **Source kind:** case study
- **Type:** Problem and fix. One problem (manual, wasteful prospecting) and one fix (one form
  feeding a pipeline).
- **Cast (1):** **Dennice**, the sales rep. Prospects are paper cards with silhouettes (props).
- **Facts ledger:** one form · anyone already in the prospects sheet is skipped before Apollo
  credits are used · scored out of 100 by fixed rules · 60+ with a verified email waits for
  review · AI uses only facts from the company website · 0 emails sent without review · approved
  prospects into Pipedrive every 15 minutes, with the research pinned to a new deal · one Slack
  digest per run
- **Intro (THE SETUP / WHAT BROKE / WATCH THE FIX):** Every first email meant searching,
  checking and writing by hand. / Credits went on poor fits, and people were contacted twice. /
  Watch one form do the searching.
- **Outline (26 beats):**
  - intro (3)
  - symptom (5): hours searching, copying contacts, a second email to the same person (red),
    credits spent on poor fits (coins falling)
  - cause (3): every step done by hand, nothing checks the sheet first
  - fix (10): one form → Apollo search → known prospects skipped → enrich the best → rule score
    out of 100 with reasons → AI reads the website and drafts → Google Sheet queue (60+) →
    Slack digest
  - confirmed (2): Dennice approves; every 15 minutes the approved ones reach Pipedrive, nothing
    sent automatically
  - recap (3)
- **Ending (what to remember):** "The machine does the digging, and a person still decides who
  hears from us."

## 4. AI Unpaid Invoice Reminders · `ai-unpaid-invoice-reminders`

- **Source kind:** case study
- **Type:** Problem and fix. The core failure is chasing customers who'd disputed or promised.
- **Cast (2):** **Dennice**, collections, protagonist. **Isa**, a customer who disputes an
  invoice.
- **Facts ledger:** runs every morning · data from QuickBooks, Pipedrive and Postgres · policy rules
  decide who is reminded and how firmly, never AI · AI writes the wording within policy · 1 row
  per invoice enforced by the database (no double sends) · 30+ days late → account owner told in
  Slack with a Pipedrive task first · 7 reply types understood · 0 reminders during a dispute ·
  a dispute stops reminders until a person clears it (no timer, no automatic restart)
- **Intro (THE SETUP / WHAT BROKE / WATCH THE FIX):** Overdue invoices need a reminder. /
  Customers who had disputed or promised kept getting chased. / Watch rules decide and replies
  get read.
- **Outline (27 beats):**
  - intro (3)
  - symptom (5): reminders pile up on one invoice and none on another, Isa disputes, the next
    reminder goes out anyway (alert), replies sit unread
  - cause (2): no rules on who to chase, nobody reading the replies
  - fix (11): morning run pulls three shelves → rules gate (who and how firm) → AI writes inside
    the rules → sent and recorded, 1 row per invoice → 30+ days → account owner warned first →
    replies read: Isa's dispute **stops everything** (red stop sign), other reply types set the
    next date
  - confirmed (2): Isa gets no more reminders until a person clears it
  - recap (4)
- **Ending (what to remember):** "Rules decide who gets chased, and a dispute stops the chase
  until a person steps in."

## 5. New Employee Onboarding · `hotel-employee-onboarding`

- **Source kind:** case study
- **Type:** How it works. A process with a 30-day timeline. A day tracker sits top-center
  (−7 · 0 · 3 · 7 · 30).
- **Cast (2):** **Myk**, HR, protagonist (the role matches the casting hint, which isn't
  shown). **Unix** (she), the new hire.
- **Facts ledger:** one form · missing details stop the run and alert HR · Drive folder, employee
  record, Day 1 orientation, Slack message to IT and the shift manager, welcome email · every task
  and document is its own Airtable row with an owner and status · daily check at 8:00 · at most 1
  email a day · 5 check-in milestones: day −7, 0, 3, 7, 30 · 30 days followed up · IT chased for
  access and key cards · HR assistant answers only from uploaded policy, and says when policy
  is silent
- **Intro (THE SYSTEM / THE MYSTERY / WATCH HOW):** Every new hire needs the same setup. /
  Documents get chased by hand, and key cards get forgotten. / Watch one form carry a new hire
  through 30 days.
- **Outline (28 beats):**
  - intro (3)
  - overview (2): Myk's form board, the day tracker
  - stage 1 · the form (3): an incomplete form stops early (red), the complete one builds the plan
  - stage 2 · set up (4): folder, record, orientation, IT message, welcome email pop in
  - stage 3 · tracked rows (2): tasks become rows with owners
  - stage 4 · the daily check (6): 8:00 clock; tracker steps −7 → 0 → 3 → 7; at most 1 email a
    day; Unix uploads a document and its reminder ends; IT chased for her key card
  - stage 5 · ask HR (3): Unix asks a question; the answer comes from the policy book; a
    question the policy doesn't cover → "ask the People Team"
  - day 30 · closed (2): everything in, onboarding complete
  - recap (3)
- **Ending (key takeaway):** "One form sets everything up, and the first 30 days follow
  themselves up."

## 6. HR Evaluation & Job Posting Assistant · `hr-evaluation-assistant`

- **Source kind:** case study
- **Type:** Before and after, from inbox-and-spreadsheet hiring to 5 automated stages.
- **Cast (3):** **Myk**, the hiring team, protagonist (same face as film 5, for consistency).
  **Samantha**, an applicant. **Carlos**, the interviewer.
- **Facts ledger:** 5 hiring stages, each with its own AI step · CV saved to Google Drive,
  applicant logged in Airtable · AI (Groq) reads the CV against the matching job posting in
  Airtable · shortlisted *and* declined both recorded · role-specific questions written by AI
  (OpenAI) · personal invite written by AI (Groq), sent from Gmail · interview created in Google
  Calendar · screening questions prepared by AI (OpenAI) · every AI step returns a fixed format ·
  100% of applicants screened and recorded · 0 invites written by hand
- **Intro (THE JOB / THE PROBLEM / WATCH FOR):** Every application means reading a CV against the
  job post. / Strong applicants wait days, and interviewers walk in unprepared. / Watch an
  application become a booked interview.
- **Outline (28 beats):**
  - intro (3)
  - before · the inbox (6): a CV pile, generic emails, scheduling back-and-forth (emails flying),
    Carlos with no questions (puzzled), records scattered across three places
  - turning point (2): the five-stage line appears
  - after · five stages (11): Samantha applies → CV filed, scored against the real job →
    shortlisted (a declined card is recorded too) → role questions on the next page → personal
    invite → interview in the calendar → Carlos gets screening questions (happy)
  - result (3): board with 5 stages · 100% recorded · 0 invites by hand
  - recap (3)
- **Ending (moral):** "Every applicant gets an answer fast, and every interviewer walks in ready."

## 7. Lead Scoring & Follow-Up · `solar-lead-scoring-follow-up`

- **Source kind:** case study
- **Type:** How it works. A 9-step pipeline with a 15-minute clock as the payoff; a timer tracker
  sits top-center.
- **Cast (3):** **Dennice**, the sales rep, protagonist. **Jeson**, a business owner who sends an
  enquiry. **Karan**, the sales manager (the backstop).
- **Facts ledger:** reply to the form in under 1 second · Airtable checked for existing customers
  and repeat enquiries from the last 24 hours · AI reads the message and never guesses · score out
  of 100 by fixed rules, with reasons · the rep assigned least recently gets the lead · saved with
  a 15-minute deadline · rep tagged in Slack with the score and site details · AI reply never
  mentions prices, savings or system sizes; a standard reply goes out if the AI fails · check every
  5 minutes · not followed up within 15 minutes → reassigned to the sales manager · duplicates only
  logged
- **Intro (THE SYSTEM / THE MYSTERY / WATCH HOW):** Businesses ask about rooftop solar on the
  website. / Good leads go cold in an inbox, and some are never called back. / Watch every lead
  get a person within 15 minutes.
- **Outline (28 beats):**
  - intro (3)
  - overview (2): the website mailbox, the stations, the 15-minute clock
  - stage 1 · instant reply (2): under 1 second, "received"
  - stage 2 · do we know them? (2): Airtable shelf check; a repeat enquiry is only logged
  - stage 3 · AI reads (2): roof, ownership and electricity details lifted out, nothing guessed
  - stage 4 · score by rules (3): points add up to /100 with reasons listed
  - stage 5 · assign and reply (4): least-recently-assigned rep → Dennice; personal reply with no
    prices; Slack tag
  - stage 6 · the 15-minute check (5): the clock ticks; a lead with no follow-up → Karan takes it;
    checked every 5 minutes
  - recap (5)
- **Ending (key takeaway):** "No lead waits in an inbox. Within 15 minutes someone owns it, or
  the manager does."

---

## Revision (2026-10-19): expanded with each project's process map

At Ramon's request the films now follow each case study's process map
(`public/images/workflows/<slug>-map.svg`) instead of a 5–6 box summary:

- After the story beats, an **overview board** shows the whole map: every lane, every node.
- Then one **hanging lane board per lane**, in the map's lane order and colours, with every
  node named as on the map and the **same 1–15 numbering**. A token travels node to node.
- **Every numbered step gets its own beat**: the camera closes in, the narrator walks under
  it, and the board's footer shows the map's own description of that step, word for word.
- Yes/no checks show their "no" path (e.g. `missing → ask again`); the
  **If something breaks** lane is included where the map has one.
- Ends with the whole map running, then the stats board and recap.
- Length: about 3 minutes each (was about 2). Rendered at 720p for the web.
- Real product logos are still not drawn (plugin rule); each node uses a hand-drawn icon
  with its name.
