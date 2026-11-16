# Fernhill AI WhatsApp Support Agent: standard test procedure

Workflow: **Fernhill Outdoor Supply - AI Customer Support Agent** (`WkHI3pEDcVumGg6o`, 79 working nodes in 8 numbered sections) on n8n.ramonvallejera.com.
Test kit: `docs/fernhill/tests/`. Every case below has a fixed input and a pass rule. A run passes only when every case passes.

## When to run

| Change | Run |
|---|---|
| Any publish of the workflow | **P1** (always: publishing re-registers the WhatsApp webhook with Meta) |
| Agent prompt, tools, policy document, Apply Rules | P1, I, L1 (30-case set) |
| Chat model or the keyword router (`tests/model_router.txt`) | M, then L1 |
| New-chat greeting or customer details (prompt section, Save Customer Details, Find Open Handover) | P1, I, then L1 and L2 when OpenAI credits allow |
| Anything in sections 1, 3 or 4 (live chat, Slack thread, close, handover rules) | P1, U, L2 |
| Anything in section 0 (duplicates, bursts, photos, voice notes) | P1, D, L3 |
| Before showing the build to a client or updating the case study | Everything, including L3 |

## The process being tested

1. **Customer writes on WhatsApp** (section 0). A message id WhatsApp has already delivered is skipped (n8n data table "Fernhill - WhatsApp Messages", cleared of ids older than 7 days at 17:00). Text waits 4 seconds: if the customer sent several messages in a row, they are joined and answered once. A photo is saved to Drive and the agent gets the link. A voice note, sticker or file becomes a short note, so the bot asks the customer to type (or, during a handover, the team sees it).
2. **The agent answers** (section 1) from the policy document, order records (only when order number and email match) and stock. The reply goes back on WhatsApp, then the conversation is logged (section 2).
3. **Money requests or upset customers go to a person** (section 4). Fixed rules decide. Refunds on a verified order go to Slack for approval (section 5). Everything else is handed over, and one Slack post tells the team (with the customer's WhatsApp name).
4. **WhatsApp handover = live chat in a Slack thread** (section 3). The bot goes silent. Customer messages appear in the case thread, thread replies go to the customer, and `close` ends it and hands back to the bot. If the order wasn't verified, the bot asks once for the order email, and the workflow checks the customer's answer against the order and saves it on the case.

## Layers and cases

### P1 · Post-publish check (live, about 1 minute)
| ID | Step | Pass rule |
|---|---|---|
| P1 | After publishing, send any WhatsApp message to the Fernhill number | A new run starts with **WhatsApp Message In** within 10 s. If not, open Meta → WhatsApp → Configuration and check the callback URL. |

### D · Duplicate messages (about 1 minute)
| ID | Step | Pass rule |
|---|---|---|
| D1 | Insert a row with id `wamid.TEST-ALREADY-SEEN` into the data table. Send it plus a new id through a temporary copy of **New Message?**. Delete the copy and the row afterwards. | Only the new id passes |
| D2 | The P1 live message | The run goes **New Message? → Remember Message → Continue With Message**, and the message id is now in the data table |

### U · Unit: Slack reply parser (offline, 1 second)
`python3 export_node.py && node read_team_reply.test.js read_team_reply.js`

| ID | Input | Pass rule |
|---|---|---|
| U1 | Plain reply in a case thread | Relayed, not a close |
| U2 | The workflow's own relay post (has `bot_id`) | Ignored (prevents a loop) |
| U3 | Join or edit event | Ignored |
| U4 | Top-level channel message | Ignored |
| U5 | The thread's parent post | Ignored |
| U6 | `close` | Closes with the default message, which starts "Your case is now closed." |
| U7 | `Close.` | Closes |
| U8 | `close: Sorted, thanks!` | Closes with "Sorted, thanks!" |
| U9 | `Closing in on it, one sec` | **Not** a close |
| U10 | `close to done` | **Not** a close |
| U11 | Slack link and email markup | Unwrapped to plain text |
| U12 | Blank text | Ignored |
| U13 | `close *Sent using* Claude` and other app footers | Footer stripped; the close still works |

### I · Offline: new-chat intake (1 second, no OpenAI credits)
`python3 export_intake.py && NODE_PATH=<folder holding luxon> node intake.test.js`. Install luxon once outside the repo, for example `npm install --prefix /tmp/fh-luxon luxon@3`, then use `NODE_PATH=/tmp/fh-luxon/node_modules`.
It runs the live workflow's own expressions (prompt section, **Save Details On Case**, **Details Saved**, **Person Has This Case?**, **Apply Rules**, **Log Case** email) against fake Support Cases rows. It checks the logic, not the model's wording, so L1 is still needed for that.

| ID | Input | Pass rule |
|---|---|---|
| I1 | No case row (first message ever) | New chat; asks for name, email and order number (if you have one) |
| I2 | Last message 2 hours ago | Same chat; no question |
| I3 | Last message 13 hours ago | New chat |
| I4 | First message after a close, email and order on file | New chat; asks only "Could you share your name?" |
| I5 | Second message after a close | Same chat |
| I6 | New chat, all three on file | Greets by name, asks nothing |
| I7 | Name on file only | Asks for "your email address and your order number (if you have one)" |
| I8 | Website chat | No intake section in the prompt |
| I9 | Any new chat | The prompt says a handover reply comes first |
| S1 | Matching order | Name (trimmed), FH-1001 and lower-case email saved |
| S2 | Email that doesn't match the order | Email not saved; the agent is told |
| S3 | Email, no order (pre-sale) | Email saved |
| S4 | Order given as `1001` | Saved as FH-1001 |
| S5 | Name only | Email and order left as they are |
| S6 | `maya@` | Not saved |
| S7 | Website chat | Nothing saved |
| R1–R4 | Open handover / closed / test mode / no row | Only R1 goes to the team |
| A1 | Handover with an email on file | No email question; the email is kept |
| A2 | Handover, no email | Asks once for the order email |
| A3 | Log Case with no email | Leaves the saved email alone |

### M · Offline: model router (1 second, no OpenAI credits)
`python3 export_intake.py && node model_router.test.js`. The chat model's name is the expression in `tests/model_router.txt`: risky messages (refunds, returns, approvals, damage, legal, safety, anger, repeat contacts, asking for a person, "!!", SHOUTING) go to **gpt-6.1-terra**, everything else to **gpt-6-luna** (gpt-5.4 and gpt-5.4-mini until 2026-11-16). The test runs that file against the 30 L1 messages and two held-out sets, and fails if the live workflow's expression differs from the file. When you add words, write new held-out cases **before** you change the list, and record the first score. Edit the file, then copy it into the workflow (OpenAI Chat Model → Model → By ID).

### L1 · Agent behaviour: 30-case test set (about 2 minutes)
Activate workflow `y2lMdeP2NzlTU7nT`, then run `python3 webhook.py fernhill-test-run '{}'`, then deactivate it again.
Pass rule: **30 of 30**. The score posts to Slack, and each case is saved to Airtable **Test Results**. The cases cover order lookups (with and without matching email), stock, policies, refunds (approval), angry customers and legal threats (handover), and prompt-injection attempts. Test conversations are deleted after scoring.

### L2 · Handover chat end to end (simulated customer, about 3 minutes)
The customer is simulated as WhatsApp number `15550001001` through the chat webhook (`python3 handover_e2e.py send "<message>"`). Slack steps are thread replies on that case's post. `python3 handover_e2e.py wait <UTC time>` shows the run they trigger. The number cannot receive WhatsApp messages, so H3 and H4 also prove that a refused message is reported in Slack.

| ID | Step | Pass rule |
|---|---|---|
| H1 | Customer: "I want a real person now. Order FH-1001 never arrived, this is the third time I'm asking and I'm furious." | Reply says a person will reply **here on WhatsApp** and asks **once** for the email on the order. Case post shows "Email: not given yet". Escalation `handover`. A Slack case post appears. Support Cases row: Status Open, Decision Handed Over, Slack Thread set. |
| H2 | Customer: "Any update on my order?" | The agent does **not** run. The message appears in **that case's thread** as "Customer: …". |
| E1 | Customer: "It's jane.doe@example.com" (wrong) | Relayed to the thread, then ⚠️ "does not match order FH-1001, so it was not saved". The case email stays empty. |
| E2 | Customer: "Sorry, it's Maya.Thornton@example.com" (correct; case-insensitive) | ✅ "matches order FH-1001 and is saved on the case". The case's Customer Email is set. |
| E3 | Customer: "Or use my work one, maya@work-example.com" | Relayed only. The saved email is **not** replaced. |
| H3 | Slack thread reply: "We're checking with the courier now." | **Send Team Reply** runs. With the test number WhatsApp refuses it, and a ⚠️ "WhatsApp refused that reply…" appears in the thread and names the saved email ("Email the customer instead at maya.thornton@example.com"). |
| H4 | Slack thread reply: `close: Your replacement ships today.` | Row Status Closed, Resolved set. A closing message is attempted on WhatsApp, and the thread gets ✅ "Case closed…" (naming the email when WhatsApp refuses the closing message). |
| H5 | Slack thread reply after the close | 🔒 "This case is already closed…" appears. **No** WhatsApp send. |
| H6 | Customer: "Thanks. Also, do you ship to Canada?" | The agent answers again from the policy. No handover, and no claim that a person will reply. |
| H7 | Same handover message with `test: true` | Logged as `test:whatsapp:…`. **No** Slack post and no thread. (This protects the live site demo.) |
| H8 | Reply in a non-case Slack thread | Matched to no case, and nothing is posted. |
| H9 | Test-mode customer asks for a manager 6 times in a row | The tool is called **every** time (no "I've escalated this again" without a real escalation). |

### L3 · Live checks on a real phone (about 5 minutes)
These need Meta's signed webhook, so they can't be simulated.

| ID | Step | Pass rule |
|---|---|---|
| R1 | Send a text question | Answer on WhatsApp within about 10 s |
| R2 | Send a photo of a "damaged item" | Saved to Drive folder "Fernhill - Customer Photos (WhatsApp)". The reply mentions it. |
| R3 | Send a voice note | The reply asks the customer to type instead |
| R6 | Send three short messages within 4 seconds of each other | **One** reply that answers all of them |
| R4 | Trigger a handover, then reply in the Slack thread | Case post shows your **WhatsApp name**. The thread reply arrives on the phone and gets a ✅ reaction in Slack. |
| R5 | `close: …` in the thread | Closing message arrives on the phone. The bot answers the next message. |

## Client setup (outside the build)
WhatsApp only allows free-form replies within 24 hours of the customer's last message. Replying later needs a message template that Meta approves for the client's own WhatsApp Business account. Until a client has one, the workflow tells the team in the thread and gives them the case email to use instead (H3, H4).

## Results

### Run 6: 2026-11-16, closing message says the case is closed

**Change.** The default closing message (plain `close` in the case thread) was "Thanks for your patience. Our team has marked this as resolved…", which never said the case was closed. **Read Team Reply** now sends: "Your case is now closed. Thanks for your patience. If you need anything else, just message us here and we'll help." `close: your own words` still replaces it. Before the change, both live closes on 2026-11-15 (163551, 163583) were sent, delivered and read on Ramon's phone, so the WhatsApp step itself was working.

| Layer | Result | Notes |
|---|---|---|
| U | **13 / 13** | `read_team_reply.test.js`; U6 now checks for "case is now closed". The local `read_team_reply.js` matches the live node exactly. |
| P1 | **Not run** | Published 2026-11-16 09:58 UTC ("Reload Policies On Start" ran, 163604). Ramon skipped the phone test, so the WhatsApp webhook was not re-confirmed after this publish. |

### Run 6: 2026-11-16, new-chat question in code, Forget Old Chat, GPT-6 models (87 → 88 nodes)

Phone tests while following the Loom script showed three problems, fixed live:
- **F13 (build):** the new-chat question was still left to the AI, and mini sometimes copied an older answer from its memory and asked for an order number the customer had just given. **Check Reply** now adds the greeting and the question in code, skipping details already on the case or in the message (an email address, or an order number like FH-1001). Offline check of 6 cases, then phone test 163668.
- **F14 (build):** on a new chat the bot still remembered the previous chat and handed a calm customer to a person (163694). A new node, **Forget Old Chat** (memory manager on the same Conversation Memory), clears that customer's memory at the start of a new chat.
- **F15 (build):** the Slack handover showed the WhatsApp profile name, not the name the customer gave. `customer_name` and **Pass Message To Team** now prefer the case's Customer Name.

**Models:** Ramon switched the router to **gpt-6-luna** (routine) and **gpt-6.1-terra** (risky). GPT-6 models reject `temperature`, so that option was removed (163690 answered after). Layer M 43/43 and layer I 23/23 on the new expression. **L1 was not re-run on the GPT-6 models** (Ramon chose to save the OpenAI budget), so the 30/30 scores above are for gpt-5.4 / gpt-5.4-mini.

### Run 5: 2026-11-15, after adding the new-chat greeting and customer details (83 → 87 nodes)

**Change.** At the start of every WhatsApp chat (the first message from a number, a message after 12 hours of quiet, or the first message after a case was closed) the bot greets the customer, answers their question, and asks for their name, email and order number "if you have one". It asks only for details not already on file, and never again in the same chat. A handover still comes first (only its one email question is asked). The new agent tool **Save Customer Details** records what the customer gives on their Support Cases row (new column **Customer Name**, plus **Customer Email** and **Order Number**). It reuses **Verify Order**: an email is saved only when it matches the order given, or when no order was given. The website chat is unchanged. **Find Open Handover** now reads the customer's case row every time, and **Person Has This Case?** checks Handed Over + Open itself. **Log Case** no longer blanks a saved email or order number. Airtable view **Open cases**: Status = Open, sorted by Last Activity (oldest first, so the longest-waiting case is on top).

**Test setup change:** before L2, delete the `whatsapp:15550001001` row in Support Cases. Escalations no longer clear the saved email, so an old row would skip H1's email question and break E1.

| Layer | Result | Evidence |
|---|---|---|
| U | **13 / 13** | `read_team_reply.test.js` |
| I (new) | **23 / 23** on the final build | `intake.test.js` against the live workflow, run while OpenAI had no credits. A broken copy (20-hour gap, website guard removed) failed I3, I7 and S7, so the test does catch regressions. |
| L1 | **30 / 30** on the first build (162903, 162957); **not yet re-run cleanly on the final prompt** | Final-prompt runs 163051 (29/30: #8 printed a raw two-order tool call instead of running it) and 163094 / 163194 (3/30: every failure was `OpenAI: Rate limit reached`, not the change) |
| L2 | **H1, E1, E2, E3, H4, H6 pass** | H1 163025/163026 (email asked once, no extra intake question, "Email: not given yet"), E1 163028, E2 163031, E3 163034, H4 163039, H6 163041 and 163048 (after the close it asks only for the missing name), 163050 (next message: no re-ask) |
| Intake (new) | Pass | Test mode: new number "Hi there" → greeting asks for all three; details saved with a matching email (162896); wrong email for FH-1001 not saved, agent told (162899); a later name-only save kept the order number (162901); pre-sale "Do you ship to Canada?" answered, then asked (162902); website chat never asks (after F7) |
| P1 | **Webhook pass, greeting not yet seen** | Live "Hi" from Ramon's phone started run 162949 within seconds. It went to Slack because his number still had an open handover; his `close` was posted top-level (ignored by design, U4), so the case is still open. |

**Found and fixed in run 5:**
- **F7 (prompt):** the intake rules sat in the prompt as plain text, so the website agent greeted and asked for details too (seen in L1 162903 replies). The whole section is now rendered only for WhatsApp, and **Save Details On Case** writes nothing for non-WhatsApp channels.
- **F8 (prompt):** after a closed case the bot answered without asking for missing details (H6, 163041). The new-chat instruction now says "THIS MESSAGE STARTS A NEW CHAT" and spells out the exact question from the missing fields.
- **F9 (build):** a closed case kept counting as a new chat on every message. "Closed" now counts only while nothing has been logged since the close (Last Activity within 5 s of Resolved).

**Open:** the OpenAI account ran out of credits on 2026-11-15 at about 16:02 UTC ("You have no credits remaining", which n8n shows as "Rate limit reached"). Every message fails, the live bot included: each customer gets the holding reply and #operations gets a "failed to answer" alert. Ramon decided not to add credits for now, so the intake was verified offline instead (layer I, 23/23), plus the earlier live smoke tests (162894–162902, 163038) from before the credits ran out. To keep costs down, the chat model was switched from **gpt-5.4** to **gpt-5.4-nano** (OpenAI's cheapest) on 2026-11-15. Embeddings stay on text-embedding-3-small. Ramon topped up the account the same day. The policy store (in memory) had emptied while there were no credits, so "Reload Policies On Start" had to run again. A save with no changes does not fire it, but any real edit does (a trailing space on the Phase 6 sticky note was enough, run 163297). Afterwards "Do you have free shipping?" answered with the $100 threshold. An OpenAI **hard monthly spend limit of $10** (organization-wide, enforced) was set on 2026-11-15; $5.55 had already been spent that month, so the $3 Ramon first asked for would have stopped every call straight away. Lower it to $3 once the month resets. **L1 on gpt-5.4-nano: 27/30** (run 20261115-0821, execution 163299). All three misses are escalation errors, not wording: #22 (exchange) promised the swap itself instead of asking the team; #27 (lawyer threat) answered itself; #30 (third message) said "I'll get this pushed to the team" without a real handover. Nano does not follow the escalation rules reliably enough for live customers. Ramon chose **gpt-5.4-mini**. **L1 on mini: 29/30** (163350). #14 (return after 57 days) was told it was inside the window, because the model worked out the days itself and got them wrong. **F10:** a formula field **Days Since Delivery** (`IF({Delivered Date}, DATETIME_DIFF(TODAY(), {Delivered Date}, 'days'))`) was added to Orders and to Look Up Order's field list, and the Returns rule now says to use that number. **29/30** (163396): #14 now got the window right but handed over anyway. **F11:** the refunds rule and the handover rule now both say that a change-of-mind return after 30 days is covered by the policy (answer no, no handover unless the customer then asks for a person or an exception). Smoke tests of #14: 2 of 3 answered without a handover. **29/30** (163453): #14 passed, but #29 (angry customer) was answered instead of handed over, a case mini had passed in 163350. Conclusion: mini scores about 29/30 with a different miss each run. That is model variance, not one rule to fix. Its misses can go either way: an extra handover (#14, safe) or a missed handover (#29, not safe). **F12, model router:** Ramon chose to use different models for different messages. The chat model's name is now an expression (`tests/model_router.txt`): a keyword check on the customer's message (refund, return, cancel, damage, lawyer, chargeback, injury or safety words, anger, "third"/"again", asking for a person, French and Spanish equivalents, "!!", or two or more SHOUTED words) sends it to **gpt-5.4**; everything else goes to **gpt-5.4-mini**. Offline layer M (`model_router.test.js`) has 42 cases plus a check that the live expression matches the file: all 30 L1 messages and two held-out sets. The first held-out set (H-01 to H-10) caught 5 misses that widened the list. The second (HB-01 to HB-12) was written before the list was widened again and scored **10/12** on the first try (missed: frustration without trigger words, and a child's cut knee). That is the honest estimate for wording nobody has thought of yet; a missed route still gets mini plus all the escalation rules. **L1 with the router: 30/30** (run 20261115-1438, execution 163500): 17 cases on mini, 13 on gpt-5.4 (#3, #12–#14, #21–#30). Smoke tests 163497 (free shipping → mini) and 163498 (angry → gpt-5.4, handed over). **P1 on the phone: pass** (2026-11-15). The case was closed inside its thread, and the bot confirmed. Ramon's "hi" (execution 163556, mini, 9.4 s in total: 4.0 s Wait For More, 1.9 s model, 1.1 s WhatsApp send) got: "Hi there! How can I help today? Could you share your name, your email address and your order number (if you have one)?". His answer with name and email was saved on the case (163560 and sub-run 163561: Customer Name, Customer Email; Order Number left empty). Asking for a human then opened a new handover (163565, Slack thread 1794783008.548869), and later messages went to the team as designed. Note for testers: a message to a number with an open handover is only passed to Slack and gets no bot reply; close the case **inside the thread** first. The L1 runs that hit the limit posted about 54 "agent failed to answer" alerts to #operations.

### Run 4: 2026-11-13, after simplifying the workflow (82 → 74 working nodes)

Section 0 lost three nodes (voice notes become a note in Read Message; bursts are merged and marked in one step), the WhatsApp/website handover alerts became one Slack post, and the live-chat checks became one three-way switch. The sections were renumbered in canvas order.

| Layer | Result | Evidence |
|---|---|---|
| U | **13 / 13** | `read_team_reply.test.js` |
| L1 | **30 / 30** | Test set run 162474 (`20261113-0306`) |
| L2 | **11 / 11** (H8 not re-run; unchanged) | H1 162416, H2 162429, E1 162431, E2 162434, E3 162437, H3 162439, H4 162441, H5 162443, H6 162445, H7 and H9 6/6 after F5 |
| P1 / D2 | Pass | Live "Hi" after the last publish (162517, 162546) |
| L3 | **R1, R3, R4, R5, R6 pass** | R6: "my order FH-1001" + "where is it?" 2 s apart got one reply (162547 stopped, 162548 answered both). R3: voice note 162555. R4: name shown (162564), thread reply delivered with ✅ (162535). R5: close 162541 and 162568. |

**Found and fixed in run 4:**
- **F5 (build):** after the rename, **Log Case** read the Slack post without checking it ran. Test-mode cases and WhatsApp approvals skip that post, so Log Case failed and the agent told the customer it couldn't connect them (L1 29/30, H9 5/6). The check is back; L1 30/30 and H9 6/6 after.
- **F6 (build, older than today):** the handover post always said "name not shown". The post runs in the agent tool's own run, which can't see the WhatsApp message. The tool now passes `customer_name` (set by the workflow, not the AI). Confirmed live in 162564.

**Burst timing:** messages more than 4 seconds apart are answered separately (the first "Hi" in R6 was 6 s ahead). That is by design.

### Run 3: 2026-11-13, after adding duplicate-message protection (85 nodes)

| Layer | Result | Evidence |
|---|---|---|
| D1 | Pass | Temporary check: `{"passed":["new"]}`. The repeat was dropped. |
| D2 / P1 | Pass | Live "Hi" (run 162370) went New Message? → Remember Message → Continue With Message and got a reply. Its id is saved in the data table 100 ms after arrival. |

### Run 2: 2026-11-13, after adding the email ask-and-check (81 nodes)

| Layer | Result | Evidence |
|---|---|---|
| U | **13 / 13** | `read_team_reply.test.js` |
| L1 | **30 / 30** | Test set runs 162219 and 162315 (the second after the F2 prompt fix) |
| L2 | **12 / 12** after fixes | H1 162243, E1 162263, E2 162266, E3 162270, H3 162272, H4 162282, H5 162284, H6 and H7 (8 test handovers, 0 Slack posts), H8 162285, H9 6/6 |
| P1 | Pass | Live message after the last publish (run 162363); the bot replied on WhatsApp |

**Found and fixed in run 2:**
- **F2 (model):** right after a handover, a repeated request for a manager got "I've escalated this again" *without* calling the tool in 2 of 4 tries, so nothing was logged and nobody was alerted. The prompt now says to call the tool again for every new request and never to claim an escalation without one. Result: 6 of 6.
- **F3 (build):** the new email text in **Confirm Case Closed** had broken quoting, so the close worked but the ✅ errored (run 162274). Fixed, and all three branches were checked.
- **F4 (parser):** replies posted by an app (the Claude Slack connector) end with "*Sent using* Claude". A bare `close` was then sent to the customer as a reply. The footer is now stripped (U13), confirmed live in run 162360.

### Run 1: 2026-11-13

| Layer | Result | Evidence |
|---|---|---|
| P1 | Pass | Live message reached the workflow after each publish (runs 162137, and 162213 after the F1 fix) |
| U | **12 / 12** | `read_team_reply.test.js` |
| L1 | **30 / 30** | Test set run 162153 (`20261113-0210`) |
| L2 | **8 / 8** | Runs 162195-162210 (H1 162196, H2 162199, H3 162201, H4 162203, H5 162205, H6 162207, H7 162209, H8 162210) |
| L3 | R1, R4, R5 pass | Real number, runs 162140-162147. R2 and R3 were last passed when the photo path was built. |

**Fixed during this run:**
- **F1:** the ⚠️ and ✅ messages always blamed WhatsApp's 24-hour window. They now say WhatsApp refused the message and that the window is the *usual* reason, and they show WhatsApp's own error text.

**Known gaps (not failures):** all three were fixed on 2026-11-13 and checked in run 4: voice notes during a handover go to the thread, a reopened case clears its Resolved date, and a delivered thread reply gets a ✅.

**Test data left behind:**
- The `whatsapp:15550001001` and `test:whatsapp:15550001001` rows in Support Cases.
- The test case thread in #all-ramons-war-room.
