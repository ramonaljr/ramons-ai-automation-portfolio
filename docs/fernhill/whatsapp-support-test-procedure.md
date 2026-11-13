# Fernhill AI WhatsApp Support Agent: standard test procedure

Workflow: **Fernhill Outdoor Supply - AI Customer Support Agent** (`WkHI3pEDcVumGg6o`, 74 working nodes in 8 numbered sections) on n8n.ramonvallejera.com.
Test kit: `docs/fernhill/tests/`. Every case below has a fixed input and a pass rule. A run passes only when every case passes.

## When to run

| Change | Run |
|---|---|
| Any publish of the workflow | **P1** (always: publishing re-registers the WhatsApp webhook with Meta) |
| Agent prompt, tools, policy document, Apply Rules | P1, L1 (30-case set) |
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
| U6 | `close` | Closes with the default message |
| U7 | `Close.` | Closes |
| U8 | `close: Sorted, thanks!` | Closes with "Sorted, thanks!" |
| U9 | `Closing in on it, one sec` | **Not** a close |
| U10 | `close to done` | **Not** a close |
| U11 | Slack link and email markup | Unwrapped to plain text |
| U12 | Blank text | Ignored |
| U13 | `close *Sent using* Claude` and other app footers | Footer stripped; the close still works |

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
