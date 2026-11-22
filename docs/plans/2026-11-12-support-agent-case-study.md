# Plan: AI Customer Support Agent case study

Date: 2026-11-12. Status: draft, waiting on the choices at the end.

## Locked order (2026-11-12, after checking Upwork and Fiverr)

1. **AI Customer Support Chatbot**: web chat (live demo on the case-study
   page) plus WhatsApp (Meta test number, filmed). Email added later on the
   same agent. RAG for policies and products, tools for live order data,
   Slack approval, human handover.
2. **Agent platform**: the "second track" below, reusing project 1's
   workflows as guarded tools.

Market check: support chatbots across web and WhatsApp with RAG and handover
are the most common "AI agent" request on both sites, and the portfolio's
biggest gap. Fiverr prices for n8n builds run about $250 to $2,000, tiered by
channels and integrations; package the gig the same way (one channel, then
WhatsApp, then CRM or email).

## Why this one

Upwork's AI agent postings cluster around four kinds of work: voice agents,
CRM and lead agents, outreach agents, and customer service agents. The
portfolio already covers the first three (AI Appointment Setter, Voltara,
Harbourline). Customer service is the gap, and it is the most common "set up
an AI agent" request.

Clients usually mean "a controlled workflow with tools and human review"
when they say agent. The case study should prove exactly that: the agent
handles routine questions on its own, asks a person before anything that
costs money, and hands angry or risky emails straight to a human.

## The fictional client

An online store with real support volume: order status, shipping delays,
returns, refunds, wrong items, and product questions. A working name is
**Fernhill Outdoor Supply**, a small outdoor gear shop (name to be checked
against real businesses before use). Labelled as a sample client, like the
other nine.

## What the agent does

1. **A customer email arrives** (Gmail trigger, test inbox only).
2. **It works out what the customer wants**: order status, return, refund,
   wrong or damaged item, product question, complaint, or other.
3. **It looks things up with tools.** It finds the order and the customer's
   history, checks tracking, and reads the store policies (returns window,
   refund rules, shipping times).
4. **It decides what to do**, as structured output: the category, the
   proposed action, a draft reply, and how sure it is.
5. **Fixed rules decide whether it may act alone.** The AI only proposes;
   the rules have the final say, the same split Voltara uses for scoring.
   - **Send automatically:** order status, tracking, and policy answers,
     when the AI is confident and no money is involved.
   - **Ask a person first:** refunds, replacements, discounts, anything over
     a set amount, or low confidence. A Slack message shows the draft with
     Approve, Edit and Reject.
   - **Hand straight to a person:** angry customers, legal or chargeback
     words, safety issues, or a third message on the same problem.
6. **It remembers the conversation.** Replies stay in the customer's email
   thread, and the agent reads the earlier messages.
7. **It logs every case**: what was asked, what it did, who approved it,
   and how long it took. A daily Slack summary covers volume, auto-answered
   share, and waiting approvals.
8. **Failure path:** any error alerts Slack and leaves the email unread for a
   person, so nothing is lost silently.

## The test set (the selling point)

Thirty sample customer emails, each with the expected outcome (send / ask /
hand over, plus category). They include tricky cases: a refund demand dressed
as a status question, a polite legal threat, a customer writing in another
language, an order number that does not exist, two orders in one email.

A small test workflow runs all thirty and scores the agent. The case study
quotes the real result, whatever it is ("28 of 30 on the first run; the two
misses and how the rules were changed"). Never a made-up number.

## What gets built

| Piece | Where |
|---|---|
| n8n workflow, plus the test-set runner | Hosted n8n, Project Portfolio folder, inactive when finished |
| Store data: orders, customers, policies | Depends on choice 2 below |
| Case-study page | `src/content/case-studies/ai-customer-support-agent.mdx` |
| Interactive demo | `src/content/demos/*.layout.json` + `src/lib/demos/*.ts` |
| Process map and build image | `public/images/workflows/` (new files only) |
| Film | Optional; Storify film like the other ten |
| Public repo | `ramonaljr/n8n-ai-customer-support-agent`, sanitised per the repo rules |
| Upwork project image | `docs/upwork/`, clean (no watermark) |
| Blog post (optional) | "When an AI agent beats a workflow, and when it doesn't" |

Categories: `['Customer Service', 'AI Agents']`.

## Build order

1. **Data and policies:** test store, orders, customers, policy document.
2. **Agent workflow:** happy path first (order status, sent automatically).
3. **Rules and approvals:** Slack approval, hand-over, logging, error path.
4. **Test set:** 30 emails, the runner, score, fix, re-run.
5. **End-to-end test** on the hosted n8n with real Gmail and Slack, then
   clean up test data and leave it inactive (as with the other case studies).
6. **Site:** case-study page, demo, process map, build image.
7. **Repo and Upwork image.** Film and blog post last, if wanted.

Steps 1 to 5 are mostly n8n work; 6 and 7 are site work, verified in the
browser before committing.

## Rules carried over

- Portfolio versions never email real customers: + addresses only.
- Frontmatter strings are single-quoted YAML; apostrophes are doubled.
- No automation claims attached to past employment.
- New images only; existing landing images are read-only.
- Verify the page and demo visually before committing.

## Second track: agent platforms (added after an Upwork example)

Some postings ask for something different: setting up and managing
always-on agent platforms (xAI's Grok Bot, Hermes Agent, n8n's Nod) and
connecting them to n8n, Make or Zapier and the business's CRM. Example:
"Set up, configure, and manage AI tools such as Grokbot and similar AI
agents ... proficiency with n8n, Make, or Zapier."

A matching case study: **an AI teammate on the client's own server.**
Hermes Agent (open source, MIT) runs on the Hostinger VPS and talks to the
team in Telegram or Slack. Its risky actions are not done by the agent
directly: they are n8n workflows, offered to it through n8n's MCP server,
each with its own approval step and log. The agent decides; n8n does the
guarded work.

This reuses the support-agent workflows as tools, so it is cheaper to
build second than first.

Correction (2026-11-12): n8n's own banner describes Nod as "a new
open-source personal agent with its own computer", offered as a separate
download. So Nod is not built into the hosted n8n; it would connect to the
Fernhill workflows the same way Hermes or Grok would (n8n MCP server or
webhooks). Check Nod's docs before choosing it for project 2.

## Decided (2026-11-12)

Online outdoor store, Airtable for orders and customers, OpenAI, web chat
plus WhatsApp first. The second track stays second.

## Step 1 done (2026-11-12): store data

- **Airtable base** "Fernhill Outdoor Supply" `appw1yUrOEX5UPzzV` (n8n
  credential: Airtable PAT 2 `vB62L7Ns9ZgjqyKL`):
  - Customers `tblwslf6FlKZXlfl3`: 12 rows, + addresses
    (`ramonvallejerajr+fh-<name>@gmail.com`), fictional 555 phones.
  - Products `tblg9G1cZjeHiMhXv`: 12 rows; Basecamp 4P is out of stock.
  - Orders `tbl8MydRn21KV4Jvj`: 25 rows (FH-1001 to FH-1025), linked to
    Customers, every status covered: 9 Delivered (FH-1001, FH-1020 outside the
    30-day window), 5 Shipped, 3 Delayed (FH-1025 lost in transit),
    4 Processing (FH-1011 backordered), plus Return Requested, Returned,
    Refunded, Cancelled. FH-1016 ($816) is the high-value refund case.
  - Support Cases `tblgrQcMnm2iHFQJG`: empty, the agent's log.
- **Policies and product FAQ:** Google Doc
  `1ZwBnuqmVhu7xAfInCARZxHzfpudaIDkVyQjbBpPrcJw`; source in
  `docs/fernhill/store-policies.md` (edit both together).
- Dates are fixed around 2026-11-12, so return-window answers drift as time
  passes; re-date the orders before recording the demo or film.

## Step 2 done (2026-11-12): chat agent

- **Workflow** "Fernhill Outdoor Supply - AI Customer Support Agent"
  `WkHI3pEDcVumGg6o`, Project Portfolio folder, 18 nodes, left inactive.
- **Entry:** `POST /webhook/fernhill-support-chat` (Portfolio Webhook Key
  header) with `{sessionId, message, channel: web|whatsapp|email}`; replies
  `{ok, sessionId, reply}`. Memory is keyed `channel:sessionId`.
- **Agent:** OpenAI gpt-5.4 (temperature 0.2), 12-message memory. Tools: Look
  Up Order (Airtable; needs order number AND email, both sanitised inside the
  formula), Check Product Stock, Search Store Policies (in-memory vector store
  `fernhill_policies`, reloaded from the Google Doc on start, publish and
  update, or by the manual trigger).
- **Tested live, all passed:** order status (FH-1004, FH-1022), wrong email
  refused without hinting (FH-1016), delay explained from Notes (FH-1007),
  return window refused (FH-1001), faulty-item refund handled without a
  promise (FH-1016), boot sizing and out-of-stock tent, prompt injection
  refused, Spanish answered in Spanish (FH-1019), chargeback plus third message
  triggered handover wording.
- **Not wired yet (step 3):** handover and refund requests are only said, not
  sent: no Slack approval, no Support Cases log, no error path.

## Step 3 done (2026-11-12): approvals, handover, log, alerts

Workflow `WkHI3pEDcVumGg6o` is now 44 nodes, still inactive.
- **Request Team Action** tool (calls this same workflow). Fixed rules in
  "Apply Rules": money requests (refund, replacement, exchange, cancellation,
  price adjustment, discount) on a re-verified order go for approval;
  everything else, or an unverified order, is handed to a person.
- **Approval** runs in its own execution ("Start Approval (Don't Wait)"), so
  the chat answers at once. Slack posts to #all-ramons-war-room with a
  **form** (Decision: Approve/Reject, optional note), not plain link buttons:
  on 2026-11-12 a plain Approve link was opened automatically 7 seconds after
  posting and approved a discount nobody had approved. A form needs a real
  submit. After the decision: case updated, customer emailed (only
  `+fh-` test addresses pass the "Test Address Only?" check).
- **Support Cases log:** one row per conversation, upserted after the reply
  is sent; escalations set Decision and Status, which the logger never
  overwrites. **Agent error** posts a Slack alert. **Daily 17:00 summary**
  posts volume, share answered alone, approvals, handovers and what waits
  (logic tested with sample rows; the schedule has not fired yet).
- **Tested live:** tent refund FH-1016 (approved, email sent), discount
  FH-1012 (rejected via the form, email sent), lost parcel plus chargeback
  FH-1025 (handover), stove burn FH-1017 (safety handover).
- Test rows web:s3a to web:s3e are left in Support Cases as demo state.
- **Same flaw elsewhere:** Braewick's three sendAndWait nodes still use link
  buttons (Ask Team To Check Details, Review Invoice With Issues, Approve
  Clean Invoice).

## Step 4 done (2026-11-12): the 30-case test set

- **Runner** "Fernhill Outdoor Supply - Support Agent Test Set (30 cases)"
  `y2lMdeP2NzlTU7nT`, Project Portfolio folder, inactive. Manual trigger, or
  `POST /webhook/fernhill-test-run` (Portfolio Webhook Key) while active; the
  agent workflow must be active too.
- **Cases:** 8 order status (incl. digits only, French, Spanish, two orders),
  5 security (wrong email, unknown order, missing email, prompt injection,
  refund on someone else's order), 7 policy and product, 6 money requests that
  need approval, 4 straight handovers (legal threat, injury, angry, third
  message). Each case lists allowed outcomes, phrases that must appear, and
  phrases that must not.
- **Scoring reads what happened, not the wording:** the agent's reply now
  carries `escalation` (approval / handover / null) and `tools`, taken from
  its intermediate steps. Test runs send `test: true`, so escalations are
  logged but never reach Slack or an inbox; their Support Cases rows are
  deleted at the end of each run. Results go to Airtable **Test Results**
  `tbltCMj1BLG12D6Ln` (one row per case per run) and a score to Slack.
- **Real results:**
  - Run 1 (20261112-0210): 27 of 30. Two misses were scorer bugs (the agent's
    curly apostrophe in "couldn’t" did not match "couldn't"); one was real:
    the Basecamp 4P answer left out the December restock date, because the
    stock tool did not return product descriptions. Fixed both.
  - Run 2 (20261112-0212): 30 of 30.
  - Run 3 (20261112-0214): 30 of 30 (repeat to rule out luck).
  - Outcome mix in runs 2 and 3: 20 answered alone, 6 sent for approval,
    4 handed to a person.
  - Simplified the workflow (46 to 39 working nodes; same behaviour; laid
    out in six labelled sections with sticky notes, like Braewick).
  - Run 4 (20261112-0220), simplified workflow: 29 of 30. Real miss: case 5
    asked for the order number although "FH-1009" was in the message. Prompt
    now says any FH-1234, fh1234 or 4-digit number is the order number.
  - Run 5 (20261112-0223): 30 of 30.
- Honest case-study line: "27 of 30 on the first run; after fixes, 30 of 30
  in three of the four runs since (the other 29 of 30)."

## Choices (original options, kept for the record)

1. **Store type:** online store (recommended), SaaS subscription, or hotel.
2. **Order data:** Shopify development store (free, closest to real Upwork
   jobs, but you create the Shopify Partner account) or Airtable store
   (fastest, no new accounts).
3. **AI model:** OpenAI, as in the other case studies, or Claude, which
   Upwork posts increasingly name and which would broaden the portfolio.
4. **Channel:** decided: website chat plus WhatsApp first, email later.
   Same agent, same tools and rules behind every channel. Mind WhatsApp's
   24-hour window: later follow-ups need an approved template.
